#!/usr/bin/env python3
"""Army dispatcher: gemini key pool + local ollama gpt-oss, file-output protocol, validate+retry, audit.
Read-only usage: dispatch.py keys | quota | preflight.
Legacy run/batch writes are disabled; use the isolated Settlers agent supervisor.
Keys are read from ~/.config/gemkeys.txt and never printed."""
import json, os, re, subprocess, sys, time, threading, urllib.request, urllib.error, itertools, concurrent.futures as cf
import quota_ledger
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
POLICY = json.load(open(os.path.join(ROOT, "army/model-policy.json")))
CHAIN = POLICY["preferred_models"]            # used by `quota` report
WORKER_CHAIN = POLICY.get("worker_models", CHAIN)
AUDIT_CHAIN = POLICY.get("audit_models", CHAIN)
PREMIUM_CHAIN = POLICY.get("premium_models", CHAIN)
DEFAULT_MODEL = WORKER_CHAIN[0]
def gemini(model, prompt, system=None, temp=0.4, max_out=65000, images=(), chain=None):
    """Quota is per (project,model): walk the CHAIN from `model` downward; a key is cooled per (key,model)."""
    import base64
    parts = [{"text": prompt}] + [{"inline_data": {"mime_type": "image/png", "data": base64.b64encode(open(f, "rb").read()).decode()}} for f in images]
    body = {"contents": [{"role": "user", "parts": parts}], "generationConfig": {"temperature": temp, "maxOutputTokens": max_out}}
    chain = list(chain or WORKER_CHAIN)
    if model and model != "auto" and model not in chain: chain = [model] + chain
    body_gemma = json.loads(json.dumps(body)) if system else body
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
        body_gemma["contents"][0]["parts"][0]["text"] = system + "\n\n" + prompt   # gemma ignores systemInstruction
    last = ""
    for attempt in range(80):
        now = time.time(); choice = None
        with lock:
            for m in chain:
                for off in range(len(KEYS)):
                    i = next(rr) % len(KEYS)
                    if i in dead or cool.get((i, m), 0) > now or quota_ledger.cooldown(KEYS[i], m, now) > now: continue
                    choice = (i, m); break
                if choice: break
            soon = min([cool.get((i, m), now + 30) for i in range(len(KEYS)) if i not in dead for m in chain] or [now + 30])
        if not choice: time.sleep(max(2, min(30, soon - now))); continue
        i, m = choice
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent"
        req = urllib.request.Request(url, json.dumps(body_gemma if m.startswith("gemma") else body).encode(), {"Content-Type": "application/json", "x-goog-api-key": KEYS[i]})
        try:
            d = json.load(urllib.request.urlopen(req, timeout=300))
            c = d["candidates"][0]
            quota_ledger.observe(KEYS[i], m, "success")
            return "".join(p.get("text", "") for p in c["content"]["parts"]), f"gemini:{m}:k{i+1}"
        except urllib.error.HTTPError as e:
            msg = e.read().decode(); last = f"http {e.code}"
            quota_ledger.observe(KEYS[i], m, str(e.code), msg, e.headers)
            with lock:
                if e.code == 429: cool[(i, m)] = time.time() + (3 * 3600 if "PerDay" in msg else 62)
                elif e.code == 403: cool[(i, m)] = time.time() + 86400
                elif e.code >= 500: cool[(i, m)] = time.time() + 10
                elif e.code == 404: cool[(i, m)] = time.time() + 86400
                else: raise RuntimeError(f"gemini {e.code}: {msg}")
        except Exception as e:
            last = str(e)[:100]; time.sleep(3)
    raise RuntimeError("gemini exhausted: " + last)
def preflight():
    """Require an actual bounded generation before any task can alter project files."""
    available = set()
    for key in KEYS:
        req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000", headers={"x-goog-api-key": key})
        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                available.update(x["name"].removeprefix("models/") for x in json.load(response).get("models", []) if "generateContent" in x.get("supportedGenerationMethods", []))
            break
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
            continue
    if not available:
        raise RuntimeError("Gemini preflight: models.list unavailable; no tasks started")
    body = json.dumps({"contents": [{"parts": [{"text": "Reply OK."}]}], "generationConfig": {"maxOutputTokens": 32}}).encode()
    failures = []
    deadline = time.monotonic() + 60
    for i, key in enumerate(KEYS):
        for model in WORKER_CHAIN:
            if model not in available:
                failures.append(model + ": not listed"); continue
            if quota_ledger.cooldown(key, model) > time.time():
                failures.append(model + "/key" + str(i + 1) + ": cooling down"); continue
            if time.monotonic() >= deadline: raise RuntimeError("Gemini preflight timed out; no tasks started: " + "; ".join(failures))
            req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", body, {"Content-Type": "application/json", "x-goog-api-key": key})
            try:
                with urllib.request.urlopen(req, timeout=15) as response: data = json.load(response)
                if not data.get("candidates"): raise ValueError("no candidates")
                quota_ledger.observe(key, model, "success")
                print("Gemini preflight: generation succeeded for", model, "key", i + 1, flush=True)
                return
            except urllib.error.HTTPError as e:
                quota_ledger.observe(key, model, str(e.code), e.read().decode(), e.headers)
                failures.append(model + "/key" + str(i + 1) + ": HTTP " + str(e.code))
            except Exception as e:
                quota_ledger.observe(key, model, "timeout" if isinstance(e, TimeoutError) else "error")
                failures.append(model + "/key" + str(i + 1) + ": " + type(e).__name__)
    raise RuntimeError("Gemini preflight failed; no tasks started: " + "; ".join(failures))

