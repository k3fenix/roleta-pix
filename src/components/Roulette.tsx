import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { SiPix } from 'react-icons/si';

export type RouletteVariant = 'classic' | 'neon' | 'extreme';

interface RouletteProps {
  variant?: RouletteVariant;
  isSpinning: boolean;
  prizeIndex: number | null; // 0 to numSegments - 1
  numSegments: number;
  onSpinEnd: () => void;
  prizes: Array<{ id: string; name: string; color: string; amount_cents: number }>;
}

export function Roulette({ isSpinning, prizeIndex, numSegments, onSpinEnd, prizes }: RouletteProps) {
  const controls = useAnimation();
  const [currentRotation, setCurrentRotation] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTick = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Som de um 'click/tac' da roleta (onda triangular caindo rapidamente de frequência)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Áudio não suportado ou bloqueado", e);
    }
  };

  useEffect(() => {
    if (isSpinning && prizeIndex !== null) {
      spinTo(prizeIndex);
    }
  }, [isSpinning, prizeIndex]);

  const spinTo = async (targetIndex: number) => {
    const segmentAngle = 360 / numSegments;
    const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
    // As fatias começam no topo (12 horas = 0 graus relativos), e o ponteiro também está no topo.
    // Para alinhar o centro da fatia com o topo, giramos a roleta no sentido anti-horário.
    const targetR = (360 - segmentCenter) % 360;
    const extraSpins = 360 * 5;
    const currentR = currentRotation % 360;
    
    let diff = targetR - currentR;
    if (diff < 0) diff += 360;
    
    const finalRotation = currentRotation + extraSpins + diff;
    const durationMs = 5000; // 5 segundos

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let delay = 40; // Começa muito rápido (40ms)
    let passed = 0;

    const tick = () => {
      playTick();
      passed += delay;
      // Continua tocando até perto do final da animação
      if (passed < durationMs - 200) {
        const progress = passed / durationMs;
        // O atraso aumenta exponencialmente no final para simular o atrito da roleta parando
        delay = 40 + Math.pow(progress, 3) * 600; 
        timeoutId = setTimeout(tick, delay);
      }
    };
    
    // Inicia os ticks
    tick();

    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: durationMs / 1000,
        ease: [0.15, 0.9, 0.2, 1], // Efeito de freada na roleta
      }
    });

    clearTimeout(timeoutId);
    setCurrentRotation(finalRotation);
    onSpinEnd();
  };

  // The Wheel Segments Backgrounds
  const renderSegmentBackgrounds = () => {
    const segmentAngle = 360 / numSegments;
    const skewAngle = 90 - segmentAngle;

    return prizes.map((prize, i) => {
      const rotateAngle = i * segmentAngle;
      const bgColor = prize.color === 'black' ? '#000000' : '#15803d'; // Green 700 vs Black
      
      return (
        <div 
          key={`bg-${prize.id || i}`}
          className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left border-l-2 border-b-2 border-green-900"
          style={{
            backgroundColor: bgColor,
            transform: `rotate(${rotateAngle}deg) skewY(-${skewAngle}deg)`,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
          }}
        />
      );
    });
  };

  // The Wheel Text Labels
  const renderLabels = () => {
    const segmentAngle = 360 / numSegments;

    return prizes.map((prize, i) => {
      const rotateAngle = i * segmentAngle + (segmentAngle / 2);
      
      return (
        <div 
          key={`label-${prize.id || i}`}
          className="absolute top-0 left-0 w-full h-full flex items-start justify-center pointer-events-none"
          style={{
            transform: `rotate(${rotateAngle}deg)`
          }}
        >
          <div className="flex flex-col items-center pt-[15%] sm:pt-[12%]">
            {prize.amount_cents > 0 ? (
              <>
                <span className="text-[10px] sm:text-xs text-green-200 font-bold leading-none">R$</span>
                <span className="text-sm sm:text-xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-white leading-none">
                  {(prize.amount_cents / 100).toString()}
                </span>
              </>
            ) : (
              <span className="text-[10px] sm:text-xs text-center px-1 font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-gray-200 leading-tight" style={{ transform: 'rotate(-90deg)', marginTop: '20px', width: '100px', whiteSpace: 'normal' }}>
                {prize.name.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  // Generate spikes for the outer rim
  const renderSpikes = () => {
    return Array.from({ length: 12 }).map((_, i) => (
      <div 
        key={`spike-${i}`}
        className="absolute w-0 h-0"
        style={{
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderBottom: '30px solid #14532d', // Dark green base
          top: '-25px',
          left: '50%',
          transformOrigin: '50% 225px', // 200px radius + 25px offset
          transform: `translateX(-50%) rotate(${i * 30}deg)`,
          filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.5))'
        }}
      >
        {/* Inner bright part of the spike */}
        <div className="absolute w-0 h-0"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '20px solid #22c55e', // Green 500
            top: '5px',
            left: '-8px'
          }}
        />
      </div>
    ));
  };

  return (
    <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] mx-auto flex items-center justify-center mt-12 mb-12">
      
      {/* Top Pointer (The largest spike) */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 0L60 40L30 80L0 40L30 0Z" fill="url(#pointerGrad)"/>
          <path d="M30 5L52 40L30 70L8 40L30 5Z" fill="#22c55e"/>
          <path d="M30 5L52 40L30 40Z" fill="#15803d"/>
          <defs>
            <linearGradient id="pointerGrad" x1="30" y1="0" x2="30" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#064e3b"/>
              <stop offset="1" stopColor="#14532d"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Outer Metallic & Neon Rim */}
      <div className="absolute inset-[-20px] rounded-full border-[15px] border-black shadow-[0_0_50px_rgba(34,197,94,0.4),inset_0_0_20px_rgba(34,197,94,0.3)] z-0 bg-gradient-to-br from-gray-900 to-black">
        {renderSpikes()}
        {/* Glowing lights on the rim */}
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-green-500/40 animate-[spin_10s_linear_infinite]" />
      </div>

      {/* The Rotating Wheel */}
      <motion.div 
        className="w-full h-full rounded-full overflow-hidden relative z-10 border-4 border-green-900 shadow-[inset_0_0_30px_rgba(0,0,0,1)] bg-black"
        animate={controls}
        initial={{ rotate: 0 }}
      >
        {renderSegmentBackgrounds()}
        {renderLabels()}
      </motion.div>

      {/* Center Dome with PIX Logo */}
      <div className="absolute w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-full flex flex-col items-center justify-center z-20 bg-[#111] border-4 border-green-800 shadow-[0_0_30px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(34,197,94,0.2)] overflow-hidden">
        <SiPix className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] text-[#22c55e] filter drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        {/* Glossy reflection overlay */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-white/10 rounded-full blur-[2px]" />
      </div>
    </div>
  );
}
