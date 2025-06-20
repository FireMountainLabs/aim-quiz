// Test script to verify the new scoring logic
import fs from 'fs';

// Load the quiz configuration
const quizConfig = JSON.parse(fs.readFileSync('ai_maturity_quick_check.json', 'utf8'));

// Simulate some test answers
const testAnswers = {
    'question_1': { score: 4, choice: 'Yes', question: { pillars_covered: ['ethical_use'] } },
    'question_2': { score: 2, choice: 'Partially', question: { pillars_covered: ['strategy_resources'] } },
    'question_3': { score: 4, choice: 'Yes', question: { pillars_covered: ['organization'] } },
    'question_4': { score: 1, choice: 'I Don\'t Know', question: { pillars_covered: ['tech_infra', 'data_analytics'] } },
    'question_5': { score: 0, choice: 'No', question: { pillars_covered: ['risk_monitoring'] } }
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
    
    // Calculate average of pillar scores with a maximum of 4.5/5
    let totalPillarScore = 0;
    let totalPillarCount = 0;
    
    Object.values(pillarScores).forEach(pillarResult => {
        if (pillarResult.count > 0) {
            totalPillarScore += pillarResult.score / pillarResult.count; // Average score for this pillar
            totalPillarCount++;
        }
    });
    
    const averagePillarScore = totalPillarCount > 0 ? totalPillarScore / totalPillarCount : 0;
    const cappedAverageScore = Math.min(averagePillarScore, 4.5); // Cap at 4.5/5
    
    // Calculate total score for maturity level determination (keep existing logic)
    let totalScore = 0;
    Object.values(answers).forEach(answer => {
        totalScore += answer.score;
    });

    return {
        totalScore,
        averagePillarScore: cappedAverageScore,
        pillarScores
    };
}

// Run the test
const results = calculateResults(testAnswers);

console.log('Test Results:');
console.log('=============');
console.log(`Total Raw Score: ${results.totalScore}`);
console.log(`Average Pillar Score (capped at 4.5): ${results.averagePillarScore.toFixed(1)}`);
console.log('\nPillar Scores:');
Object.entries(results.pillarScores).forEach(([pillarKey, pillarResult]) => {
    const averageScore = pillarResult.count > 0 ? pillarResult.score / pillarResult.count : 0;
    console.log(`${quizConfig.pillars[pillarKey].name}: ${averageScore.toFixed(1)}/5.0 (raw: ${pillarResult.score}, count: ${pillarResult.count})`);
});

// Expected results:
// - ethical_use: 4.0/5.0 (raw: 4, count: 1)
// - strategy_resources: 2.0/5.0 (raw: 2, count: 1) 
// - organization: 4.0/5.0 (raw: 4, count: 1)
// - tech_infra: 1.0/5.0 (raw: 1, count: 1)
// - data_analytics: 1.0/5.0 (raw: 1, count: 1)
// - risk_monitoring: 0.0/5.0 (raw: 0, count: 1)
// Average: (4.0 + 2.0 + 4.0 + 1.0 + 1.0 + 0.0) / 6 = 2.0 