"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./my.module.css";
import { getMyRollpapers, type MyRollpaper } from "@/lib/editToken";

// 수정/8번 피드백 — 생성 직후 링크 복사 전에 페이지를 나가면 되찾을 방법이 없던 문제.
// 이 기기에서 만든 롤링페이퍼 목록(로컬 저장)을 다시 보여주는 복구용 페이지.
export default function MyRollpapersPage() {
  const [list, setList] = useState<MyRollpaper[] | null>(null);

  useEffect(() => {
    setList(getMyRollpapers());
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="Rollpe" className={styles.logoImg} />
      </header>

      <main className={styles.body}>
        <h1 className={styles.title}>내가 만든 롤링페이퍼</h1>
        <p className={styles.desc}>이 기기(브라우저)에서 만든 기록만 보여줘요. 다른 기기에서는 보이지 않아요.</p>

        {list === null ? null : list.length === 0 ? (
          <p className={styles.empty}>아직 만든 롤링페이퍼가 없어요.</p>
        ) : (
          <ul className={styles.list}>
            {list.map((r) => (
              <li key={r.id}>
                <Link href={`/${r.id}`} className={styles.card}>
                  <span className={styles.cardTo}>To. {r.toName}</span>
                  <span className={styles.cardDate}>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
