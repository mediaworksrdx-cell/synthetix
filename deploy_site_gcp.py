import os
import shutil
import tarfile
import subprocess
import time

REMOTE_IP = "136.85.114.150"
REMOTE_USER = "sathishbadri2015"
REMOTE_DIR = f"/home/{REMOTE_USER}/synthetix-site"
ARCHIVE_NAME = "synthetix_site_gcp.tar.gz"

STANDALONE_DIR = "./.next/standalone"
STATIC_DIR = "./.next/static"
PUBLIC_DIR = "./public"

def package_site():
    print("\n[1/4] Preparing Next.js standalone assets...")
    if not os.path.exists(STANDALONE_DIR):
        print("Building Next.js application...")
        subprocess.run(["npm", "run", "build"], check=True)

    dest_public = os.path.join(STANDALONE_DIR, "public")
    if os.path.exists(dest_public):
        shutil.rmtree(dest_public)
    if os.path.exists(PUBLIC_DIR):
        shutil.copytree(PUBLIC_DIR, dest_public)
        print("  + Copied public assets")

    dest_static = os.path.join(STANDALONE_DIR, ".next", "static")
    if os.path.exists(dest_static):
        shutil.rmtree(dest_static)
    if os.path.exists(STATIC_DIR):
        shutil.copytree(STATIC_DIR, dest_static)
        print("  + Copied static assets")

    if os.path.exists(ARCHIVE_NAME):
        os.remove(ARCHIVE_NAME)

    print(f"\n[2/4] Packaging into {ARCHIVE_NAME}...")
    with tarfile.open(ARCHIVE_NAME, "w:gz") as tar:
        for item in os.listdir(STANDALONE_DIR):
            full_path = os.path.join(STANDALONE_DIR, item)
            tar.add(full_path, arcname=item)
            
    size_mb = os.path.getsize(ARCHIVE_NAME) / (1024 * 1024)
    print(f"-> Archive created: {ARCHIVE_NAME} ({size_mb:.2f} MB)")
    return True

if __name__ == "__main__":
    package_site()
