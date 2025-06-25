// AI Maturity Snapshot Application - Modern One-Question-at-a-Time Flow
// EmailJS Configuration - Only defined when not in fallback mode
let EMAILJS_CONFIG = null;

const FALLBACK_QUIZ_CONFIG = {
  "app_config": {
    "title": "AI Maturity Checkup (Demo)",
    "subtitle": "This is a demonstration version. Please contact support to access the full assessment.",
  },
  "sections": {
    "quiz": { "description": "This is a demonstration version." },
    "snapshot": { "title": "DEMO SNAPSHOT", "subtitle": "Demonstration Profile", "pillars_title": "Maturity Scoring", "recommendations_title": "Key Recommendations" },
    "contact": { "title": "Contact Us", "description": "Contact us to get access to the full assessment.", "fields": { "name": {"label": "Name *", "type": "text", "required": true}, "email": {"label": "Email *", "type": "email", "required": true}, "company": {"label": "Company *", "type": "text", "required": true} } },
    "success": { "title": "Request Sent!", "description": "Thank you for your interest!", "icon": "✅" }
  },
  "buttons": {
    "generate_snapshot": { "text": "Generate Snapshot" }, "submit_contact": { "text": "Submit" }, "back_to_quiz": { "text": "Back to Quiz" },
    "back_to_snapshot": { "text": "Back to Snapshot" }, "download_snapshot": { "text": "Contact Us" }, "start_over": { "text": "Start New Assessment" }, "send_request": { "text": "Send Request" }
  },
  "pillars": { "demo_pillar": { "name": "Demonstration Pillar", "icon": "icons/strategy.svg" } },
  "questions": [
    {
      "id": 1, "category": "Demonstration", "question": "This is a demo question. Is the primary assessment configured correctly?", "pillars_covered": ["demo_pillar"],
      "choices": {
        "Yes": { "text": "Yes", "score": 4.5, "description": "The full assessment should be loading." },
        "No": { "text": "No", "score": 1, "description": "The system has correctly loaded the fallback demo quiz." }
      }
    }
  ],
  "interpretation_guide": {
    "total_score_ranges": { "0-5": { "level": "Level 0: Demo Mode", "description": "This is a fallback demonstration.", "recommendations": ["Please contact support to resolve the configuration issue."] } }
  }
};

let quizConfig = null;
let quizAnswers = {};
let quizResults = null;
let currentQuestionIndex = 0;
let quizStarted = false;
let isFallbackMode = false;
let quizStartTime;
let currentQuestionStartTime;
let quizAbandoned = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadQuizConfig();
        // Only initialize EmailJS config if not in fallback mode
        if (!isFallbackMode) {
            EMAILJS_CONFIG = {
                USER_ID: import.meta.env.VITE_EMAILJS_USER_ID,
                SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
                TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID
            };
        }
    } catch (error) {
        console.warn(`Primary quiz config failed to load: ${error.message}. Using fallback quiz.`);
        quizConfig = FALLBACK_QUIZ_CONFIG;
        isFallbackMode = true;
        showError('Could not load the assessment and are showing a demo version. Please contact support.');
    }

    try {
        populateUIContent();
        setupEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize app with quiz config:', error);
        // This is a critical failure, the page cannot be rendered.
        document.body.innerHTML = '<h1>A critical error occurred. The application cannot start.</h1>';
    }
}

async function loadQuizConfig() {
    const configJsonString = import.meta.env.VITE_QUIZ_JSON_CONTENT;
    if (configJsonString) {
        // In production, load config from the base64 encoded environment variable
        console.log("Loading quiz config from environment variable.");
        try {
            // Use a UTF-8-aware base64 decoder instead of atob()
            const decodedJson = decodeBase64UTF8(configJsonString);
            quizConfig = JSON.parse(decodedJson);
        } catch (error) {
            if (error instanceof DOMException) {
                throw new Error('The provided quiz content is not a valid Base64 string.');
            } else if (error instanceof SyntaxError) {
                throw new Error('The decoded quiz content is not valid JSON.');
            } else {
                throw new Error('A generic configuration error occurred during parsing.');
            }
        }
    } else {
        // In local development, load from the local file
        console.log("Loading quiz config from local local_quiz_config.json file.");
        const response = await fetch('./local_quiz_config.json');
        if (!response.ok) {
            throw new Error('Could not load local quiz configuration file.');
        }
        quizConfig = await response.json();
    }
}

