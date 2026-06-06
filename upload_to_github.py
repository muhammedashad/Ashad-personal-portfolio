import os
import base64
import json
import urllib.request
import urllib.error

# Load config
CONFIG_FILE = "github_config.py"
if not os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        f.write('''# GitHub Configuration File
# 1. Go to https://github.com/settings/tokens
# 2. Generate a new classic token or fine-grained token with "repo" write permissions.
# 3. Fill in the values below:

GITHUB_TOKEN = "your_github_token_here"
GITHUB_USERNAME = "your_github_username_here"
GITHUB_REPO_NAME = "ashad-creative-portfolio"
REPO_DESCRIPTION = "Premium Futuristic Multimedia Artist Portfolio Website"
IS_PRIVATE = False
''')
    print(f"Created config template at {CONFIG_FILE}.")
    print("\nIMPORTANT: Please open github_config.py, put your GitHub token and username, and save it.")
    print("Once done, run this script again to start the upload!")
    exit(0)

# Import config values
import github_config

if not github_config.GITHUB_TOKEN or github_config.GITHUB_TOKEN == "your_github_token_here":
    print("Error: Please update GITHUB_TOKEN in github_config.py with your real token.")
    exit(1)
if not github_config.GITHUB_USERNAME or github_config.GITHUB_USERNAME == "your_github_username_here":
    print("Error: Please update GITHUB_USERNAME in github_config.py with your GitHub username.")
    exit(1)

# API Helper
def github_request(url, method, data=None):
    headers = {
        "Authorization": f"token {github_config.GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Antigravity-Uploader"
    }
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
        
    req = urllib.request.Request(url, headers=headers, method=method, data=req_data)
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            err_data = json.loads(e.read().decode("utf-8"))
            return e.code, err_data
        except Exception:
            return e.code, str(e)

# Create repository if it doesn't exist
owner = github_config.GITHUB_USERNAME
repo = github_config.GITHUB_REPO_NAME
print(f"Checking if repository '{owner}/{repo}' exists...")

status, info = github_request(f"https://api.github.com/repos/{owner}/{repo}", "GET")

if status == 404:
    print(f"Repository not found. Creating a new repo '{repo}'...")
    create_data = {
        "name": repo,
        "description": github_config.REPO_DESCRIPTION,
        "private": github_config.IS_PRIVATE,
        "auto_init": False
    }
    status, info = github_request("https://api.github.com/user/repos", "POST", create_data)
    if status in (200, 201):
        print(f"Successfully created repository: {info.get('html_url')}")
    else:
        print(f"Error creating repository: {info}")
        exit(1)
elif status == 200:
    print(f"Repository exists: {info.get('html_url')}")
else:
    print(f"Unexpected status code {status}: {info}")
    exit(1)

# Scan files and upload
ignore_dirs = {'.git', '__pycache__', 'node_modules', 'dist', '.vscode'}
ignore_files = {'github_config.py', 'upload_to_github.py', '.DS_Store'}

def should_ignore(path):
    parts = path.replace('\\', '/').split('/')
    for part in parts:
        if part in ignore_dirs:
            return True
    if os.path.basename(path) in ignore_files:
        return True
    return False

print("Scanning files for upload...")
files_to_upload = []
for root, dirs, files in os.walk("."):
    for file in files:
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, ".")
        if not should_ignore(rel_path):
            files_to_upload.append(rel_path)

print(f"Found {len(files_to_upload)} files to upload.")

for i, rel_path in enumerate(files_to_upload, 1):
    github_path = rel_path.replace('\\', '/')
    print(f"[{i}/{len(files_to_upload)}] Uploading {rel_path}...")
    
    # Read file
    with open(rel_path, "rb") as f:
        file_bytes = f.read()
    
    content_b64 = base64.b64encode(file_bytes).decode("utf-8")
    
    # Check if file exists on GitHub to get its SHA
    sha = None
    status, file_info = github_request(f"https://api.github.com/repos/{owner}/{repo}/contents/{github_path}", "GET")
    if status == 200:
        sha = file_info.get("sha")
        
    # Upload/update file
    commit_data = {
        "message": f"Upload {github_path}",
        "content": content_b64
    }
    if sha:
        commit_data["sha"] = sha
        
    status, upload_info = github_request(f"https://api.github.com/repos/{owner}/{repo}/contents/{github_path}", "PUT", commit_data)
    if status in (200, 201):
        action = "Updated" if sha else "Created"
        print(f"  {action} successfully.")
    else:
        print(f"  Failed to upload {rel_path}: {upload_info}")

print("\nUpload complete! Visit your repository at:")
print(info.get('html_url') if 'html_url' in info else f"https://github.com/{owner}/{repo}")
