"""Compatibility shim: shared ledger lives outside any one project."""
import importlib.util
from pathlib import Path
_spec = importlib.util.spec_from_file_location("shared_gemini_quota", Path.home() / ".local/share/openclaw-quota/quota_ledger.py")
_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_module)
fingerprint = _module.fingerprint
project_from_error = _module.project_from_error
observe = _module.observe
cooldown = _module.cooldown
report = _module.report
