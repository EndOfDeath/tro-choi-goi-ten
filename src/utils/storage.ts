import { ClassGroup, DrawHistory, AppSettings, TaskItem, ActiveSession, Student } from '../types';
import { assignDisambiguationLabels } from './random';

const DEMO_STUDENTS: Student[] = [
  { id: 'demo-1', code: 'ĐNL-01', name: 'Nguyễn Văn An', isPresent: true },
  { id: 'demo-2', code: 'ĐNL-02', name: 'Trần Thị Bích', isPresent: true },
  { id: 'demo-3', code: 'ĐNL-03', name: 'Lê Hoàng Cường', isPresent: true },
  { id: 'demo-4', code: 'ĐNL-04', name: 'Phạm Thu Dung', isPresent: true },
  { id: 'demo-5', code: 'ĐNL-05', name: 'Hoàng Quốc Đạt', isPresent: true },
  { id: 'demo-6', code: 'ĐNL-06', name: 'Đặng Mỹ Hạnh', isPresent: true },
  { id: 'demo-7', code: 'ĐNL-07', name: 'Vũ Đức Khang', isPresent: true },
  { id: 'demo-8', code: 'ĐNL-08', name: 'Bùi Thanh Mai', isPresent: true },
  { id: 'demo-9', code: 'ĐNL-09', name: 'Đỗ Minh Nam', isPresent: true },
  { id: 'demo-10', code: 'ĐNL-10', name: 'Ngô Kim Ngân', isPresent: true },
  { id: 'demo-11', code: 'ĐNL-11', name: 'Dương Tuấn Phong', isPresent: true },
  { id: 'demo-12', code: 'ĐNL-12', name: 'Mai Quỳnh Như', isPresent: true },
  { id: 'demo-13', code: 'ĐNL-13', name: 'Hà Văn Quân', isPresent: true },
  { id: 'demo-14', code: 'ĐNL-14', name: 'Phan Thảo Trang', isPresent: true },
  { id: 'demo-15', code: 'ĐNL-15', name: 'Lương Gia Phúc', isPresent: true },
  { id: 'demo-16', code: 'ĐNL-16', name: 'Trịnh Ánh Tuyết', isPresent: true },
  { id: 'demo-17', code: 'ĐNL-17', name: 'Đinh Việt Thắng', isPresent: true },
  { id: 'demo-18', code: 'ĐNL-18', name: 'Đoàn Bảo Trâm', isPresent: true },
  { id: 'demo-19', code: 'ĐNL-19', name: 'Chu Quang Vinh', isPresent: true },
  { id: 'demo-20', code: 'ĐNL-20', name: 'Tạ Yến Vy', isPresent: true },
];

export const DEMO_CLASS: ClassGroup = {
  id: 'demo-class-k38',
  name: 'Lớp demo: K38 Quản lý Nông Lâm (20 sinh viên)',
  students: assignDisambiguationLabels(DEMO_STUDENTS),
  isDemo: true,
  createdAt: '2026-10-20T00:00:00.000Z',
};

export const DEFAULT_TASKS: TaskItem[] = [
  { id: 'task-1', title: 'Trả lời câu hỏi ôn tập của giảng viên', isPreset: true },
  { id: 'task-2', title: 'Lên bảng trình bày trong 1 phút về bài học', isPreset: true },
  { id: 'task-3', title: 'Gọi tên bộ phận / cấu trúc trên sơ đồ giảng viên đang chiếu', isPreset: true },
  { id: 'task-4', title: 'Chỉ vị trí mẫu vật / chi tiết theo yêu cầu của giảng viên', isPreset: true },
  { id: 'task-5', title: 'Giải thích một thuật ngữ chuyên môn vừa học', isPreset: true },
  { id: 'task-6', title: 'Nêu một ví dụ thực tế liên quan đến nội dung bài học', isPreset: true },
  { id: 'task-7', title: 'Đặt một câu hỏi gợi mở hoặc phản biện cho cả lớp', isPreset: true },
];

const STORAGE_KEYS = {
  CLASSES: 'ai_se_duoc_goi_classes_v2',
  ACTIVE_CLASS_ID: 'ai_se_duoc_goi_active_class_id_v2',
  HISTORY: 'ai_se_duoc_goi_history_v2',
  SETTINGS: 'ai_se_duoc_goi_settings_v2',
  TASKS: 'ai_se_duoc_goi_tasks_v2',
  ACTIVE_SESSION: 'ai_se_duoc_goi_active_session_v2',
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  speechEnabled: true,
  reduceMotion: false,
  selectionMode: 'no-repeat',
  raceDuration: 10,
};

