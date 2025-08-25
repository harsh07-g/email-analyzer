
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Instructions from './components/Instructions';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const [task, setTask] = useState({ emailAddress: '', subject: '', uniqueId: '' });
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');

    // Polling interval ko store karne ke liye useRef ka istmaal kraa h
    const intervalRef = useRef(null);

    // Results check karne wala function
    const checkResults = async (uniqueId) => {
        try {
            // const response = await fetch(`http://localhost:3001/api/analysis/results/${uniqueId}`);
            const response = await fetch(`${API_URL}/api/analysis/results/${uniqueId}`);
            const result = await response.json();

            if (result.status === 'completed') {
                setAnalysisResult(result.data);
                setError('');
                clearInterval(intervalRef.current); 
            }
        } catch (err) {
            setError('Could not connect to the server.');
            clearInterval(intervalRef.current);
        }
    };

    // Component load hone par ek baar chalta hai
    useEffect(() => {
        const generateNewTask = async () => {
            try {
                // const response = await fetch('http://localhost:3001/api/analysis/generate');
                const response = await fetch(`${API_URL}/api/analysis/generate`);
                const data = await response.json();
                setTask(data);
            } catch (err) {
                setError('Failed to generate a new task. Please refresh the page.');
            }
        };
        generateNewTask();
        
        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Jab task (uniqueId) set ho jaaye, tab polling start karo
    useEffect(() => {
        if (task.uniqueId && !analysisResult) {
            // Har 5 second mein check karo
            intervalRef.current = setInterval(() => {
                checkResults(task.uniqueId);
            }, 5000);
        }

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [task.uniqueId, analysisResult]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Automatic Email Analyzer</h1>
                <p>A system to automatically identify the receiving chain and ESP of any email.</p>
            </header>
            <main>
                {!analysisResult ? (
                    <Instructions emailAddress={task.emailAddress} subject={task.subject} />
                ) : (
                    <p className="success-message">Email received and analyzed successfully!</p>
                )}
                
                <ResultsDisplay result={analysisResult} error={error} isLoading={!analysisResult && !error} />
            </main>
            <footer className="App-footer">
                <p>Lucid Growth - Software Development Assignment</p>
            </footer>
        </div>
    );
}

export default App;
