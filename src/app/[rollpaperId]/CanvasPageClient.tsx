"use client";

import { useRef, useState } from "react";
import styles from "./canvas-page.module.css";
import { CanvasBoard } from "@/features/canvas/components/CanvasBoard";
import { WritePanel } from "@/features/write-panel/components/WritePanel";
import { StickerPanel } from "@/features/stickers/components/StickerPanel";
import { DrawPanel } from "@/features/drawing/components/DrawPanel";
import { useCanvasNotes } from "@/features/canvas/hooks/useCanvasNotes";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";
import { showToast } from "@/components/Toast";
import { ShareMenu } from "@/features/share/components/ShareMenu";
import { ConversionBanner } from "@/features/share/components/ConversionBanner";
import { hasBannerBeenSeen, markBannerSeen } from "@/features/share/lib/bannerSeen";
import { downloadCanvasAsImage } from "@/features/share/lib/canvasExport";
import { EnvelopeIntro } from "@/features/recipient/components/EnvelopeIntro";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BgColorPanel } from "@/features/canvas/components/BgColorPanel";
import { getOwnerToken } from "@/lib/editToken";

type PanelKey = "write" | "sticker" | "draw" | "bg" | null;

export function CanvasPageClient({
  rollpaperId,
  recipientView = false,
}: {
  rollpaperId: string;
  recipientView?: boolean;
}) {
  const { rollpaper, loading, error, addNote, updateNote, moveNote, deleteNote, updateBgColor } =
    useCanvasNotes(rollpaperId);
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(recipientView);
  const canvasExportRef = useRef<HTMLDivElement>(null);

  if (loading) return <div className={styles.loading}>불러오는 중…</div>;
  if (error || !rollpaper) return <div className={styles.loading}>{error ?? "오류가 발생했어요"}</div>;

  const cfg = MODE_CONFIG[rollpaper.mode as RollpaperMode];
  const noteCount = rollpaper.notes.length;
  const atCap = noteCount >= cfg.capacity;

  function handleOpenShare() {
    if (rollpaper!.mode === "online" && !hasBannerBeenSeen(rollpaperId)) {
      markBannerSeen(rollpaperId);
      setShowBanner(true);
    }
  }

  async function handleDownload() {
    if (!canvasExportRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadCanvasAsImage(canvasExportRef.current, `rollpe-${rollpaperId}.png`);
    } catch {
      showToast("다운로드에 실패했어요");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={styles.app}>
      {showEnvelope && (
        <EnvelopeIntro toName={rollpaper.toName} onDone={() => setShowEnvelope(false)} />
      )}
      <div className={styles.appbar}>
        <div className={styles.toField}>
          <span>To.</span>
          <b>{rollpaper.toName}</b>
        </div>
        <span className={styles.counter}>
          {isFinite(cfg.capacity) ? `${noteCount} / ${cfg.capacity}명` : `${noteCount}명 작성`}
        </span>
        <ThemeToggle />
        {!recipientView && (
          <ShareMenu mode={rollpaper.mode as RollpaperMode} onOpenShare={handleOpenShare} />
        )}
      </div>

      {showBanner && <ConversionBanner onClose={() => setShowBanner(false)} />}

      {!recipientView && atCap && isFinite(cfg.capacity) && (
        <div className={styles.capBanner}>
          정원이 다 찼어요 ({cfg.capacity}명). 더 큰 사이즈로 바꾸면 계속 받을 수 있어요.
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.toolbar}>
          {!recipientView && (
            <>
              <button
                className={`${styles.tool} ${openPanel === "write" ? styles.toolActive : ""}`}
                disabled={atCap && isFinite(cfg.capacity)}
                onClick={() => setOpenPanel(openPanel === "write" ? null : "write")}
              >
                <span className={styles.ic}>✎</span>글쓰기
              </button>
              <button
                className={`${styles.tool} ${openPanel === "sticker" ? styles.toolActive : ""}`}
                disabled={!cfg.stickerEnabled}
                onClick={() => setOpenPanel(openPanel === "sticker" ? null : "sticker")}
              >
                <span className={styles.ic}>★</span>스티커
              </button>
              <button
                className={`${styles.tool} ${openPanel === "draw" ? styles.toolActive : ""}`}
                disabled={atCap && isFinite(cfg.capacity)}
                onClick={() => setOpenPanel(openPanel === "draw" ? null : "draw")}
              >
                <span className={styles.ic}>✏</span>그리기
              </button>
              <button
                className={`${styles.tool} ${openPanel === "bg" ? styles.toolActive : ""}`}
                disabled={!cfg.bgPickerEnabled || !getOwnerToken(rollpaperId)}
                onClick={() => setOpenPanel(openPanel === "bg" ? null : "bg")}
              >
                <span className={styles.ic}>◐</span>배경색
              </button>
            </>
          )}
          <button className={styles.tool} onClick={handleDownload} disabled={downloading}>
            <span className={styles.ic}>⬇</span>{downloading ? "저장 중…" : "저장"}
          </button>
        </div>

        <CanvasBoard
          rollpaperId={rollpaperId}
          rollpaper={rollpaper}
          updateNote={updateNote}
          moveNote={moveNote}
          deleteNote={deleteNote}
          canvasRef={canvasExportRef}
          readOnly={recipientView}
        />

        {!recipientView && openPanel === "write" && (
          <div className={styles.sidePanel}>
            <WritePanel mode={rollpaper.mode as RollpaperMode} onSubmit={addNote} onDone={() => setOpenPanel(null)} />
          </div>
        )}
        {!recipientView && openPanel === "sticker" && (
          <div className={styles.sidePanel}>
            <StickerPanel onSubmit={addNote} />
          </div>
        )}
        {!recipientView && openPanel === "draw" && (
          <div className={styles.sidePanel}>
            <DrawPanel onSubmit={addNote} onDone={() => setOpenPanel(null)} />
          </div>
        )}
        {!recipientView && openPanel === "bg" && (
          <div className={styles.sidePanel}>
            <BgColorPanel current={rollpaper.bgColor} onPick={updateBgColor} />
          </div>
        )}
      </div>
    </div>
  );
}
