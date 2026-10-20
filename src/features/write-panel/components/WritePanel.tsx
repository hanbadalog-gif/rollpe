"use client";

import { useState, type FormEvent } from "react";
import styles from "./write-panel.module.css";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";
import type { CreateNoteInput, NoteDTO } from "@/features/canvas/types";
import { showToast } from "@/components/Toast";
import { NOTE_BG_COLORS, NOTE_TEXT_COLORS } from "@/features/canvas/lib/palette";
import { ApiError } from "@/lib/api-client";
import { FONTS } from "@/lib/fonts";


const FONT_SIZES = [
  { label: "작게", value: 14 },
  { label: "보통", value: 16 },
  { label: "크게", value: 20 },
];

// 무드등은 캔버스가 작아 8장이 겹치지 않게 하려면 글씨가 작아야 한다 — 기준 폭 360px에서 9/11/14, 기본 11
// (실물 샘플 7.jpg도 손글씨가 작다. 캔버스 폭에 비례하므로 큰 화면에서는 같은 비율로 커진다)
const MOOD_FONT_SIZES = [
  { label: "작게", value: 9 },
  { label: "보통", value: 11 },
  { label: "크게", value: 14 },
];

const TEXT_COLORS = NOTE_TEXT_COLORS;
const BG_COLORS = NOTE_BG_COLORS;

interface Props {
  mode: RollpaperMode;
  onSubmit: (input: CreateNoteInput) => Promise<unknown>;
  onDone: () => void;
  /** 값이 있으면 "수정 모드" — 기존 내용이 채워져 있고, 등록 대신 수정 내용을 onSubmit으로 보낸다 */
  initial?: NoteDTO | null;
}

function SwatchRow({
  colors,
  value,
  onPick,
}: {
  colors: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  return (
    <div className={styles.swatches}>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          className={`${styles.swatch} ${value === c ? styles.swatchSel : ""}`}
          style={{ background: c }}
          onClick={() => onPick(c)}
          aria-label={c}
        />
      ))}
    </div>
  );
}

