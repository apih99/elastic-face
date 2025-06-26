import React, { useState, useRef, useCallback, useEffect } from 'react';
import './ElasticFace.css';

const ElasticFace = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
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

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
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
    return `face-element ${elementName} ${element.isAnimating ? 'animating' : ''}`;
  };

  return (
    <div className="elastic-face-container">
      <svg
        ref={svgRef}
        className="elastic-face-svg"
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
          fill="#FFD93D"
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
          fill="#FFB347"
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
          fill="#FFB347"
          transform={getElementTransform('rightCheek')}
          onMouseDown={(e) => handleMouseDown(e, 'rightCheek')}
          onTouchStart={(e) => handleMouseDown(e, 'rightCheek')}
        />

        {/* Left eye */}
        <g
          className={getElementClass('leftEye')}
          transform={getElementTransform('leftEye')}
          onMouseDown={(e) => handleMouseDown(e, 'leftEye')}
          onTouchStart={(e) => handleMouseDown(e, 'leftEye')}
        >
          <ellipse cx="170" cy="170" rx="20" ry="25" fill="white" />
          <circle cx="175" cy="170" r="12" fill="black" />
          <circle cx="178" cy="167" r="4" fill="white" />
        </g>

        {/* Right eye */}
        <g
          className={getElementClass('rightEye')}
          transform={getElementTransform('rightEye')}
          onMouseDown={(e) => handleMouseDown(e, 'rightEye')}
          onTouchStart={(e) => handleMouseDown(e, 'rightEye')}
        >
          <ellipse cx="230" cy="170" rx="20" ry="25" fill="white" />
          <circle cx="225" cy="170" r="12" fill="black" />
          <circle cx="222" cy="167" r="4" fill="white" />
        </g>

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
        <path
          className={getElementClass('mouth')}
          d="M 170 240 Q 200 270 230 240"
          stroke="#FF6B42"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          transform={getElementTransform('mouth')}
          onMouseDown={(e) => handleMouseDown(e, 'mouth')}
          onTouchStart={(e) => handleMouseDown(e, 'mouth')}
        />
      </svg>
    </div>
  );
};

export default ElasticFace; 