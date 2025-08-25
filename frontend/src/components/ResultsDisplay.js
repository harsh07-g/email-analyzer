import React from 'react';
import './ResultsDisplay.css';

// function ResultsDisplay({ result, isLoading, error }) {
//     if (isLoading) {
//         return <div className="loading">Analyzing...</div>;
//     }

//     if (error) {
//         return <div className="error">Error: {error}</div>;
//     }

//     if (!result) {
//         return <div className="placeholder">Results will be displayed here.</div>;
//     }

function ResultsDisplay({ result, error, isLoading }) {
    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!result) {
        // Jab tak result nahi aata, yeh message dikhega
        return <div className="placeholder">Results will be displayed here once the email is processed.</div>;
    }


    return (
        <div className="results-container">
            <h2>Analysis Results</h2>
            <div className="esp-result">
                <strong>Detected ESP:</strong>
                <span>{result.esp}</span>
            </div>
            
            <h3>Receiving Chain (Path from Sender to You)</h3>
            <div className="timeline">
                {result.receivingChain.map((hop, index) => (
                    <div key={index} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <p><strong>Hop {index + 1}</strong></p>
                            <p><strong>From:</strong> {hop.from}</p>
                            <p><strong>By:</strong> {hop.by}</p>
                            <p><strong>Protocol:</strong> {hop.protocol}</p>
                            <p><strong>Time:</strong> {hop.timestamp}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResultsDisplay;