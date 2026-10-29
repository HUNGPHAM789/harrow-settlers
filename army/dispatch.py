#!/usr/bin/env python3
"""Army dispatcher: gemini key pool + local ollama gpt-oss, file-output protocol, validate+retry, audit.
Usage: dispatch.py run task.json | batch t1.json t2.json ... [-j N] | audit <runid> | keys
Keys are read from ~/.config/gemkeys.txt and never printed."""
import json, os, re, subprocess, sys, time, threading, urllib.request, urllib.error, itertools, concurrent.futures as cf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYFILE = os.path.expanduser("~/.config/gemkeys.txt")
DEAD = {1: "blocked-referer", 11: "quota"}  # seed from probe; re-probed by `keys`
lock = threading.Lock()
cool = {}      # key idx -> unix time until usable
dead = set()
def load_keys():
    return [l.strip() for l in open(KEYFILE) if l.strip()]
KEYS = load_keys()
rr = itertools.count()
def pick_key():
    while True:
        with lock:
            n = len(KEYS)
            for _ in range(n):
                i = next(rr) % n
                if i in dead: continue
                if cool.get(i, 0) <= time.time(): return i
            soon = min([cool.get(i, 0) for i in range(n) if i not in dead] or [time.time() + 30])
        time.sleep(max(1, min(20, soon - time.time())))
def gemini(model, prompt, system=None, temp=0.4, max_out=32000):
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temp, "maxOutputTokens": max_out}}
    if system: body["systemInstruction"] = {"parts": [{"text": system}]}
    last = ""
    for attempt in range(14):
        i = pick_key()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEYS[i]}"
        req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json"})
        try:
            d = json.load(urllib.request.urlopen(req, timeout=300))
            c = d["candidates"][0]
            return "".join(p.get("text", "") for p in c["content"]["parts"]), f"gemini:{model}:k{i+1}"
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:200]
            last = f"http {e.code}"
            with lock:
                if e.code == 429: cool[i] = time.time() + (65 if "PerDay" not in msg else 3600)
                elif e.code in (403, 400) and "API key" in msg or e.code == 403: dead.add(i)
                elif e.code >= 500: cool[i] = time.time() + 10
                else: raise RuntimeError(f"gemini {e.code}: {msg}")
        except Exception as e:
            last = str(e)[:100]; time.sleep(3)
    raise RuntimeError("gemini exhausted: " + last)
