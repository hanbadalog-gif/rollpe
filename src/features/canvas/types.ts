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
  scale: number;
  z: number;
  createdAt: string;
}

/** 무드등 고정 레이아웃 칸 내용 — 키는 theme.ts의 ZONES와 같다 */
export type FixedFields = Partial<Record<"title" | "photo" | "caption" | "label", string>>;

export interface RollpaperDTO {
  id: string;
  toName: string;
  mode: RollpaperMode;
  bgColor: string | null;
  /** 방장이 "완성"한 시각 — 값이 있으면 작성/수정이 잠김 */
  finishedAt: string | null;
  fixedFields: FixedFields | null;
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
  scale?: number;
  z?: number;
}
