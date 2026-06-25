import os
import shutil
import zipfile
import subprocess
import time

# ─── Configuration ────────────────────────────────────────────────────────────
PEM_KEY = r"C:\Users\daarv\.ssh\id_ed25519"
HOST = "194.68.245.29"
PORT = 22168
USER = "root"
REMOTE_DIR = "/workspace/synthetix-site"
ZIP_NAME = "site_update.zip"

STANDALONE_DIR = "./.next/standalone"
STATIC_DIR = "./.next/static"
PUBLIC_DIR = "./public"

# ─── Step 1: Copy assets to standalone directory ─────────────────────────────
print("Step 1: Copying public and static assets to standalone folder...")
if not os.path.exists(STANDALONE_DIR):
    print("Error: .next/standalone does not exist. Please run next build first.")
    exit(1)

# Copy public
dest_public = os.path.join(STANDALONE_DIR, "public")
if os.path.exists(dest_public):
    shutil.rmtree(dest_public)
if os.path.exists(PUBLIC_DIR):
    shutil.copytree(PUBLIC_DIR, dest_public)
    print("  Copied public assets.")

# Copy static to standalone/.next/static
dest_static = os.path.join(STANDALONE_DIR, ".next", "static")
if os.path.exists(dest_static):
    shutil.rmtree(dest_static)
if os.path.exists(STATIC_DIR):
    shutil.copytree(STATIC_DIR, dest_static)
    print("  Copied static CSS/JS assets.")

# ─── Step 2: Package standalone folder into ZIP ──────────────────────────────
print("\nStep 2: Packaging standalone files...")
with zipfile.ZipFile(ZIP_NAME, "w", zipfile.ZIP_DEFLATED) as zipf:
    # Pack standalone files
    for root, dirs, files in os.walk(STANDALONE_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, STANDALONE_DIR)
            zipf.write(file_path, arcname)
    # Pack the remote script
    if os.path.exists("remote_deploy_site.sh"):
        zipf.write("remote_deploy_site.sh", "remote_deploy_site.sh")
print(f"Packaging complete. Created {ZIP_NAME}")

# Shell command to bootstrap deployment on remote server
remote_commands = f"cd /workspace && rm -rf {REMOTE_DIR}/.next {REMOTE_DIR}/public && unzip -o {ZIP_NAME} -d {REMOTE_DIR} && rm -f {ZIP_NAME} && bash {REMOTE_DIR}/remote_deploy_site.sh && rm -f {REMOTE_DIR}/remote_deploy_site.sh"

# ─── Step 3: Upload ZIP to remote server ─────────────────────────────────────
print("\nStep 3: Uploading ZIP to remote server...")
scp_cmd = [
    "scp",
    "-P", str(PORT),
    "-i", PEM_KEY,
    "-o", "StrictHostKeyChecking=no",
    "-o", "BatchMode=yes",
    ZIP_NAME,
    f"{USER}@{HOST}:/workspace/"
]
print("Running SCP command...")
result = subprocess.run(scp_cmd, capture_output=True, text=True, encoding="utf-8")
if result.returncode != 0:
    print(f"SCP failed: {result.stderr}")
    exit(1)
print("Upload successful.")

# Remove local ZIP
if os.path.exists(ZIP_NAME):
    os.remove(ZIP_NAME)

# ─── Step 4: Run Remote SSH commands to deploy ───────────────────────────────
print("\nStep 4: Executing remote deployment commands via SSH...")
ssh_cmd = [
    "ssh",
    "-p", str(PORT),
    "-i", PEM_KEY,
    "-o", "StrictHostKeyChecking=no",
    "-o", "BatchMode=yes",
    f"{USER}@{HOST}",
    remote_commands
]

print("Running SSH commands...")
result = subprocess.run(ssh_cmd, capture_output=True, text=True, encoding="utf-8")
print("SSH Command Output:")
print(result.stdout.encode('ascii', 'ignore').decode('ascii'))
if result.returncode != 0:
    print(f"SSH failed: {result.stderr.encode('ascii', 'ignore').decode('ascii')}")
    exit(1)

# ─── Step 5: Verify Deployment ───────────────────────────────────────────────
print("\nStep 5: Verifying remote deployment health check...")
time.sleep(3)

verify_cmd = [
    "ssh",
    "-p", str(PORT),
    "-i", PEM_KEY,
    "-o", "StrictHostKeyChecking=no",
    "-o", "BatchMode=yes",
    f"{USER}@{HOST}",
    "curl -s http://localhost:3000/aarkaai"
]

for attempt in range(8):
    try:
        print(f"Attempt {attempt+1}: Querying website...")
        res = subprocess.run(verify_cmd, capture_output=True, text=True, encoding="utf-8")
        if res.returncode == 0 and ("<!DOCTYPE html>" in res.stdout or "html" in res.stdout.lower() or res.stdout.strip()):
            print("Website deployment verified successfully! Remote health check returned HTML/response.")
            break
        else:
            print(f"Health check failed or pending. Output: {res.stdout[:100].strip()} Error: {res.stderr.strip()}")
    except Exception as e:
        print(f"Attempt {attempt+1} exception: {e}")
    time.sleep(4)
else:
    print("Website health check could not be verified after 8 attempts.")