// UTF-8-aware base64 decoder function
function decodeBase64UTF8(str) {
    try {
        // First try the modern approach with TextDecoder
        const binaryString = atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
        // Fallback to legacy atob if TextDecoder is not available
        console.warn('TextDecoder not available, using legacy atob fallback');
        return atob(str);
    }
}

function populateUIContent() {
    if (!quizConfig) return;

    const pageTitle = [quizConfig.app_config.title, quizConfig.app_config.company_name].filter(Boolean).join(' - ');
    document.getElementById('page-title').textContent = pageTitle;

    document.getElementById('hero-title').textContent = quizConfig.app_config.title;
    document.getElementById('hero-subtitle').innerHTML = quizConfig.app_config.subtitle;
    document.getElementById('quiz-title').textContent = quizConfig.sections.quiz.title;
    document.getElementById('quiz-description').textContent = quizConfig.sections.quiz.description;
    document.getElementById('snapshot-title').textContent = quizConfig.sections.snapshot.title;
    document.getElementById('snapshot-subtitle').textContent = quizConfig.sections.snapshot.subtitle;
    document.getElementById('pillars-title').textContent = quizConfig.sections.snapshot.pillars_title;
    document.getElementById('recommendations-title').textContent = quizConfig.sections.snapshot.recommendations_title;
    document.getElementById('contact-title').textContent = quizConfig.sections.contact.title;
    document.getElementById('contact-description').textContent = quizConfig.sections.contact.description;
    document.getElementById('success-icon').textContent = quizConfig.sections.success.icon;
    document.getElementById('success-title').textContent = quizConfig.sections.success.title;
    document.getElementById('success-description').textContent = quizConfig.sections.success.description;
    document.getElementById('download-snapshot').textContent = quizConfig.buttons.download_snapshot.text;
    document.getElementById('start-over').textContent = quizConfig.buttons.start_over.text;
    
    // Hide quiz actions if no questions
    if (!quizConfig.questions || quizConfig.questions.length === 0) {
        document.getElementById('quiz-actions').style.display = 'none';
    }
    
    // Handle logo image replacement
    const logoArea = document.querySelector('.logo-area');
    const existingLogo = logoArea.querySelector('.app-logo');
    if (existingLogo && quizConfig.app_config.logo_image_url) {
        const logoImg = document.createElement('img');
        logoImg.src = quizConfig.app_config.logo_image_url;
        logoImg.alt = quizConfig.app_config.company_name + ' Logo';
        logoImg.className = 'app-logo';
        logoImg.onerror = function() {
            console.warn('Failed to load logo from:', this.src);
            // Fallback to text if image fails to load
            this.style.display = 'none';
        };
        existingLogo.replaceWith(logoImg);
    }
    
    generateContactForm();
}

function generateContactForm() {
    const contactForm = document.getElementById('contact-form');
    contactForm.innerHTML = ''; // Clear existing content
    const fields = quizConfig.sections.contact.fields;

    Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        const fieldId = `contact-${fieldName}`;
        label.setAttribute('for', fieldId);
        label.textContent = fieldConfig.label;
        formGroup.appendChild(label);

        let input;
        if (fieldConfig.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
            input.placeholder = fieldConfig.placeholder || '';
        } else {
            input = document.createElement('input');
            input.type = fieldConfig.type;
        }

        input.id = fieldId;
        input.name = fieldName;
        if (fieldConfig.required) {
            input.required = true;
        }

        formGroup.appendChild(input);
        contactForm.appendChild(formGroup);
    });

    const formActions = document.createElement('div');
    formActions.className = 'form-actions';

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.id = 'back-to-snapshot';
    backButton.className = 'btn btn-outline';
    backButton.textContent = quizConfig.buttons.back_to_snapshot.text;
    formActions.appendChild(backButton);

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-primary';
    submitButton.textContent = quizConfig.buttons.send_request.text;
    formActions.appendChild(submitButton);

    contactForm.appendChild(formActions);
}

