// 제작 요청의 첨부 사진(가운데 사진 / 메모에 넣은 사진 / 내가 올린 스티커)을 파일로 꺼내고, JSON에서는 파일 이름으로 대신한다.
// 서버 전용. 사진은 DB에 데이터 URL(base64)로 저장되어 있다.
import { enrichSnapshot } from "@/lib/orderExport";

export interface Attachment {
  file: string; // ZIP 안/다운로드 파일 이름 (ASCII)
  role: "가운데 사진" | "메모 사진" | "내 스티커";
  from?: string | null;
  dataUrl: string;
  /** 메모 목록에서의 위치 (가운데 사진은 없음) — 같은 이미지가 여러 번 쓰여도 JSON에서 파일을 정확히 가리키기 위함 */
  noteIndex?: number;
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

function ext(dataUrl: string) {
  const mime = /^data:([^;]+);/.exec(dataUrl)?.[1] ?? "image/jpeg";
  return EXT[mime] ?? "jpg";
}

export function decodeDataUrl(dataUrl: string) {
  const mime = /^data:([^;]+);base64,/.exec(dataUrl)?.[1] ?? "application/octet-stream";
  return { mime, data: Buffer.from(dataUrl.split(",")[1] ?? "", "base64") };
}

type Snap = {
  fixedFields?: Record<string, string> | null;
  notes?: { type?: string; fromName?: string | null; photoUrl?: string | null }[];
};

export function collectAttachments(snapshot: unknown): Attachment[] {
  const s = (snapshot ?? {}) as Snap;
  const out: Attachment[] = [];
  const center = s.fixedFields?.photo;
  if (center?.startsWith("data:image/")) {
    out.push({ file: `photos/center-photo.${ext(center)}`, role: "가운데 사진", dataUrl: center });
  }
  let photo = 0;
  let sticker = 0;
  (s.notes ?? []).forEach((n, noteIndex) => {
    if (!n.photoUrl?.startsWith("data:image/")) return;
    if (n.type === "sticker") {
      out.push({ file: `stickers/sticker-${String(++sticker).padStart(2, "0")}.${ext(n.photoUrl)}`, role: "내 스티커", dataUrl: n.photoUrl, noteIndex });
    } else {
      out.push({ file: `photos/note-${String(++photo).padStart(2, "0")}.${ext(n.photoUrl)}`, role: "메모 사진", from: n.fromName, dataUrl: n.photoUrl, noteIndex });
    }
  });
  return out;
}

/** 글리모리용 JSON — 글씨체 정보를 보강하고, 사진 base64는 빼고 파일 이름과 목록(attachments)으로 대신한다 */
export function slimEnrichedSnapshot(snapshot: unknown) {
  const atts = collectAttachments(snapshot);
  const centerFile = atts.find((a) => a.role === "가운데 사진")?.file;
  const noteFile = new Map(atts.filter((a) => a.noteIndex != null).map((a) => [a.noteIndex as number, a.file]));
  const e = enrichSnapshot(snapshot) as { fixedFields?: Record<string, string> | null; notes: { photoUrl?: string | null }[] } & Record<string, unknown>;
  return {
    ...e,
    fixedFields: e.fixedFields ? { ...e.fixedFields, ...(centerFile ? { photo: centerFile } : {}) } : e.fixedFields,
    notes: e.notes.map((n, i) => ({ ...n, photoUrl: noteFile.get(i) ?? n.photoUrl })),
    attachments: atts.map(({ file, role, from }) => ({ file, role, ...(from ? { from } : {}) })),
  };
}
