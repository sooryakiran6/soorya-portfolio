# Soorya Kiran - Portfolio Website

A high-performance, dynamic portfolio featuring kinetic typography, multi-theme neon aesthetics, 3D interactive hero parallax, physics-based stickers, curved case-study carousel, and flipbook comic readers.

## 🚀 How to Host on GitHub Pages (Free & Instant)

1. **Create a GitHub Repository**:
   - Go to [github.com/new](https://github.com/new).
   - Name your repository (e.g. portfolio or <your-username>.github.io).
   - Choose **Public**, leave other options unchecked, and click **Create repository**.

2. **Upload Files**:
   - **Option A (Via Web Browser / Drag & Drop)**:
     - On your new repository page, click **uploading an existing file**.
     - Drag and drop all files and the img folder from this directory directly into the browser.
     - Click **Commit changes**.
   - **Option B (Via Git CLI)**:
     `ash
     git init
     git add .
     git commit -m "Initial portfolio release"
     git branch -M main
     git remote add origin https://github.com/<your-username>/<repo-name>.git
     git push -u origin main
     `

3. **Enable GitHub Pages**:
   - In your repository, go to **Settings** > **Pages** (on the left sidebar).
   - Under **Build and deployment > Branch**, select main (or master) and folder / (root).
   - Click **Save**.
   - In 1-2 minutes, your website will be live at https://<your-username>.github.io/<repo-name>/!

## 💻 Running Locally

- Simply double-click Start-Portfolio.bat (or open index.html in any modern web browser).
- Or run a lightweight local server:
  `ash
  npx serve .
  # or
  python -m http.server 8000
  `

## 📁 File Structure

`	ext
├── index.html               # Main interactive portfolio
├── resume.html              # Dedicated full resume page
├── styles.css               # Complete stylesheet & responsive styles
├── app.js                   # Interactive logic, physics & state
├── resume.pdf               # Downloadable PDF resume
├── backdrop*.png            # Background grid & noise textures
├── logo.png / logo-reveal.* # Animated branding & loaders
├── favicon* / apple-touch*  # Browser & mobile app icons
├── .nojekyll                # GitHub Pages asset preservation
├── Start-Portfolio.bat      # Local runner
└── img/                     # All project art, stickers & media
    ├── profile/             # Profile portraits
    ├── projects/            # Project posters, comics, case studies
    └── stickers/            # Physics canvas stickers & visual assets
`

© 2026 Soorya Kiran. All rights reserved.