function initializeEmailJS() {
    // Additional safety check to prevent EmailJS initialization in fallback mode
    if (isFallbackMode || !EMAILJS_CONFIG) {
        console.warn('EmailJS initialization skipped in fallback mode for security reasons.');
        return;
    }
    
    try { 
        emailjs.init(EMAILJS_CONFIG.USER_ID); 
    } catch (error) { 
        console.error('Failed to initialize EmailJS:', error); 
    }
}

function setupEventListeners() {
    document.getElementById('start-quiz').addEventListener('click', startQuizFlow);
    document.getElementById('download-snapshot').addEventListener('click', downloadSnapshot);
    document.getElementById('start-over').addEventListener('click', startOver);
    document.addEventListener('submit', function(event) {
        if (event.target.id === 'contact-form') {
            event.preventDefault();
            handleContactForm(event);
        }
    });
    document.addEventListener('click', function(event) {
        if (event.target.id === 'back-to-snapshot') {
            event.preventDefault();
            showSnapshotSection();
        }
    });
}

function startQuizFlow() {
    quizStarted = true;
    currentQuestionIndex = 0;
    quizAnswers = {};
    quizStartTime = Date.now();
    quizAbandoned = false;
    document.getElementById('quiz-actions').style.display = 'none';
    
    renderSingleQuestion();
}

function renderSingleQuestion() {
    const container = document.getElementById('single-question-container');
    container.innerHTML = '';
    if (currentQuestionIndex >= quizConfig.questions.length) {
        // All questions answered, show snapshot
        quizResults = calculateResults(quizAnswers);
        displaySnapshot(quizResults);
        showSnapshotSection();
        
        // Remove abandonment tracking since quiz is completed
        removeAbandonmentTracking();
        
        return;
    }
    
    const question = quizConfig.questions[currentQuestionIndex];
    currentQuestionStartTime = Date.now(); // Track when this question started
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-card';
    questionDiv.innerHTML = `
        <div class="question-category">${question.category}</div>
        <div class="question-text">${question.question}</div>
        <div class="choices">
            ${Object.entries(question.choices).map(([key, choice]) => `
                <label class="choice">
                    <input type="radio" name="question_${question.id}" value="${key}" data-score="${choice.score}">
                    <div class="choice-label">
                        <div class="choice-text">${choice.text}</div>
                        <div class="choice-description">${choice.description}</div>
                    </div>
                </label>
            `).join('')}
        </div>
    `;
    container.appendChild(questionDiv);
    
    // Add event listeners for choices
    const radios = questionDiv.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            const questionTime = Date.now() - currentQuestionStartTime; // Time spent on this question
            
            // Save answer
            quizAnswers[question.id] = {
                choice: radio.value,
                score: parseInt(radio.dataset.score),
                question: question,
                timeSpent: questionTime
            };
            
            // Visual feedback
            questionDiv.querySelectorAll('.choice').forEach(label => label.classList.remove('selected'));
            radio.closest('.choice').classList.add('selected');
            
            // Delay for feedback, then next question
            setTimeout(() => {
                currentQuestionIndex++;
                renderSingleQuestion();
            }, 250);
        });
    });
    
    // Focus the screen on the question card
    questionDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Start dwell tracking for this question
    setupQuestionDwellTracking();
}

function showQuizSection() {
    hideAllSections();
    document.getElementById('quiz-section').style.display = 'block';
    document.getElementById('quiz-actions').style.display = quizStarted ? 'none' : 'block';
    document.getElementById('single-question-container').innerHTML = '';
    quizStarted = false;
}

function showSnapshotSection() {
    hideAllSections();
    document.getElementById('snapshot-section').style.display = 'block';
}

function showContactSection() {
    hideAllSections();
    document.getElementById('contact-section').style.display = 'block';
}

function showSuccessMessage() {
    hideAllSections();
    document.getElementById('success-message').style.display = 'flex';
}

