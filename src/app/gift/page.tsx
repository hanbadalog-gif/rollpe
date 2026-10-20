import Link from "next/link";
import styles from "../new/new.module.css";
import { GiftFlow } from "@/features/rollpaper-create/components/GiftFlow";

// 롤링페이퍼 무드등 선물하기 — 완성 예시 → 고정 디자인 안내 → To 입력 → 캔버스(/[id]) → 공유 → 글리모리 전달
export default function GiftPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Rollpe 메인으로">
          {/* eslint-disable-next-line @next/next/no-img-element -- 브랜드 로고, 단순 정적 이미지 */}
          <img src="/brand/logo.png" alt="Rollpe" className={styles.logoImg} />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.png" alt="" className={styles.markImg} aria-hidden />
      </header>
      <GiftFlow />
    </div>
  );
}
