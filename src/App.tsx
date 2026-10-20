import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Student,
  ClassGroup,
  GameType,
  DrawHistory,
  TaskItem,
  SelectionMode,
  AppSettings,
  ActiveSession,
} from './types';
import {
  loadClasses,
  saveClasses,
  loadActiveClassId,
  saveActiveClassId,
  loadHistory,
  saveHistory,
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
  loadActiveSession,
  saveActiveSession,
  DEMO_CLASS,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { pickRandomStudent, selectRepresentativeGroup } from './utils/random';
import { sound } from './utils/sound';
import { PetRaceGame } from './components/games/PetRaceGame';
import { GardenGame } from './components/games/GardenGame';
import { ClawMachineGame } from './components/games/ClawMachineGame';
import { ResultModal } from './components/ResultModal';
import { ClassManager } from './components/ClassManager';
import { HistoryModal } from './components/HistoryModal';
import { TaskManager } from './components/TaskManager';
import {
  Users,
  History,
  ListTodo,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Sprout,
  Gift,
  HelpCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function App() {
  // Persistence state
  const [classes, setClasses] = useState<ClassGroup[]>(() => loadClasses());
  const [activeClassId, setActiveClassId] = useState<string>(() => loadActiveClassId());
  const [history, setHistory] = useState<DrawHistory[]>(() => loadHistory());
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadTasks());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => loadActiveSession());

  // UI Navigation & Modals
  const [activeGame, setActiveGame] = useState<GameType | null>(() => activeSession?.game || null);
  const [showResultModal, setShowResultModal] = useState<boolean>(() => !!activeSession?.isFinished);
  const [showClassManager, setShowClassManager] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showTaskManager, setShowTaskManager] = useState<boolean>(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync active class
  const activeClass = useMemo(() => {
    return classes.find(c => c.id === activeClassId) || classes[0] || DEMO_CLASS;
  }, [classes, activeClassId]);

  // Determine called student IDs in the current round for this class
  const calledStudentIdsInCurrentRound = useMemo(() => {
    // Only records for the current class
    const classHist = history.filter(h => h.classId === activeClass.id);
    return new Set(classHist.map(h => h.studentId));
  }, [history, activeClass.id]);

  // Compute eligible students for selection
  const eligibleStudents = useMemo(() => {
    const present = activeClass.students.filter(s => s.isPresent);
    if (settings.selectionMode === 'allow-repeat') {
      return present;
    }
    // 'no-repeat' mode: present students who haven't been called yet in current round
    return present.filter(s => !calledStudentIdsInCurrentRound.has(s.id));
  }, [activeClass.students, settings.selectionMode, calledStudentIdsInCurrentRound]);

  const presentCount = useMemo(() => {
    return activeClass.students.filter(s => s.isPresent).length;
  }, [activeClass.students]);

  const calledCount = useMemo(() => {
    if (settings.selectionMode === 'allow-repeat') {
      return history.filter(h => h.classId === activeClass.id).length;
    }
    return activeClass.students.filter(
      s => s.isPresent && calledStudentIdsInCurrentRound.has(s.id)
    ).length;
  }, [activeClass.students, calledStudentIdsInCurrentRound, history, settings.selectionMode, activeClass.id]);

  const remainingCount = useMemo(() => {
    return eligibleStudents.length;
  }, [eligibleStudents]);

  // Sync sound settings with audio controller
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save settings whenever changed
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Track Fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Switch Active Class
  const handleSelectClass = (id: string) => {
    setActiveClassId(id);
    saveActiveClassId(id);
    // Clear in-flight session if changing class
    setActiveSession(null);
    saveActiveSession(null);
    setActiveGame(null);
    setShowResultModal(false);
  };

  const handleUpdateClass = (updated: ClassGroup) => {
    const newClasses = classes.map(c => (c.id === updated.id ? updated : c));
    setClasses(newClasses);
    saveClasses(newClasses);
  };

  const handleCreateClass = (newClass: ClassGroup) => {
    const newClasses = [...classes, newClass];
    setClasses(newClasses);
    saveClasses(newClasses);
    setActiveClassId(newClass.id);
    saveActiveClassId(newClass.id);
  };

  const handleDeleteClass = (id: string) => {
    const filtered = classes.filter(c => c.id !== id);
    const fallbackId = filtered[0]?.id || DEMO_CLASS.id;
    setClasses(filtered);
    saveClasses(filtered);
    setActiveClassId(fallbackId);
    saveActiveClassId(fallbackId);
  };

  const handleResetDemo = () => {
    const newClasses = classes.map(c => (c.id === DEMO_CLASS.id ? DEMO_CLASS : c));
    setClasses(newClasses);
    saveClasses(newClasses);
    setActiveClassId(DEMO_CLASS.id);
    saveActiveClassId(DEMO_CLASS.id);
  };

  // Start a Game & Immediately lock down Web Crypto draw result
  const handleLaunchGame = useCallback((game: GameType) => {
    if (eligibleStudents.length === 0) return;

    sound.playClick();

    // 1. Unbiased cryptographic random draw from eligible pool
    const winner = pickRandomStudent(eligibleStudents);
    if (!winner) return;

    // 2. Select representative racers if race game
    const representative = selectRepresentativeGroup(eligibleStudents, winner, 8);

    // 3. Create persistent active session immediately
    const session: ActiveSession = {
      classId: activeClass.id,
      winnerId: winner.id,
      winner,
      game,
      eligibleStudents,
      representativeRacers: representative,
      animationDuration: settings.raceDuration,
      startedAt: Date.now(),
      isFinished: false,
    };

    setActiveSession(session);
    saveActiveSession(session);
    setActiveGame(game);
    setShowResultModal(false);
  }, [eligibleStudents, activeClass.id, settings.raceDuration]);

  // Finish Animation and Register Result in History (Once!)
  const handleFinishAnimation = useCallback(() => {
    if (!activeSession || activeSession.isFinished) return;

    const newHistoryItem: DrawHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      turnNumber: history.length + 1,
      classId: activeSession.classId,
      studentId: activeSession.winner.id,
      studentName: activeSession.winner.name,
      studentCode: activeSession.winner.code,
      game: activeSession.game,
      taskText: activeSession.assignedTask,
      timestamp: new Date().toISOString(),
    };

    const updatedHist = [newHistoryItem, ...history];
    setHistory(updatedHist);
    saveHistory(updatedHist);

    const updatedSession = { ...activeSession, isFinished: true };
    setActiveSession(updatedSession);
    saveActiveSession(updatedSession);
    setShowResultModal(true);
  }, [activeSession, history]);

  // Skip Animation button: immediately triggers the finish of the SAME winner
  const handleSkipAnimation = useCallback(() => {
    handleFinishAnimation();
  }, [handleFinishAnimation]);

  // Assign Task to Current Winner
  const handleAssignTask = (taskText: string) => {
    if (!activeSession) return;
    const updatedSession = { ...activeSession, assignedTask: taskText };
    setActiveSession(updatedSession);
    saveActiveSession(updatedSession);

    // Update in history as well
    const updatedHist = history.map((item, idx) => {
      if (idx === 0 && item.studentId === activeSession.winner.id) {
        return { ...item, taskText };
      }
      return item;
    });
    setHistory(updatedHist);
    saveHistory(updatedHist);
  };

  // Call Next Person
  const handleCallNext = () => {
    setShowResultModal(false);
    setActiveSession(null);
    saveActiveSession(null);

    // If there's an active game, immediately launch next round if pool is available
    if (activeGame && eligibleStudents.length > 0) {
      handleLaunchGame(activeGame);
    } else {
      setActiveGame(null);
    }
  };

  // Back to Homepage
  const handleBackToHome = () => {
    setShowResultModal(false);
    setActiveSession(null);
    saveActiveSession(null);
    setActiveGame(null);
  };

  // Start New Round (Reset called status for this class)
  const handleResetRound = () => {
    const filteredHist = history.filter(h => h.classId !== activeClass.id);
    setHistory(filteredHist);
    saveHistory(filteredHist);
    setActiveSession(null);
    saveActiveSession(null);
    setShowResultModal(false);
    setActiveGame(null);
  };

  // Undo Last Turn
  const handleUndoLastTurn = () => {
    if (history.length === 0) return;
    const updated = history.slice(1);
    setHistory(updated);
    saveHistory(updated);
    setActiveSession(null);
    saveActiveSession(null);
    setShowResultModal(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
    setActiveSession(null);
    saveActiveSession(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP BAR CONTRACT: Brand Wordmark — 4 Nav Links — 1 Primary Action */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 font-display block leading-tight">
                AI SẼ ĐƯỢC GỌI?
              </span>
              <span className="text-[11px] text-emerald-800 font-semibold block leading-tight truncate max-w-[220px] sm:max-w-xs">
                Trường CĐ Nông Lâm Đông Bắc
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Clean single-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setShowClassManager(true)}
              className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1"
            >
              <Users className="w-4 h-4 text-emerald-600" /> Quản lý lớp
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1"
            >
              <History className="w-4 h-4 text-teal-600" /> Lịch sử gọi tên
            </button>
            <button
              onClick={() => setShowTaskManager(true)}
              className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1"
            >
              <ListTodo className="w-4 h-4 text-amber-600" /> Nhiệm vụ học tập
            </button>
          </nav>

          {/* Zone 3: Primary Action Controls (Sound, Fullscreen, Settings) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
              className={`p-2.5 rounded-xl border transition-colors shadow-2xs ${
                settings.soundEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title={settings.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              aria-label="Bật tắt âm thanh"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình máy chiếu'}
              aria-label="Toàn màn hình"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Settings dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                title="Cài đặt lượt gọi"
                aria-label="Cài đặt"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {showSettingsDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs animate-fade-in">
                  <h4 className="font-bold text-slate-900 mb-2">Tùy chọn hệ thống</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Chế độ gọi ngẫu nhiên:
                      </label>
                      <select
                        value={settings.selectionMode}
                        onChange={e =>
                          setSettings(s => ({
                            ...s,
                            selectionMode: e.target.value as SelectionMode,
                          }))
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                      >
                        <option value="no-repeat">Không lặp (Mỗi người 1 lần/vòng)</option>
                        <option value="allow-repeat">Có thể lặp (Mọi lượt từ cả lớp)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Thời lượng đua thú cưng:
                      </label>
                      <div className="flex gap-1.5">
                        {[5, 10, 15].map(sec => (
                          <button
                            key={sec}
                            onClick={() =>
                              setSettings(s => ({
                                ...s,
                                raceDuration: sec as 5 | 10 | 15,
                              }))
                            }
                            className={`flex-1 py-1 rounded-lg border font-bold text-xs ${
                              settings.raceDuration === sec
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={settings.speechEnabled}
                          onChange={e =>
                            setSettings(s => ({ ...s, speechEnabled: e.target.checked }))
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Đọc to tên bằng tiếng Việt</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={settings.reduceMotion}
                          onChange={e =>
                            setSettings(s => ({ ...s, reduceMotion: e.target.checked }))
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Giảm chuyển động hoạt cảnh</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSettingsDropdown(false)}
                    className="w-full mt-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-center"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. CLASSROOM METADATA & STATUS STRIP (Zero-Pill discipline: unboxed text with separators) */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-4 text-xs sm:text-sm">
          {/* Active Class Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500">Đang chọn lớp:</span>
            <button
              onClick={() => setShowClassManager(true)}
              className="font-bold text-emerald-800 hover:text-emerald-950 underline decoration-dotted decoration-emerald-500 underline-offset-4"
            >
              {activeClass.name}
            </button>
            {activeClass.isDemo && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                Lớp demo
              </span>
            )}
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-600">
              Chế độ: <strong className="text-slate-900">{settings.selectionMode === 'no-repeat' ? 'Không lặp' : 'Có thể lặp'}</strong>
            </span>
          </div>

          {/* Metrics Cluster (Tabular figures, unboxed) */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Có mặt:</span>
              <span className="font-bold text-slate-900 font-mono tabular-nums">
                {presentCount}
              </span>
            </div>

            <span className="text-slate-300" aria-hidden="true">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Đã gọi:</span>
              <span className="font-bold text-emerald-800 font-mono tabular-nums">
                {calledCount}
              </span>
            </div>

            <span className="text-slate-300" aria-hidden="true">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Còn lại:</span>
              <span className={`font-bold font-mono tabular-nums ${
                remainingCount === 0 ? 'text-rose-600' : 'text-amber-800'
              }`}>
                {remainingCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Nav Bar for smaller viewports */}
      <div className="md:hidden flex items-center justify-around bg-slate-50 border-b border-slate-200 py-2 px-4 text-xs">
        <button
          onClick={() => setShowClassManager(true)}
          className="flex items-center gap-1 text-slate-700 font-semibold"
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" /> Lớp ({activeClass.students.length})
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center gap-1 text-slate-700 font-semibold"
        >
          <History className="w-3.5 h-3.5 text-teal-600" /> Lịch sử ({history.length})
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setShowTaskManager(true)}
          className="flex items-center gap-1 text-slate-700 font-semibold"
        >
          <ListTodo className="w-3.5 h-3.5 text-amber-600" /> Nhiệm vụ
        </button>
      </div>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col justify-center">
        {/* If Active Game is running or in-progress */}
        {activeGame && activeSession ? (
          <div className="flex flex-col items-center gap-4">
            {activeGame === 'race' && (
              <PetRaceGame
                winner={activeSession.winner}
                eligiblePool={activeSession.eligibleStudents}
                racers={activeSession.representativeRacers || activeSession.eligibleStudents.slice(0, 8)}
                duration={settings.raceDuration}
                onFinish={handleFinishAnimation}
                onSkip={handleSkipAnimation}
                reduceMotion={settings.reduceMotion}
              />
            )}

            {activeGame === 'garden' && (
              <GardenGame
                winner={activeSession.winner}
                eligiblePool={activeSession.eligibleStudents}
                onFinish={handleFinishAnimation}
                onSkip={handleSkipAnimation}
                reduceMotion={settings.reduceMotion}
              />
            )}

            {activeGame === 'claw' && (
              <ClawMachineGame
                winner={activeSession.winner}
                eligiblePool={activeSession.eligibleStudents}
                onFinish={handleFinishAnimation}
                onSkip={handleSkipAnimation}
                reduceMotion={settings.reduceMotion}
              />
            )}

            <button
              onClick={handleBackToHome}
              className="mt-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 underline underline-offset-4"
            >
              ← Trở về bảng chọn trò chơi
            </button>
          </div>
        ) : (
          /* HOMEPAGE VIEW: 3 Large Game Cards & Overview */
          <div className="flex flex-col gap-6">
            {/* Hero / Header Intro */}
            <div className="text-center py-4">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-display text-balance">
                AI SẼ ĐƯỢC GỌI?
              </h1>
              <p className="mt-2 text-base sm:text-xl text-emerald-800 font-medium max-w-2xl mx-auto text-balance">
                Một chút hồi hộp – Cả lớp cùng tham gia
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Ứng dụng chọn ngẫu nhiên sinh viên công bằng bằng thuật toán Web Crypto dành cho giảng viên Trường CĐ Nông Lâm Đông Bắc
              </p>
            </div>

            {/* Condition Alerts: If no students eligible or only 1 remaining */}
            {eligibleStudents.length === 0 && (
              <div className="max-w-2xl mx-auto w-full bg-amber-50 border border-amber-300 rounded-2xl p-5 text-center shadow-xs">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-amber-900">
                  {presentCount === 0
                    ? 'Chưa có sinh viên nào được đánh dấu có mặt!'
                    : 'Đã gọi đủ một vòng!'}
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 mt-1">
                  {presentCount === 0
                    ? 'Vui lòng mở Quản lý lớp và đánh dấu có mặt cho các sinh viên tham gia buổi học.'
                    : 'Toàn bộ sinh viên có mặt trong lớp đã được gọi tên ít nhất một lần.'}
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  {presentCount > 0 && (
                    <button
                      onClick={handleResetRound}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" /> Bắt đầu vòng mới
                    </button>
                  )}
                  <button
                    onClick={() => setShowClassManager(true)}
                    className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
                  >
                    Kiểm tra điểm danh lớp
                  </button>
                </div>
              </div>
            )}

            {eligibleStudents.length === 1 && (
              <div className="max-w-xl mx-auto w-full bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-center text-xs sm:text-sm text-emerald-900 font-medium flex items-center justify-center gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Chỉ còn <strong>1 sinh viên duy nhất</strong> trong vòng này: <strong>{eligibleStudents[0].name}</strong>!
                </span>
              </div>
            )}

            {/* 3 LARGE GAME CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-2">
              {/* Card 1: Đường đua thú cưng */}
              <div className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden">
                {/* Decorative top stripe */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500" />

                <div>
                  {/* Visual Header / Illustration */}
                  <div className="w-full h-36 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50/60 border border-amber-100 flex items-center justify-center relative overflow-hidden mb-5">
                    {/* Running track mini graphic */}
                    <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                    <div className="flex items-center gap-3 z-10 scale-90 sm:scale-100">
                      <div className="animate-bounce" style={{ animationDuration: '1.2s' }}>
                        <span className="text-4xl">🐕</span>
                      </div>
                      <div className="animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}>
                        <span className="text-4xl">🐇</span>
                      </div>
                      <div className="animate-bounce" style={{ animationDuration: '1.4s', animationDelay: '0.4s' }}>
                        <span className="text-4xl">🐹</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Trò chơi 1
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {settings.raceDuration}s
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors font-display">
                    Đường Đua Thú Cưng
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3">
                    Đường đua sôi động với các thú cưng đáng yêu tăng tốc, vượt nhau kịch tính và tìm ra bạn sinh viên chạm đích đầu tiên!
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleLaunchGame('race')}
                    disabled={eligibleStudents.length === 0}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group-hover:scale-[1.02]"
                  >
                    Bắt đầu <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              </div>

              {/* Card 2: Vườn cây bất ngờ */}
              <div className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden">
                {/* Decorative top stripe */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

                <div>
                  {/* Visual Header / Illustration */}
                  <div className="w-full h-36 rounded-2xl bg-gradient-to-b from-emerald-50 to-teal-50/60 border border-emerald-100 flex items-center justify-center relative overflow-hidden mb-5">
                    <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                    <div className="flex items-center gap-3 z-10 scale-90 sm:scale-100">
                      <span className="text-4xl animate-sway">🌱</span>
                      <span className="text-5xl animate-pulse">🌸</span>
                      <span className="text-4xl animate-sway" style={{ animationDelay: '0.5s' }}>🌿</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Trò chơi 2
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Nông Lâm
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors font-display">
                    Vườn Cây Bất Ngờ
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3">
                    Bình nước thần kỳ tưới mát vườn ươm, cây của sinh viên được chọn sẽ vươn cao và bung nở bông hoa rực rỡ!
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleLaunchGame('garden')}
                    disabled={eligibleStudents.length === 0}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group-hover:scale-[1.02]"
                  >
                    Bắt đầu <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Card 3: Máy gắp thú bông */}
              <div className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all flex flex-col justify-between overflow-hidden">
                {/* Decorative top stripe */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 to-blue-600" />

                <div>
                  {/* Visual Header / Illustration */}
                  <div className="w-full h-36 rounded-2xl bg-gradient-to-b from-cyan-50 to-blue-50/60 border border-cyan-100 flex items-center justify-center relative overflow-hidden mb-5">
                    <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                    <div className="flex items-center gap-3 z-10 scale-90 sm:scale-100">
                      <span className="text-4xl animate-bounce">🧸</span>
                      <span className="text-3xl animate-pulse">🕹️</span>
                      <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎁</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                      Trò chơi 3
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Arcade
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors font-display">
                    Máy Gắp Thú Bông
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3">
                    Cần gắp hoạt hình di chuyển, kẹp chuẩn xác một bé gấu bông và thả vào cửa nhận quà kèm bảng tên sinh viên may mắn!
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleLaunchGame('claw')}
                    disabled={eligibleStudents.length === 0}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group-hover:scale-[1.02]"
                  >
                    Bắt đầu <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Dock for Lecturers */}
            <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {activeClass.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {activeClass.students.length} sinh viên · {presentCount} có mặt · {calledCount} đã gọi lượt này
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowClassManager(true)}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-400 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 border border-emerald-400"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-900" />
                  Nhập file Excel
                </button>
                <button
                  onClick={() => setShowClassManager(true)}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-2xs"
                >
                  Quản lý danh sách lớp
                </button>
                <button
                  onClick={handleResetRound}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Bắt đầu vòng mới
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto py-5 bg-white border-t border-slate-200 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-3">
          <p className="font-medium text-slate-600">
            Ứng dụng gọi tên ngẫu nhiên · Trường Cao đẳng Nông Lâm Đông Bắc
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Web Crypto Random Engine</span>
            <span>·</span>
            <span>Bảo lưu quyền tác giả 2026</span>
          </div>
        </div>
      </footer>

      {/* UNIVERSAL RESULT MODAL */}
      {showResultModal && activeSession && (
        <ResultModal
          winner={activeSession.winner}
          game={activeSession.game}
          availableTasks={tasks}
          currentTask={activeSession.assignedTask}
          onAssignTask={handleAssignTask}
          onCallNext={handleCallNext}
          onBackToHome={handleBackToHome}
          onClose={() => setShowResultModal(false)}
          speechEnabled={settings.speechEnabled}
          reduceMotion={settings.reduceMotion}
        />
      )}

      {/* CLASS MANAGER MODAL */}
      {showClassManager && (
        <ClassManager
          classes={classes}
          activeClassId={activeClass.id}
          onSelectClass={handleSelectClass}
          onUpdateClass={handleUpdateClass}
          onCreateClass={handleCreateClass}
          onDeleteClass={handleDeleteClass}
          onResetDemo={handleResetDemo}
          onClose={() => setShowClassManager(false)}
        />
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <HistoryModal
          history={history}
          onUndoLastTurn={handleUndoLastTurn}
          onClearHistory={handleClearHistory}
          onResetRound={handleResetRound}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* TASK MANAGER MODAL */}
      {showTaskManager && (
        <TaskManager
          tasks={tasks}
          onUpdateTasks={updated => {
            setTasks(updated);
            saveTasks(updated);
          }}
          onClose={() => setShowTaskManager(false)}
        />
      )}
    </div>
  );
}
