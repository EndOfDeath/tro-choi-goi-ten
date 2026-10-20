import React, { useState } from 'react';
import { ClassGroup, Student } from '../types';
import {
  parsePastedStudentList,
  exportClassToCsv,
  DEMO_CLASS,
} from '../utils/storage';
import { assignDisambiguationLabels } from '../utils/random';
import {
  parseExcelFile,
  downloadExcelTemplate,
  exportClassToExcel,
  ParsedExcelResult,
} from '../utils/excelHelper';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Search,
  Download,
  Upload,
  CheckSquare,
  Square,
  ClipboardPaste,
  ShieldAlert,
  Plus,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  FileDown,
  ArrowRight,
  Check,
} from 'lucide-react';

interface ClassManagerProps {
  classes: ClassGroup[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onUpdateClass: (updated: ClassGroup) => void;
  onCreateClass: (newClass: ClassGroup) => void;
  onDeleteClass: (id: string) => void;
  onResetDemo: () => void;
  onClose: () => void;
}

export const ClassManager: React.FC<ClassManagerProps> = ({
  classes,
  activeClassId,
  onSelectClass,
  onUpdateClass,
  onCreateClass,
  onDeleteClass,
  onResetDemo,
  onClose,
}) => {
  const activeClass = classes.find(c => c.id === activeClassId) || classes[0] || DEMO_CLASS;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');

  // Edit single student
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // New Class Modal
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  // Excel Import Preview Modal
  const [excelPreview, setExcelPreview] = useState<ParsedExcelResult | null>(null);
  const [excelFileObj, setExcelFileObj] = useState<File | null>(null);
  const [excelTargetClassName, setExcelTargetClassName] = useState<string>('');
  const [isProcessingExcel, setIsProcessingExcel] = useState<boolean>(false);
  const [excelError, setExcelError] = useState<string | null>(null);

  // Filter students by search term
  const filteredStudents = activeClass.students.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle single attendance
  const handleToggleAttendance = (studentId: string) => {
    const updated = activeClass.students.map(s =>
      s.id === studentId ? { ...s, isPresent: !s.isPresent } : s
    );
    onUpdateClass({ ...activeClass, students: updated });
  };

  // Bulk attendance
  const handleSetAllAttendance = (isPresent: boolean) => {
    const updated = activeClass.students.map(s => ({ ...s, isPresent }));
    onUpdateClass({ ...activeClass, students: updated });
  };

  // Delete student
  const handleDeleteStudent = (studentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này khỏi danh sách lớp?')) return;
    const remaining = activeClass.students.filter(s => s.id !== studentId);
    onUpdateClass({
      ...activeClass,
      students: assignDisambiguationLabels(remaining),
    });
  };

  // Save edited student
  const handleSaveEditStudent = () => {
    if (!editingStudent || !editingStudent.name.trim()) return;
    const updated = activeClass.students.map(s =>
      s.id === editingStudent.id ? editingStudent : s
    );
    onUpdateClass({
      ...activeClass,
      students: assignDisambiguationLabels(updated),
    });
    setEditingStudent(null);
  };

  // Add single student
  const handleAddSingleStudent = () => {
    if (!newStudentName.trim()) return;
    const code = newStudentCode.trim() || `SV-${String(activeClass.students.length + 1).padStart(2, '0')}`;
    const newStd: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code,
      name: newStudentName.trim(),
      isPresent: true,
    };
    const updated = [...activeClass.students, newStd];
    onUpdateClass({
      ...activeClass,
      students: assignDisambiguationLabels(updated),
    });
    setNewStudentCode('');
    setNewStudentName('');
    setShowAddSingleModal(false);
  };

  // Paste batch list
  const handleApplyPasteList = (replace: boolean) => {
    if (!pasteText.trim()) return;
    const countOffset = replace ? 0 : activeClass.students.length;
    const parsed = parsePastedStudentList(pasteText, countOffset);
    const updated = replace ? parsed : [...activeClass.students, ...parsed];

    onUpdateClass({
      ...activeClass,
      students: assignDisambiguationLabels(updated),
    });
    setPasteText('');
    setShowPasteModal(false);
  };

