// EmailJS Configuration Test Script
// Run this in the browser console to test EmailJS setup

function testEmailJSConfig() {
    console.log('Testing EmailJS Configuration...');
    
    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS is not loaded');
        return false;
    }
    console.log('✅ EmailJS is loaded');
    
    // Check configuration
    console.log('EmailJS Config:', EMAILJS_CONFIG);
    
    if (!EMAILJS_CONFIG.USER_ID) {
        console.error('❌ EMAILJS_USER_ID is not set');
        return false;
    }
    
    if (!EMAILJS_CONFIG.SERVICE_ID) {
        console.error('❌ EMAILJS_SERVICE_ID is not set');
        return false;
    }
    
    if (!EMAILJS_CONFIG.TEMPLATE_ID) {
        console.error('❌ EMAILJS_TEMPLATE_ID is not set');
        return false;
    }
    
    console.log('✅ All EmailJS configuration values are set');
    
    // Test initialization
    try {
        emailjs.init(EMAILJS_CONFIG.USER_ID);
        console.log('✅ EmailJS initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize EmailJS:', error);
        return false;
    }
    
    return true;
}

function testEmailSending() {
    if (!testEmailJSConfig()) {
        console.error('Cannot test email sending - configuration failed');
        return;
    }
    
    console.log('Testing email sending...');
    
    const testParams = {
        to_email: 'info@firemountainlabs.com',
        from_name: 'Test User',
        from_email: 'test@example.com',
        company: 'Test Company',
        title: 'Test Title',
        phone: '555-1234',
        message: 'This is a test email from the AI Maturity Assessment tool.',
        maturity_level: 'Level 2: Engaged',
        maturity_level_number: 2,
        total_score: 10,
        average_score: 2.0,
        percentage: 44,
        recommendations: 'Test recommendation 1\n• Test recommendation 2',
        quiz_answers: JSON.stringify({test: 'data'}, null, 2),
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
    };
    
    emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, testParams)
        .then(function(response) {
            console.log('✅ Test email sent successfully:', response);
            alert('Test email sent successfully! Check info@firemountainlabs.com');
        })
        .catch(function(error) {
            console.error('❌ Test email failed:', error);
            alert('Test email failed. Check console for details.');
        });
}

// Export functions for use in console
window.testEmailJSConfig = testEmailJSConfig;
window.testEmailSending = testEmailSending;

console.log('EmailJS Test Functions loaded. Use:');
console.log('- testEmailJSConfig() to check configuration');
console.log('- testEmailSending() to send a test email'); 