

//  case-insensitive (/i)
const ESP_PATTERNS = {
    'Google/Gmail': /(google.com|gmail.com)/i,
    'Microsoft/Outlook': /(outlook.com|office365.com|live.com|prod.outlook.com)/i,
    'Amazon SES': /amazonses.com/i,
    'SendGrid': /sendgrid.net/i,
    'Zoho Mail': /(zoho.com|zohomail.com)/i,
    'Mailgun': /mailgun.org/i,
    'Postmark': /postmarkapp.com/i,
    'Yahoo Mail': /yahoo.com/i,
};

function detectESP(rawEmailSource) {
    // Received headers se check karna sabse reliable hota hai
    const receivedHeaders = rawEmailSource.match(/^Received: .+/gm) || [];

    for (const header of receivedHeaders) {
        for (const esp in ESP_PATTERNS) {
            if (ESP_PATTERNS[esp].test(header)) {
                return esp;
            }
        }
    }
    return 'Unknown'; // Agar kuch na mile
}

function parseReceivingChain(rawEmailSource) {
    // Email ke raw source se saare "Received:" headers nikal ne kk liyyyy
    const receivedHeaders = rawEmailSource.match(/^Received: .+/gm) || [];
    
    const chain = receivedHeaders.map(header => {
        // Yeh parsing logic hai
        // Yeh 'from', 'by', 'with', aur timestamp ko dhoondhne ki koshish karega
        const fromMatch = header.match(/from\s+([^\s(]+)/);
        const byMatch = header.match(/by\s+([^\s(]+)/);
        const protocolMatch = header.match(/with\s+([^\s;]+)/);
        // Timestamp aam taur par semicolon (;) ke baad hota hai
        const timestampMatch = header.match(/;\s+(.+)$/);

        return {
            from: fromMatch ? fromMatch[1] : 'N/A',
            by: byMatch ? byMatch[1] : 'N/A',
            protocol: protocolMatch ? protocolMatch[1] : 'N/A',
            timestamp: timestampMatch ? timestampMatch[1].trim() : 'N/A',
        };
    });

    // Chain ko reverse karna zaroori hai taaki path sender -> receiver dikhe
    return chain.reverse();
}

module.exports = { detectESP, parseReceivingChain };