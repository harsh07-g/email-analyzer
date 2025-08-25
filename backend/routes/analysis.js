// const express = require('express');
// const router = express.Router();
// const Email = require('../models/Email');
// const { detectESP, parseReceivingChain } = require('../utils/emailParser');

// router.post('/', async (req, res) => {
//     try {
//         const rawHeaders = typeof req.body === 'string' ? req.body : '';

//         if (!rawHeaders) {
//             return res.status(400).json({ message: 'Email headers are required.' });
//         }

//         const esp = detectESP(rawHeaders);
//         const receivingChain = parseReceivingChain(rawHeaders);

//         const newEmail = new Email({
//             rawHeaders,
//             esp,
//             receivingChain
//         });

//         await newEmail.save();

//         res.status(200).json({ esp, receivingChain });

//     } catch (error) {
//         console.error('Analysis error:', error);
//         res.status(500).json({ message: 'Server error during analysis.' });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const crypto = require('crypto');

// Nayi unique email address aur ID generate karne ke liye
router.get('/generate', async (req, res) => {
    try {
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const emailAddress = process.env.IMAP_USER;
        const subject = `Test Email ID: ${uniqueId}`;

        // ID ko database mein pehle se save kar dein
        const newEmailRequest = new Email({
            uniqueId: uniqueId,
            rawHeaders: 'Pending', // Placeholder
            esp: 'Pending', // Placeholder
        });
        await newEmailRequest.save();

        res.status(200).json({ emailAddress, subject, uniqueId });
    } catch (error) {
        res.status(500).json({ message: 'Error generating new email task.' });
    }
});

// Frontend is route ko check karega ki result aaya ya nahi
router.get('/results/:id', async (req, res) => {
    try {
        const email = await Email.findOne({ uniqueId: req.params.id });

        if (!email) {
            return res.status(404).json({ message: 'ID not found.' });
        }

        // Agar email process ho chuki hai, toh result bhej do
        if (email.isProcessed) {
            return res.status(200).json({
                status: 'completed',
                data: {
                    esp: email.esp,
                    receivingChain: email.receivingChain
                }
            });
        }

        // Agar abhi tak process nahi hui
        res.status(200).json({ status: 'pending' });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching results.' });
    }
});


module.exports = router;