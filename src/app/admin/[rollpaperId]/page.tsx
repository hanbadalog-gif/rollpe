import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rollpapers, notes } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import styles from "./admin.module.css";

export default async function AdminRollpaperPage({
  params,
}: {
  params: Promise<{ rollpaperId: string }>;
}) {
  const ok = await isAdmin();
  if (!ok) {
    return <div className={styles.denied}>접근 권한이 없어요. 전달받은 관리자 링크로 다시 들어와주세요.</div>;
  }

  const { rollpaperId } = await params;
  const [rollpaper] = await db.select().from(rollpapers).where(eq(rollpapers.id, rollpaperId));
  if (!rollpaper) {
    return <div className={styles.denied}>롤링페이퍼를 찾을 수 없어요.</div>;
  }
  const noteRows = await db.select().from(notes).where(eq(notes.rollpaperId, rollpaperId));

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>To. {rollpaper.toName}</h1>
      <p className={styles.sub}>메모 {noteRows.length}개</p>

      <a className={styles.exportBtn} href={`/api/admin/rollpapers/${rollpaperId}/export`} download>
        ⬇ JSON으로 내보내기 (문구+사진 포함)
      </a>

      <div className={styles.list}>
        {noteRows.map((n) => (
          <div key={n.id} className={styles.item}>
            <div className={styles.itemFrom}>From. {n.fromName ?? "(이름 없음)"}</div>
            {n.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.itemPhoto} src={n.photoUrl} alt="" />
            )}
            {n.content && <div className={styles.itemContent}>{n.content}</div>}
          </div>
        ))}
        {noteRows.length === 0 && <p className={styles.sub}>아직 작성된 메모가 없어요.</p>}
      </div>
    </div>
  );
}
