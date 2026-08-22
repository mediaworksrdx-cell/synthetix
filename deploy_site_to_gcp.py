import os
import subprocess
import time

REMOTE_IP = "136.85.114.150"
REMOTE_USER = "sathishbadri2015"
REMOTE_HOST = f"{REMOTE_USER}@{REMOTE_IP}"
SSH_KEY = r"C:\Users\daarv\.ssh\id_ed25519"
ARCHIVE_NAME = "synthetix_site_gcp.tar.gz"
REMOTE_DIR = f"/home/{REMOTE_USER}/synthetix-site"

SSH_OPTS = [
    "-o", "StrictHostKeyChecking=no",
    "-i", SSH_KEY
]

def main():
    print("=" * 60)
    print("Deploying synthetix-site to GCP Compute Engine (136.85.114.150)")
    print("=" * 60)

    # 1. Create Remote Directory
    print("\n[1/4] Ensuring remote directory exists...")
    subprocess.run(["ssh"] + SSH_OPTS + [REMOTE_HOST, f"mkdir -p {REMOTE_DIR}"], check=True)

    # 2. Upload Archive via SCP
    print(f"\n[2/4] Uploading {ARCHIVE_NAME} via SCP...")
    scp_cmd = ["scp"] + SSH_OPTS + [ARCHIVE_NAME, f"{REMOTE_HOST}:{REMOTE_DIR}/{ARCHIVE_NAME}"]
    res = subprocess.run(scp_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Upload failed: {res.stderr}")
        return False
    print("Upload completed successfully.")

    # 3. Extract and Setup on GCP VM
    print("\n[3/4] Extracting files and setting up Node.js runtime...")
    setup_cmd = (
        f"cd {REMOTE_DIR} && "
        f"tar -xzf {ARCHIVE_NAME} && "
        f"rm -f {ARCHIVE_NAME} && "
        f"if ! command -v node &> /dev/null; then "
        f"  echo 'Installing Node.js...'; "
        f"  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>/dev/null && apt-get install -y nodejs 2>/dev/null || true; "
        f"fi && "
        f"node -v || true && "
        f"echo 'EXTRACTION_COMPLETE'"
    )
    res = subprocess.run(["ssh"] + SSH_OPTS + [REMOTE_HOST, setup_cmd], capture_output=True, text=True)
    print(res.stdout)

    print("\n[4/4] Starting Next.js standalone server on port 3000...")
    start_cmd = (
        f"cd {REMOTE_DIR} && "
        f"pkill -f 'node server.js' 2>/dev/null || true && "
        f"PORT=3000 nohup node server.js > site.log 2>&1 & "
        f"sleep 2 && "
        f"ps aux | grep 'node server.js' | grep -v grep || true && "
        f"curl -s -o /dev/null -w 'Site HTTP Code: %{{http_code}}\\n' http://127.0.0.1:3000/ || true"
    )
    res = subprocess.run(["ssh"] + SSH_OPTS + [REMOTE_HOST, start_cmd], capture_output=True, text=True)
    print(res.stdout)

    print("=" * 60)
    print("synthetix-site deployment executed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