/** 글쓰기 패널 — Epic 4 (Story 4.1~4.4). /design-preview 프로토타입과 시각적으로 맞춤(스와치/토글 UI) */
export function WritePanel({ mode, onSubmit, onDone, initial }: Props) {
  const cfg = MODE_CONFIG[mode];
  const sizes = cfg.locked ? MOOD_FONT_SIZES : FONT_SIZES;

  const [fromName, setFromName] = useState(initial?.fromName ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [font, setFont] = useState(initial?.font ?? FONTS[0].value);
  // 예전에 다른 값(11/14/18)으로 저장된 메모도 가장 가까운 칸이 선택되도록
  const [fontSize, setFontSize] = useState(
    initial?.fontSize
      ? sizes.reduce((best, s) => (Math.abs(s.value - initial.fontSize!) < Math.abs(best.value - initial.fontSize!) ? s : best)).value
      : cfg.locked ? 11 : 16,
  );
  const [bold, setBold] = useState(initial?.bold ?? false);
  const [textColor, setTextColor] = useState(initial?.textColor ?? cfg.fixedTextColor ?? TEXT_COLORS[0]);
  const [bgColor, setBgColor] = useState(initial?.bgColor ?? BG_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photoUrl ?? null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoUrl(null);
      return;
    }
    // 스토리지 벤더 확정 전 — 그리기 도구와 동일하게 데이터 URL로 직접 저장(photoUrl 컬럼 재사용).
    // 폰 카메라 원본은 수 MB라 요청 크기 제한(Vercel 서버리스 함수 기본 4.5MB)에 걸릴 수 있어
    // 캔버스로 긴 변 800px까지 축소 후 JPEG로 압축해서 저장한다.
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : null;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setPhotoUrl(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (initial) {
      // 수정 — 창은 바로 닫고 저장은 뒤에서(실패하면 안내). 메모 선택은 그대로 유지된다.
      const patch: Partial<CreateNoteInput> = {
        fromName,
        content,
        font,
        fontSize,
        bold,
        textColor: cfg.fixedTextColor ?? textColor,
        bgColor: cfg.bgPickerEnabled ? bgColor : undefined,
        photoUrl: photoUrl && photoUrl !== initial.photoUrl ? photoUrl : undefined,
      };
      onDone();
      showToast("수정했어요");
      onSubmit(patch as CreateNoteInput).catch(() => showToast("수정하지 못했어요. 잠시 후 다시 시도해주세요."));
      return;
    }
    if (!fromName || !content) return;
    setSubmitting(true);
    try {
      await onSubmit({
        type: "text",
        fromName,
        content,
        font,
        fontSize,
        bold,
        textColor: cfg.fixedTextColor ?? textColor,
        bgColor: cfg.bgPickerEnabled ? bgColor : undefined,
        photoUrl: photoUrl ?? undefined,
      });
      showToast("캔버스에 추가했어요");
      setTimeout(() => showToast("친구들한테도 공유해서 꽉 채워봐요 🔗"), 2400);
      setContent("");
      setPhotoUrl(null);
      onDone();
    } catch (err) {
      const message =
        err instanceof ApiError && err.code === "CAPACITY_FULL"
          ? "정원이 다 찼어요"
          : "추가하지 못했어요. 잠시 후 다시 시도해주세요.";
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      {initial && <h4 className={styles.heading}>메모 수정</h4>}
      {/* 수정/24.png 피드백 — "마음 전하기" 행 삭제, 페이지/4.jpg처럼 From.부터 바로 시작 */}
      <div className={styles.field}>
        <label htmlFor="fromName">From.</label>
        <input
          id="fromName"
          type="text"
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          placeholder="이름을 입력해 주세요 (익명 가능)"
          required={!initial}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="content">내용</label>
        <textarea
          id="content"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="전하고 싶은 말을 적어보세요"
          style={{ fontFamily: font }}
          required={!initial}
        />
        {cfg.locked && (
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--ink-soft)" }}>
            {content.length}자 · 8장이 겹치지 않으려면 40자 안팎이 적당해요 (제한은 없어요)
          </p>
        )}
      </div>

      <div className={styles.field}>
        <span className={styles.miniLabel}>폰트</span>
        <div className={styles.pillRow}>
          {FONTS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`${styles.pill} ${font === f.value ? styles.pillSelected : ""}`}
              onClick={() => setFont(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.miniLabel} htmlFor="fontSize">
            글자 크기
          </label>
          <select id="fontSize" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}>
            {sizes.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.miniLabel} htmlFor="bold">
            굵게
          </label>
          <select id="bold" value={bold ? "1" : "0"} onChange={(e) => setBold(e.target.value === "1")}>
            <option value="0">보통</option>
            <option value="1">굵게</option>
          </select>
        </div>
      </div>

      <div>
        <div>
          <span className={styles.miniLabel}>글자 색</span>
          {cfg.fixedTextColor ? (
            <div className={styles.swatches}>
              <span className={`${styles.swatch} ${styles.swatchSel}`} style={{ background: cfg.fixedTextColor }} />
            </div>
          ) : (
            <SwatchRow colors={TEXT_COLORS} value={textColor} onPick={setTextColor} />
          )}
        </div>
      </div>

      {cfg.bgPickerEnabled && (
        <div>
          <span className={styles.miniLabel}>메모지 배경</span>
          <SwatchRow colors={BG_COLORS} value={bgColor} onPick={setBgColor} />
        </div>
      )}

      <div className={styles.field}>
        <span className={styles.miniLabel}>사진(선택)</span>
        <label className={styles.uploadBox}>
          {photoUrl ? (
            <span className={styles.photoPreviewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="" className={styles.photoPreview} />
              <span className={styles.photoPreviewLabel}>눌러서 사진 바꾸기</span>
            </span>
          ) : (
            "눌러서 사진추가"
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          />
        </label>
      </div>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {initial ? "수정 완료" : "등록하기"}
      </button>
    </form>
  );
}
