# Interactive Quiz App

A modern, interactive web application for creating and deploying custom assessments and quizzes. Built with Vite, featuring a beautiful UI, instant results, and secure email integration with EmailJS.

---

## 🚀 Features
- **Custom Quiz Builder**: Create assessments with multiple questions and scoring
- **Instant Results**: Visual scores, recommendations, and progress bars
- **Email Integration**: Secure contact form via EmailJS (no backend required)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Easy Deployment**: One-command deploy to GitHub Pages
- **Lead Generation**: Automatically sends assessment results via email
- **Configurable**: Easy to customize questions, scoring, and branding

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd <your-repo-name>
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

### Quiz Configuration
Edit `local_quiz_config.json` to customize your quiz:

```json
{
  "app_config": {
    "title": "Your Quiz Title",
    "subtitle": "Your quiz description",
    "company_name": "Your Company",
    "footer_copyright": "© 2025 Your Company"
  },
  "questions": [
    {
      "id": 1,
      "category": "Category Name",
      "question": "Your question text?",
      "pillars_covered": ["pillar_1"],
      "choices": {
        "Yes": { "text": "Option 1", "score": 4.5, "description": "Description" },
        "Partially": { "text": "Option 2", "score": 2.5, "description": "Description" },
        "No": { "text": "Option 3", "score": 1, "description": "Description" }
      }
    }
  ]
}
```

### EmailJS Setup (Detailed)
See `SETUP_GUIDE.md` for complete EmailJS configuration instructions.

### GitHub Pages Deployment
- Deployment is automated via GitHub Actions (see `.github/workflows/deploy.yml`)
- Site will be published at: `https://<your-username>.github.io/<your-repo-name>/`
- For production, set EmailJS environment variables in GitHub Secrets

---

## 🎨 Customization

### Quiz Content
- **Questions**: Edit the `questions` array in `local_quiz_config.json`
- **Scoring**: Modify score values and interpretation ranges
- **Categories**: Add or modify question categories and pillars
- **Branding**: Update app title, company name, and styling

### Styling
- **Colors & Fonts**: Tweak `style.css` for custom branding
- **Layout**: Modify CSS classes for different layouts
- **Icons**: Replace icons in the `public/icons/` directory

### Email Integration
- **Template**: Update email template in EmailJS dashboard
- **Recipients**: Change email recipient in `script.js`
- **Fields**: Modify contact form fields in the config

---

## 🧪 Testing

### EmailJS Testing
The app includes built-in testing functions:
- `testEmailJSConfig()`: Validates EmailJS configuration
- `testEmailSending()`: Sends a test email

### Manual Testing
1. Complete the assessment
2. Fill out contact form
3. Submit - check your email for results
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
/<your-repo-name>
  |-- index.html              # Main HTML file
  |-- style.css               # Styles and UI
  |-- script.js               # Main application logic
  |-- local_quiz_config.json  # Quiz configuration
  |-- test_emailjs.js         # EmailJS testing utilities
  |-- SETUP_GUIDE.md          # Detailed EmailJS setup guide
  |-- package.json
  |-- vite.config.js          # Build configuration
  |-- .github/workflows/deploy.yml
  |-- README.md
```

---

## 📧 Email Integration Details

The app automatically sends assessment results when users submit the contact form. Each email includes:

- **Contact Information**: Name, email, company, title, phone
- **Assessment Results**: Score level, scores, recommendations
- **Quiz Answers**: Complete response data for analysis
- **Metadata**: Timestamp, user agent, etc.

### Email Template Variables
- `{{to_email}}` - Recipient email address
- `{{from_name}}`, `{{from_email}}` - User contact info
- `{{company}}`, `{{title}}`, `{{phone}}` - Additional contact details
- `{{message}}` - User's additional notes
- `{{score_level}}`, `{{score_level_number}}` - Assessment results
- `{{total_score}}`, `{{average_score}}`, `{{percentage}}` - Numerical scores
- `{{recommendations}}` - Formatted recommendations list
- `{{quiz_answers}}` - JSON string of all quiz responses

---

## 📄 License
MIT License - feel free to use and modify for your projects.

## 📞 Support
- Open an issue on GitHub for bugs or feature requests
- Check the documentation in `SETUP_GUIDE.md` for detailed setup instructions

---

## 📊 Google Analytics Setup & Event Tracking

### Setup
1. **Create a Google Analytics 4 property** at https://analytics.google.com/ and get your Measurement ID (e.g., G-XXXXXXXXXX).
2. **Set the environment variable** in your deployment:
   - For local development, add to your `.env` file:
     ```env
     VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
     ```
   - For GitHub Actions or CI/CD, add `VITE_GA_MEASUREMENT_ID` as a secret/environment variable.
3. The app will automatically inject the GA tag and send events if the variable is set.

### Custom Events Tracked
The app sends the following custom events to Google Analytics:

| Event Name              | Triggered When                                      | Parameters Sent                                  |
|------------------------|-----------------------------------------------------|--------------------------------------------------|
| question_answered      | User answers a quiz question                        | question_id, question_text, answer, score        |
| quiz_abandoned         | User leaves quiz before finishing                    | reason, question_id, time_spent                  |
| quiz_completed         | User completes all quiz questions                    | total_score, average_score, maturity_level        |
| contact_form_completed | User submits the contact form (before email sent)    | name, email, company                             |
| back_to_assessment     | User clicks 'Back to Snapshot' from contact form     | from                                             |
| form_submitted_success | Email is sent successfully via contact form          | name, email, company                             |

You can view these events in the **Realtime** or **Events** section of your GA4 dashboard.

---
_Built with modern web technologies for creating engaging assessments_# Trigger deployment
