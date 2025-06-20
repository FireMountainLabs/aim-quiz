// Test script to verify the new scoring logic
import fs from 'fs';

// Load the quiz configuration
const quizConfig = JSON.parse(fs.readFileSync('ai_maturity_quick_check.json', 'utf8'));

// Simulate some test answers
const testAnswers = {
    'question_1': { score: 4.5, choice: 'Yes', question: { pillars_covered: ['ethical_use'] } },
    'question_2': { score: 2.5, choice: 'Partially', question: { pillars_covered: ['strategy_resources'] } },
    'question_3': { score: 4.5, choice: 'Yes', question: { pillars_covered: ['organization'] } },
    'question_4': { score: 1.5, choice: 'I Don\'t Know', question: { pillars_covered: ['tech_infra', 'data_analytics'] } },
    'question_5': { score: 1, choice: 'No', question: { pillars_covered: ['risk_monitoring'] } }
};

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

function calculateResults(answers) {
    const pillarScores = calculatePillarScores(answers);
    
    // Calculate average of pillar scores with a maximum of 4.5
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

    return {
        totalScore: Object.values(answers).reduce((sum, answer) => sum + answer.score, 0),
        averagePillarScore: cappedAverageScore,
        maturityLevelNumber,
        pillarScores
    };
}

// Run the test
const results = calculateResults(testAnswers);

console.log('=== AI Maturity Assessment Test Results ===');
console.log(`Total Score: ${results.totalScore}`);
console.log(`Average Pillar Score: ${results.averagePillarScore.toFixed(1)}/4.5`);
console.log(`Maturity Level: ${results.maturityLevelNumber}`);
console.log('\nPillar Scores:');
Object.entries(results.pillarScores).forEach(([pillarKey, pillarResult]) => {
    const averageScore = pillarResult.count > 0 ? pillarResult.score / pillarResult.count : 0;
    console.log(`${pillarKey}: ${averageScore.toFixed(1)}/4.5`);
});

// Expected results:
// - ethical_use: 4.0/5.0 (raw: 4, count: 1)
// - strategy_resources: 2.0/5.0 (raw: 2, count: 1) 
// - organization: 4.0/5.0 (raw: 4, count: 1)
// - tech_infra: 1.0/5.0 (raw: 1, count: 1)
// - data_analytics: 1.0/5.0 (raw: 1, count: 1)
// - risk_monitoring: 0.0/5.0 (raw: 0, count: 1)
// Average: (4.0 + 2.0 + 4.0 + 1.0 + 1.0 + 0.0) / 6 = 2.0 