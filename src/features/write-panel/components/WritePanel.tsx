"use client";

import { useState, type FormEvent } from "react";
import styles from "./write-panel.module.css";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";
import type { CreateNoteInput } from "@/features/canvas/types";
import { showToast } from "@/components/Toast";
import { ApiError } from "@/lib/api-client";

const FONTS = [
  { label: "Noto Sans KR", value: "'Noto Sans KR',sans-serif" },
  { label: "Gaegu (손글씨)", value: "'Gaegu',cursive" },
  { label: "Roboto", value: "'Roboto',sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display',serif" },
  { label: "Montserrat", value: "'Montserrat',sans-serif" },
  { label: "Lato", value: "'Lato',sans-serif" },
  { label: "Oswald", value: "'Oswald',sans-serif" },
  { label: "Raleway", value: "'Raleway',sans-serif" },
  { label: "Merriweather", value: "'Merriweather',serif" },
  { label: "Lobster", value: "'Lobster',cursive" },
]; // TRD §4-4-1 10종 확정 목록

const FONT_SIZES = [
  { label: "작게", value: 14 },
  { label: "보통", value: 16 },
  { label: "크게", value: 20 },
];

const TEXT_COLORS = ["#3A3D4D", "#6C7FB7", "#E88CA6", "#E8A449"];
const BG_COLORS = ["#FFF7E0", "#EAF3FF", "#FDE9EF", "#EEF0FA"];
const BORDER_COLORS = ["#6C7FB7", "#E88CA6"];

interface Props {
  mode: RollpaperMode;
  onSubmit: (input: CreateNoteInput) => Promise<unknown>;
  onDone: () => void;
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
export function WritePanel({ mode, onSubmit, onDone }: Props) {
  const cfg = MODE_CONFIG[mode];

  const [fromName, setFromName] = useState("");
  const [content, setContent] = useState("");
  const [font, setFont] = useState(FONTS[1].value);
  const [fontSize, setFontSize] = useState(16);
  const [bold, setBold] = useState(false);
  const [textColor, setTextColor] = useState(cfg.fixedTextColor ?? TEXT_COLORS[0]);
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderColor, setBorderColor] = useState(BORDER_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

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
        borderColor: borderEnabled ? borderColor : undefined,
        photoUrl: photoUrl ?? undefined,
      });
      showToast("캔버스에 추가했어요");
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
      <h4 className={styles.heading}>마음 전하기</h4>

      <div className={styles.field}>
        <label htmlFor="fromName">From, 이름</label>
        <input
          id="fromName"
          type="text"
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          placeholder="예: 민수"
          required
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
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="font">폰트</label>
        <select id="font" value={font} onChange={(e) => setFont(e.target.value)}>
          {FONTS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.miniLabel} htmlFor="fontSize">
            글자 크기
          </label>
          <select id="fontSize" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}>
            {FONT_SIZES.map((s) => (
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

      <div className={styles.row2}>
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
        {cfg.bgPickerEnabled && (
          <div>
            <span className={styles.miniLabel}>메모지 배경</span>
            <SwatchRow colors={BG_COLORS} value={bgColor} onPick={setBgColor} />
          </div>
        )}
      </div>

      <div className={styles.toggleRow}>
        <span className={styles.miniLabel} style={{ margin: 0 }}>
          테두리 표시
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={borderEnabled}
          className={`${styles.miniToggle} ${borderEnabled ? styles.miniToggleOn : ""}`}
          onClick={() => setBorderEnabled((v) => !v)}
        />
      </div>

      {borderEnabled && (
        <div className={styles.field}>
          <span className={styles.miniLabel}>테두리 색</span>
          <SwatchRow colors={BORDER_COLORS} value={borderColor} onPick={setBorderColor} />
        </div>
      )}

      <div className={styles.field}>
        <span className={styles.miniLabel}>사진 (선택)</span>
        <label className={styles.uploadBox}>
          {photoUrl ? (
            <span className={styles.photoPreviewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="" className={styles.photoPreview} />
              <span className={styles.photoPreviewLabel}>눌러서 사진 바꾸기</span>
            </span>
          ) : (
            "📷 눌러서 사진 추가"
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
        캔버스에 추가 ＋
      </button>
    </form>
  );
}