export function loadClasses(): ClassGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (!raw) {
      saveClasses([DEMO_CLASS]);
      return [DEMO_CLASS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveClasses([DEMO_CLASS]);
      return [DEMO_CLASS];
    }
    return parsed.map((cls: ClassGroup) => ({
      ...cls,
      students: assignDisambiguationLabels(cls.students || []),
    }));
  } catch {
    return [DEMO_CLASS];
  }
}

export function saveClasses(classes: ClassGroup[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch {}
}

export function loadActiveClassId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS_ID) || DEMO_CLASS.id;
  } catch {
    return DEMO_CLASS.id;
  }
}

export function saveActiveClassId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS_ID, id);
  } catch {}
}

export function loadHistory(): DrawHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: DrawHistory[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch {}
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function loadTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch {}
}

export function loadActiveSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: ActiveSession | null) {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    }
  } catch {}
}

/**
 * Parse raw text pasted by user (one student per line)
 * Supports formats:
 * - "ĐNL01 - Nguyễn Văn An"
 * - "ĐNL01, Nguyễn Văn An"
 * - "ĐNL01\tNguyễn Văn An"
 * - "Nguyễn Văn An" (auto-assigns code SVxx)
 */
export function parsePastedStudentList(text: string, existingCount: number = 0): Student[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const students: Student[] = [];

  lines.forEach((line, index) => {
    let code = '';
    let name = '';

    // Check for delimiter: tab, dash with spaces, comma, or semicolon
    if (line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim());
      code = parts[0] || '';
      name = parts.slice(1).join(' ');
    } else if (line.includes(' - ')) {
      const parts = line.split(' - ').map(p => p.trim());
      code = parts[0] || '';
      name = parts.slice(1).join(' - ');
    } else if (line.includes(';')) {
      const parts = line.split(';').map(p => p.trim());
      code = parts[0] || '';
      name = parts.slice(1).join(';');
    } else if (line.includes(',')) {
      const parts = line.split(',').map(p => p.trim());
      code = parts[0] || '';
      name = parts.slice(1).join(',');
    } else {
      name = line;
    }

    if (!code) {
      const num = String(existingCount + index + 1).padStart(2, '0');
      code = `SV-${num}`;
    }

    students.push({
      id: `std-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      name,
      isPresent: true,
    });
  });

  return assignDisambiguationLabels(students);
}

/**
 * Export students of a class to CSV format with UTF-8 BOM
 */
export function exportClassToCsv(className: string, students: Student[]) {
  const header = ['STT', 'Mã Sinh Viên', 'Họ Và Tên', 'Trạng Thái', 'Ghi Chú'].join(',');
  const rows = students.map((s, idx) => {
    return [
      idx + 1,
      `"${s.code.replace(/"/g, '""')}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      s.isPresent ? 'Có mặt' : 'Vắng mặt',
      s.disambiguationLabel ? `"${s.disambiguationLabel}"` : '',
    ].join(',');
  });

  const csvContent = '\uFEFF' + [header, ...rows].join('\r\n');
  downloadBlob(csvContent, `Danh_sach_${className.replace(/[^\w\d-_]/g, '_')}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export history log to CSV with UTF-8 BOM
 */
export function exportHistoryToCsv(history: DrawHistory[]) {
  const gameNames: Record<string, string> = {
    race: 'Đường đua thú cưng',
    garden: 'Vườn cây bất ngờ',
    claw: 'Máy gắp thú bông',
  };

  const header = ['Lượt', 'Thời Gian', 'Mã Sinh Viên', 'Họ Và Tên', 'Trò Chơi', 'Nhiệm Vụ Được Giao'].join(',');
  const rows = history.map(h => {
    return [
      h.turnNumber,
      `"${new Date(h.timestamp).toLocaleString('vi-VN')}"`,
      `"${(h.studentCode || '').replace(/"/g, '""')}"`,
      `"${h.studentName.replace(/"/g, '""')}"`,
      `"${gameNames[h.game] || h.game}"`,
      `"${(h.taskText || 'Không chỉ định').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [header, ...rows].join('\r\n');
  downloadBlob(csvContent, `Lich_su_goi_ten_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
