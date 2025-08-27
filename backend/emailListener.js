// backend/emailListener.js
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const { detectESP, parseReceivingChain } = require('./utils/emailParser');
const Email = require('./models/Email');

const config = {
    imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST,
        port: 993,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false
        },
        authTimeout: 3000
    }
};



async function checkEmails() {
    console.log('--- [1] Running checkEmails function... ---'); 
    
    // ==> connection ko function ke bahar declare karaa hhhhhhhhhhhhhhhhh <==
    let connection; 
    
    try {
        connection = await imaps.connect(config);
        console.log('--- [2] IMAP connection successful. ---'); 
        
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL']; 
        const fetchOptions = { bodies: ['HEADER', ''], markSeen: false }; 
        
        const messages = await connection.search(searchCriteria, fetchOptions);
        console.log(`--- [3] Found ${messages.length} total messages in INBOX. ---`);

        for (const item of messages) {
            const headerPart = item.parts.find(part => part.which === 'HEADER');
            const subject = headerPart.body.subject ? headerPart.body.subject[0] : '';
            
            console.log(`  - Checking email with subject: "${subject}"`);

            const uniqueId = subject.split('ID:')[1]?.trim();

            if (uniqueId) {
                console.log(`  - SUCCESS! Found matching email with ID: ${uniqueId}`);
                
                const existingEmail = await Email.findOne({ uniqueId: uniqueId, isProcessed: true });
                if (existingEmail) {
                    console.log(`  - SKIPPING: Email with ID ${uniqueId} has already been processed.`);
                    continue;
                }
                
                const rawEmailPart = item.parts.find(part => part.which === '');
                const rawEmailSource = rawEmailPart.body;
                
                const esp = detectESP(rawEmailSource);
                const receivingChain = parseReceivingChain(rawEmailSource);

                await Email.updateOne(
                    { uniqueId: uniqueId },
                    {
                        $set: {
                            rawHeaders: rawEmailSource,
                            esp,
                            receivingChain,
                            isProcessed: true
                        }
                    }
                );
                console.log(`--- [4] Database UPDATED for ID: ${uniqueId}. ---`);
            }
        }
    } catch (error) {
        // ----------------- Ab hum error ko sirf log karenge, crash nahi hone denge --------<==
        console.error('--- [ERROR] An error occurred during email check, but the app will continue running: ---', error.message);
    } finally {
        //  'finally' block hamesha chalega <==
        // Yeh guarantee dega ki connection hamesha band ho, chahe error aaye ya na aaye
        if (connection && connection.state !== 'disconnected') {
            try {
                await connection.end();
                console.log('--- [5] IMAP connection ended successfully. ---');
            } catch (endErr) {
                console.error('--- [ERROR] Failed to end the IMAP connection:', endErr.message);
            }
        }
    }
}














// async function checkEmails() {
//     console.log('--- [1] Running checkEmails function... ---'); 
    
//     let connection;
//     try {
//         connection = await imaps.connect(config);
//         console.log('--- [2] IMAP connection successful. ---'); 
        
//         await connection.openBox('INBOX');

//         const searchCriteria = ['ALL']; 
        

//         const fetchOptions = { bodies: ['HEADER', ''], markSeen: false }; 
        
//         const messages = await connection.search(searchCriteria, fetchOptions);
//         console.log(`--- [3] Found ${messages.length} total messages in INBOX. ---`);

//         for (const item of messages) {

//             const headerPart = item.parts.find(part => part.which === 'HEADER');
//             const subject = headerPart.body.subject ? headerPart.body.subject[0] : '';
            
//             console.log(`  - Checking email with subject: "${subject}"`);

//             const uniqueId = subject.split('ID:')[1]?.trim();

//             if (uniqueId) {
//                 console.log(`  - SUCCESS! Found matching email with ID: ${uniqueId}`);
                
//                 const existingEmail = await Email.findOne({ uniqueId: uniqueId, isProcessed: true });
//                 if (existingEmail) {
//                     console.log(`  - SKIPPING: Email with ID ${uniqueId} has already been processed.`);
//                     continue;
//                 }
                
//                 const rawEmailPart = item.parts.find(part => part.which === '');
//                 const rawEmailSource = rawEmailPart.body;
                
//                 const esp = detectESP(rawEmailSource);
//                 const receivingChain = parseReceivingChain(rawEmailSource);

//                 await Email.updateOne(
//                     { uniqueId: uniqueId },
//                     {
//                         $set: {
//                             rawHeaders: rawEmailSource,
//                             esp,
//                             receivingChain,
//                             isProcessed: true
//                         }
//                     }
//                 );
//                 console.log(`--- [4] Database UPDATED for ID: ${uniqueId}. ---`);
//             }
//         }

//         if (connection) {
//             connection.end();
//         }
//     } catch (error) {
//         console.error('--- [ERROR] Error during email check: ---', error);
//         if (connection) {
//             connection.end();
//         }
//     }
// }


function startEmailListener() {
    console.log('Email listener started. Checking for new emails every 15 seconds.');
    setInterval(checkEmails, 15000); 
}

module.exports = { startEmailListener };