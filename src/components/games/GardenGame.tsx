import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../../types';
import { PlantIllustration } from '../illustrations/PlantIllustrations';
import { sound } from '../../utils/sound';
import { Droplets, Sparkles, FastForward, Cloud, Leaf } from 'lucide-react';

interface GardenGameProps {
  winner: Student;
  eligiblePool: Student[];
  onFinish: () => void;
  onSkip: () => void;
  reduceMotion: boolean;
}

export const GardenGame: React.FC<GardenGameProps> = ({
  winner,
  eligiblePool,
  onFinish,
  onSkip,
  reduceMotion,
}) => {
  const [gameState, setGameState] = useState<'idle' | 'watering' | 'suspense' | 'bloomed'>('idle');
  const [wateringCanPos, setWateringCanPos] = useState({ x: 10, y: 15 });
  const [wateredPlants, setWateredPlants] = useState<Record<string, boolean>>({});
  const winnerCardRef = useRef<HTMLDivElement | null>(null);

  // If pool is very large, display up to 24 plants in greenhouse grid, always containing the winner
  const displayPlants = React.useMemo(() => {
    if (eligiblePool.length <= 24) {
      return eligiblePool;
    }
    const otherPlants = eligiblePool.filter(s => s.id !== winner.id);
    // Shuffle and pick 23 others + winner
    const sample = otherPlants.slice(0, 23);
    const combined = [...sample, winner];
    // Deterministic sort by student code so the garden grid stays stable
    return combined.sort((a, b) => a.code.localeCompare(b.code));
  }, [eligiblePool, winner]);

  const handleWaterPlants = () => {
    if (gameState !== 'idle') return;
    setGameState('watering');
    sound.playClick();

    const duration = reduceMotion ? 1000 : 5000;
    const startTime = performance.now();

    const interval = setInterval(() => {
      sound.playWaterDrop();
    }, 450);

    const animateWateringCan = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Move watering can across screen horizontally in S-curve
      const curX = 10 + t * 78;
      const curY = 12 + Math.sin(t * Math.PI * 4) * 8;
      setWateringCanPos({ x: curX, y: curY });

      // Mark nearby plants as watered
      displayPlants.forEach((p, idx) => {
        const plantProgress = idx / displayPlants.length;
        if (t >= plantProgress && !wateredPlants[p.id]) {
          setWateredPlants(prev => ({ ...prev, [p.id]: true }));
        }
      });

      if (t < 1) {
        requestAnimationFrame(animateWateringCan);
      } else {
        clearInterval(interval);
        setGameState('suspense');

        // Suspense pause before blooming
        setTimeout(() => {
          setGameState('bloomed');
          sound.playBloom();

          // Scroll winner into focus if needed
          if (winnerCardRef.current) {
            winnerCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          // Trigger finish modal
          setTimeout(() => {
            onFinish();
          }, 1400);
        }, 900);
      }
    };

    requestAnimationFrame(animateWateringCan);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-300" />
          <h2 className="text-lg font-bold tracking-tight font-display">
            Vườn Cây Bất Ngờ
          </h2>
          <span className="text-xs text-emerald-200 hidden sm:inline">
            · Khu vườn ươm sinh viên Nông Lâm
          </span>
        </div>

        <div className="flex items-center gap-2">
          {gameState === 'idle' && (
            <button
              onClick={handleWaterPlants}
              className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Droplets className="w-4 h-4 fill-emerald-950" /> Tưới nước ngay
            </button>
          )}

          {(gameState === 'watering' || gameState === 'suspense') && (
            <button
              onClick={onSkip}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <FastForward className="w-3.5 h-3.5" /> Hiện kết quả ngay
            </button>
          )}
        </div>
      </div>

      {/* Info notice if pool > displayed */}
      {eligiblePool.length > displayPlants.length && (
        <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-4 py-1.5 text-xs text-emerald-900 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Vườn ươm chăm sóc toàn bộ <strong>{eligiblePool.length}</strong> sinh viên đủ điều kiện.
          </span>
        </div>
      )}

      {/* Main Garden Botanical Environment */}
      <div className="relative bg-gradient-to-b from-sky-100 via-emerald-50 to-[#E8F5E9] p-4 sm:p-6 min-h-[420px] sm:min-h-[480px] overflow-hidden select-none flex flex-col justify-between">
        {/* Sky Ambient Clouds */}
        <div className="absolute top-3 left-6 text-white/70 animate-float pointer-events-none">
          <Cloud className="w-12 h-12" />
        </div>
        <div className="absolute top-8 right-12 text-white/60 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>
          <Cloud className="w-16 h-16" />
        </div>

        {/* Floating Animated Watering Can */}
        {gameState === 'watering' && (
          <div
            className="absolute z-40 transition-all duration-75 pointer-events-none drop-shadow-xl"
            style={{
              left: `${wateringCanPos.x}%`,
              top: `${wateringCanPos.y}%`,
              transform: 'rotate(-25deg)',
            }}
          >
            {/* SVG Watering Can */}
            <svg width="74" height="64" viewBox="0 0 100 80" className="overflow-visible">
              {/* Can body */}
              <ellipse cx="45" cy="48" rx="28" ry="24" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
              {/* Handle */}
              <path d="M18,44 C8,44 6,24 22,22 C30,22 34,30 36,36" stroke="#0369A1" strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* Spout */}
              <path d="M68,52 L88,32" stroke="#0284C7" strokeWidth="8" strokeLinecap="round" />
              {/* Rose (sprinkler head) */}
              <ellipse cx="90" cy="30" rx="8" ry="12" fill="#38BDF8" transform="rotate(30 90 30)" />
              {/* Water streams */}
              <g className="animate-pulse">
                <line x1="94" y1="34" x2="114" y2="60" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="90" y1="36" x2="108" y2="68" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="86" y1="38" x2="100" y2="72" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
              </g>
            </svg>
          </div>
        )}

        {/* Nursery Benches / Plant Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 my-auto max-h-[380px] overflow-y-auto p-2 scrollbar-thin">
          {displayPlants.map((student, idx) => {
            const isWinner = student.id === winner.id;
            const isWatered = !!wateredPlants[student.id];
            const isBloomed = isWinner && gameState === 'bloomed';

            const stage = isBloomed ? 'bloomed' : isWatered ? 'watered' : 'idle';

            return (
              <div
                key={student.id}
                ref={isWinner ? winnerCardRef : undefined}
                className={`relative flex flex-col items-center justify-end p-2 rounded-2xl transition-all duration-500 ${
                  isBloomed
                    ? 'bg-amber-100/90 ring-4 ring-amber-400 shadow-2xl scale-110 z-30'
                    : isWatered
                    ? 'bg-white/80 shadow-xs'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              >
                <PlantIllustration
                  type={idx}
                  stage={stage}
                  name={student.name}
                  code={student.code}
                  size={isBloomed ? 110 : 85}
                  isWinner={isBloomed}
                />
              </div>
            );
          })}
        </div>

        {/* Idle Start Prompt Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-2xs flex items-center justify-center z-30">
            <button
              onClick={handleWaterPlants}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl font-extrabold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-2 border-white/60"
            >
              <Droplets className="w-7 h-7 fill-white" /> BẤM ĐỂ TƯỚI NƯỚC VƯỜN CÂY
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
        <span className="font-medium">
          Mỗi chậu cây tượng trưng cho một sinh viên. Khi hoa nở, sinh viên đó sẽ nhận nhiệm vụ!
        </span>
        <span className="font-semibold text-emerald-800">
          Chế độ: Vườn ươm tương tác Nông Lâm
        </span>
      </div>
    </div>
  );
};
