export interface Student {
  id: string;
  code: string;
  name: string;
  isPresent: boolean;
  disambiguationLabel?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  students: Student[];
  isDemo?: boolean;
  createdAt: string;
}

export type GameType = 'race' | 'garden' | 'claw';

export interface DrawHistory {
  id: string;
  turnNumber: number;
  classId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  game: GameType;
  taskText?: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  isPreset?: boolean;
}

export type SelectionMode = 'no-repeat' | 'allow-repeat';

export interface AppSettings {
  soundEnabled: boolean;
  speechEnabled: boolean;
  reduceMotion: boolean;
  selectionMode: SelectionMode;
  raceDuration: 5 | 10 | 15;
}

export interface ActiveSession {
  classId: string;
  winnerId: string;
  winner: Student;
  game: GameType;
  eligibleStudents: Student[];
  representativeRacers?: Student[];
  animationDuration: number;
  startedAt: number;
  isFinished: boolean;
  assignedTask?: string;
}
