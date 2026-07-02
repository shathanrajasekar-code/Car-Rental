const fs = require('fs');
const path = require('path');

const logMockEmail = async (to, subject, body) => {
  try {
    const logDir = path.join(__dirname, '..', 'logs');
    const logFile = path.join(logDir, 'emails.json');

    // Create log directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const emailRecord = {
      timestamp: new Date().toISOString(),
      to,
      subject,
      body
    };

    // Print to server console
    console.log('\n=========================================');
    console.log('📬 [MOCK EMAIL SENT]');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log('=========================================\n');

    // Save to local JSON log
    let emails = [];
    if (fs.existsSync(logFile)) {
      const fileData = fs.readFileSync(logFile, 'utf8');
      try {
        emails = JSON.parse(fileData);
      } catch (err) {
        emails = [];
      }
    }

    emails.push(emailRecord);
    fs.writeFileSync(logFile, JSON.stringify(emails, null, 2), 'utf8');

    return true;
  } catch (error) {
    console.error('Error logging mock email:', error.message);
    return false;
  }
};

module.exports = { logMockEmail };
