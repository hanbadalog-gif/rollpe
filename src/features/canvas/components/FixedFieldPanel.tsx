"use client";

import { useState, type FormEvent } from "react";
import styles from "@/features/write-panel/components/write-panel.module.css";
import { showToast } from "@/components/Toast";
import type { Zone } from "@/lib/theme";
import type { FixedFields } from "@/features/canvas/types";
import { shrinkToDataUrl } from "@/lib/imageResize";
import { FONTS, ZONE_SIZES, parseZoneStyle } from "@/lib/fonts";

interface Props {
  zone: Zone;
  /** 현재 저장된 값(없으면 빈 문자열) */
  value: string;
  /** 문구 칸의 현재 글씨 스타일(JSON 문자열, 없으면 기본) */
  styleRaw?: string;
  onSave: (patch: FixedFields) => Promise<unknown>;
  onDone: () => void;
}

/** 무드등 고정 레이아웃 칸 입력 — 문구 칸은 텍스트 + 메모와 같은 글씨체/크기/굵기, 사진 칸은 이미지 1장 */
export function FixedFieldPanel({ zone, value, styleRaw, onSave, onDone }: Props) {
  const [text, setText] = useState(value);
  const initial = parseZoneStyle(styleRaw);
  const [font, setFont] = useState(initial.font);
  const [size, setSize] = useState(initial.size);
  const [bold, setBold] = useState(initial.bold);
  const [saving, setSaving] = useState(false);

  async function save(patch: FixedFields) {
    setSaving(true);
    try {
      await onSave(patch);
      onDone();
    } catch {
      showToast("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSaving(false);
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await save({ [zone.key]: await shrinkToDataUrl(file) });
    } catch {
      showToast("사진을 불러오지 못했어요.");
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    save({ [zone.key]: text.trim(), [`${zone.key}Style`]: JSON.stringify({ font, size, bold }) } as FixedFields);
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <h4 className={styles.heading}>{zone.kind === "photo" ? "가운데 사진" : zone.placeholder}</h4>
      {zone.kind === "photo" ? (
        <>
          <label className={styles.uploadBox}>
            {value ? (
              <span className={styles.photoPreviewWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="" className={styles.photoPreview} />
                <span className={styles.photoPreviewLabel}>눌러서 사진 바꾸기</span>
              </span>
            ) : (
              "눌러서 사진추가"
            )}
            <input type="file" accept="image/*" onChange={handlePhoto} disabled={saving} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
          </label>
          {value && (
            <button type="button" className={styles.submit} disabled={saving} onClick={() => save({ [zone.key]: "" })}>
              사진 지우기
            </button>
          )}
        </>
      ) : (
        <>
          <div className={styles.field}>
            <textarea
              rows={2}
              maxLength={60}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={zone.defaultText ?? zone.placeholder}
              style={{ fontFamily: font, fontWeight: bold ? 700 : 400 }}
              autoFocus
            />
          </div>

          {/* 메모 글쓰기 패널과 같은 글씨체 기능 */}
          <div className={styles.field}>
            <span className={styles.miniLabel}>폰트</span>
            <div className={styles.pillRow}>
              {FONTS.map((f) => (
                <button key={f.value} type="button" className={`${styles.pill} ${font === f.value ? styles.pillSelected : ""}`} onClick={() => setFont(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row2}>
            <div>
              <label className={styles.miniLabel} htmlFor="zoneSize">
                글자 크기
              </label>
              <select id="zoneSize" value={size} onChange={(e) => setSize(Number(e.target.value))}>
                {ZONE_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.miniLabel} htmlFor="zoneBold">
                굵게
              </label>
              <select id="zoneBold" value={bold ? "1" : "0"} onChange={(e) => setBold(e.target.value === "1")}>
                <option value="0">보통</option>
                <option value="1">굵게</option>
              </select>
            </div>
          </div>

          <button className={styles.submit} disabled={saving}>
            저장
          </button>
        </>
      )}
    </form>
  );
}
