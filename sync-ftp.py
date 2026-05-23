#!/usr/bin/env python3
"""
sync-ftp.py — Sync ./public to remote public_html via FTP.

Credentials are read from .env.ftp in the same directory:
    FTP_HOST=ftp.yourdomain.com
    FTP_USER=your-username
    FTP_PASS=your-password
"""

import ftplib
import hashlib
import os
import sys
import time
from pathlib import Path

# ── ANSI colors ───────────────────────────────────────────────────────────────
R  = "\033[0;31m"   # red    — deleted
G  = "\033[0;32m"   # green  — new
Y  = "\033[1;33m"   # yellow — new directory
C  = "\033[0;36m"   # cyan   — updated
DIM = "\033[2m"
B  = "\033[1m"      # bold
NC = "\033[0m"      # reset

USE_COLOR = sys.stdout.isatty()

def c(color, text):
    return f"{color}{text}{NC}" if USE_COLOR else text


# ── Config ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
LOCAL_DIR  = SCRIPT_DIR / "public"
REMOTE_DIR = "/"
ENV_FILE   = SCRIPT_DIR / ".env.ftp"


def load_env():
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip().strip('"').strip("'")
    merged = {**env, **{k: os.environ[k] for k in ("FTP_HOST", "FTP_USER", "FTP_PASS") if k in os.environ}}
    return merged.get("FTP_HOST"), merged.get("FTP_USER"), merged.get("FTP_PASS")


# ── FTP helpers ───────────────────────────────────────────────────────────────
def ftp_list_recursive(ftp, remote_path):
    """Return {relative_path: size_bytes} for all files under remote_path."""
    files = {}
    dirs_to_visit = [""]

    while dirs_to_visit:
        rel_dir = dirs_to_visit.pop()
        abs_dir = f"{remote_path.rstrip('/')}/{rel_dir}".rstrip("/") or "/"
        entries = []
        try:
            ftp.retrlines(f"LIST {abs_dir}", entries.append)
        except ftplib.error_perm:
            continue

        for entry in entries:
            parts = entry.split(None, 8)
            if len(parts) < 9:
                continue
            perms, _, _, _, size_str, *_, name = parts
            name = name.strip()
            if name in (".", ".."):
                continue
            rel_path = f"{rel_dir}/{name}".lstrip("/")
            if perms.startswith("d"):
                dirs_to_visit.append(rel_path)
            else:
                try:
                    files[rel_path] = int(size_str)
                except ValueError:
                    files[rel_path] = 0

    return files


def local_files(local_dir):
    """Return {relative_path: size_bytes} for all files under local_dir."""
    result = {}
    for path in sorted(local_dir.rglob("*")):
        if path.is_file():
            rel = str(path.relative_to(local_dir))
            result[rel] = path.stat().st_size
    return result


def ftp_mkdirs(ftp, remote_path):
    """Recursively create remote directories if they don't exist."""
    parts = remote_path.strip("/").split("/")
    current = ""
    for part in parts:
        current += f"/{part}"
        try:
            ftp.mkd(current)
        except ftplib.error_perm:
            pass  # already exists


def ftp_upload(ftp, local_path, remote_path):
    ftp_mkdirs(ftp, str(Path(remote_path).parent))
    with open(local_path, "rb") as f:
        ftp.storbinary(f"STOR {remote_path}", f)