def ollama(model, prompt, system=None):
    body = {"model": model, "stream": False, "options": {"num_ctx": 16384, "temperature": 0.3},
            "messages": ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]}
    req = urllib.request.Request("http://127.0.0.1:11434/api/chat", json.dumps(body).encode(), {"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=900))
    return d["message"]["content"], f"ollama:{model}"

LOCAL_SEM = threading.Semaphore(1)   # one local model job at a time (shared-memory Mac)
def local_preflight(model="gpt-oss:20b"):
    """Refuse to load the local model while LTX/ComfyUI renders or memory is tight (TOOLS.md)."""
    ps = subprocess.run("ps -axo command", shell=True, capture_output=True, text=True).stdout
    busy = [k for k in ("ltx", "comfyui", "ComfyUI/main.py") if re.search(k, ps, re.I) and "grep" not in k]
    if busy: raise RuntimeError("local preflight: GPU/RAM job running (" + ",".join(busy) + "); waiting")
    tags = json.load(urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=5))["models"]
    if not any(m["name"] == model for m in tags): raise RuntimeError("local preflight: model not installed " + model)
    free = subprocess.run("memory_pressure | grep -i 'free percentage'", shell=True, capture_output=True, text=True).stdout
    m = re.search(r"(\d+)%", free)
    if m and int(m.group(1)) < 25: raise RuntimeError("local preflight: free memory %s%% < 25%%" % m.group(1))
def legacy_writes_disabled():
    raise RuntimeError("Legacy dispatcher direct writes are disabled. Use ~/Documents/Codex/settlers-agent-system/README.md and the isolated supervisor; no task was started.")

def aider_local(t, prompt, rd, att, model="gpt-oss:20b"):
    """Disabled: legacy output promotion can overwrite unvalidated work."""
    legacy_writes_disabled()
    import shutil, tempfile
    model = t.get("model", model) if t.get("model", "").startswith("gpt-oss") else model
    with LOCAL_SEM:
        local_preflight(model)
        tmp = tempfile.mkdtemp(prefix="aider-", dir=os.path.join(ROOT, "army"))
        try:
            shutil.copytree(ROOT, tmp + "/repo", ignore=shutil.ignore_patterns(".git", "node_modules", "army", "art", "public", "__pycache__"))
            repo = tmp + "/repo"
            for p in t["outputs"]: os.makedirs(os.path.dirname(os.path.join(repo, p)) or repo, exist_ok=True); open(os.path.join(repo, p), "a").close() if not os.path.exists(os.path.join(repo, p)) else None
            open(tmp + "/msg.txt", "w").write(prompt + "\n\nEdit ONLY the listed output files, writing each complete. No explanations.")
            open(tmp + "/models.yml", "w").write(f"- name: ollama_chat/{model}\n  edit_format: whole\n  use_repo_map: false\n  extra_params:\n    num_ctx: 16384\n")
            open(tmp + "/aider.conf.yml", "w").write("auto-commits: false\n"); open(tmp + "/env", "w").write("")
            argv = [os.path.expanduser("~/.local/bin/aider"), "--no-git", "--config", tmp + "/aider.conf.yml", "--env-file", tmp + "/env",
                    "--model-settings-file", tmp + "/models.yml", "--model", "ollama_chat/" + model, "--edit-format", "whole",
                    "--no-auto-lint", "--no-auto-test", "--no-suggest-shell-commands", "--no-check-update", "--analytics-disable",
                    "--no-show-model-warnings", "--no-stream", "--no-pretty", "--yes-always", "--map-tokens", "0",
                    "--message-file", tmp + "/msg.txt", "--chat-history-file", os.path.join(rd, f"aider{att}.history.md")]
            for p in t["outputs"]: argv += ["--file", p]
            for p in t.get("context", []):
                if os.path.exists(os.path.join(repo, p)): argv += ["--read", p]
            env = dict(os.environ, OLLAMA_API_BASE="http://127.0.0.1:11434")
            pr = subprocess.run(argv, cwd=repo, env=env, capture_output=True, text=True, timeout=t.get("timeout", 1500))
            blob = ""
            for p in t["outputs"]:
                fp = os.path.join(repo, p)
                if os.path.exists(fp) and os.path.getsize(fp) > 0: blob += f"=== FILE: {p} ===\n{open(fp).read().rstrip()}\n=== END ===\n"
            if not blob: raise RuntimeError("aider produced no output: " + (pr.stdout + pr.stderr)[-400:])
            return blob, "aider+ollama:" + model
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
            subprocess.run(["ollama", "stop", model], capture_output=True)
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
    legacy_writes_disabled()
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
            if w == "gemini":
                txt, who = gemini(t.get("model", "auto"), prompt, SYSTEM, chain=PREMIUM_CHAIN + WORKER_CHAIN if t.get("tier") == "premium" else WORKER_CHAIN)
            elif w == "aider-local":
                txt, who = aider_local(t, prompt, rd, att)
            else:
                txt, who = ollama(t.get("model", "gpt-oss:20b"), prompt, SYSTEM)
        except Exception as e:
            result["attempts"].append({"n": att, "error": str(e)}); fb = f"worker error {e}"; continue
        open(os.path.join(rd, f"attempt{att}.txt"), "w").write(txt)
        files = FILE_RE.findall(txt)
        trunc = txt.count("=== FILE:") > len(files)
        wrote = []
        if trunc:
            a = {"n": att, "worker": who, "wrote": [], "error": "output truncated"}
            fb = "Output was truncated; return complete files with === END ===."
            result["attempts"].append(a); continue
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
    imgs = [os.path.join(ROOT, g) for pat in t.get("previews", []) for g in __import__("glob").glob(os.path.join(ROOT, pat))][:12]
    if imgs: ctx += "\nThe attached images are the rendered previews of this art (judge the VISUALS: readability, consistency, charm, pixel-art craft)."
    txt, who = gemini("auto", f"{RUBRIC}\n\nOBJECTIVE:\n{t['objective']}\nACCEPTANCE:{t.get('acceptance')}\n{ctx}", images=imgs, chain=AUDIT_CHAIN)
    m = re.search(r"\{.*\}", txt, re.S)
    try: return json.loads(m.group(0))
    except Exception: return {"score": 0, "issues": ["audit unparsable"]}
def snap(t):
    return {p: open(os.path.join(ROOT, p)).read() for p in t["outputs"] if os.path.exists(os.path.join(ROOT, p))}
def restore(files):
    legacy_writes_disabled()
    for p, c in files.items(): open(os.path.join(ROOT, p), "w").write(c)
def run_audited(t, rounds=2, bar=8):
    """Disabled: use the isolated supervisor for generation, validation and review."""
    legacy_writes_disabled()
    r = run_task(t); hist = []
    if r["status"] != "validated": return {"id": t["id"], "final": "failed", "run": r}
    best = (-1, None, [])
    for k in range(rounds + 1):
        a = audit(t, t["id"]); hist.append(a["score"])
        if a["score"] > best[0]: best = (a["score"], snap(t), a.get("issues", []))
        if a["score"] >= bar or k == rounds: break
        prev = snap(t)
        r = run_task(t, "AUDIT score %s/10 (best so far %s). Keep what works; fix ALL of:\n- %s\nRewrite the files fully, improved." % (a["score"], best[0], "\n- ".join(a["issues"])))
        if r["status"] != "validated": restore(prev); continue
    restore(best[1])
    out = {"id": t["id"], "scores": hist, "best": best[0], "final": "pass" if best[0] >= bar else "needs-lead-review", "issues": best[2]}
    json.dump(out, open(os.path.join(ROOT, "army/runs", t["id"], "audit.json"), "w"), indent=1)
    return out
if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "keys":
        print(len(KEYS), "keys"); sys.exit()
    if cmd == "quota":
        print(json.dumps(quota_ledger.report(KEYS, CHAIN), indent=2)); sys.exit()
    if cmd == "preflight":
        preflight(); sys.exit()
    if cmd in ("run", "batch"):
        try: legacy_writes_disabled()
        except RuntimeError as e:
            print(str(e), file=sys.stderr); sys.exit(2)
        paths = [a for a in sys.argv[2:] if a.endswith(".json")]
        j = int(sys.argv[sys.argv.index("-j") + 1]) if "-j" in sys.argv else 3
        tasks = [json.load(open(p)) for p in paths]
        if any(t.get("worker", "gemini") == "gemini" for t in tasks): preflight()
        if any(t.get("worker") == "aider-local" for t in tasks): local_preflight()
        with cf.ThreadPoolExecutor(j) as ex:
            results = list(ex.map(run_audited, tasks))
        for r in results: print(json.dumps(r), flush=True)
        if any(r.get("final") != "pass" for r in results): sys.exit(1)