function hideAllSections() {
    ['quiz-section', 'snapshot-section', 'contact-section', 'success-message'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

function calculateResults(answers) {
    const pillarScores = calculatePillarScores(answers);
    
    // Calculate average of pillar scores
    let totalPillarScore = 0;
    let totalPillarCount = 0;
    
    Object.values(pillarScores).forEach(pillarResult => {
        if (pillarResult.count > 0) {
            totalPillarScore += pillarResult.score / pillarResult.count; // Average score for this pillar
            totalPillarCount++;
        }
    });
    
    const averagePillarScore = totalPillarCount > 0 ? totalPillarScore / totalPillarCount : 0;
    const cappedAverageScore = Math.min(averagePillarScore, 4.5); // Cap at 4.5
    
    // Determine maturity level based on the new 1-4.5 scale
    let maturityLevelNumber;
    if (cappedAverageScore >= 3.5) {
        maturityLevelNumber = 4; // Level 4: Managed
    } else if (cappedAverageScore >= 2.5) {
        maturityLevelNumber = 3; // Level 3: Developing
    } else if (cappedAverageScore >= 1.5) {
        maturityLevelNumber = 2; // Level 2: Engaged
    } else {
        maturityLevelNumber = 1; // Level 1: Initial
    }

    const maturityLevels = [
        { // Level 1
            level: "Level 1: Initial",
            description: "Limited AI readiness requiring foundational work across multiple areas.",
            recommendations: [
                "Start with basic AI governance and strategy",
                "Build foundational technology and data capabilities",
                "Consider external expertise and guidance"
            ]
        },
        { // Level 2
            level: "Level 2: Engaged",
            description: "Basic AI awareness and capabilities are emerging, but efforts are fragmented.",
            recommendations: [
                "Develop a formal AI strategy and roadmap",
                "Establish clear roles and responsibilities for AI initiatives",
                "Begin investing in targeted workforce training"
            ]
        },
        { // Level 3
            level: "Level 3: Developing",
            description: "Good progress in most areas with some opportunities for improvement.",
            recommendations: [
                "Strengthen areas with lower scores",
                "Standardize processes across the organization",
                "Increase leadership visibility and commitment"
            ]
        },
        { // Level 4
            level: "Level 4: Managed",
            description: "Strong AI foundation across all key areas. Focus on optimization and advanced capabilities.",
            recommendations: [
                "Focus on scaling successful AI initiatives",
                "Implement robust monitoring and performance tracking",
                "Foster a culture of data-driven decision-making"
            ]
        }
    ];

    const maturityLevelIndex = maturityLevelNumber - 1;
    const maturityLevel = maturityLevels[maturityLevelIndex];
    
    // Calculate total score for backward compatibility
    let totalScore = 0;
    Object.values(answers).forEach(answer => {
        totalScore += answer.score;
    });

    let recommendations = maturityLevel ? [...maturityLevel.recommendations] : [];
    const hasUncertainAnswers = Object.values(answers).some(a => a.choice === "I Don't Know");
    if (hasUncertainAnswers && quizConfig.interpretation_guide && quizConfig.interpretation_guide.uncertainty_guidance) {
        recommendations.push(...quizConfig.interpretation_guide.uncertainty_guidance.recommendations);
    }

    return {
        totalScore,
        averagePillarScore: cappedAverageScore,
        maturityLevel,
        maturityLevelNumber,
        pillarScores,
        recommendations
    };
}

function calculatePillarScores(answers) {
    const pillarScores = {};
    Object.keys(quizConfig.pillars).forEach(pillarKey => {
        pillarScores[pillarKey] = {
            score: 0,
            count: 0
        };
    });

    Object.values(answers).forEach(answer => {
        const question = answer.question;
        const pillars = question.pillars_covered;

        pillars.forEach(pillarKey => {
            pillarScores[pillarKey].score += answer.score;
            pillarScores[pillarKey].count++;
        });
    });

    return pillarScores;
}

function displaySnapshot(results) {
    // Display the maturity level number (1, 2, 3, or 4) in the score circle
    document.getElementById('overall-score').textContent = results.maturityLevelNumber;
    if (results.maturityLevel) {
        document.getElementById('maturity-level').textContent = results.maturityLevel.level;
        document.getElementById('maturity-description').textContent = results.maturityLevel.description;
    } else {
        document.getElementById('maturity-level').textContent = 'N/A';
        document.getElementById('maturity-description').textContent = 'Could not determine maturity level.';
    }

    const pillarsContainer = document.getElementById('pillars-container');
    pillarsContainer.innerHTML = '';
    for (const pillarKey in results.pillarScores) {
        const pillarInfo = quizConfig.pillars[pillarKey];
        const pillarResult = results.pillarScores[pillarKey];
        // Calculate average score for this pillar
        const averageScore = pillarResult.count > 0 ? pillarResult.score / pillarResult.count : 0;
        const pillarElement = createPillarElement(pillarInfo, averageScore, pillarKey);
        pillarsContainer.appendChild(pillarElement);
    }

    const recommendationsContainer = document.getElementById('recommendations-container');
    recommendationsContainer.innerHTML = '';
    if (results.recommendations && results.recommendations.length > 0) {
        results.recommendations.forEach((rec, index) => {
            recommendationsContainer.appendChild(createRecommendationElement(rec, index));
        });
    } else {
        recommendationsContainer.innerHTML = '<p>No recommendations available.</p>';
    }
}

function createPillarElement(pillar, score, pillarKey) {
    const pillarRow = document.createElement('div');
    pillarRow.className = 'pillar-row';
    pillarRow.dataset.pillar = pillarKey;

    // The score is now on a 1-4.5 scale. Dividing by 4.5 makes a perfect score fill the bar.
    const progressValue = score / 4.5;

    pillarRow.innerHTML = `
        <div class="pillar-details">
            <img src="${pillar.icon}" alt="${pillar.name}" class="pillar-icon">
            <span class="pillar-name">${pillar.name.toUpperCase()}</span>
        </div>
        <div class="pillar-performance">
            <md-linear-progress value="${progressValue}"></md-linear-progress>
        </div>
    `;
    return pillarRow;
}

function createRecommendationElement(recommendation, index) {
    const recElement = document.createElement('div');
    recElement.className = 'recommendation-item';
    recElement.innerHTML = `
        <div class="recommendation-icon">💡</div>
        <div class="recommendation-text">${recommendation}</div>
    `;
    return recElement;
}

function downloadSnapshot() {
    if (!quizResults) return;
    // Instead of downloading, show the contact section for booking a consultation
    showContactSection();
}

function startOver() {
    location.reload();
}

function handleContactForm(event) {
    event.preventDefault();
    
    // Check for honeypot field (spam protection)
    const honeypot = document.getElementById('website') ? document.getElementById('website').value : '';
    if (honeypot) {
        console.log('Honeypot field filled - likely spam');
        return;
    }
    
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name')?.trim(),
        email: formData.get('email')?.trim(),
        company: formData.get('company')?.trim(),
        title: formData.get('title')?.trim(),
        phone: formData.get('phone')?.trim(),
        message: formData.get('message')?.trim()
    };
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'company'];
    const missingFields = requiredFields.filter(field => !contactData[field]);
    
    if (missingFields.length > 0) {
        showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Add quiz results to contact data
    contactData.quizResults = quizResults;
    contactData.quizAnswers = quizAnswers;
    
    // Send email
    sendEmail(contactData);
}

async function sendEmail(contactData) {
    // Prevent access to secrets in fallback mode
    if (isFallbackMode || !EMAILJS_CONFIG) {
        console.warn('Email functionality disabled in fallback mode for security reasons.');
        showError('Email functionality is not available in demo mode. Please contact support to access the full assessment.');
        return;
    }

    const submitButton = document.querySelector('#contact-form button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        const templateParams = {
            to_email: 'info@firemountainlabs.com',
            from_name: contactData.name,
            from_email: contactData.email,
            company: contactData.company,
            title: contactData.title || 'Not provided',
            phone: contactData.phone || 'Not provided',
            message: contactData.message || 'No additional notes provided',
            maturity_level: contactData.quizResults.maturityLevel ? contactData.quizResults.maturityLevel.level : 'N/A',
            maturity_level_number: contactData.quizResults.maturityLevelNumber,
            total_score: contactData.quizResults.totalScore,
            average_score: contactData.quizResults.averagePillarScore.toFixed(1),
            percentage: Math.round((contactData.quizResults.totalScore / (quizConfig.questions.length * 4.5)) * 100),
            recommendations: contactData.quizResults.recommendations.join('\n• '),
            quiz_answers: JSON.stringify(contactData.quizAnswers, null, 2),
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
        };
        
        // Validate EmailJS configuration
        if (!EMAILJS_CONFIG.USER_ID || !EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_ID) {
            throw new Error('EmailJS configuration is incomplete. Please check your environment variables.');
        }
        
        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID, 
            EMAILJS_CONFIG.TEMPLATE_ID, 
            templateParams
        );
        
        console.log('Email sent successfully:', response);
        showSuccessMessage();
        
    } catch (error) {
        console.error('Failed to send email:', error);
        
        // Provide specific error messages based on error type
        let errorMessage = 'Failed to send your request. ';
        
        if (error.text && error.text.includes('Invalid template')) {
            errorMessage += 'Email template configuration error. Please contact support.';
        } else if (error.text && error.text.includes('Invalid service')) {
            errorMessage += 'Email service configuration error. Please contact support.';
        } else if (error.text && error.text.includes('Invalid user')) {
            errorMessage += 'Email service authentication error. Please contact support.';
        } else if (error.text && error.text.includes('rate limit')) {
            errorMessage += 'Too many requests. Please try again in a few minutes.';
        } else {
            errorMessage += 'Please try again or contact us directly at info@firemountainlabs.com';
        }
        
        showError(errorMessage);
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message); // Simple success display - could be enhanced with a modal
}

