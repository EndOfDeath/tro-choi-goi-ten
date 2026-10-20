import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../../types';
import { PetAvatar } from '../illustrations/PetAvatars';
import { sound } from '../../utils/sound';
import { Flag, FastForward, Play, AlertCircle } from 'lucide-react';

interface PetRaceGameProps {
  winner: Student;
  eligiblePool: Student[];
  racers: Student[];
  duration: 5 | 10 | 15;
  onFinish: () => void;
  onSkip: () => void;
  reduceMotion: boolean;
}

export const PetRaceGame: React.FC<PetRaceGameProps> = ({
  winner,
  eligiblePool,
  racers,
  duration,
  onFinish,
  onSkip,
  reduceMotion,
}) => {
  const [gameState, setGameState] = useState<'ready' | 'countdown' | 'running' | 'finished'>('ready');
  const [countdownNum, setCountdownNum] = useState<number | 'GO'>(3);
  const [progresses, setProgresses] = useState<number[]>(racers.map(() => 0));

  const winnerIndex = racers.findIndex(r => r.id === winner.id);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Ready to race
  const handleStartRace = () => {
    if (gameState !== 'ready') return;
    setGameState('countdown');
    sound.playCountdown(false);
    setCountdownNum(3);

    // 3
    setTimeout(() => {
      setCountdownNum(2);
      sound.playCountdown(false);
    }, 1000);

    // 2
    setTimeout(() => {
      setCountdownNum(1);
      sound.playCountdown(false);
    }, 2000);

    // 1 -> GO!
    setTimeout(() => {
      setCountdownNum('GO');
      sound.playCountdown(true);
      sound.playWhistle();

      setTimeout(() => {
        setGameState('running');
        startRacingAnimation();
      }, 500);
    }, 3000);
  };

  const startRacingAnimation = () => {
    const totalMs = reduceMotion ? 1200 : duration * 1000;
    startTimeRef.current = performance.now();

    const frame = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / totalMs);

      // Play occasional galloping sound
      if (Math.random() < 0.15) {
        sound.playGallop();
      }

      // Compute progress for each racer
      // Winner is designed to cross 100% first at t=1
      // Non-winners stop around 75%-94%
      const newProgresses = racers.map((_, idx) => {
        if (idx === winnerIndex) {
          // Winner starts steady, surges in final third
          const surge = t > 0.65 ? Math.pow((t - 0.65) / 0.35, 1.4) * 0.35 : 0;
          const wobble = Math.sin(t * 12 + idx) * 0.03 * (1 - t);
          const prog = Math.min(100, (t * 0.7 + surge + wobble) * 100);
          return Math.max(0, prog);
        } else {
          // Others run fast early, then peak between 76% and 93%
          const seed = (idx + 1) * 17;
          const targetMax = 78 + (seed % 15);
          const speedMod = 0.9 + (seed % 20) / 100;
          const earlyBurst = Math.min(targetMax, t * speedMod * 85);
          const wobble = Math.sin(t * 15 + idx * 2) * 2 * (1 - t);
          return Math.min(targetMax, Math.max(0, earlyBurst + wobble));
        }
      });

      setProgresses(newProgresses);

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        // Winner crosses finish!
        setProgresses(prev => {
          const updated = [...prev];
          if (winnerIndex !== -1) updated[winnerIndex] = 100;
          return updated;
        });
        setGameState('finished');
        sound.playVictory();
        setTimeout(() => {
          onFinish();
        }, 800);
      }
    };

    animRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Race Top Banner & Track Controls */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold tracking-tight font-display">
            Đường Đua Thú Cưng
          </h2>
          <span className="text-xs text-emerald-200 hidden sm:inline">
            · Thời lượng: {duration} giây
          </span>
        </div>

        {/* Action button inside game */}
        <div className="flex items-center gap-2">
          {gameState === 'ready' && (
            <button
              onClick={handleStartRace}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-900" /> Xuất phát!
            </button>
          )}

          {gameState === 'running' && (
            <button
              onClick={onSkip}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1 shadow-xs"
              title="Xem ngay người chiến thắng"
            >
              <FastForward className="w-3.5 h-3.5" /> Hiện kết quả ngay
            </button>
          )}
        </div>
      </div>

      {/* Info notice if pool > racers */}
      {eligiblePool.length > racers.length && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Kết quả được chọn từ toàn bộ <strong>{eligiblePool.length}</strong> sinh viên đủ điều kiện; đường đua hiển thị <strong>{racers.length}</strong> bạn đại diện.
          </span>
        </div>
      )}

      {/* Main Race Track Scene */}
      <div className="relative bg-[#E8F5E9] p-4 sm:p-6 min-h-[380px] sm:min-h-[460px] flex flex-col justify-around overflow-hidden select-none">
        {/* Track Grass Background and Pennants */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Pennants / Bunting */}
        <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-6 pointer-events-none opacity-80">
          {['#EF4444', '#3B82F6', '#FBBF24', '#10B981', '#8B5CF6', '#EC4899', '#F97316'].map((c, i) => (
            <div
              key={i}
              className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent"
              style={{ borderTopColor: c }}
            />
          ))}
        </div>

        {/* Start Line */}
        <div className="absolute top-4 bottom-4 left-16 sm:left-24 w-1 bg-white/80 border-r border-dashed border-emerald-600 z-10 flex flex-col justify-between py-2 text-[10px] text-emerald-800 font-bold uppercase tracking-wider pl-1 pointer-events-none">
          <span>X</span>
          <span>P</span>
        </div>

        {/* Finish Line (Checkered Pattern) */}
        <div className="absolute top-4 bottom-4 right-12 sm:right-20 w-5 bg-repeat-y z-10 shadow-sm pointer-events-none rounded-xs overflow-hidden flex flex-col">
          <div className="w-full h-full bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[size:10px_10px] bg-white opacity-80" />
        </div>
        <div className="absolute top-2 right-12 sm:right-20 text-[10px] font-extrabold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded shadow-xs z-20">
          ĐÍCH
        </div>

        {/* Lanes & Racers */}
        <div className="flex flex-col gap-2.5 sm:gap-3 my-2 z-10">
          {racers.map((student, idx) => {
            const prog = progresses[idx] || 0;
            const isWinner = student.id === winner.id;
            const isFinishedWinner = isWinner && gameState === 'finished';

            return (
              <div
                key={student.id}
                className="relative h-14 sm:h-16 flex items-center bg-white/60 hover:bg-white/80 backdrop-blur-xs rounded-2xl border border-emerald-200/60 shadow-xs px-2"
              >
                {/* Lane Number */}
                <span className="text-[11px] font-mono font-bold text-emerald-800/60 w-5 shrink-0 tabular-nums">
                  L{idx + 1}
                </span>

                {/* Track Line */}
                <div className="absolute left-10 right-12 h-0.5 bg-emerald-300/40 border-b border-dashed border-emerald-400/50" />

                {/* Animated Moving Racer Container */}
                <div
                  className="absolute z-20 transition-all duration-75 flex items-center"
                  style={{
                    left: `calc(44px + ${prog}% * 0.76)`,
                  }}
                >
                  <PetAvatar
                    type={idx}
                    size={48}
                    isWinning={isFinishedWinner}
                    name={student.name}
                    code={student.code}
                    className={
                      gameState === 'running'
                        ? 'animate-bounce'
                        : isFinishedWinner
                        ? 'scale-125 transition-transform duration-300'
                        : ''
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Countdown Large Overlay */}
        {gameState === 'countdown' && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-40 animate-fade-in">
            <div className="w-36 h-36 rounded-full bg-white/95 border-4 border-amber-400 shadow-2xl flex items-center justify-center animate-bounce">
              <span className="text-6xl sm:text-7xl font-extrabold text-amber-600 font-display">
                {countdownNum}
              </span>
            </div>
          </div>
        )}

        {/* Ready Prompt */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-2xs flex items-center justify-center z-30">
            <button
              onClick={handleStartRace}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 text-xl font-extrabold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-2 border-white"
            >
              <Play className="w-7 h-7 fill-slate-900" /> BẤM ĐỂ XUẤT PHÁT
            </button>
          </div>
        )}
      </div>

      {/* Footer Track Status */}
      <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
        <span className="font-medium">
          Mẹo: Giảng viên có thể bấm &ldquo;Hiện kết quả ngay&rdquo; khi muốn tua nhanh lượt gọi.
        </span>
        <span className="font-semibold text-emerald-800">
          Chế độ: Đua ngẫu nhiên công bằng Web Crypto
        </span>
      </div>
    </div>
  );
};
