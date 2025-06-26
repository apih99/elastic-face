import React, { useState, useRef, useCallback, useEffect } from 'react';
import './ElasticFace.css';

const ElasticFace = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [currentMood, setCurrentMood] = useState('happy');
  const [particles, setParticles] = useState([]);
  const [physicsMode, setPhysicsMode] = useState({
    jiggle: true,
    chainReaction: false,
    gravity: false,
    bounce: false
  });
  const [faceElements, setFaceElements] = useState({
    leftEye: { x: 0, y: 0, vx: 0, vy: 0, isAnimating: false, jigglePhase: 0, lastUpdate: Date.now() },
    rightEye: { x: 0, y: 0, vx: 0, vy: 0, isAnimating: false, jigglePhase: 0, lastUpdate: Date.now() },
    nose: { x: 0, y: 0, vx: 0, vy: 0, isAnimating: false, jigglePhase: 0, lastUpdate: Date.now() },
    mouth: { x: 0, y: 0, vx: 0, vy: 0, isAnimating: false, jigglePhase: 0, lastUpdate: Date.now() },
    leftCheek: { x: 0, y: 0, vx: 0, vy: 0, isAnimating: false, jigglePhase: 0, lastUpdate: Date.now() },
    rightCheek: { x: 0, y: 0, vx: 0, vy: 0, isAnimating: false, jigglePhase: 0, lastUpdate: Date.now() },
    face: { x: 0, y: 0, vx: 0, vy: 0, scaleX: 1, scaleY: 1, isAnimating: false, jigglePhase: 0, lastUpdate: Date.now() }
  });
  
  const svgRef = useRef(null);
  const audioContext = useRef(null);
  const particleIdCounter = useRef(0);
  const animationFrameRef = useRef(null);
  const physicsAnimationRef = useRef(null);

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

  // Physics configuration - moved to useMemo to prevent recreation
  const physicsConfig = React.useMemo(() => ({
    jiggle: {
      frequency: 0.15,
      damping: 0.95,
      amplitude: 3
    },
    chainReaction: {
      influenceRadius: 80,
      influenceStrength: 0.3
    },
    gravity: {
      strength: 0.2,
      terminalVelocity: 8
    },
    bounce: {
      damping: 0.8,
      boundary: 150
    }
  }), []);

  // Particle system
  const createParticle = useCallback((type, x, y, options = {}) => {
    const id = particleIdCounter.current++;
    const baseParticle = {
      id,
      x,
      y,
      createdAt: Date.now(),
      type
    };

    switch (type) {
      case 'sparkle':
        return {
          ...baseParticle,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          size: Math.random() * 3 + 2,
          life: 1,
          decay: 0.02,
          color: `hsl(${Math.random() * 60 + 40}, 100%, 70%)`,
          rotation: Math.random() * 360
        };
      case 'pop':
        return {
          ...baseParticle,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: Math.random() * 4 + 3,
          life: 1,
          decay: 0.03,
          color: `hsl(${Math.random() * 360}, 80%, 60%)`,
          bounce: 0.8
        };
      case 'trail':
        return {
          ...baseParticle,
          vx: 0,
          vy: 0,
          size: Math.random() * 2 + 1,
          life: 1,
          decay: 0.05,
          color: `hsl(${(Date.now() / 10) % 360}, 80%, 60%)`,
          trail: true
        };
      case 'confetti':
        return {
          ...baseParticle,
          vx: (Math.random() - 0.5) * 12,
          vy: Math.random() * -8 - 4,
          size: Math.random() * 6 + 4,
          life: 1,
          decay: 0.015,
          color: `hsl(${Math.random() * 360}, 90%, 60%)`,
          shape: Math.random() > 0.5 ? 'rect' : 'circle',
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          gravity: 0.2
        };
      default:
        return baseParticle;
    }
  }, []);

  const addParticles = useCallback((type, x, y, count = 1, options = {}) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push(createParticle(type, x, y, options));
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, [createParticle]);

  const getElementPosition = useCallback((elementName) => {
    const element = faceElements[elementName];
    const basePositions = {
      leftEye: { x: 170, y: 170 },
      rightEye: { x: 230, y: 170 },
      nose: { x: 200, y: 200 },
      mouth: { x: 200, y: 250 },
      leftCheek: { x: 150, y: 220 },
      rightCheek: { x: 250, y: 220 },
      face: { x: 200, y: 200 }
    };
    
    const base = basePositions[elementName] || { x: 200, y: 200 };
    return {
      x: base.x + element.x,
      y: base.y + element.y
    };
  }, [faceElements]);

  // Physics animation loop
  const updatePhysics = useCallback(() => {
    const now = Date.now();
    
    setFaceElements(prev => {
      const newElements = { ...prev };
      
      Object.keys(newElements).forEach(elementName => {
        const element = newElements[elementName];
        const deltaTime = (now - element.lastUpdate) / 16.67; // Normalize to 60fps
        
        // Skip physics for dragged element
        if (isDragging && dragTarget === elementName) {
          element.lastUpdate = now;
          return;
        }
        
        // Jiggle Physics
        if (physicsMode.jiggle && !element.isAnimating) {
          const distance = Math.sqrt(element.x ** 2 + element.y ** 2);
          if (distance > 0.5) {
            element.jigglePhase += physicsConfig.jiggle.frequency * deltaTime;
            const jiggleX = Math.sin(element.jigglePhase) * physicsConfig.jiggle.amplitude * (distance / 100);
            const jiggleY = Math.cos(element.jigglePhase * 1.3) * physicsConfig.jiggle.amplitude * (distance / 100);
            
            element.x += jiggleX * 0.1;
            element.y += jiggleY * 0.1;
            
            // Damping
            element.x *= physicsConfig.jiggle.damping;
            element.y *= physicsConfig.jiggle.damping;
          }
        }
        
        // Gravity Mode
        if (physicsMode.gravity && !element.isAnimating) {
          element.vy += physicsConfig.gravity.strength * deltaTime;
          element.vy = Math.min(element.vy, physicsConfig.gravity.terminalVelocity);
          element.y += element.vy * deltaTime;
          
          // Ground collision
          if (element.y > physicsConfig.bounce.boundary) {
            element.y = physicsConfig.bounce.boundary;
            element.vy *= -physicsConfig.bounce.damping;
          }
        }
        
        // Bounce Mode
        if (physicsMode.bounce && !element.isAnimating) {
          element.x += element.vx * deltaTime;
          element.y += element.vy * deltaTime;
          
          // Boundary collisions
          if (Math.abs(element.x) > physicsConfig.bounce.boundary) {
            element.x = Math.sign(element.x) * physicsConfig.bounce.boundary;
            element.vx *= -physicsConfig.bounce.damping;
            addParticles('pop', 200 + element.x, 200 + element.y, 5);
          }
          
          if (Math.abs(element.y) > physicsConfig.bounce.boundary) {
            element.y = Math.sign(element.y) * physicsConfig.bounce.boundary;
            element.vy *= -physicsConfig.bounce.damping;
            addParticles('pop', 200 + element.x, 200 + element.y, 5);
          }
          
          // Friction
          element.vx *= 0.99;
          element.vy *= 0.99;
        }
        
        element.lastUpdate = now;
      });
      
      // Chain Reactions
      if (physicsMode.chainReaction && isDragging && dragTarget) {
        const draggedElement = newElements[dragTarget];
        const draggedDistance = Math.sqrt(draggedElement.x ** 2 + draggedElement.y ** 2);
        
        Object.keys(newElements).forEach(otherElementName => {
          if (otherElementName === dragTarget) return;
          
          const otherElement = newElements[otherElementName];
          const basePositions = {
            leftEye: { x: 170, y: 170 },
            rightEye: { x: 230, y: 170 },
            nose: { x: 200, y: 200 },
            mouth: { x: 200, y: 250 },
            leftCheek: { x: 150, y: 220 },
            rightCheek: { x: 250, y: 220 },
            face: { x: 200, y: 200 }
          };
          
          const draggedPos = basePositions[dragTarget];
          const otherPos = basePositions[otherElementName];
          
          if (draggedPos && otherPos) {
            const distance = Math.sqrt(
              (draggedPos.x - otherPos.x) ** 2 + (draggedPos.y - otherPos.y) ** 2
            );
            
            if (distance < physicsConfig.chainReaction.influenceRadius) {
              const influence = (1 - distance / physicsConfig.chainReaction.influenceRadius) * 
                               physicsConfig.chainReaction.influenceStrength;
              
              const angleToOther = Math.atan2(
                otherPos.y - draggedPos.y,
                otherPos.x - draggedPos.x
              );
              
              otherElement.x += Math.cos(angleToOther) * draggedDistance * influence;
              otherElement.y += Math.sin(angleToOther) * draggedDistance * influence;
              
              // Add chain reaction sparkles
              if (Math.random() < 0.1) {
                const elementPos = getElementPosition(otherElementName);
                addParticles('sparkle', elementPos.x, elementPos.y, 1);
              }
            }
          }
        });
      }
      
      return newElements;
    });
  }, [isDragging, dragTarget, physicsMode, physicsConfig, addParticles, getElementPosition]);

  // Physics animation loop
  useEffect(() => {
    const animatePhysics = () => {
      updatePhysics();
      physicsAnimationRef.current = requestAnimationFrame(animatePhysics);
    };
    
    animatePhysics();
    
    return () => {
      if (physicsAnimationRef.current) {
        cancelAnimationFrame(physicsAnimationRef.current);
      }
    };
  }, [updatePhysics]);

  const updateParticles = useCallback(() => {
    setParticles(prev => {
      return prev
        .map(particle => {
          const newParticle = { ...particle };
          
          // Update position
          newParticle.x += newParticle.vx || 0;
          newParticle.y += newParticle.vy || 0;
          
          // Apply gravity for confetti
          if (newParticle.type === 'confetti' && newParticle.gravity) {
            newParticle.vy += newParticle.gravity;
          }
          
          // Update rotation
          if (newParticle.rotationSpeed) {
            newParticle.rotation = (newParticle.rotation || 0) + newParticle.rotationSpeed;
          }
          
          // Update life
          newParticle.life -= newParticle.decay || 0.01;
          
          // Bounce for pop particles
          if (newParticle.type === 'pop' && newParticle.bounce) {
            if (newParticle.x < 0 || newParticle.x > 400) {
              newParticle.vx *= -newParticle.bounce;
            }
            if (newParticle.y < 0 || newParticle.y > 400) {
              newParticle.vy *= -newParticle.bounce;
            }
          }
          
          return newParticle;
        })
        .filter(particle => particle.life > 0);
    });
  }, []);

  // Animation loop for particles
  useEffect(() => {
    const animate = () => {
      updateParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateParticles]);

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

  // Play boing sound with pop particles
  const playBoingSound = useCallback((x, y) => {
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
    
    // Add pop particles
    addParticles('pop', x, y, 8);
  }, [addParticles]);

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
    
    // Add mood change sparkles
    addParticles('sparkle', 200, 200, 15);
    
    // Resume audio context on user interaction
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  }, [playMoodSound, addParticles]);

  const togglePhysicsMode = useCallback((mode) => {
    setPhysicsMode(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
    
    // Reset velocities when toggling modes
    setFaceElements(prev => {
      const newElements = { ...prev };
      Object.keys(newElements).forEach(key => {
        newElements[key].vx = 0;
        newElements[key].vy = 0;
        newElements[key].jigglePhase = 0;
      });
      return newElements;
    });
    
    // Play toggle sound
    if (audioContext.current) {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      oscillator.frequency.setValueAtTime(300, audioContext.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.current.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.1);
      
      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + 0.1);
    }
    
    // Add toggle particles
    addParticles('sparkle', 200, 100, 8);
  }, [addParticles]);

  const handleMouseDown = useCallback((e, elementName) => {
    e.preventDefault();
    setIsDragging(true);
    setDragTarget(elementName);
    
    // Reset physics for the dragged element
    setFaceElements(prev => ({
      ...prev,
      [elementName]: {
        ...prev[elementName],
        vx: 0,
        vy: 0,
        isAnimating: false
      }
    }));
    
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

    // Add sparkles while dragging
    const elementPos = getElementPosition(dragTarget);
    if (Math.random() < 0.3) { // 30% chance each frame
      addParticles('sparkle', elementPos.x, elementPos.y, 2);
    }

    // Add rainbow trail particles
    if (Math.random() < 0.5) { // 50% chance each frame
      addParticles('trail', elementPos.x, elementPos.y, 1);
    }

    // Big stretch confetti
    if (distance > maxDistance * 0.8) {
      if (Math.random() < 0.1) { // 10% chance for big stretches
        addParticles('confetti', elementPos.x, elementPos.y, 5);
      }
    }
  }, [isDragging, dragTarget, getMousePosition, getElementPosition, addParticles]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragTarget) {
      const elementPos = getElementPosition(dragTarget);
      
      // Calculate stretch distance for special effects
      const element = faceElements[dragTarget];
      const stretchDistance = Math.sqrt(element.x ** 2 + element.y ** 2);
      
      playBoingSound(elementPos.x, elementPos.y);
      
      // Set initial velocity for bounce mode
      if (physicsMode.bounce) {
        setFaceElements(prev => ({
          ...prev,
          [dragTarget]: {
            ...prev[dragTarget],
            vx: element.x * 0.1,
            vy: element.y * 0.1,
            isAnimating: false
          }
        }));
      } else {
        setFaceElements(prev => ({
          ...prev,
          [dragTarget]: {
            ...prev[dragTarget],
            isAnimating: true
          }
        }));

        // Reset position after animation if not in physics modes
        if (!physicsMode.gravity && !physicsMode.bounce) {
          setTimeout(() => {
            setFaceElements(prev => ({
              ...prev,
              [dragTarget]: {
                ...prev[dragTarget],
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                isAnimating: false
              }
            }));
          }, 100);
        }
      }
      
      // Big stretch confetti explosion
      if (stretchDistance > 100) {
        addParticles('confetti', elementPos.x, elementPos.y, 20);
      }
    }
    
    setIsDragging(false);
    setDragTarget(null);
  }, [isDragging, dragTarget, playBoingSound, getElementPosition, faceElements, addParticles, physicsMode]);

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

  // Render particles
  const renderParticles = () => {
    return particles.map(particle => {
      const opacity = particle.life;
      const transform = `translate(${particle.x}, ${particle.y}) rotate(${particle.rotation || 0})`;
      
      switch (particle.type) {
        case 'sparkle':
          return (
            <g key={particle.id} transform={transform} opacity={opacity}>
              <path
                d={`M 0,-${particle.size} L ${particle.size * 0.3},-${particle.size * 0.3} L ${particle.size},0 L ${particle.size * 0.3},${particle.size * 0.3} L 0,${particle.size} L -${particle.size * 0.3},${particle.size * 0.3} L -${particle.size},0 L -${particle.size * 0.3},-${particle.size * 0.3} Z`}
                fill={particle.color}
                className="sparkle-particle"
              />
            </g>
          );
        case 'pop':
          return (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              opacity={opacity}
              className="pop-particle"
            />
          );
        case 'trail':
          return (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              opacity={opacity}
              className="trail-particle"
            />
          );
        case 'confetti':
          if (particle.shape === 'rect') {
            return (
              <rect
                key={particle.id}
                x={particle.x - particle.size / 2}
                y={particle.y - particle.size / 2}
                width={particle.size}
                height={particle.size}
                fill={particle.color}
                opacity={opacity}
                transform={`rotate(${particle.rotation || 0} ${particle.x} ${particle.y})`}
                className="confetti-particle"
              />
            );
          } else {
            return (
              <circle
                key={particle.id}
                cx={particle.x}
                cy={particle.y}
                r={particle.size / 2}
                fill={particle.color}
                opacity={opacity}
                className="confetti-particle"
              />
            );
          }
        default:
          return null;
      }
    });
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

      {/* Physics Controls */}
      <div className="physics-controls">
        <h3>Physics Modes:</h3>
        <div className="physics-buttons">
          <button
            className={`physics-button ${physicsMode.jiggle ? 'active' : ''}`}
            onClick={() => togglePhysicsMode('jiggle')}
            title="Parts wobble after release"
          >
            <span className="physics-icon">🌊</span>
            <span className="physics-name">Jiggle</span>
          </button>
          <button
            className={`physics-button ${physicsMode.chainReaction ? 'active' : ''}`}
            onClick={() => togglePhysicsMode('chainReaction')}
            title="Stretching one part affects others"
          >
            <span className="physics-icon">⚡</span>
            <span className="physics-name">Chain</span>
          </button>
          <button
            className={`physics-button ${physicsMode.gravity ? 'active' : ''}`}
            onClick={() => togglePhysicsMode('gravity')}
            title="Parts fall down when stretched"
          >
            <span className="physics-icon">🍎</span>
            <span className="physics-name">Gravity</span>
          </button>
          <button
            className={`physics-button ${physicsMode.bounce ? 'active' : ''}`}
            onClick={() => togglePhysicsMode('bounce')}
            title="Elements bounce off screen edges"
          >
            <span className="physics-icon">🏀</span>
            <span className="physics-name">Bounce</span>
          </button>
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

        {/* Particle Effects */}
        <g className="particles-layer">
          {renderParticles()}
        </g>
      </svg>
    </div>
  );
};

export default ElasticFace; 