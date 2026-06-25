import os
import shutil
import zipfile
import subprocess
import time

# ─── Configuration ────────────────────────────────────────────────────────────
PEM_KEY = r"C:\Users\daarv\.ssh\LightsailDefaultKey-ap-south-1 (2).pem"
HOST = "43.204.153.162"
USER = "ubuntu"
REMOTE_DIR = "/home/ubuntu/synthetix-site"
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
    for root, dirs, files in os.walk(STANDALONE_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            # Archive paths relative to STANDALONE_DIR
            arcname = os.path.relpath(file_path, STANDALONE_DIR)
            zipf.write(file_path, arcname)
print(f"Packaging complete. Created {ZIP_NAME}")

# ─── Step 3: Upload ZIP to remote server ─────────────────────────────────────
print("\nStep 3: Uploading ZIP to remote server...")
scp_cmd = [
    "scp",
    "-i", PEM_KEY,
    "-o", "StrictHostKeyChecking=no",
    ZIP_NAME,
    f"{USER}@{HOST}:/home/ubuntu/"
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
remote_commands = f"""
set -e

# Backup current build
echo "Creating backup of current deployment..."
if [ -d {REMOTE_DIR} ]; then
    tar -czf /home/ubuntu/site_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C {REMOTE_DIR} .next server.js public || true
fi

# Clean and extract new files
echo "Extracting new files..."
mkdir -p {REMOTE_DIR}
unzip -o /home/ubuntu/{ZIP_NAME} -d {REMOTE_DIR}
rm /home/ubuntu/{ZIP_NAME}

# Restart Next.js service
echo "Restarting synthetix-site service..."
sudo systemctl restart synthetix-site.service

echo "Checking service status..."
sudo systemctl status synthetix-site.service --no-pager -l
"""

ssh_cmd = [
    "ssh",
    "-i", PEM_KEY,
    "-o", "StrictHostKeyChecking=no",
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

print("\nDeployment completed successfully!")
