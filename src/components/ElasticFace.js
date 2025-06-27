import React, { useState, useRef, useCallback, useEffect } from 'react';
import './ElasticFace.css';

const ElasticFace = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [currentMood, setCurrentMood] = useState('happy');
  const [faceElements, setFaceElements] = useState({
    leftEye: { x: 0, y: 0, isAnimating: false },
    rightEye: { x: 0, y: 0, isAnimating: false },
    nose: { x: 0, y: 0, isAnimating: false },
    mouth: { x: 0, y: 0, isAnimating: false },
    leftCheek: { x: 0, y: 0, isAnimating: false },
    rightCheek: { x: 0, y: 0, isAnimating: false },
    face: { x: 0, y: 0, scaleX: 1, scaleY: 1, isAnimating: false }
  });
  
  const svgRef = useRef(null);
  const audioContext = useRef(null);

  // Face expressions configuration
  const expressions = {
    happy: {
      name: 'Happy',
      emoji: '😊',
      faceColor: '#FFD93D',
      cheekColor: '#FFB347',
      eyeShape: 'normal',
      mouthShape: 'smile'
    },
    surprised: {
      name: 'Surprised',
      emoji: '😲',
      faceColor: '#FFE55C',
      cheekColor: '#FFCC5C',
      eyeShape: 'wide',
      mouthShape: 'o'
    },
    sleepy: {
      name: 'Sleepy',
      emoji: '😴',
      faceColor: '#E6D7FF',
      cheekColor: '#D4C4FF',
      eyeShape: 'sleepy',
      mouthShape: 'neutral'
    },
    angry: {
      name: 'Angry',
      emoji: '😡',
      faceColor: '#FF6B6B',
      cheekColor: '#FF4757',
      eyeShape: 'narrow',
      mouthShape: 'frown'
    }
  };

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Play mood-specific sound
  const playMoodSound = useCallback((mood) => {
    if (!audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    // Different sounds for different moods
    const soundConfig = {
      happy: { startFreq: 200, endFreq: 400, duration: 0.3 },
      surprised: { startFreq: 150, endFreq: 600, duration: 0.2 },
      sleepy: { startFreq: 100, endFreq: 80, duration: 0.5 },
      angry: { startFreq: 60, endFreq: 40, duration: 0.4 }
    };
    
    const config = soundConfig[mood] || soundConfig.happy;
    
    oscillator.frequency.setValueAtTime(config.startFreq, audioContext.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(config.endFreq, audioContext.current.currentTime + config.duration);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + config.duration);
    
    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + config.duration);
  }, []);

  // Play boing sound
  const playBoingSound = useCallback(() => {
    if (!audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.frequency.setValueAtTime(80, audioContext.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.current.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.3);
    
    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + 0.3);
  }, []);

  const getMousePosition = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2
    };
  }, []);

  const handleMoodChange = useCallback((mood) => {
    setCurrentMood(mood);
    playMoodSound(mood);
    
    // Resume audio context on user interaction
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  }, [playMoodSound]);

  const handleMouseDown = useCallback((e, elementName) => {
    e.preventDefault();
    setIsDragging(true);
    setDragTarget(elementName);
    
    // Resume audio context on user interaction
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragTarget) return;
    
    const mousePos = getMousePosition(e);
    const maxDistance = 150;
    
    // Limit the drag distance
    const distance = Math.sqrt(mousePos.x ** 2 + mousePos.y ** 2);
    let limitedX = mousePos.x;
    let limitedY = mousePos.y;
    
    if (distance > maxDistance) {
      limitedX = (mousePos.x / distance) * maxDistance;
      limitedY = (mousePos.y / distance) * maxDistance;
    }

    setFaceElements(prev => ({
      ...prev,
      [dragTarget]: {
        ...prev[dragTarget],
        x: limitedX,
        y: limitedY,
        isAnimating: false
      }
    }));
  }, [isDragging, dragTarget, getMousePosition]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragTarget) {
      playBoingSound();
      
      setFaceElements(prev => ({
        ...prev,
        [dragTarget]: {
          ...prev[dragTarget],
          isAnimating: true
        }
      }));

      // Reset position after animation
      setTimeout(() => {
        setFaceElements(prev => ({
          ...prev,
          [dragTarget]: {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            isAnimating: false
          }
        }));
      }, 100);
    }
    
    setIsDragging(false);
    setDragTarget(null);
  }, [isDragging, dragTarget, playBoingSound]);

  // Event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const getElementTransform = (elementName) => {
    const element = faceElements[elementName];
    const transform = `translate(${element.x}, ${element.y})`;
    
    if (elementName === 'face') {
      return `${transform} scale(${element.scaleX}, ${element.scaleY})`;
    }
    
    return transform;
  };

  const getElementClass = (elementName) => {
    const element = faceElements[elementName];
    return `face-element ${elementName} ${currentMood} ${element.isAnimating ? 'animating' : ''}`;
  };

  // Render eyes based on mood
  const renderEye = (side, baseX, baseY) => {
    const expression = expressions[currentMood];
    const eyeTransform = getElementTransform(`${side}Eye`);
    const eyeClass = getElementClass(`${side}Eye`);

    switch (expression.eyeShape) {
      case 'wide':
        return (
          <g
            className={eyeClass}
            transform={eyeTransform}
            onMouseDown={(e) => handleMouseDown(e, `${side}Eye`)}
            onTouchStart={(e) => handleMouseDown(e, `${side}Eye`)}
          >
            <ellipse cx={baseX} cy={baseY} rx="25" ry="30" fill="white" stroke="#333" strokeWidth="2" />
            <circle cx={side === 'left' ? baseX + 5 : baseX - 5} cy={baseY} r="15" fill="black" />
            <circle cx={side === 'left' ? baseX + 8 : baseX - 8} cy={baseY - 3} r="5" fill="white" />
          </g>
        );
      case 'sleepy':
        return (
          <g
            className={eyeClass}
            transform={eyeTransform}
            onMouseDown={(e) => handleMouseDown(e, `${side}Eye`)}
            onTouchStart={(e) => handleMouseDown(e, `${side}Eye`)}
          >
            <path d={`M ${baseX - 20} ${baseY} Q ${baseX} ${baseY + 5} ${baseX + 20} ${baseY}`} 
                  stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Add Z's for sleepy effect */}
            <text x={baseX + 30} y={baseY - 20} fill="#666" fontSize="12" fontFamily="Arial">z</text>
            <text x={baseX + 40} y={baseY - 30} fill="#888" fontSize="10" fontFamily="Arial">z</text>
            <text x={baseX + 50} y={baseY - 40} fill="#aaa" fontSize="8" fontFamily="Arial">z</text>
          </g>
        );
      case 'narrow':
        return (
          <g
            className={eyeClass}
            transform={eyeTransform}
            onMouseDown={(e) => handleMouseDown(e, `${side}Eye`)}
            onTouchStart={(e) => handleMouseDown(e, `${side}Eye`)}
          >
            <ellipse cx={baseX} cy={baseY} rx="18" ry="15" fill="white" />
            <circle cx={side === 'left' ? baseX + 3 : baseX - 3} cy={baseY} r="10" fill="black" />
            <circle cx={side === 'left' ? baseX + 5 : baseX - 5} cy={baseY - 2} r="3" fill="white" />
            {/* Angry eyebrow */}
            <path d={side === 'left' ? 
              `M ${baseX - 15} ${baseY - 25} L ${baseX + 10} ${baseY - 15}` :
              `M ${baseX + 15} ${baseY - 25} L ${baseX - 10} ${baseY - 15}`
            } stroke="#333" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      default: // normal
        return (
          <g
            className={eyeClass}
            transform={eyeTransform}
            onMouseDown={(e) => handleMouseDown(e, `${side}Eye`)}
            onTouchStart={(e) => handleMouseDown(e, `${side}Eye`)}
          >
            <ellipse cx={baseX} cy={baseY} rx="20" ry="25" fill="white" />
            <circle cx={side === 'left' ? baseX + 5 : baseX - 5} cy={baseY} r="12" fill="black" />
            <circle cx={side === 'left' ? baseX + 8 : baseX - 8} cy={baseY - 3} r="4" fill="white" />
          </g>
        );
    }
  };

  // Render mouth based on mood
  const renderMouth = () => {
    const expression = expressions[currentMood];
    const mouthTransform = getElementTransform('mouth');
    const mouthClass = getElementClass('mouth');

    switch (expression.mouthShape) {
      case 'smile':
        return (
          <path
            className={mouthClass}
            d="M 170 240 Q 200 270 230 240"
            stroke="#FF6B42"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            transform={mouthTransform}
            onMouseDown={(e) => handleMouseDown(e, 'mouth')}
            onTouchStart={(e) => handleMouseDown(e, 'mouth')}
          />
        );
      case 'frown':
        return (
          <path
            className={mouthClass}
            d="M 170 260 Q 200 230 230 260"
            stroke="#FF6B42"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            transform={mouthTransform}
            onMouseDown={(e) => handleMouseDown(e, 'mouth')}
            onTouchStart={(e) => handleMouseDown(e, 'mouth')}
          />
        );
      case 'o':
        return (
          <ellipse
            className={mouthClass}
            cx="200"
            cy="250"
            rx="15"
            ry="20"
            fill="#FF6B42"
            transform={mouthTransform}
            onMouseDown={(e) => handleMouseDown(e, 'mouth')}
            onTouchStart={(e) => handleMouseDown(e, 'mouth')}
          />
        );
      default: // neutral
        return (
          <line
            className={mouthClass}
            x1="180"
            y1="250"
            x2="220"
            y2="250"
            stroke="#FF6B42"
            strokeWidth="4"
            strokeLinecap="round"
            transform={mouthTransform}
            onMouseDown={(e) => handleMouseDown(e, 'mouth')}
            onTouchStart={(e) => handleMouseDown(e, 'mouth')}
          />
        );
    }
  };

  const currentExpression = expressions[currentMood];

  return (
    <div className="elastic-face-container">
      {/* Mood Selector */}
      <div className="mood-selector">
        <h3>Choose a Mood:</h3>
        <div className="mood-buttons">
          {Object.entries(expressions).map(([mood, config]) => (
            <button
              key={mood}
              className={`mood-button ${currentMood === mood ? 'active' : ''}`}
              onClick={() => handleMoodChange(mood)}
              title={config.name}
            >
              <span className="mood-emoji">{config.emoji}</span>
              <span className="mood-name">{config.name}</span>
            </button>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        className={`elastic-face-svg mood-${currentMood}`}
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Face outline */}
        <ellipse
          className={getElementClass('face')}
          cx="200"
          cy="200"
          rx="120"
          ry="140"
          fill={currentExpression.faceColor}
          stroke="#FFA500"
          strokeWidth="3"
          transform={getElementTransform('face')}
          onMouseDown={(e) => handleMouseDown(e, 'face')}
          onTouchStart={(e) => handleMouseDown(e, 'face')}
        />

        {/* Left cheek */}
        <circle
          className={getElementClass('leftCheek')}
          cx="150"
          cy="220"
          r="25"
          fill={currentExpression.cheekColor}
          transform={getElementTransform('leftCheek')}
          onMouseDown={(e) => handleMouseDown(e, 'leftCheek')}
          onTouchStart={(e) => handleMouseDown(e, 'leftCheek')}
        />

        {/* Right cheek */}
        <circle
          className={getElementClass('rightCheek')}
          cx="250"
          cy="220"
          r="25"
          fill={currentExpression.cheekColor}
          transform={getElementTransform('rightCheek')}
          onMouseDown={(e) => handleMouseDown(e, 'rightCheek')}
          onTouchStart={(e) => handleMouseDown(e, 'rightCheek')}
        />

        {/* Eyes */}
        {renderEye('left', 170, 170)}
        {renderEye('right', 230, 170)}

        {/* Nose */}
        <ellipse
          className={getElementClass('nose')}
          cx="200"
          cy="200"
          rx="8"
          ry="15"
          fill="#FF8C42"
          transform={getElementTransform('nose')}
          onMouseDown={(e) => handleMouseDown(e, 'nose')}
          onTouchStart={(e) => handleMouseDown(e, 'nose')}
        />

        {/* Mouth */}
        {renderMouth()}
      </svg>
    </div>
  );
};

export default ElasticFace; 