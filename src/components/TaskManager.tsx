import React, { useState } from 'react';
import { TaskItem } from '../types';
import { DEFAULT_TASKS } from '../utils/storage';
import { ListTodo, Plus, Trash2, Edit2, RotateCcw } from 'lucide-react';

interface TaskManagerProps {
  tasks: TaskItem[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onClose: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onUpdateTasks,
  onClose,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const item: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      isPreset: false,
    };
    onUpdateTasks([...tasks, item]);
    setNewTaskTitle('');
  };

  const handleSaveEdit = () => {
    if (!editingTask || !editingTask.title.trim()) return;
    onUpdateTasks(
      tasks.map(t => (t.id === editingTask.id ? editingTask : t))
    );
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  const handleResetPresets = () => {
    if (window.confirm('Khôi phục danh sách nhiệm vụ mẫu ban đầu?')) {
      onUpdateTasks(DEFAULT_TASKS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ListTodo className="w-6 h-6 text-emerald-300" />
            <div>
              <h2 className="text-xl font-bold font-display">
                Quản Lý Nhiệm Vụ Giảng Dạy
              </h2>
              <p className="text-xs text-emerald-100">
                Tùy chỉnh nhiệm vụ khi sinh viên được gọi tên
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

        {/* Input New Task */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Nhập nhiệm vụ mới (VD: Vẽ lại sơ đồ cấu trúc tế bào)..."
            className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>

        {/* List of Tasks */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100 scrollbar-thin">
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="text-xs font-mono font-bold text-slate-400 mt-0.5 tabular-nums">
                  {idx + 1}.
                </span>
                <span className="text-sm font-medium text-slate-800 break-words">
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Sửa nhiệm vụ"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Xóa nhiệm vụ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <button
            onClick={handleResetPresets}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục 7 nhiệm vụ mẫu
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3 font-display">
              Sửa nhiệm vụ
            </h3>
            <textarea
              rows={3}
              value={editingTask.title}
              onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