// Abandonment tracking functions
function setupAbandonmentTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track beforeunload (user leaving the page)
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Track if user navigates away from quiz section
    const quizSection = document.getElementById('quiz-section');
    if (quizSection) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isHidden = quizSection.style.display === 'none';
                    if (isHidden && quizStarted && !quizAbandoned) {
                        trackQuizAbandonment('navigated_away');
                    }
                }
            });
        });
        observer.observe(quizSection, { attributes: true });
    }
}

function removeAbandonmentTracking() {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
}

function handleVisibilityChange() {
    if (document.hidden && quizStarted && !quizAbandoned) {
        // User switched tabs or minimized browser
        trackQuizAbandonment('tab_switch');
    }
}

function handleBeforeUnload(event) {
    if (quizStarted && !quizAbandoned) {
        trackQuizAbandonment('page_leave');
        // Don't prevent the unload, just track it
    }
}

function trackQuizAbandonment(reason) {
    if (quizAbandoned) return; // Prevent duplicate tracking
    
    quizAbandoned = true;
    const currentQuestion = quizConfig.questions[currentQuestionIndex];
    const timeSpent = Date.now() - quizStartTime;
    
    // Track abandonment event
    // This is a placeholder and should be replaced with actual implementation
    console.log(`User abandoned quiz. Reason: ${reason}`);
}

