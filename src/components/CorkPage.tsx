import Link from "next/link";
import styles from "./cork-page.module.css";
import { ThemeToggle } from "./ThemeToggle";

/** /new, /gift 공용 쉘 — 코르크보드 + 핀카드 톤 (UI_PRD_재구성.md "폴라로이드 콜라주" 채택분) */
export function CorkPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.appbar}>
        <Link href="/" className={styles.back}>
          ←
        </Link>
        <h3 className={styles.title}>{title}</h3>
        <ThemeToggle />
      </div>
      <div className={styles.board}>{children}</div>
    </div>
  );
}
