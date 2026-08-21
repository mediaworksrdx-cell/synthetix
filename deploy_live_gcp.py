import os
import tarfile
import subprocess
import time

REMOTE_IP = "136.85.114.150"
REMOTE_USER = "ubuntu"
REMOTE_HOST = f"{REMOTE_USER}@{REMOTE_IP}"
SSH_KEY = r"C:\Users\daarv\.ssh\id_ed25519"
ARCHIVE_NAME = "synthetix_source_update.tar.gz"
TARGET_DIR = "/home/sathishbadri2015/synthetix-site"

SSH_OPTS = [
    "-o", "StrictHostKeyChecking=no",
    "-i", SSH_KEY
]

def make_archive():
    print("[1/5] Creating source archive...")
    include_dirs = ["app", "components", "public", "utils"]
    include_files = [
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "next.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs"
    ]
    
    with tarfile.open(ARCHIVE_NAME, "w:gz") as tar:
        for d in include_dirs:
            if os.path.exists(d):
                tar.add(d)
                print(f"  + Added directory {d}")
        for f in include_files:
            if os.path.exists(f):
                tar.add(f)
                print(f"  + Added file {f}")
                
    size_mb = os.path.getsize(ARCHIVE_NAME) / (1024 * 1024)
    print(f"Archive created: {ARCHIVE_NAME} ({size_mb:.2f} MB)")

def upload():
    print(f"\n[2/5] Uploading {ARCHIVE_NAME} to {REMOTE_HOST}...")
    scp_cmd = ["scp"] + SSH_OPTS + [ARCHIVE_NAME, f"{REMOTE_HOST}:/tmp/{ARCHIVE_NAME}"]
    res = subprocess.run(scp_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Upload failed: {res.stderr}")
        return False
    print("Upload successful.")
    return True

def deploy():
    print(f"\n[3/5] Extracting files and building on remote server...")
    remote_script = f"""#!/bin/bash
set -e
echo "Extracting archive to {TARGET_DIR}..."
rm -rf {TARGET_DIR}/.next
tar -xzf /tmp/{ARCHIVE_NAME} -C {TARGET_DIR}
rm -f /tmp/{ARCHIVE_NAME}
chown -R sathishbadri2015:sathishbadri2015 {TARGET_DIR}

echo "Building Next.js on server..."
export PATH=/home/sathishbadri2015/.nvm/versions/node/v20.20.2/bin:$PATH
cd {TARGET_DIR}
sudo -u sathishbadri2015 env PATH="$PATH" npm run build

echo "Restarting synthetix-multi-frontend.service..."
systemctl restart synthetix-multi-frontend.service
sleep 3
systemctl status synthetix-multi-frontend.service --no-pager -l
"""
    remote_script_bytes = remote_script.replace("\r\n", "\n").replace("\r", "\n").strip().encode("utf-8")
    ssh_cmd = ["ssh"] + SSH_OPTS + [REMOTE_HOST, "sudo bash -s"]
    res = subprocess.run(ssh_cmd, input=remote_script_bytes, capture_output=True)
    stdout_text = res.stdout.decode("utf-8", errors="replace")
    stderr_text = res.stderr.decode("utf-8", errors="replace")
    print("Remote execution output:")
    print(stdout_text.encode('ascii', 'replace').decode('ascii'))
    if res.returncode != 0:
        print("Remote execution error:")
        print(stderr_text.encode('ascii', 'replace').decode('ascii'))
        return False
    return True

def verify():
    print("\n[4/5] Verifying local and public endpoints...")
    time.sleep(3)
    
    # Check localhost:3002 on remote
    check_cmd = ["ssh"] + SSH_OPTS + [REMOTE_HOST, "curl -sI http://127.0.0.1:3002/ | head -n 10"]
    res = subprocess.run(check_cmd, capture_output=True, text=True)
    print("Port 3002 status:")
    print(res.stdout)
    
    # Check public domain
    pub_cmd = ["ssh"] + SSH_OPTS + [REMOTE_HOST, "curl -sI -k https://synthetixanalytics.com/ | head -n 10"]
    res_pub = subprocess.run(pub_cmd, capture_output=True, text=True)
    print("Public HTTPS status:")
    print(res_pub.stdout)

def main():
    try:
        make_archive()
        if upload():
            if deploy():
                verify()
                print("\n[5/5] DEPLOYMENT COMPLETED SUCCESSFULLY!")
    finally:
        if os.path.exists(ARCHIVE_NAME):
            os.remove(ARCHIVE_NAME)

if __name__ == "__main__":
    main()