def ollama(model, prompt, system=None):
    body = {"model": model, "stream": False, "options": {"num_ctx": 16384, "temperature": 0.3},
            "messages": ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]}
    req = urllib.request.Request("http://127.0.0.1:11434/api/chat", json.dumps(body).encode(), {"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=900))
    return d["message"]["content"], f"ollama:{model}"
SYSTEM = ("You are a senior game engineer on a team building a polished Settlers-style pixel-art browser game "
 "(vanilla ES modules, Canvas2D, no build step, no external deps). Output ONLY files in this exact protocol, no prose:\n"
 "=== FILE: relative/path.js ===\n<full file content>\n=== END ===\n"
 "Write complete files (never diffs/placeholders/TODO stubs). Only write the files you are allowed to. "
 "Code must be production quality: documented exports, no globals, deterministic where asked, no console spam.")
FILE_RE = re.compile(r"=== FILE: (.+?) ===\n(.*?)\n=== END ===", re.S)
def strip_fence(s):
    m = re.match(r"^\s*```[a-zA-Z]*\n(.*?)\n```\s*$", s, re.S)
    return m.group(1) if m else s
def run_task(t, feedback=""):
    rid = t["id"]; rd = os.path.join(ROOT, "army/runs", rid); os.makedirs(rd, exist_ok=True)
    ctx = ""
    for p in t.get("context", []):
        fp = os.path.join(ROOT, p)
        if os.path.exists(fp): ctx += f"\n--- CONTEXT FILE {p} ---\n{open(fp).read()}\n"
    result = {"id": rid, "attempts": [], "status": "failed"}
    fb = feedback
    for att in range(1, t.get("max_attempts", 3) + 1):
        prompt = f"TASK {rid}\n{t['objective']}\n\nALLOWED OUTPUT FILES: {t['outputs']}\n\nACCEPTANCE:\n- " + "\n- ".join(t.get("acceptance", [])) + f"\n{ctx}"
        if fb: prompt += f"\n\nPREVIOUS ATTEMPT FAILED / AUDIT FEEDBACK — fix all of it:\n{fb}\n"
        w = t.get("worker", "gemini")
        try:
            txt, who = (gemini(t.get("model", "gemini-3.5-flash"), prompt, SYSTEM) if w == "gemini"
                        else ollama(t.get("model", "gpt-oss:20b"), prompt, SYSTEM))
        except Exception as e:
            result["attempts"].append({"n": att, "error": str(e)}); fb = f"worker error {e}"; continue
        open(os.path.join(rd, f"attempt{att}.txt"), "w").write(txt)
        files = FILE_RE.findall(txt)
        wrote = []
        for path, body in files:
            path = path.strip()
            if path not in t["outputs"]: continue
            full = os.path.join(ROOT, path); os.makedirs(os.path.dirname(full), exist_ok=True)
            open(full, "w").write(strip_fence(body).rstrip() + "\n"); wrote.append(path)
        a = {"n": att, "worker": who, "wrote": wrote}
        if not wrote:
            a["error"] = "no allowed files in output"; fb = "Output protocol violated: use === FILE: path === ... === END === for allowed files only."
        else:
            rc, out = 0, ""
            for cmd in t.get("validate", []):
                p = subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True, text=True, timeout=180)
                if p.returncode: rc, out = p.returncode, (p.stdout + p.stderr)[-2500:]; break
            a["validate_rc"] = rc
            if rc == 0: result["attempts"].append(a); result["status"] = "validated"; break
            a["validate_out"] = out; fb = "Validation failed:\n" + out
        result["attempts"].append(a)
    json.dump(result, open(os.path.join(rd, "result.json"), "w"), indent=1)
    return result
RUBRIC = ("Score this work 0-10 as a STRICT commercial game-studio reviewer. Dimensions: correctness, completeness vs objective, "
 "code quality/architecture, robustness/edge cases, polish. Reply ONLY JSON: {\"score\":n,\"issues\":[\"concrete fix\",...]}. "
 "8 = shippable commercial quality. Be harsh; list specific actionable fixes.")
def audit(t, rid):
    ctx = ""
    for p in t["outputs"]:
        fp = os.path.join(ROOT, p)
        if os.path.exists(fp): ctx += f"\n--- {p} ---\n{open(fp).read()[:30000]}\n"
    txt, who = gemini("gemini-3.5-flash", f"{RUBRIC}\n\nOBJECTIVE:\n{t['objective']}\nACCEPTANCE:{t.get('acceptance')}\n{ctx}")
    m = re.search(r"\{.*\}", txt, re.S)
    try: return json.loads(m.group(0))
    except Exception: return {"score": 0, "issues": ["audit unparsable"]}
def run_audited(t, rounds=2, bar=8):
    r = run_task(t); hist = []
    if r["status"] != "validated": return {"id": t["id"], "final": "failed", "run": r}
    for k in range(rounds + 1):
        a = audit(t, t["id"]); hist.append(a["score"])
        if a["score"] >= bar and k >= (0 if t.get("min_rounds", 0) == 0 else t["min_rounds"]): break
        if k == rounds: break
        r = run_task(t, "AUDIT score %s/10. Fix:\n- %s\nRewrite the files fully, improved." % (a["score"], "\n- ".join(a["issues"])))
        if r["status"] != "validated": break
    out = {"id": t["id"], "scores": hist, "final": "pass" if hist and hist[-1] >= bar else "needs-lead-review", "issues": a.get("issues", [])}
    json.dump(out, open(os.path.join(ROOT, "army/runs", t["id"], "audit.json"), "w"), indent=1)
    return out
if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "keys":
        print(len(KEYS), "keys"); sys.exit()
    if cmd in ("run", "batch"):
        paths = [a for a in sys.argv[2:] if a.endswith(".json")]
        j = int(sys.argv[sys.argv.index("-j") + 1]) if "-j" in sys.argv else 3
        tasks = [json.load(open(p)) for p in paths]
        with cf.ThreadPoolExecutor(j) as ex:
            for r in ex.map(run_audited, tasks): print(json.dumps(r), flush=True)
