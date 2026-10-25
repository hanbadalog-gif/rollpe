"use client";

import { useState } from "react";
import { showToast } from "@/components/Toast";
import styles from "./gift.module.css";

/** 글리모리 홈페이지(무드등 구경하기·바로가기) */
export const HOMEPAGE_URL = "https://glimory.co.kr";
/** 카카오톡 고객센터 채널 — 주소가 정해지면 여기만 채우면 된다 */
export const KAKAO_URL = "";

/** 캔버스 옆(PC) / 안(모바일)에 붙는 선물 아이콘 버튼 — 누르면 무드등 안내 팝업이 열린다 */
export function GiftButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  return (
    <button type="button" className={`${styles.giftBtn} ${active ? styles.giftOn : ""}`} onClick={onClick} aria-label="무드등 선물하기">
      <span className={styles.giftIcon} aria-hidden />
    </button>
  );
}

/** 팝업① 무드등 소개 → 팝업② 링크 복사 안내 */
export function GiftPopup({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);

  async function makeLamp() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      showToast("링크 복사에 실패했어요. 주소창의 링크를 직접 복사해 주세요");
    }
    setStep(2);
  }

  function openKakao() {
    if (KAKAO_URL) window.open(KAKAO_URL, "_blank", "noopener");
    else showToast("고객센터 채널은 준비 중이에요");
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="무드등 선물하기" onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
          ✕
        </button>
        {step === 1 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- 예시 사진 */}
            <img src="/brand/type-a.jpg" alt="롤링페이퍼 무드등 예시" className={styles.hero} />
            <p className={styles.title}>
              밤마다 보게 되는 감동 선물, 함께 만든
              <br />
              <b>롤링페이퍼를 무드등</b>으로 선물해보세요
            </p>
            <a className={styles.primary} href={HOMEPAGE_URL} target="_blank" rel="noopener noreferrer">
              롤링페이퍼 무드등 구경하기
            </a>
            <button type="button" className={styles.secondary} onClick={makeLamp}>
              작성한 롤링페이퍼로 무드등 제작하기
            </button>
          </>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gift/check.png" alt="" className={styles.check} />
            <p className={styles.title}>현재 작성된 롤링페이퍼 링크가 복사되었어요</p>
            <p className={styles.desc}>
              쇼핑몰에서 무드등 주문 후 배송 메시지 혹은
              <br />
              “글리모리” 카카오톡 고객센터에 복사된 링크를 남겨주세요.
            </p>
            <p className={styles.desc}>
              작성하신 롤링페이퍼 내용 그대로
              <br />
              예쁘게 디자인하여 제작됩니다.
            </p>
            <div className={styles.links}>
              <a href={HOMEPAGE_URL} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gift/glimory.png" alt="" />
                글리모리 바로가기
              </a>
              <button type="button" onClick={openKakao}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gift/kakao.png" alt="" />
                고객센터 연결
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
