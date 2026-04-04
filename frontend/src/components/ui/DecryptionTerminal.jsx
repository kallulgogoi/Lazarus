import React, { useState, useEffect } from 'react';
import './Terminal.css'; // Make sure to link the CSS file below!

const DecryptionTerminal = ({ corruptedText, finalText }) => {
    // State to hold the text currently shown on screen
    const [displayText, setDisplayText] = useState("AWAITING INPUT...");

    useEffect(() => {
        // Don't run if we don't have the text yet
        if (!corruptedText || !finalText) {
            setDisplayText("AWAITING INPUT...");
            return;
        }

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let iterations = 0;

        const interval = setInterval(() => {
            setDisplayText(() => {
                return corruptedText
                    .split("")
                    .map((letter, index) => {
                        // Ignore spaces and commas
                        if (letter === " " || letter === ",") return letter;
                        
                        // Lock in the correct letter if iteration has passed this index
                        if (index < iterations) {
                            return finalText[index];
                        }
                        
                        // Otherwise, return a random scrambled letter
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");
            });

            // Stop the interval once the whole word is decrypted
            if (iterations >= finalText.length) {
                clearInterval(interval);
                setDisplayText(finalText); // Ensure the final state is perfect
            }

            // Increase iterations (lower number = slower reveal)
            iterations += 1 / 3;
        }, 30);

        // Cleanup function to clear the interval if the component unmounts
        return () => clearInterval(interval);

    }, [corruptedText, finalText]); // Re-run animation if new text comes in

    return (
        <div className="decryption-terminal">
            <div className="terminal-header">
                SYSTEM_OVERRIDE // DECRYPTION_PROTOCOL
            </div>
            <div className="terminal-body">
                <span className="prompt">root@lazarus:~$ decrypt target_string</span>
                <br />
                {/* The glowing scrambling text */}
                <span className="scrambling-text">{displayText}</span>
            </div>
        </div>
    );
};

export default DecryptionTerminal;