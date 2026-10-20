import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../../types';
import { PlushieDoll } from '../illustrations/PlushieDolls';
import { sound } from '../../utils/sound';
import { Gift, FastForward, Play, Disc } from 'lucide-react';

interface ClawMachineGameProps {
  winner: Student;
  eligiblePool: Student[];
  onFinish: () => void;
  onSkip: () => void;
  reduceMotion: boolean;
}

export const ClawMachineGame: React.FC<ClawMachineGameProps> = ({
  winner,
  eligiblePool,
  onFinish,
  onSkip,
  reduceMotion,
}) => {
  const [gameState, setGameState] = useState<
    'idle' | 'moving' | 'dropping' | 'grabbing' | 'lifting' | 'returning' | 'dispensed'
  >('idle');
  const [clawX, setClawX] = useState<number>(50); // percentage 20 to 80
  const [clawY, setClawY] = useState<number>(10); // percentage 10 to 65
  const [clawOpen, setClawOpen] = useState<boolean>(true);
  const [hasToy, setHasToy] = useState<boolean>(false);

  // Background plushies inside the claw machine cabinet
  const cabinetPlushies = [0, 1, 2, 3, 4, 5, 1, 2, 0, 4];

  const handleStartGrab = () => {
    if (gameState !== 'idle') return;
    setGameState('moving');
    sound.playClick();

    const speedMod = reduceMotion ? 0.3 : 1;

    // Step 1: Claw moves back and forth with motor sound
    let stepCount = 0;
    const motorInterval = setInterval(() => {
      sound.playClawMotor();
      stepCount++;
      if (stepCount >= 10) clearInterval(motorInterval);
    }, 180);

    // Target X position above prize area
    const targetX = 52;
    setClawX(25);

    setTimeout(() => {
      setClawX(75);
    }, 600 * speedMod);

    setTimeout(() => {
      setClawX(targetX);
    }, 1300 * speedMod);

    // Step 2: Claw drops down
    setTimeout(() => {
      setGameState('dropping');
      setClawY(62);
      sound.playClawMotor();
    }, 2000 * speedMod);

    // Step 3: Claw closes and grabs plushie
    setTimeout(() => {
      setGameState('grabbing');
      setClawOpen(false);
      setHasToy(true);
      sound.playClawGrab();
    }, 2800 * speedMod);

    // Step 4: Claw lifts up with toy
    setTimeout(() => {
      setGameState('lifting');
      setClawY(12);
      sound.playClawMotor();
    }, 3400 * speedMod);

    // Step 5: Claw moves horizontally to the chute (left side: x = 18%)
    setTimeout(() => {
      setGameState('returning');
      setClawX(18);
      sound.playClawMotor();
    }, 4200 * speedMod);

    // Step 6: Claw opens and drops plushie into prize chute!
    setTimeout(() => {
      setClawOpen(true);
      setHasToy(false);
      setGameState('dispensed');
      sound.playVictory();

      // Complete and open winner modal
      setTimeout(() => {
        onFinish();
      }, 1200);
    }, 5100 * speedMod);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Top Arcade Marquee */}
      <div className="bg-gradient-to-r from-teal-800 via-cyan-800 to-emerald-800 text-white px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-300" />
          <h2 className="text-lg font-bold tracking-tight font-display">
            Máy Gắp Thú Bông
          </h2>
          <span className="text-xs text-cyan-200 hidden sm:inline">
            · Bốc thăm từ {eligiblePool.length} sinh viên đủ điều kiện
          </span>
        </div>

        <div className="flex items-center gap-2">
          {gameState === 'idle' && (
            <button
              onClick={handleStartGrab}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-900" /> Gắp ngay
            </button>
          )}

          {gameState !== 'idle' && gameState !== 'dispensed' && (
            <button
              onClick={onSkip}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <FastForward className="w-3.5 h-3.5" /> Hiện kết quả ngay
            </button>
          )}
        </div>
      </div>

      {/* Main Arcade Cabinet Body */}
      <div className="relative bg-gradient-to-b from-sky-900 via-cyan-950 to-slate-900 p-4 sm:p-6 min-h-[440px] sm:min-h-[500px] flex flex-col justify-between overflow-hidden select-none">
        {/* Glass Cabinet Frame with Neon Border */}
        <div className="absolute inset-4 rounded-3xl border-4 border-cyan-400/40 shadow-[inset_0_0_30px_rgba(56,189,248,0.2)] pointer-events-none z-20" />

        {/* Top Rail & Crane Gantry */}
        <div className="relative z-10 w-full h-8 bg-slate-800 border-b-2 border-cyan-500/50 rounded-t-xl flex items-center shadow-inner">
          <div className="w-full h-1.5 bg-cyan-400/30" />
        </div>

        {/* Movable Claw Crane Assembly */}
        <div
          className="absolute z-20 transition-all duration-500 flex flex-col items-center pointer-events-none"
          style={{
            left: `${clawX}%`,
            top: `${clawY}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Suspension wire */}
          <div
            className="w-1 bg-gradient-to-b from-slate-300 to-slate-400 shadow-sm"
            style={{ height: '80px', marginTop: '-80px' }}
          />

          {/* Crane Motor Body */}
          <div className="w-12 h-9 bg-gradient-to-b from-amber-400 to-amber-500 rounded-lg border-2 border-amber-600 shadow-md flex items-center justify-center">
            <Disc className="w-4 h-4 text-amber-800 animate-spin" />
          </div>

          {/* Mechanical Claw Fingers */}
          <div className="relative w-14 h-12 flex justify-center mt-[-2px]">
            {/* Left finger */}
            <div
              className={`absolute top-0 left-1 w-2.5 h-10 bg-slate-200 border border-slate-400 rounded-b-md transition-transform duration-200 origin-top ${
                clawOpen ? '-rotate-35' : '-rotate-10'
              }`}
            />
            {/* Center finger */}
            <div className="absolute top-0 w-2.5 h-10 bg-slate-300 border border-slate-400 rounded-b-md" />
            {/* Right finger */}
            <div
              className={`absolute top-0 right-1 w-2.5 h-10 bg-slate-200 border border-slate-400 rounded-b-md transition-transform duration-200 origin-top ${
                clawOpen ? 'rotate-35' : 'rotate-10'
              }`}
            />

            {/* Held Plushie if grabbed */}
            {hasToy && (
              <div className="absolute top-7 scale-90 animate-wiggle">
                <PlushieDoll
                  type={0}
                  size={64}
                  isGrabbed={true}
                  name={winner.name}
                  code={winner.code}
                />
              </div>
            )}
          </div>
        </div>

        {/* Pile of Plushies at the Bottom */}
        <div className="relative z-10 mt-auto pt-16 flex items-end justify-around gap-1 px-4 flex-wrap">
          {cabinetPlushies.map((typeIdx, i) => (
            <div
              key={i}
              className={`transition-transform duration-300 hover:scale-105 ${
                i % 2 === 0 ? '-rotate-6 translate-y-1' : 'rotate-6'
              }`}
            >
              <PlushieDoll type={typeIdx} size={62} />
            </div>
          ))}
        </div>

        {/* Prize Chute on the bottom-left */}
        <div className="absolute bottom-4 left-6 w-24 h-24 bg-slate-900 border-2 border-cyan-400 rounded-2xl shadow-[0_0_15px_rgba(56,189,248,0.3)] z-15 flex flex-col items-center justify-center p-2 text-center">
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            Cửa Nhận Quà
          </span>
          <div className="w-14 h-8 bg-slate-950 rounded-lg border border-cyan-700/50 mt-1 flex items-center justify-center">
            {gameState === 'dispensed' ? (
              <span className="text-xl animate-bounce">🎁</span>
            ) : (
              <span className="text-xs text-slate-500">⬇</span>
            )}
          </div>
        </div>

        {/* Start Button Overlay in Idle State */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-2xs flex items-center justify-center z-30">
            <button
              onClick={handleStartGrab}
              className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xl font-extrabold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-2 border-white/80"
            >
              <Play className="w-7 h-7 fill-slate-900" /> BẤM ĐỂ GẮP THÚ BÔNG
            </button>
          </div>
        )}
      </div>

      {/* Arcade Control Panel Footer */}
      <div className="bg-slate-900 text-slate-300 px-6 py-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-red-400 shadow-md flex items-center justify-center" />
          <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-blue-400 shadow-md flex items-center justify-center" />
          <span className="font-semibold text-slate-300">
            Hệ thống gắp thú tự động công bằng 100%
          </span>
        </div>
        <span className="text-cyan-400 font-mono">
          Trường Cao đẳng Nông Lâm Đông Bắc
        </span>
      </div>
    </div>
  );
};
