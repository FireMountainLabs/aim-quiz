// AI Maturity Snapshot Application - Modern One-Question-at-a-Time Flow
// EmailJS Configuration (will be replaced during build)
const EMAILJS_CONFIG = {
    USER_ID: '{{EMAILJS_USER_ID}}',
    SERVICE_ID: '{{EMAILJS_SERVICE_ID}}',
    TEMPLATE_ID: '{{EMAILJS_TEMPLATE_ID}}'
};

let quizConfig = null;
let quizAnswers = {};
let quizResults = null;
let currentQuestionIndex = 0;
let quizStarted = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadQuizConfig();
        populateUIContent();
        initializeEmailJS();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load the assessment. Please refresh the page and try again.');
    }
}

async function loadQuizConfig() {
    const response = await fetch('./ai_maturity_quick_check.json');
    if (!response.ok) throw new Error('Failed to load quiz configuration');
    quizConfig = await response.json();
}

function populateUIContent() {
    if (!quizConfig) return;
    document.getElementById('page-title').textContent = `${quizConfig.app_config.title} - ${quizConfig.app_config.company_name}`;
    document.getElementById('hero-title').textContent = quizConfig.app_config.title;
    document.getElementById('hero-subtitle').textContent = quizConfig.app_config.subtitle;
    document.getElementById('company-name').textContent = quizConfig.app_config.company_name;
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
    document.getElementById('footer-copyright').textContent = quizConfig.app_config.footer_copyright;
    document.getElementById('footer-tagline').textContent = quizConfig.app_config.footer_tagline;
    document.getElementById('back-to-quiz').textContent = quizConfig.buttons.back_to_quiz.text;
    document.getElementById('download-snapshot').textContent = quizConfig.buttons.download_snapshot.text;
    document.getElementById('start-over').textContent = quizConfig.buttons.start_over.text;
    
    // Hide quiz actions if no questions
    if (!quizConfig.questions || quizConfig.questions.length === 0) {
        document.getElementById('quiz-actions').style.display = 'none';
    }
    
    // Handle logo image replacement
    if (quizConfig.app_config.logo_image_url) {
        const logoArea = document.querySelector('.logo-area');
        const existingLogo = logoArea.querySelector('.app-logo');
        if (existingLogo) {
            const logoImg = document.createElement('img');
            logoImg.src = quizConfig.app_config.logo_image_url;
            logoImg.alt = `${quizConfig.app_config.company_name} Logo`;
            logoImg.className = 'app-logo';
            existingLogo.replaceWith(logoImg);
        }
    }
    
    generateContactForm();
}

function generateContactForm() {
    const contactForm = document.getElementById('contact-form');
    const fields = quizConfig.sections.contact.fields;
    let formHTML = '';
    Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
        formHTML += `<div class="form-group">
            <label for="contact-${fieldName}">${fieldConfig.label}</label>`;
        if (fieldConfig.type === 'textarea') {
            formHTML += `<textarea id="contact-${fieldName}" name="${fieldName}" rows="4" placeholder="${fieldConfig.placeholder || ''}" ${fieldConfig.required ? 'required' : ''}></textarea>`;
        } else {
            formHTML += `<input type="${fieldConfig.type}" id="contact-${fieldName}" name="${fieldName}" ${fieldConfig.required ? 'required' : ''}>`;
        }
        formHTML += '</div>';
    });
    formHTML += `<div class="form-actions">
        <button type="button" id="back-to-snapshot" class="btn btn-outline">${quizConfig.buttons.back_to_snapshot.text}</button>
        <button type="submit" class="btn btn-primary">${quizConfig.buttons.send_request.text}</button>
    </div>`;
    contactForm.innerHTML = formHTML;
}

function initializeEmailJS() {
    try { emailjs.init(EMAILJS_CONFIG.USER_ID); } catch (error) { console.error('Failed to initialize EmailJS:', error); }
}

function setupEventListeners() {
    document.getElementById('start-quiz').addEventListener('click', startQuizFlow);
    document.getElementById('back-to-quiz').addEventListener('click', showQuizSection);
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
        return;
    }
    const question = quizConfig.questions[currentQuestionIndex];
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
            // Save answer
            quizAnswers[question.id] = {
                choice: radio.value,
                score: parseInt(radio.dataset.score),
                question: question
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
    const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
    const maxScore = quizConfig.questions.length * 4;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const scoreRanges = quizConfig.interpretation_guide.total_score_ranges;
    let maturityLevel = 'Low Maturity';
    let maturityDescription = 'Limited AI readiness requiring foundational work across multiple areas.';
    let recommendations = [];
    if (percentage >= 80) {
        const range = scoreRanges['16-20'];
        maturityLevel = range.level;
        maturityDescription = range.description;
        recommendations = range.recommendations;
    } else if (percentage >= 60) {
        const range = scoreRanges['11-15'];
        maturityLevel = range.level;
        maturityDescription = range.description;
        recommendations = range.recommendations;
    } else if (percentage >= 40) {
        const range = scoreRanges['6-10'];
        maturityLevel = range.level;
        maturityDescription = range.description;
        recommendations = range.recommendations;
    } else {
        const range = scoreRanges['0-5'];
        maturityLevel = range.level;
        maturityDescription = range.description;
        recommendations = range.recommendations;
    }
    const uncertaintyAnswers = Object.values(answers).filter(answer => answer.choice === "I Don't Know");
    if (uncertaintyAnswers.length > 0) {
        const uncertaintyGuidance = quizConfig.interpretation_guide.uncertainty_guidance;
        recommendations.unshift(...uncertaintyGuidance.recommendations);
    }
    return {
        totalScore,
        percentage,
        maturityLevel,
        maturityDescription,
        recommendations,
        pillarScores: calculatePillarScores(answers)
    };
}

