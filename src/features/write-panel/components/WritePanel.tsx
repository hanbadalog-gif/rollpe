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

interface Props {
  mode: RollpaperMode;
  onSubmit: (input: CreateNoteInput) => Promise<unknown>;
  onDone: () => void;
}

/** 글쓰기 패널 — Epic 4 (Story 4.1~4.4) */
export function WritePanel({ mode, onSubmit, onDone }: Props) {
  const cfg = MODE_CONFIG[mode];

  const [fromName, setFromName] = useState("");
  const [content, setContent] = useState("");
  const [font, setFont] = useState(FONTS[1].value);
  const [fontSize, setFontSize] = useState(16);
  const [bold, setBold] = useState(false);
  const [textColor, setTextColor] = useState(cfg.fixedTextColor ?? "#3a2f1c");
  const [bgColor, setBgColor] = useState("#fff6d8");
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderColor, setBorderColor] = useState("#3a2f1c");
  const [submitting, setSubmitting] = useState(false);
  const [photoChosen, setPhotoChosen] = useState(false);

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
      });
      showToast("캔버스에 추가했어요");
      setContent("");
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
          <input
            id="fontSize"
            type="number"
            min={10}
            max={40}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={styles.miniLabel} htmlFor="bold">
            굵게
          </label>
          <button
            id="bold"
            type="button"
            className={`${styles.toggle} ${bold ? styles.toggleOn : ""}`}
            onClick={() => setBold((v) => !v)}
          >
            B 굵게
          </button>
        </div>
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.miniLabel} htmlFor="textColor">
            글자 색
          </label>
          <input
            id="textColor"
            type="color"
            value={cfg.fixedTextColor ?? textColor}
            disabled={!!cfg.fixedTextColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </div>
        {cfg.bgPickerEnabled && (
          <div>
            <label className={styles.miniLabel} htmlFor="bgColor">
              메모지 배경색
            </label>
            <input id="bgColor" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          </div>
        )}
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.miniLabel} htmlFor="borderEnabled">
            테두리
          </label>
          <button
            id="borderEnabled"
            type="button"
            className={`${styles.toggle} ${borderEnabled ? styles.toggleOn : ""}`}
            onClick={() => setBorderEnabled((v) => !v)}
          >
            {borderEnabled ? "테두리 켜짐" : "테두리 없음"}
          </button>
        </div>
        {borderEnabled && (
          <div>
            <label className={styles.miniLabel} htmlFor="borderColor">
              테두리 색
            </label>
            <input
              id="borderColor"
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className={styles.field}>
        <span className={styles.miniLabel}>사진 (선택)</span>
        <label className={styles.uploadBox}>
          {photoChosen ? "사진 선택됨 (미리보기만 — 스토리지 연동 전)" : "📷 눌러서 사진 추가"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoChosen(!!e.target.files?.[0])}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          />
        </label>
      </div>

      <button type="submit" className={styles.submit} disabled={submitting}>
        캔버스에 추가
      </button>
    </form>
  );
}
