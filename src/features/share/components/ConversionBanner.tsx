"use client";

import { useState } from "react";
import styles from "./conversion-banner.module.css";
import { downloadNextEventIcs } from "../lib/calendarExport";
import { showToast } from "@/components/Toast";

/** Epic 7 Story 7.3 — 공유 직후 안내 배너 (PRD §4-7)
 *  + 퀵윈 #3(A4 미리보기 썸네일로 무드등 CTA 강화), #4(다음 이벤트 캘린더 저장) */
export function ConversionBanner({ onClose, onOrder, toName }: { onClose: () => void; onOrder: () => void; toName: string }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState("");

  function handleSaveDate() {
    if (!date) return;
    downloadNextEventIcs(date, toName);
    showToast("캘린더 파일을 저장했어요");
    setShowDatePicker(false);
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.banner} role="dialog" aria-modal="true" aria-label="무드등 제작 안내" onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          ✕
        </button>
        <div className={styles.thumb} aria-hidden>
          🕯️
        </div>
        <div className={styles.text}>
          <strong>모은 마음, 무드등으로 간직해 볼까요?</strong>
          <p>지금까지 모인 메시지 그대로 무드등 제작을 요청할 수 있어요.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.cta} onClick={onOrder}>
            제작 요청하기
          </button>
          <button className={styles.laterBtn} onClick={onClose}>
            닫기
          </button>
        </div>

        <div className={styles.calRow}>
          {!showDatePicker ? (
            <button className={styles.calBtn} onClick={() => setShowDatePicker(true)}>
              📅 다음엔 언제 또 만드실 건가요? - 날짜 저장
            </button>
          ) : (
            <div className={styles.calPicker}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.dateInput} />
              <button className={styles.calSaveBtn} onClick={handleSaveDate} disabled={!date}>
                저장
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