// Track long dwell time on questions (potential confusion)
function setupQuestionDwellTracking() {
    if (!quizStarted || quizAbandoned) return;
    
    const currentQuestion = quizConfig.questions[currentQuestionIndex];
    const questionStartTime = currentQuestionStartTime;
    
    // Check for long dwell time after 30 seconds
    setTimeout(() => {
        if (quizStarted && !quizAbandoned && currentQuestionIndex < quizConfig.questions.length) {
            const currentQuestion = quizConfig.questions[currentQuestionIndex];
            if (currentQuestion && currentQuestion.id === quizConfig.questions[currentQuestionIndex].id) {
                // User is still on the same question after 30 seconds
                console.log(`User dwelled on Question ${currentQuestion.id} for ${Date.now() - questionStartTime} ms`);
            }
        }
    }, 30000);
    
    // Check for very long dwell time after 60 seconds
    setTimeout(() => {
        if (quizStarted && !quizAbandoned && currentQuestionIndex < quizConfig.questions.length) {
            const currentQuestion = quizConfig.questions[currentQuestionIndex];
            if (currentQuestion && currentQuestion.id === quizConfig.questions[currentQuestionIndex].id) {
                // User is still on the same question after 60 seconds
                console.log(`User dwelled on Question ${currentQuestion.id} for ${Date.now() - questionStartTime} ms`);
            }
        }
    }, 60000);
} 