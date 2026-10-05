// 캔버스 코어 공용 타입 (TRD §2 데이터 모델과 1:1 대응)
import type { RollpaperMode } from "@/lib/theme";

export type NoteType = "text" | "sticker" | "photo";

export interface NoteDTO {
  id: string;
  rollpaperId: string;
  type: NoteType;
  fromName: string | null;
  content: string | null;
  font: string | null;
  fontSize: number | null;
  bold: boolean;
  textColor: string | null;
  bgColor: string | null;
  borderColor: string | null;
  photoUrl: string | null;
  posX: number;
  posY: number;
  rotation: number;
  createdAt: string;
}

export interface RollpaperDTO {
  id: string;
  toName: string;
  mode: RollpaperMode;
  bgColor: string | null;
  createdAt: string;
  notes: NoteDTO[];
}

export interface CreateNoteInput {
  type: NoteType;
  fromName?: string;
  content?: string;
  font?: string;
  fontSize?: number;
  bold?: boolean;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  photoUrl?: string;
  posX?: number;
  posY?: number;
  rotation?: number;
}
