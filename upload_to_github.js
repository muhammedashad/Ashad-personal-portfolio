/**
 * ASHAD PORTFOLIO — GITHUB REST API UPLOADER (Node.js)
 * 
 * Uploads updated portfolio files directly to GitHub without requiring Git CLI.
 * 
 * Usage:
 *   1. Add your GitHub Personal Access Token to github_config.json
 *   2. Run: node upload_to_github.js [--all | --file <path>]
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'github_config.json');

if (!fs.existsSync(CONFIG_PATH)) {
    console.error('Error: github_config.json not found!');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

if (!config.token || config.token === 'YOUR_GITHUB_TOKEN_HERE') {
    console.error('\n[AUTHENTICATION REQUIRED]');
    console.error('Please open github_config.json and set your GitHub Personal Access Token (PAT).');
    console.error('Create a token at: https://github.com/settings/tokens (classic token with "repo" scope).');
    process.exit(1);
}

const OWNER = config.owner || 'muhammedashad';
const REPO = config.repo || 'Ashad-personal-portfolio';
const BRANCH = config.branch || 'main';

async function githubRequest(endpoint, method = 'GET', body = null) {
    const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Ashad-Portfolio-Uploader',
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    let data = null;
    try {
        data = await res.json();
    } catch(e) {}
    return { status: res.status, ok: res.ok, data };
}

async function uploadSingleFile(filePath) {
    const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
    console.log(`\nUploading: ${relativePath}...`);

    if (!fs.existsSync(filePath)) {
        console.error(`File does not exist: ${filePath}`);
        return false;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const contentB64 = fileBuffer.toString('base64');

    // Check if file already exists in repo to get SHA
    const checkRes = await githubRequest(`/repos/${OWNER}/${REPO}/contents/${relativePath}?ref=${BRANCH}`);
    let sha = null;
    if (checkRes.status === 200 && checkRes.data?.sha) {
        sha = checkRes.data.sha;
    }

    const payload = {
        message: `Update ${relativePath} via Ashad Portfolio Uploader`,
        content: contentB64,
        branch: BRANCH
    };
    if (sha) payload.sha = sha;

    const uploadRes = await githubRequest(`/repos/${OWNER}/${REPO}/contents/${relativePath}`, 'PUT', payload);
    if (uploadRes.status === 200 || uploadRes.status === 201) {
        console.log(`✅ Successfully uploaded ${relativePath} (${sha ? 'Updated' : 'Created'})`);
        return true;
    } else {
        console.error(`❌ Failed to upload ${relativePath}:`, uploadRes.data?.message || uploadRes.status);
        return false;
    }
}

async function main() {
    console.log('=== ASHAD PORTFOLIO GITHUB UPLOADER ===');
    console.log(`Target: https://github.com/${OWNER}/${REPO} (Branch: ${BRANCH})`);

    // Verify repository access
    console.log('\nChecking repository access...');
    const repoCheck = await githubRequest(`/repos/${OWNER}/${REPO}`);
    if (repoCheck.status === 404) {
        console.error(`Repository ${OWNER}/${REPO} not found or token has insufficient permissions.`);
        process.exit(1);
    } else if (repoCheck.status === 401) {
        console.error('Invalid token. Please check your GitHub token in github_config.json.');
        process.exit(1);
    } else if (!repoCheck.ok) {
        console.error('GitHub API error:', repoCheck.data?.message || repoCheck.status);
        process.exit(1);
    }

    console.log(`Repository confirmed: ${repoCheck.data.html_url}`);

    // Parse CLI arguments
    const args = process.argv.slice(2);
    if (args.includes('--file') && args[args.indexOf('--file') + 1]) {
        const targetFile = args[args.indexOf('--file') + 1];
        await uploadSingleFile(path.resolve(__dirname, targetFile));
    } else {
        // Upload updated production files
        const coreFiles = [
            'index.html',
            'CNAME',
            'robots.txt',
            'sitemap.xml',
            '.gitignore',
            'works-manifest.json',
            'css/style.css',
            'css/cursor.css',
            'css/feedback.css',
            'css/certifications.css',
            'css/globe.css',
            'js/main.js',
            'js/feedback.js',
            'js/certifications.js',
            'js/projects-data.js',
            'js/project-viewer.js',
            'js/globe.js',
            'vendor/three.min.js',
            'assets/workes/61.jpg',
            'assets/Muhammed_Ashad_K_CV.pdf'
        ];

        console.log(`\nStarting upload of ${coreFiles.length} core production files...`);
        let successCount = 0;
        for (let i = 0; i < coreFiles.length; i++) {
            const rel = coreFiles[i];
            const full = path.join(__dirname, rel);
            console.log(`[${i + 1}/${coreFiles.length}] Processing ${rel}...`);
            const ok = await uploadSingleFile(full);
            if (ok) successCount++;
            // Brief pause between requests to prevent secondary rate limits
            await new Promise(r => setTimeout(r, 600));
        }

        console.log(`\n========================================`);
        console.log(`Upload complete: ${successCount}/${coreFiles.length} files successfully pushed to GitHub!`);
        console.log(`Visit: https://github.com/${OWNER}/${REPO}`);
        console.log(`========================================`);
    }
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
