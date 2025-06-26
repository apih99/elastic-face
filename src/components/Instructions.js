import React, { useState, useEffect } from 'react';
import './Instructions.css';

const Instructions = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false);

  useEffect(() => {
    // Check if user has seen instructions before
    const seen = localStorage.getItem('elasticFaceInstructionsSeen');
    if (!seen) {
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      setHasSeenInstructions(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('elasticFaceInstructionsSeen', 'true');
    setHasSeenInstructions(true);
  };

  const showInstructions = () => {
    setIsVisible(true);
  };

  if (!isVisible && hasSeenInstructions) {
    return (
      <button className="help-button" onClick={showInstructions}>
        ?
      </button>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="instructions-overlay" onClick={handleClose}>
      <div className="instructions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="instructions-header">
          <h2>🎭 Welcome to The Elastic Face!</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="instructions-content">
          <div className="instruction-item">
            <span className="instruction-icon">👆</span>
            <div>
              <h3>Click & Drag</h3>
              <p>Click on any part of the face and drag it around</p>
            </div>
          </div>
          
          <div className="instruction-item">
            <span className="instruction-icon">🎯</span>
            <div>
              <h3>Stretch It</h3>
              <p>Pull the eyes, nose, mouth, cheeks, or entire face</p>
            </div>
          </div>
          
          <div className="instruction-item">
            <span className="instruction-icon">🔊</span>
            <div>
              <h3>Listen</h3>
              <p>Hear the satisfying "boing" sound when you let go</p>
            </div>
          </div>
          
          <div className="instruction-item">
            <span className="instruction-icon">📱</span>
            <div>
              <h3>Mobile Friendly</h3>
              <p>Works great on phones and tablets too!</p>
            </div>
          </div>
        </div>
        
        <div className="instructions-footer">
          <button className="got-it-button" onClick={handleClose}>
            Got it! Let's play! 🎉
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions; 