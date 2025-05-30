# Markdown CV Builder

A modern, customizable CV/Resume builder that converts Markdown to a beautiful web page and PDF. Perfect for developers and tech professionals who want to maintain their CV in a version-controlled format.

## 🚀 Features

- Write your CV in Markdown
- Multiple language support
- Multiple theme options
- Automatic deployment to GitHub Pages
- PDF export
- Mobile-responsive design
- SEO-friendly

## 🛠️ Quick Start

1. **Fork this repository**
   Click the "Fork" button at the top right of this page.

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages"
   - Select "GitHub Actions" as the source
   - The site will be available at `https://[your-username].github.io/markdown-cv-builder`

3. **Customize your CV**
   - Edit the Markdown files in the `markdown-source` directory
   - The main template is in `cv.default.en.md`
   - Create language variants by copying and renaming (e.g., `cv.de.md` for German)

4. **Configuration**
   Create a `.env` file in the root directory with these options:
   ```env
   # Theme options: github, retro, screen
   VITE_CV_THEME=github
   VITE_PAGE_TITLE=Your Name - CV
   ```

## 📝 Markdown Format

The CV builder supports standard Markdown syntax plus some special formatting:
- Use `#` for your name
- Use `##` for main sections
- Use `###` for subsections or job titles
- Use `>` for contact information
- Use `-` or `*` for bullet points

See `markdown-source/cv.default.en.md` for a complete example.

## 🎨 Themes

Currently available themes:
- `github` - Clean, professional GitHub-style theme (default)
- `retro` - Classic paper-like theme
- `screen` - Modern, screen-optimized theme

To change the theme:
1. Update `VITE_CV_THEME` in your `.env` file
2. Or use the manual deployment workflow with your chosen theme

## 🔄 Automatic Deployment

The CV automatically deploys to GitHub Pages when you:
1. Push changes to the `master` branch
2. The GitHub Action will build and deploy your CV
3. View your CV at `https://[your-username].github.io/markdown-cv-builder`


## 📱 Mobile Responsive

Your CV will look great on all devices - desktop, tablet, and mobile.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