  // Create new class
  const handleCreateNewClass = () => {
    if (!newClassName.trim()) return;
    const newClass: ClassGroup = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim(),
      students: [],
      createdAt: new Date().toISOString(),
    };
    onCreateClass(newClass);
    setNewClassName('');
    setShowNewClassModal(false);
  };

  // Import Excel (.xlsx, .xls)
  const handleSelectExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    setExcelError(null);
    setExcelFileObj(file);

    try {
      const result = await parseExcelFile(file, 0);
      if (result.students.length === 0) {
        setExcelError('Không tìm thấy danh sách sinh viên hợp lệ trong file Excel. Vui lòng kiểm tra tiêu đề cột (Mã SV, Họ và tên) hoặc tải file mẫu.');
      } else {
        setExcelPreview(result);
        setExcelTargetClassName(result.suggestedClassName || `Lớp ${result.selectedSheet}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đọc file Excel';
      setExcelError(msg);
    } finally {
      setIsProcessingExcel(false);
      e.target.value = '';
    }
  };

  // Switch Sheet in Excel Preview
  const handleSwitchExcelSheet = async (sheetIndex: number) => {
    if (!excelFileObj) return;
    setIsProcessingExcel(true);
    try {
      const result = await parseExcelFile(excelFileObj, sheetIndex);
      setExcelPreview(result);
      setExcelTargetClassName(`Lớp ${result.selectedSheet}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đọc sheet';
      setExcelError(msg);
    } finally {
      setIsProcessingExcel(false);
    }
  };

  // Apply Excel Import
  const handleConfirmExcelImport = (mode: 'new' | 'replace' | 'append') => {
    if (!excelPreview || excelPreview.students.length === 0) return;

    if (mode === 'new') {
      const newClass: ClassGroup = {
        id: `cls-${Date.now()}`,
        name: excelTargetClassName.trim() || `Lớp nhập từ ${excelPreview.fileName}`,
        students: excelPreview.students,
        createdAt: new Date().toISOString(),
      };
      onCreateClass(newClass);
    } else if (mode === 'replace') {
      onUpdateClass({
        ...activeClass,
        students: excelPreview.students,
      });
    } else if (mode === 'append') {
      onUpdateClass({
        ...activeClass,
        students: assignDisambiguationLabels([...activeClass.students, ...excelPreview.students]),
      });
    }

    setExcelPreview(null);
    setExcelFileObj(null);
    setExcelError(null);
  };

  // Import CSV fallback
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const cleanContent = content.replace(/^\uFEFF/, '');
        const lines = cleanContent.split(/\r?\n/).filter(Boolean);
        const dataLines = lines[0]?.toLowerCase().includes('họ') || lines[0]?.toLowerCase().includes('name')
          ? lines.slice(1)
          : lines;
        const parsed = parsePastedStudentList(dataLines.join('\n'), activeClass.students.length);
        onUpdateClass({
          ...activeClass,
          students: assignDisambiguationLabels([...activeClass.students, ...parsed]),
        });
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const presentCount = activeClass.students.filter(s => s.isPresent).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-300" />
            <div>
              <h2 className="text-xl font-bold font-display">
                Quản Lý Danh Sách Lớp
              </h2>
              <p className="text-xs text-emerald-100">
                Trường Cao đẳng Nông Lâm Đông Bắc
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

        {/* Class Selection & Switcher Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chọn Lớp:
            </span>
            <select
              value={activeClass.id}
              onChange={e => onSelectClass(e.target.value)}
              className="px-3.5 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isDemo ? '(Lớp demo)' : ''} ({c.students.length} SV)
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowNewClassModal(true)}
              className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Thêm lớp mới
            </button>

            {activeClass.isDemo && (
              <button
                onClick={onResetDemo}
                className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
              >
                Đặt lại 20 sinh viên demo
              </button>
            )}

            {!activeClass.isDemo && classes.length > 1 && (
              <button
                onClick={() => {
                  if (window.confirm(`Bạn có chắc muốn xóa lớp "${activeClass.name}"?`)) {
                    onDeleteClass(activeClass.id);
                  }
                }}
                className="px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Xóa lớp này
              </button>
            )}
          </div>

          {/* Quick Attendance Counters */}
          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 font-bold text-emerald-800 tabular-nums">
              Có mặt: {presentCount} / {activeClass.students.length}
            </span>
          </div>
        </div>

        {/* Action Controls & Excel / Search Toolbar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc mã sinh viên..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons: Excel Import, Template, Add Single, Paste, Export */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Excel Import Button */}
            <label className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-400 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer border border-emerald-400">
              <FileSpreadsheet className="w-4 h-4 text-emerald-900" />
              <span>Nhập file Excel (.xlsx)</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleSelectExcelFile}
                className="hidden"
              />
            </label>

            {/* Download Excel Template */}
            <button
              onClick={downloadExcelTemplate}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-xs"
              title="Tải file mẫu Excel chuẩn để điền danh sách sinh viên"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-700" /> File mẫu Excel
            </button>

            {/* Add single */}
            <button
              onClick={() => setShowAddSingleModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" /> Thêm 1 SV
            </button>

            {/* Paste batch */}
            <button
              onClick={() => setShowPasteModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-xs"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-teal-600" /> Dán nhanh
            </button>

            {/* Export Excel */}
            <button
              onClick={() => exportClassToExcel(activeClass.name, activeClass.students)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-xs"
              title="Xuất danh sách lớp ra file Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel
            </button>
          </div>
        </div>

        {/* Quick Bulk Attendance Buttons */}
        <div className="px-4 sm:px-6 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Hiển thị <strong>{filteredStudents.length}</strong> sinh viên
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSetAllAttendance(true)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Tất cả có mặt
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => handleSetAllAttendance(false)}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> Đánh dấu vắng hết
            </button>
          </div>
        </div>

        {/* Student Table List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">Không tìm thấy sinh viên nào phù hợp.</p>
              <p className="text-xs text-slate-500 mt-1">
                Bấm &ldquo;Nhập file Excel&rdquo;, &ldquo;Dán nhanh&rdquo; hoặc &ldquo;Thêm 1 SV&rdquo; để bổ sung vào lớp.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              {filteredStudents.map((student, idx) => (
                <div
                  key={student.id}
                  className={`p-3.5 flex items-center justify-between gap-4 transition-colors ${
                    student.isPresent ? 'hover:bg-slate-50' : 'bg-slate-50/70 text-slate-400'
                  }`}
                >
                  {/* Left: Attendance toggle + STT + Code + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleAttendance(student.id)}
                      className={`p-1 rounded-md transition-colors ${
                        student.isPresent
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-slate-300 bg-slate-100'
                      }`}
                      title={student.isPresent ? 'Đang có mặt (Bấm để báo vắng)' : 'Đang vắng mặt (Bấm để báo có mặt)'}
                    >
                      {student.isPresent ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <span className="text-xs text-slate-400 font-mono w-6 text-right tabular-nums">
                      {idx + 1}
                    </span>

                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 tabular-nums shrink-0">
                      {student.code}
                    </span>

                    <span className={`text-sm sm:text-base font-semibold truncate ${
                      student.isPresent ? 'text-slate-900' : 'line-through text-slate-400'
                    }`}>
                      {student.name}
                    </span>

                    {student.disambiguationLabel && (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                        {student.disambiguationLabel}
                      </span>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingStudent(student)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Sửa thông tin"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Xóa sinh viên"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="px-6 py-3 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Hỗ trợ file Excel (.xlsx, .xls) và CSV. Dữ liệu lưu an toàn trên trình duyệt thiết bị.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            Hoàn tất & Đóng
          </button>
        </div>
      </div>

      {/* EXCEL IMPORT PREVIEW MODAL */}
      {excelPreview && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Xem trước dữ liệu Excel
                  </h3>
                  <p className="text-xs text-slate-500">
                    File: <strong className="text-slate-800">{excelPreview.fileName}</strong> · Tìm thấy <strong className="text-emerald-700">{excelPreview.students.length} sinh viên</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExcelPreview(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Multi-sheet switcher if file has multiple sheets */}
            {excelPreview.sheetNames.length > 1 && (
              <div className="py-2.5 px-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="font-semibold text-slate-600 shrink-0">Chọn trang tính (Sheet):</span>
                {excelPreview.sheetNames.map((sheet, idx) => (
                  <button
                    key={sheet}
                    onClick={() => handleSwitchExcelSheet(idx)}
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      excelPreview.selectedSheet === sheet
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sheet}
                  </button>
                ))}
              </div>
            )}

            {/* Target Class Name field (for creating new class) */}
            <div className="py-3 px-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên lớp (dùng khi tạo lớp mới):
              </label>
              <input
                type="text"
                value={excelTargetClassName}
                onChange={e => setExcelTargetClassName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            {/* Preview Student Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl my-2 divide-y divide-slate-100 scrollbar-thin">
              <div className="sticky top-0 bg-slate-100 p-2 text-[11px] font-bold text-slate-600 uppercase flex justify-between">
                <span className="w-12 text-center">STT</span>
                <span className="w-24">Mã SV</span>
                <span className="flex-1">Họ và tên</span>
              </div>
              {excelPreview.students.slice(0, 50).map((s, idx) => (
                <div key={s.id} className="p-2 flex items-center justify-between text-xs hover:bg-slate-50">
                  <span className="w-12 text-center text-slate-400 font-mono">{idx + 1}</span>
                  <span className="w-24 font-mono font-bold text-emerald-800">{s.code}</span>
                  <span className="flex-1 font-semibold text-slate-800">{s.name}</span>
                </div>
              ))}
              {excelPreview.students.length > 50 && (
                <div className="p-2 text-center text-xs text-slate-500 italic bg-slate-50">
                  ...và {excelPreview.students.length - 50} sinh viên khác.
                </div>
              )}
            </div>

            {/* Options to Import */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                onClick={() => setExcelPreview(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleConfirmExcelImport('append')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
                >
                  Thêm vào lớp hiện tại
                </button>
                <button
                  onClick={() => handleConfirmExcelImport('replace')}
                  className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors shadow-xs"
                >
                  Thay thế lớp hiện tại
                </button>
                <button
                  onClick={() => handleConfirmExcelImport('new')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo lớp mới từ file này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel error modal if file is invalid */}
      {excelError && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Chưa đọc được dữ liệu Excel
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {excelError}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={downloadExcelTemplate}
                className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors flex items-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5" /> Tải file mẫu Excel
              </button>
              <button
                onClick={() => setExcelError(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Batch Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-display">
              Dán danh sách sinh viên
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Mỗi sinh viên một dòng. Hỗ trợ định dạng &ldquo;Mã SV - Họ và tên&rdquo;, &ldquo;Mã SV [Tab] Họ tên&rdquo; hoặc chỉ cần nhập họ tên (hệ thống sẽ tự tạo mã SV).
            </p>
            <textarea
              rows={8}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder={`ĐNL01 - Nguyễn Văn An\nĐNL02 - Trần Thị Bích\nLê Hoàng Cường`}
              className="w-full p-3 text-xs sm:text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyPasteList(false)}
                  className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
                >
                  Thêm vào lớp hiện tại
                </button>
                <button
                  onClick={() => handleApplyPasteList(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  Thay thế toàn bộ lớp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Modal */}
      {showAddSingleModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3 font-display">
              Thêm sinh viên mới
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã sinh viên (tùy chọn)
                </label>
                <input
                  type="text"
                  value={newStudentCode}
                  onChange={e => setNewStudentCode(e.target.value)}
                  placeholder="VD: ĐNL-21"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên sinh viên *
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Cường"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAddSingleModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleAddSingleStudent}
                disabled={!newStudentName.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
              >
                Thêm vào lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Single Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3 font-display">
              Sửa thông tin sinh viên
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã sinh viên
                </label>
                <input
                  type="text"
                  value={editingStudent.code}
                  onChange={e =>
                    setEditingStudent({ ...editingStudent, code: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={e =>
                    setEditingStudent({ ...editingStudent, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEditStudent}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Class Modal */}
      {showNewClassModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3 font-display">
              Tạo lớp học mới
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên lớp học
              </label>
              <input
                type="text"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="VD: K38 Khoa học Cây trồng"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowNewClassModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateNewClass}
                disabled={!newClassName.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
              >
                Tạo lớp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
