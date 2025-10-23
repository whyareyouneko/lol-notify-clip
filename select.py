
#!/usr/bin/env python3
import argparse, shutil, pathlib, sys, os

ROOT = pathlib.Path(__file__).resolve().parent
APPS = ROOT / "apps"
WS = ROOT / "workspace"

def list_apps():
    names = [p.name for p in APPS.iterdir() if p.is_dir()]
    print("\n".join(sorted(names)))

def select(frontend:str, backend:str):
    fsrc = APPS / frontend
    bsrc = APPS / backend
    if not fsrc.exists() or not bsrc.exists():
        print("Invalid app name. Run with --list to see options.", file=sys.stderr)
        sys.exit(1)
    fdst = WS / "frontend"
    bdst = WS / "backend"
    if fdst.exists(): shutil.rmtree(fdst)
    if bdst.exists(): shutil.rmtree(bdst)
    shutil.copytree(fsrc, fdst)
    shutil.copytree(bsrc, bdst)
    print(f"Selected front='{frontend}', back='{backend}'.")
    print("Your working copies are in workspace/frontend and workspace/backend.")

if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Select which extracted app to use as frontend/backend.")
    p.add_argument("--list", action="store_true", help="List available apps")
    p.add_argument("--frontend", help="Folder name under apps/ to use as frontend")
    p.add_argument("--backend", help="Folder name under apps/ to use as backend")
    args = p.parse_args()
    if args.list:
        list_apps()
        sys.exit(0)
    if not args.frontend or not args.backend:
        p.error("Provide --frontend and --backend or use --list")
    select(args.frontend, args.backend)
