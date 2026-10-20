import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Student, GameType, TaskItem } from '../types';
import { sound } from '../utils/sound';
import { PetAvatar } from './illustrations/PetAvatars';
import { PlantIllustration } from './illustrations/PlantIllustrations';
import { PlushieDoll } from './illustrations/PlushieDolls';
import { Volume2, Sparkles, RotateCw, ArrowRight, Home, CheckCircle2, Shuffle } from 'lucide-react';

interface ResultModalProps {
  winner: Student;
  game: GameType;
  availableTasks: TaskItem[];
  currentTask?: string;
  onAssignTask: (taskText: string) => void;
  onCallNext: () => void;
  onBackToHome: () => void;
  onClose: () => void;
  speechEnabled: boolean;
  reduceMotion: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  winner,
  game,
  availableTasks,
  currentTask,
  onAssignTask,
  onCallNext,
  onBackToHome,
  onClose,
  speechEnabled,
  reduceMotion,
}) => {
  const [isSpinningTask, setIsSpinningTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>(currentTask || '');
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);

  // Trigger celebration on mount
  useEffect(() => {
    sound.playVictory();

    if (!reduceMotion) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#FBBF24', '#F43F5E', '#3B82F6'],
        });
      } catch {}
    }

    if (speechEnabled) {
      const timer = setTimeout(() => {
        sound.speakVietnamese(winner.name);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [winner, speechEnabled, reduceMotion]);

  // Handle task spinning roulette
  const handleSpinTask = () => {
    if (availableTasks.length === 0) return;
    setIsSpinningTask(true);
    sound.playClick();

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const randIdx = Math.floor(Math.random() * availableTasks.length);
      setSelectedTask(availableTasks[randIdx].title);
      sound.playClick();

      if (counter >= 12) {
        clearInterval(interval);
        setIsSpinningTask(false);
        const finalIdx = Math.floor(Math.random() * availableTasks.length);
        const finalTask = availableTasks[finalIdx].title;
        setSelectedTask(finalTask);
        onAssignTask(finalTask);
        sound.playVictory();
      }
    }, 100);
  };

  const handleSpeak = () => {
    sound.speakVietnamese(winner.name);
  };

  const handleSaveCustomTask = () => {
    if (!customTaskInput.trim()) return;
    setSelectedTask(customTaskInput.trim());
    onAssignTask(customTaskInput.trim());
    setShowTaskInput(false);
    setCustomTaskInput('');
  };

  const getGameBanner = () => {
    switch (game) {
      case 'race':
        return {
          title: 'VỀ ĐÍCH ĐẦU TIÊN!',
          sub: 'Hôm nay, mời bạn:',
          badgeBg: 'bg-amber-500 text-white',
        };
      case 'garden':
        return {
          title: 'BÔNG HOA HÔM NAY',
          sub: 'Mời bạn thực hiện nhiệm vụ!',
          badgeBg: 'bg-emerald-600 text-white',
        };
      case 'claw':
        return {
          title: 'GẮP ĐƯỢC RỒI!',
          sub: 'Xin mời bạn:',
          badgeBg: 'bg-cyan-600 text-white',
        };
    }
  };

  const banner = getGameBanner();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${banner.badgeBg}`}>
              {banner.title}
            </span>
            <span className="text-emerald-100 text-sm hidden sm:inline">
              Trường CĐ Nông Lâm Đông Bắc
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
            title="Xem lại màn chơi"
          >
            ✕
          </button>
        </div>

        {/* Main Winner Showcase (Optimized for 16:9 projection and distance readability) */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto flex flex-col items-center text-center">
          <p className="text-emerald-700 font-medium text-base sm:text-lg mb-2">
            {banner.sub}
          </p>

          {/* Center Mascot Preview */}
          <div className="my-2 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            {game === 'race' && (
              <PetAvatar
                type={parseInt(winner.id.slice(-1), 10) || 0}
                size={84}
                isWinning={true}
              />
            )}
            {game === 'garden' && (
              <PlantIllustration
                type={parseInt(winner.id.slice(-1), 10) || 3}
                size={94}
                stage="bloomed"
                isWinner={true}
              />
            )}
            {game === 'claw' && (
              <PlushieDoll
                type={parseInt(winner.id.slice(-1), 10) || 0}
                size={84}
                isGrabbed={true}
              />
            )}
          </div>

          {/* Huge Student Name for Projectors */}
          <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              {winner.name}
            </h1>
            <button
              onClick={handleSpeak}
              className="p-2.5 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors shadow-xs"
              title="Đọc tên bằng giọng tiếng Việt"
              aria-label="Đọc tên sinh viên"
            >
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Student ID & Disambiguation */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base sm:text-lg font-semibold text-emerald-800 bg-emerald-100/70 px-3.5 py-1 rounded-lg font-mono tabular-nums">
              Mã SV: {winner.code}
            </span>
            {winner.disambiguationLabel && (
              <span className="text-sm font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                {winner.disambiguationLabel}
              </span>
            )}
          </div>

          {/* Task Section */}
          <div className="mt-6 w-full max-w-lg bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Nhiệm vụ được giao
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpinTask}
                  disabled={isSpinningTask}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Bốc ngẫu nhiên
                </button>
                <button
                  onClick={() => setShowTaskInput(!showTaskInput)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {showTaskInput ? 'Đóng' : 'Tự nhập'}
                </button>
              </div>
            </div>

            {/* Custom Task Input Box */}
            {showTaskInput ? (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={customTaskInput}
                  onChange={e => setCustomTaskInput(e.target.value)}
                  placeholder="Nhập nhiệm vụ trực tiếp cho sinh viên..."
                  className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSaveCustomTask}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Lưu
                </button>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                {selectedTask ? (
                  <p className="text-slate-800 text-sm sm:text-base font-medium flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{selectedTask}</span>
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm italic">
                    Chưa chỉ định nhiệm vụ cụ thể. Bấm &ldquo;Bốc ngẫu nhiên&rdquo; hoặc giao nhiệm vụ trực tiếp trên lớp.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="px-6 py-4 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={onBackToHome}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Home className="w-4 h-4" /> Về trang chủ
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onCallNext}
              className="px-6 py-2.5 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-98"
            >
              Gọi người tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