def ftp_delete(ftp, remote_path):
    try:
        ftp.delete(remote_path)
    except ftplib.error_perm:
        pass


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    dry_run = any(a in ("--dry-run", "--dry_run") for a in sys.argv[1:])

    # Credentials
    ftp_host, ftp_user, ftp_pass = load_env()
    if not all([ftp_host, ftp_user, ftp_pass]):
        print(c(R+B, "Error: FTP credentials not configured."))
        print(f"\nCreate {ENV_FILE} with:")
        print("  FTP_HOST=ftp.yourdomain.com")
        print("  FTP_USER=your-username")
        print("  FTP_PASS=your-password")
        sys.exit(1)

    if not LOCAL_DIR.is_dir():
        print(c(R, f"Error: local directory not found: {LOCAL_DIR}"))
        sys.exit(1)

    print()
    mode_label = c(Y, " [DRY RUN]") if dry_run else ""
    print(c(C+B, f"Connecting to FTP server...{mode_label}"))
    print(c(DIM, f"  Host:   {ftp_host}"))
    print(c(DIM, f"  Remote: {REMOTE_DIR}"))
    print(c(DIM, f"  Local:  {LOCAL_DIR}"))
    print()

    # Connect
    try:
        ftp = ftplib.FTP(ftp_host, timeout=30)
        ftp.login(ftp_user, ftp_pass)
        ftp.set_pasv(True)
    except Exception as e:
        print(c(R+B, f"Connection failed: {e}"))
        sys.exit(1)

    print(c(C, "Fetching remote file list..."))
    try:
        remote = ftp_list_recursive(ftp, REMOTE_DIR)
    except Exception as e:
        print(c(R, f"Failed to list remote: {e}"))
        ftp.quit()
        sys.exit(1)

    local = local_files(LOCAL_DIR)

    # Categorise
    new_files     = sorted(p for p in local  if p not in remote)
    deleted_files = sorted(p for p in remote if p not in local)
    updated_files = sorted(
        p for p in local
        if p in remote and local[p] != remote[p]
    )
    unchanged = sum(1 for p in local if p in remote and local[p] == remote[p])

    total_changes = len(new_files) + len(deleted_files) + len(updated_files)

    # Display
    HR = c(B, "─" * 57)
    print(HR)
    print(c(B, " Pending changes"))
    print(HR)
    print()

    if new_files:
        print(c(G+B, f"  New files ({len(new_files)})"))
        for f in new_files:
            size = local[f]
            print(c(G, f"  +  {f}") + c(DIM, f"  ({_fmt_size(size)})"))
        print()

    if updated_files:
        print(c(C+B, f"  Updated files ({len(updated_files)})"))
        for f in updated_files:
            local_size  = local[f]
            remote_size = remote[f]
            diff = local_size - remote_size
            diff_str = f"+{_fmt_size(diff)}" if diff > 0 else f"-{_fmt_size(abs(diff))}"
            print(c(C, f"  ~  {f}") + c(DIM, f"  ({_fmt_size(remote_size)} → {_fmt_size(local_size)}, {diff_str})"))
        print()

    if deleted_files:
        print(c(R+B, f"  Deleted files ({len(deleted_files)})"))
        for f in deleted_files:
            print(c(R, f"  -  {f}") + c(DIM, f"  ({_fmt_size(remote[f])})"))
        print()

    if total_changes == 0:
        print(c(G+B, "  Already up to date. Nothing to sync."))
        print()
        ftp.quit()
        return

    print(HR)
    summary_parts = []
    if new_files:     summary_parts.append(c(G, f"+{len(new_files)} new"))
    if updated_files: summary_parts.append(c(C, f"~{len(updated_files)} updated"))
    if deleted_files: summary_parts.append(c(R, f"-{len(deleted_files)} deleted"))
    if unchanged:     summary_parts.append(c(DIM, f"{unchanged} unchanged"))
    print(c(B, " Summary: ") + "  ".join(summary_parts))
    print(HR)
    print()

    if dry_run:
        print(c(Y+B, "Dry run — no changes made."))
        print()
        ftp.quit()
        return

    # Confirm
    try:
        answer = input(c(B, "Proceed with sync? [y/N] ")).strip().lower()
    except (KeyboardInterrupt, EOFError):
        print()
        print(c(DIM, "\nSync cancelled."))
        ftp.quit()
        return

    if answer != "y":
        print()
        print(c(DIM, "Sync cancelled."))
        ftp.quit()
        return

    print()
    print(c(C+B, "Syncing..."))
    print()

    errors = []
    all_ops = (
        [(rel, "add")    for rel in new_files] +
        [(rel, "update") for rel in updated_files] +
        [(rel, "delete") for rel in deleted_files]
    )
    total = len(all_ops)

    for i, (rel, op) in enumerate(all_ops, 1):
        counter = c(DIM, f"[{i}/{total}]")
        if op == "add":
            label = c(G, "+ add   ")
        elif op == "update":
            label = c(C, "~ update")
        else:
            label = c(R, "- delete")

        print(f"  {counter}  {label}  {rel} ", end="", flush=True)
        t0 = time.time()
        try:
            remote_path = f"{REMOTE_DIR.rstrip('/')}/{rel}"
            if op in ("add", "update"):
                ftp_upload(ftp, LOCAL_DIR / rel, remote_path)
            else:
                ftp_delete(ftp, remote_path)
            elapsed = time.time() - t0
            print(c(G, f"✓") + c(DIM, f"  {elapsed:.1f}s"))
        except Exception as e:
            elapsed = time.time() - t0
            errors.append((rel, str(e)))
            print(c(R, f"✗") + c(DIM, f"  {elapsed:.1f}s"))
            print(c(R, f"       {e}"))

    ftp.quit()
    print()

    if errors:
        print(c(R+B, f"Sync finished with {len(errors)} error(s):"))
        for path, msg in errors:
            print(c(R, f"  {path}: {msg}"))
        sys.exit(1)
    else:
        print(c(G+B, "Sync complete!"))
    print()


def _fmt_size(n):
    n = abs(n)
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


if __name__ == "__main__":
    main()
