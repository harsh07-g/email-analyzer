
import React from 'react';
import './Instructions.css';

function Instructions({ emailAddress, subject }) {
    if (!emailAddress) {
        return <div className="instructions-container loading-message">Generating your test email address...</div>;
    }

    return (
        <div className="instructions-container">
            <h3>Follow these steps:</h3>
            <ol className="steps-list">
                <li>
                    <p>Send an email from any provider (Gmail, Outlook, etc.) to the following address:</p>
                    <div className="info-box">{emailAddress}</div>
                </li>
                <li>
                    <p>You **MUST** use this exact subject line:</p>
                    <div className="info-box">{subject}</div>
                </li>
                <li>
                    <p>Once you send the email, this page will automatically detect it and show the results below.</p>
                </li>
            </ol>
            <p className="waiting-message">Waiting for your email to arrive...</p>
        </div>
    );
}

export default Instructions;