function calculatePillarScores(answers) {
    const pillarScores = {};
    Object.values(answers).forEach(answer => {
        const pillars = answer.question.pillars_covered;
        pillars.forEach(pillar => {
            if (!pillarScores[pillar]) pillarScores[pillar] = { total: 0, count: 0 };
            pillarScores[pillar].total += answer.score;
            pillarScores[pillar].count += 1;
        });
    });
    Object.keys(pillarScores).forEach(pillar => {
        const avg = pillarScores[pillar].total / pillarScores[pillar].count;
        pillarScores[pillar] = Math.round(avg * 25);
    });
    return pillarScores;
}

function displaySnapshot(results) {
    document.getElementById('overall-score').textContent = results.totalScore;
    document.getElementById('maturity-level').textContent = results.maturityLevel;
    document.getElementById('maturity-description').textContent = results.maturityDescription;
    const pillarsContainer = document.getElementById('pillars-container');
    pillarsContainer.innerHTML = '';
    Object.entries(results.pillarScores).forEach(([pillar, score]) => {
        const pillarElement = createPillarElement(pillar, score);
        pillarsContainer.appendChild(pillarElement);
    });
    const recommendationsContainer = document.getElementById('recommendations-container');
    recommendationsContainer.innerHTML = '';
    results.recommendations.forEach((recommendation, index) => {
        const recommendationElement = createRecommendationElement(recommendation, index);
        recommendationsContainer.appendChild(recommendationElement);
    });
}

function createPillarElement(pillar, score) {
    const pillarDiv = document.createElement('div');
    pillarDiv.className = 'pillar-item';
    pillarDiv.innerHTML = `
        <div class="pillar-name">${pillar}</div>
        <div class="pillar-score">${score}%</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${score}%"></div>
        </div>
    `;
    return pillarDiv;
}

function createRecommendationElement(recommendation, index) {
    const recommendationDiv = document.createElement('div');
    recommendationDiv.className = 'recommendation-item';
    recommendationDiv.innerHTML = `
        <div class="recommendation-icon">💡</div>
        <div class="recommendation-text">${recommendation}</div>
    `;
    return recommendationDiv;
}

function downloadSnapshot() {
    if (!quizResults) return;
    const snapshotText = `
${quizConfig.app_config.title.toUpperCase()}
${'='.repeat(quizConfig.app_config.title.length + 10)}

Overall Score: ${quizResults.totalScore}
Maturity Level: ${quizResults.maturityLevel}
Description: ${quizResults.maturityDescription}

Pillar Scores:
${Object.entries(quizResults.pillarScores).map(([pillar, score]) => `${pillar}: ${score}%`).join('\n')}

Key Recommendations:
${quizResults.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

Generated by ${quizConfig.app_config.company_name} AI Maturity Assessment Tool
    `;
    const blob = new Blob([snapshotText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'ai-maturity-snapshot.txt';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

function startOver() {
    quizAnswers = {};
    quizResults = null;
    currentQuestionIndex = 0;
    quizStarted = false;
    showQuizSection();
}

function handleContactForm(event) {
    event.preventDefault();
    const honeypot = document.getElementById('website') ? document.getElementById('website').value : '';
    if (honeypot) return;
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        title: formData.get('title'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        quizResults: quizResults,
        quizAnswers: quizAnswers
    };
    sendEmail(contactData);
}

async function sendEmail(contactData) {
    try {
        const templateParams = {
            to_email: 'info@firemountainlabs.com',
            from_name: contactData.name,
            from_email: contactData.email,
            company: contactData.company,
            title: contactData.title,
            phone: contactData.phone,
            message: contactData.message,
            maturity_level: contactData.quizResults.maturityLevel,
            total_score: contactData.quizResults.totalScore,
            percentage: contactData.quizResults.percentage,
            recommendations: contactData.quizResults.recommendations.join('\n'),
            quiz_answers: JSON.stringify(contactData.quizAnswers, null, 2)
        };
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
        showSuccessMessage();
    } catch (error) {
        console.error('Failed to send email:', error);
        showError('Failed to send your request. Please try again or contact us directly at info@firemountainlabs.com');
    }
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message); // Simple success display - could be enhanced with a modal
} 