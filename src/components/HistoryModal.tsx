import React, { useState } from 'react';
import { DrawHistory, TaskItem } from '../types';
import { exportHistoryToCsv } from '../utils/storage';
import {
  History,
  Download,
  RotateCcw,
  Trash2,
  Undo2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HistoryModalProps {
  history: DrawHistory[];
  onUndoLastTurn: () => void;
  onClearHistory: () => void;
  onResetRound: () => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onUndoLastTurn,
  onClearHistory,
  onResetRound,
  onClose,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  const getGameLabel = (game: string) => {
    switch (game) {
      case 'race':
        return { label: 'Đường đua thú cưng', color: 'bg-amber-100 text-amber-800' };
      case 'garden':
        return { label: 'Vườn cây bất ngờ', color: 'bg-emerald-100 text-emerald-800' };
      case 'claw':
        return { label: 'Máy gắp thú bông', color: 'bg-cyan-100 text-cyan-800' };
      default:
        return { label: game, color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-emerald-300" />
            <div>
              <h2 className="text-xl font-bold font-display">
                Lịch Sử Gọi Tên & Nhiệm Vụ
              </h2>
              <p className="text-xs text-emerald-100">
                Ghi nhận minh bạch các lượt gọi trong buổi học
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onResetRound()}
              className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              title="Đặt lại trạng thái đã gọi để bắt đầu vòng mới"
            >
              <RotateCcw className="w-4 h-4 text-emerald-700" /> Bắt đầu vòng mới
            </button>

            {history.length > 0 && (
              <button
                onClick={() => setShowUndoConfirm(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                title="Hủy lượt gọi vừa thực hiện nếu thao tác nhầm"
              >
                <Undo2 className="w-4 h-4 text-amber-600" /> Hoàn tác lượt gần nhất
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={() => exportHistoryToCsv(history)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4 text-blue-600" /> Xuất file CSV
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Xóa lịch sử
                </button>
              </>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">Chưa có lượt gọi nào trong phiên học này.</p>
              <p className="text-xs text-slate-500 mt-1">
                Khi bắt đầu bất kỳ trò chơi nào, kết quả sẽ tự động lưu lại tại đây.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Sinh viên</th>
                    <th className="py-3 px-4">Trò chơi</th>
                    <th className="py-3 px-4">Nhiệm vụ</th>
                    <th className="py-3 px-4 text-right">Thời điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {history.map(item => {
                    const gameMeta = getGameLabel(item.game);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-400 tabular-nums">
                          {item.turnNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {item.studentName}
                            </span>
                            {item.studentCode && (
                              <span className="text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {item.studentCode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${gameMeta.color}`}>
                            {gameMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.taskText ? (
                            <span className="text-slate-800 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {item.taskText}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Không chỉ định</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 font-mono text-xs tabular-nums">
                          {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Tổng số lượt đã gọi: <strong>{history.length}</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Undo confirmation modal */}
      {showUndoConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Xác nhận hoàn tác lượt gần nhất?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sinh viên vừa được gọi sẽ được đưa trở lại danh sách đủ điều kiện để có cơ hội được gọi lại trong vòng này.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onUndoLastTurn();
                  setShowUndoConfirm(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
              >
                Đồng ý hoàn tác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Xác nhận xóa toàn bộ lịch sử?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Toàn bộ dữ liệu ghi nhận lượt gọi trước đó sẽ bị xóa. Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
