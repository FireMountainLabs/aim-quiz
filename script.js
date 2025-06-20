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
    try { emailjs.init(EMAILJS_CONFIG.USER_ID); } catch (error) { console.error('Failed to initialize EmailJS:', error); }
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
    const snapshotText = `
${quizConfig.app_config.title.toUpperCase()}
${'='.repeat(quizConfig.app_config.title.length + 10)}

Maturity Level: ${quizResults.maturityLevelNumber} (${quizResults.maturityLevel ? quizResults.maturityLevel.level : 'N/A'})
Overall Average Score: ${quizResults.averagePillarScore.toFixed(1)}/4.5
Total Raw Score: ${quizResults.totalScore}
Description: ${quizResults.maturityLevel ? quizResults.maturityLevel.description : 'Could not determine maturity level.'}

Pillar Scores (Average):
${Object.entries(quizResults.pillarScores).map(([pillarKey, pillarResult]) => {
    const averageScore = pillarResult.count > 0 ? pillarResult.score / pillarResult.count : 0;
    return `${quizConfig.pillars[pillarKey].name}: ${averageScore.toFixed(1)}/4.5`;
}).join('\n')}

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
            maturity_level: contactData.quizResults.maturityLevel ? contactData.quizResults.maturityLevel.level : 'N/A',
            maturity_level_number: contactData.quizResults.maturityLevelNumber,
            total_score: contactData.quizResults.totalScore,
            average_score: contactData.quizResults.averagePillarScore.toFixed(1),
            percentage: Math.round((contactData.quizResults.totalScore / (quizConfig.questions.length * 4.5)) * 100),
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