import * as XLSX from 'xlsx';
import { Student } from '../types';
import { assignDisambiguationLabels } from './random';

export interface ParsedExcelResult {
  sheetNames: string[];
  selectedSheet: string;
  students: Student[];
  fileName: string;
  suggestedClassName?: string;
}

/**
 * Remove Vietnamese accents and lowercase for fuzzy header matching
 */
function normalizeHeader(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Smartly parse an Excel file (.xlsx, .xls) and extract students
 */
export async function parseExcelFile(file: File, sheetIndex: number = 0): Promise<ParsedExcelResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    throw new Error('File Excel không có trang tính (sheet) nào!');
  }

  const selectedSheetName = sheetNames[Math.min(sheetIndex, sheetNames.length - 1)];
  const worksheet = workbook.Sheets[selectedSheetName];

  // Convert worksheet to 2D array of rows
  const rawRows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    return {
      sheetNames,
      selectedSheet: selectedSheetName,
      students: [],
      fileName: file.name,
    };
  }

  // Scan rows to find header row (typically row 0 to 12)
  let headerRowIndex = -1;
  let codeCol = -1;
  let fullNameCol = -1;
  let hoCol = -1;
  let tenCol = -1;

  for (let r = 0; r < Math.min(15, rawRows.length); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    let foundKeywords = 0;
    let tempCode = -1;
    let tempFull = -1;
    let tempHo = -1;
    let tempTen = -1;

    for (let c = 0; c < row.length; c++) {
      const cell = normalizeHeader(row[c]);
      if (!cell) continue;

      if (cell.includes('ma sv') || cell.includes('ma sinh vien') || cell.includes('mssv') || cell === 'masv' || cell === 'ma') {
        tempCode = c;
        foundKeywords++;
      } else if (cell.includes('ho va ten') || cell.includes('ho ten') || cell === 'ho va ten sinh vien' || cell === 'ho ten hoc vien') {
        tempFull = c;
        foundKeywords++;
      } else if (cell.includes('ho dem') || cell.includes('ho lot') || cell === 'ho') {
        tempHo = c;
        foundKeywords++;
      } else if (cell === 'ten' || cell.includes('ten sv') || cell.includes('ten sinh vien')) {
        tempTen = c;
        foundKeywords++;
      } else if (cell === 'stt' || cell.includes('so thu tu')) {
        foundKeywords++;
      }
    }

    if (foundKeywords >= 1 && (tempFull !== -1 || (tempHo !== -1 && tempTen !== -1) || tempCode !== -1)) {
      headerRowIndex = r;
      codeCol = tempCode;
      fullNameCol = tempFull;
      hoCol = tempHo;
      tenCol = tempTen;
      break;
    }
  }

  const students: Student[] = [];
  const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    let code = '';
    let name = '';

    if (fullNameCol !== -1 && row[fullNameCol]) {
      name = String(row[fullNameCol]).trim();
    } else if (hoCol !== -1 && tenCol !== -1) {
      const ho = row[hoCol] ? String(row[hoCol]).trim() : '';
      const ten = row[tenCol] ? String(row[tenCol]).trim() : '';
      name = `${ho} ${ten}`.trim();
    } else {
      // Fallback: look for strings in the row that look like names
      const textCells = row
        .map(cell => (cell !== undefined && cell !== null ? String(cell).trim() : ''))
        .filter(cell => cell.length > 0 && !/^\d+$/.test(cell));

      if (textCells.length === 1) {
        name = textCells[0];
      } else if (textCells.length >= 2) {
        // If first text looks like code, second looks like name
        if (textCells[0].length < 15 && textCells[1].length > textCells[0].length) {
          code = textCells[0];
          name = textCells[1];
        } else {
          name = textCells.join(' ');
        }
      }
    }

    if (codeCol !== -1 && row[codeCol]) {
      code = String(row[codeCol]).trim();
    }

    // Skip rows that look like title lines, footers or signatures
    const normName = normalizeHeader(name);
    if (!name || normName.includes('tong so') || normName.includes('giao vien') || normName.includes('giang vien') || normName.includes('truong phong')) {
      continue;
    }

    // Auto-generate code if missing
    if (!code) {
      code = `SV-${String(students.length + 1).padStart(2, '0')}`;
    }

    students.push({
      id: `std-xls-${Date.now()}-${r}-${Math.random().toString(36).slice(2, 6)}`,
      code,
      name,
      isPresent: true,
    });
  }

  // Derive suggested class name from sheet or file name
  const rawBaseName = file.name.replace(/\.[^/.]+$/, '');
  const suggestedClassName = rawBaseName.replace(/[-_]/g, ' ');

  return {
    sheetNames,
    selectedSheet: selectedSheetName,
    students: assignDisambiguationLabels(students),
    fileName: file.name,
    suggestedClassName,
  };
}

/**
 * Generate and trigger download of a sample Excel template (.xlsx)
 */
export function downloadExcelTemplate() {
  const data = [
    ['STT', 'Mã Sinh Viên', 'Họ Và Tên', 'Ghi Chú'],
    [1, 'ĐNL-01', 'Nguyễn Văn An', 'Cán sự lớp'],
    [2, 'ĐNL-02', 'Trần Thị Bích', ''],
    [3, 'ĐNL-03', 'Lê Hoàng Cường', ''],
    [4, 'ĐNL-04', 'Phạm Thu Dung', ''],
    [5, 'ĐNL-05', 'Hoàng Quốc Đạt', ''],
    [6, 'ĐNL-06', 'Đặng Mỹ Hạnh', ''],
    [7, 'ĐNL-07', 'Vũ Đức Khang', ''],
    [8, 'ĐNL-08', 'Bùi Thanh Mai', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },  // STT
    { wch: 18 }, // Mã SV
    { wch: 28 }, // Họ và tên
    { wch: 20 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachSinhVien');

  XLSX.writeFile(wb, 'Mau_Danh_Sach_Sinh_Vien_Cao_Dang_Nong_Lam.xlsx');
}

/**
 * Export current class to a formatted Excel file (.xlsx)
 */
export function exportClassToExcel(className: string, students: Student[]) {
  const data = [
    ['DANH SÁCH SINH VIÊN'],
    [`Lớp: ${className}`],
    [`Trường Cao đẳng Nông Lâm Đông Bắc - Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
    ['STT', 'Mã Sinh Viên', 'Họ Và Tên', 'Trạng Thái', 'Nhãn Phân Biệt'],
    ...students.map((s, idx) => [
      idx + 1,
      s.code,
      s.name,
      s.isPresent ? 'Có mặt' : 'Vắng mặt',
      s.disambiguationLabel || '',
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },  // STT
    { wch: 18 }, // Mã SV
    { wch: 30 }, // Họ tên
    { wch: 16 }, // Trạng thái
    { wch: 20 }, // Nhãn phân biệt
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachLop');

  const cleanName = className.replace(/[^\w\d-_]/g, '_');
  XLSX.writeFile(wb, `Danh_sach_${cleanName}.xlsx`);
}
