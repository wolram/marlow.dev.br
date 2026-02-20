# Project Overview

This directory contains the source code for the personal portfolio website of **Marlow Sousa** (marlow.dev.br). It is a static website highlighting his work as an Software Engineering Lead and Digital Nomad.

The site is built using:
- **HTML5**: Semantic structure.
- **CSS3**: Internal styling with modern features (CSS variables, Flexbox, Grid, Animations).
- **Embedded Assets**: SVGs are embedded directly in the HTML.

# Deployment

The project includes a deployment script to push changes to the production server (Hostinger).

**Command:**
```bash
./deploy.sh
```

**What it does:**
1.  Uses `rsync` to upload files from the local directory to the remote server.
2.  Excludes development files (e.g., `.git`, `.DS_Store`, `deploy.sh`, `.claude`).
3.  Connects via SSH on port `65002`.
4.  Sets correct file permissions (644) for `index.html` and `og-image.png` using `sftp`.

**Prerequisites:**
- SSH access to the remote server must be configured.
- The `rsync` and `sftp` utilities must be available in the environment.

# Key Files

*   **`index.html`**: The main file containing all content, structure, and styling for the single-page application.
*   **`deploy.sh`**: Bash script for automating the deployment process.
*   **`og-image.png`**: Open Graph image used for social media link previews.
*   **`Profile-2.pdf`**: (Excluded from deploy) Likely a downloadable resume/CV.
*   **`.claude/`**: Directory for Claude AI configuration (excluded from deploy).

# Development

Since this is a static site without a build step, development consists of directly editing `index.html`.

1.  **Edit**: Modify `index.html` to update content or styles.
2.  **Preview**: Open `index.html` in a local web browser to test changes.
3.  **Deploy**: Run `./deploy.sh` to publish changes.
