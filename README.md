# AI Maturity Assessment Tool

A modern, interactive web app for assessing organizational AI maturity. Built with Vite, featuring a beautiful UI, instant results, and secure email integration.

---

## 🚀 Features
- **Quick AI Maturity Quiz**: 5-question assessment across key organizational dimensions
- **Instant Results**: Visual scores, recommendations, and progress bars
- **Email Integration**: Secure contact form via EmailJS (no backend required)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Easy Deployment**: One-command deploy to GitHub Pages

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/FireMountainLabs/aim-quiz.git
cd aim-quiz
npm install
```

### 2. Local Development
```bash
npm run dev
# Visit http://localhost:3000
```

### 3. Production Build & Deploy
```bash
npm run build
npm run deploy
# Or push to main branch for auto-deploy via GitHub Actions
```

---

## 🔧 Configuration

### EmailJS Setup
1. [Create an EmailJS account](https://www.emailjs.com/)
2. Add an email service and template (see EmailJS docs)
3. In your GitHub repo, add these secrets (Settings → Secrets and variables → Actions):
   - `EMAILJS_USER_ID`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`

### GitHub Pages
- Deployment is automated via GitHub Actions (see `.github/workflows/deploy.yml`)
- Site will be published at: `https://<your-username>.github.io/aim-quiz/`

---

## 🎨 Customization
- **Quiz Content**: Edit `ai_maturity_quick_check.json`
- **Styling**: Tweak `style.css` (colors, fonts, layout)
- **Email Template**: Update in EmailJS dashboard

---

## 🛠️ Troubleshooting
- **Email not sending?** Check GitHub secrets and EmailJS config
- **Build fails?** Ensure Node.js v16+ and all dependencies installed
- **Quiz not loading?** Validate your JSON files and check browser console
- **Permission errors on deploy?** Ensure GitHub Actions has write access (Settings → Actions → General → Workflow permissions: set to "Read and write")

---

## 📁 Project Structure
```
/aim-quiz
  |-- index.html
  |-- style.css
  |-- script.js
  |-- ai_maturity_quick_check.json
  |-- package.json
  |-- vite.config.js
  |-- .github/workflows/deploy.yml
  |-- README.md
```

---

## 📄 License
Proprietary to Fire Mountain Labs. All rights reserved.

## 📞 Support
- Email: info@firemountainlabs.com
- Or open an issue on GitHub

---
_Built with ❤️ by Fire Mountain Labs_

.heading-class {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  width: 100%;
  max-width: 100%;
  display: block;
}