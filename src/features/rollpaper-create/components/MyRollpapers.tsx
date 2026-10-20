"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/app/my/my.module.css";
import { getMyRollpapers, getOwnerToken, removeMyRollpaper, type MyRollpaper } from "@/lib/editToken";
import { api, ApiError } from "@/lib/api-client";
import { showToast } from "@/components/Toast";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";

type Kind = "online" | "gift";

// 수정/8번 피드백 — 생성 직후 링크 복사 전에 페이지를 나가면 되찾을 방법이 없던 문제.
// 이 기기에서 만든 목록(로컬 저장)을 다시 보여주는 복구용 목록. 만든 버튼별로 따로 보여준다:
// "무료 롤링페이퍼 방 만들기"(online)와 "롤링페이퍼 무드등 선물하기"(gift)는 서로의 목록에 나오지 않는다.
export function MyRollpapers({ kind }: { kind: Kind }) {
  const [list, setList] = useState<MyRollpaper[] | null>(null);
  const load = () => setList(getMyRollpapers().filter((r) => (r.mode === "online") === (kind === "online")));
  const noun = kind === "online" ? "롤링페이퍼" : "무드등";

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 첫 로드에서 한 번만
  }, []);

  async function handleDelete(r: MyRollpaper) {
    const token = getOwnerToken(r.id);
    const ok = window.confirm(
      token
        ? `"To. ${r.toName}" ${noun}를 삭제할까요?
모인 메시지가 모두 사라지고 되돌릴 수 없어요.`
        : `"To. ${r.toName}"을(를) 이 기기 목록에서 지울까요?
(방장 권한이 없어 롤링페이퍼 자체는 삭제되지 않아요.)`,
    );
    if (!ok) return;
    try {
      if (token) await api.delete(`/api/rollpapers/${r.id}`, { "x-owner-token": token });
    } catch (err) {
      // 이미 서버에 없으면(404) 목록만 정리하면 된다. 그 외(제작 요청 접수 등)는 막고 이유를 알려준다
      if (!(err instanceof ApiError && err.status === 404)) {
        showToast(err instanceof ApiError ? err.message : "삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
        return;
      }
    }
    removeMyRollpaper(r.id);
    load();
    showToast("삭제했어요");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Rollpe 메인으로">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Rollpe" className={styles.logoImg} />
        </Link>
      </header>

      <main className={styles.body}>
        <h1 className={styles.title}>내가 만든 {noun}</h1>
        <p className={styles.desc}>이 기기(브라우저)에서 만든 기록만 보여줘요. 다른 기기에서는 보이지 않아요.</p>

        {list === null ? null : list.length === 0 ? (
          <p className={styles.empty}>아직 만든 {noun}가 없어요.</p>
        ) : (
          <ul className={styles.list}>
            {list.map((r) => (
              <li key={r.id} className={styles.item}>
                <Link href={r.mode === "online" ? `/${r.id}` : `/gift/${r.id}`} className={styles.card}>
                  <span className={styles.cardTo}>
                    To. {r.toName}
                    {r.mode !== "online" && ` · ${MODE_CONFIG[r.mode as RollpaperMode]?.label ?? "무드등"}`}
                  </span>
                  <span className={styles.cardDate}>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                </Link>
                <button type="button" className={styles.delBtn} onClick={() => handleDelete(r)} aria-label={`To. ${r.toName} 삭제`}>
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
