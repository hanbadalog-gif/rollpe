"use client";

import { useState, type FormEvent } from "react";
import styles from "@/features/write-panel/components/write-panel.module.css";
import { showToast } from "@/components/Toast";
import type { Zone } from "@/lib/theme";
import { shrinkToDataUrl } from "@/lib/imageResize";

interface Props {
  zone: Zone;
  /** 현재 저장된 값(없으면 빈 문자열) */
  value: string;
  onSave: (value: string) => Promise<unknown>;
  onDone: () => void;
}

/** 무드등 고정 레이아웃 칸 입력 — 문구 칸은 텍스트, 사진 칸은 이미지 1장 */
export function FixedFieldPanel({ zone, value, onSave, onDone }: Props) {
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);

  async function save(next: string) {
    setSaving(true);
    try {
      await onSave(next);
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
      await save(await shrinkToDataUrl(file));
    } catch {
      showToast("사진을 불러오지 못했어요.");
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    save(text.trim());
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
            <button type="button" className={styles.submit} disabled={saving} onClick={() => save("")}>
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
              autoFocus
            />
          </div>
          <button className={styles.submit} disabled={saving}>
            저장
          </button>
        </>
      )}
    </form>
  );
}
