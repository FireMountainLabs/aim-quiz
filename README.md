# AI Maturity Assessment Tool

A modern, interactive web app for assessing organizational AI maturity. Built with Vite, featuring a beautiful UI, instant results, and secure email integration with EmailJS.

---

## 🚀 Features
- **Quick AI Maturity Quiz**: 5-question assessment across key organizational dimensions
- **Instant Results**: Visual scores, recommendations, and progress bars
- **Email Integration**: Secure contact form via EmailJS (no backend required)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Easy Deployment**: One-command deploy to GitHub Pages
- **Lead Generation**: Automatically sends assessment results to info@firemountainlabs.com

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/FireMountainLabs/aim-quiz.git
cd aim-quiz
npm install
```

### 2. EmailJS Setup (Required)
Before running the app, you need to configure EmailJS:

1. **Create EmailJS Account**: Sign up at [https://www.emailjs.com/](https://www.emailjs.com/)
2. **Add Email Service**: Connect Gmail, Outlook, or other email service
3. **Create Email Template**: Use the template from `SETUP_GUIDE.md`
4. **Get Credentials**: Copy User ID, Service ID, and Template ID
5. **Set Environment Variables**: Create a `.env` file and add your credentials. **Note:** Variables must be prefixed with `VITE_`.
   ```env
   VITE_EMAILJS_USER_ID=your_user_id_here
   VITE_EMAILJS_SERVICE_ID=your_service_id_here
   VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
   ```

### 3. Local Development
```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Test Email Functionality
Open browser console and run:
```javascript
testEmailJSConfig()  // Check configuration
testEmailSending()   // Send test email
```

### 5. Production Build & Deploy
```bash
npm run build
npm run deploy
# Or push to main branch for auto-deploy via GitHub Actions
```

---

## 🔧 Configuration

### EmailJS Setup (Detailed)
See `SETUP_GUIDE.md` for complete EmailJS configuration instructions.

### GitHub Pages Deployment
- Deployment is automated via GitHub Actions (see `.github/workflows/deploy.yml`)
- Site will be published at: `https://<your-username>.github.io/aim-quiz/`
- For production, set EmailJS environment variables in GitHub Secrets

---

## 🎨 Customization
- **Quiz Content**: Edit `ai_maturity_quick_check.json`
- **Styling**: Tweak `style.css` (colors, fonts, layout)
- **Email Template**: Update in EmailJS dashboard
- **Email Recipient**: Change `info@firemountainlabs.com` in `script.js`

---

## 🧪 Testing

### EmailJS Testing
The app includes built-in testing functions:
- `testEmailJSConfig()`: Validates EmailJS configuration
- `testEmailSending()`: Sends a test email to info@firemountainlabs.com

### Manual Testing
1. Complete the assessment
2. Fill out contact form
3. Submit - check info@firemountainlabs.com for email
4. Verify all assessment data is included

---

## 🛠️ Troubleshooting

### Email Issues
- **Email not sending?** Check EmailJS configuration and template variables
- **Configuration errors?** Verify environment variables are set correctly
- **Template issues?** Ensure all variables are defined in EmailJS template
- **Rate limiting?** Check EmailJS dashboard for usage limits

### General Issues
- **Build fails?** Ensure Node.js v16+ and all dependencies installed
- **Quiz not loading?** Validate your JSON files and check browser console
- **Permission errors on deploy?** Ensure GitHub Actions has write access

---

## 📁 Project Structure
```
/aim-quiz
  |-- index.html              # Main HTML file
  |-- style.css               # Styles and UI
  |-- script.js               # Main application logic
  |-- ai_maturity_quick_check.json  # Quiz configuration
  |-- test_emailjs.js         # EmailJS testing utilities
  |-- SETUP_GUIDE.md          # Detailed EmailJS setup guide
  |-- package.json
  |-- vite.config.js          # Build configuration
  |-- .github/workflows/deploy.yml
  |-- README.md
```

---

## 📧 Email Integration Details

The app automatically sends assessment results to `info@firemountainlabs.com` when users submit the contact form. Each email includes:

- **Contact Information**: Name, email, company, title, phone
- **Assessment Results**: Maturity level, scores, recommendations
- **Quiz Answers**: Complete response data for analysis
- **Metadata**: Timestamp, user agent, etc.

### Email Template Variables
- `{{to_email}}` - Always set to info@firemountainlabs.com
- `{{from_name}}`, `{{from_email}}` - User contact info
- `{{company}}`, `{{title}}`, `{{phone}}` - Additional contact details
- `{{message}}` - User's additional notes
- `{{maturity_level}}`, `{{maturity_level_number}}` - Assessment results
- `{{total_score}}`, `{{average_score}}`, `{{percentage}}` - Numerical scores
- `{{recommendations}}` - Formatted recommendations list
- `{{quiz_answers}}` - JSON string of all quiz responses

---

## 📄 License
Proprietary to Fire Mountain Labs. All rights reserved.

## 📞 Support
- Email: info@firemountainlabs.com
- Or open an issue on GitHub

---
_Built with ❤️ by Fire Mountain Labs_