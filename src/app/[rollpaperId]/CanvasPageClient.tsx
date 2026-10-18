"use client";

import { useRef, useState } from "react";
import styles from "./canvas-page.module.css";
import { CanvasBoard } from "@/features/canvas/components/CanvasBoard";
import { WritePanel } from "@/features/write-panel/components/WritePanel";
import { StickerPanel } from "@/features/stickers/components/StickerPanel";
import { useCanvasNotes } from "@/features/canvas/hooks/useCanvasNotes";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";
import { showToast } from "@/components/Toast";
import { ShareMenu } from "@/features/share/components/ShareMenu";
import { ConversionBanner } from "@/features/share/components/ConversionBanner";
import { hasBannerBeenSeen, markBannerSeen } from "@/features/share/lib/bannerSeen";
import { downloadCanvasAsImage } from "@/features/share/lib/canvasExport";
import { EnvelopeIntro } from "@/features/recipient/components/EnvelopeIntro";
import { DownloadIcon, WriteIcon, StickerIcon, PaletteIcon, FrameIcon } from "@/components/icons";
import { BgColorPanel } from "@/features/canvas/components/BgColorPanel";
import { PaperSizePanel, type PaperSize } from "@/features/canvas/components/PaperSizePanel";
import { OrderPanel } from "@/features/order/components/OrderPanel";
import { getOwnerToken } from "@/lib/editToken";

type PanelKey = "write" | "sticker" | "bg" | "paper" | "order" | null;

export function CanvasPageClient({
  rollpaperId,
  recipientView = false,
}: {
  rollpaperId: string;
  recipientView?: boolean;
}) {
  const { rollpaper, loading, error, addNote, updateNote, moveNote, resizeNote, deleteNote, updateBgColor } =
    useCanvasNotes(rollpaperId);
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>("free");
  const [showBanner, setShowBanner] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(recipientView);
  const canvasExportRef = useRef<HTMLDivElement>(null);

  if (loading) return <div className={styles.loading}>불러오는 중…</div>;
  if (error || !rollpaper) return <div className={styles.loading}>{error ?? "오류가 발생했어요"}</div>;

  const cfg = MODE_CONFIG[rollpaper.mode as RollpaperMode];
  const noteCount = rollpaper.notes.length; // 정원(캔버스 혼잡도) 체크용 — 스티커/그림 포함 전체 아이템 수
  // 수정/6번 피드백 — 카운터가 스티커/그림까지 포함해 부풀려지던 문제.
  // 한 사람이 여러 장 쓸 수 있으므로 사람 수가 아니라 글이 있는 메모지 "개수"로 집계
  const peopleCount = rollpaper.notes.filter((n) => n.type === "text").length;
  const atCap = noteCount >= cfg.capacity;

  // 방장 기기에서만 제작 요청 가능 (서버도 방장 토큰을 확인)
  const isOwner = !!getOwnerToken(rollpaperId);
  function openOrder() {
    setShowBanner(false);
    setOpenPanel("order");
  }

  function handleOpenShare() {
    if (rollpaper!.mode === "online" && isOwner && !hasBannerBeenSeen(rollpaperId)) {
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
          {isFinite(cfg.capacity) ? `${peopleCount} / ${cfg.capacity}개` : `${peopleCount}개 작성`}
        </span>
      </div>

      {showBanner && <ConversionBanner onClose={() => setShowBanner(false)} onOrder={openOrder} toName={rollpaper.toName} />}

      {!recipientView && atCap && isFinite(cfg.capacity) && (
        <div className={styles.capBanner}>
          정원이 다 찼어요 ({cfg.capacity}개). 더 큰 사이즈로 바꾸면 계속 받을 수 있어요.
        </div>
      )}

      <div className={styles.body}>
        {!recipientView && (
          <div className={styles.toolbar}>
              <button
                className={`${styles.tool} ${openPanel === "write" ? styles.toolActive : ""}`}
                disabled={atCap && isFinite(cfg.capacity)}
                onClick={() => setOpenPanel(openPanel === "write" ? null : "write")}
                aria-label="글쓰기"
              >
                <WriteIcon />
              </button>
              <button
                className={`${styles.tool} ${openPanel === "sticker" ? styles.toolActive : ""}`}
                disabled={!cfg.stickerEnabled}
                onClick={() => setOpenPanel(openPanel === "sticker" ? null : "sticker")}
                aria-label="스티커"
              >
                <StickerIcon />
              </button>
              <button
                className={`${styles.tool} ${openPanel === "bg" ? styles.toolActive : ""}`}
                disabled={!cfg.bgPickerEnabled || !getOwnerToken(rollpaperId)}
                onClick={() => setOpenPanel(openPanel === "bg" ? null : "bg")}
                aria-label="배경색"
              >
                <PaletteIcon />
              </button>
              <button
                className={`${styles.tool} ${openPanel === "paper" ? styles.toolActive : ""}`}
                onClick={() => setOpenPanel(openPanel === "paper" ? null : "paper")}
                aria-label="용지"
              >
                <FrameIcon />
              </button>

              <button className={styles.downloadBtn} onClick={handleDownload} disabled={downloading} aria-label="이미지로 저장">
                {downloading ? "⋯" : <DownloadIcon size={19} />}
              </button>
              <ShareMenu mode={rollpaper.mode as RollpaperMode} onOpenShare={handleOpenShare} canOrder={isOwner} onOrder={openOrder} variant="rail" />
          </div>
        )}

        <CanvasBoard
          rollpaperId={rollpaperId}
          rollpaper={rollpaper}
          updateNote={updateNote}
          moveNote={moveNote}
          resizeNote={resizeNote}
          deleteNote={deleteNote}
          canvasRef={canvasExportRef}
          readOnly={recipientView}
          paperSize={paperSize}
        />

        {!recipientView && openPanel !== null && (
          <div className={styles.modalBackdrop} onClick={() => setOpenPanel(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              {openPanel === "write" && (
                <WritePanel mode={rollpaper.mode as RollpaperMode} onSubmit={addNote} onDone={() => setOpenPanel(null)} />
              )}
              {openPanel === "sticker" && <StickerPanel onSubmit={addNote} />}
              {openPanel === "bg" && <BgColorPanel current={rollpaper.bgColor} onPick={updateBgColor} />}
              {openPanel === "paper" && <PaperSizePanel value={paperSize} onPick={setPaperSize} />}
              {openPanel === "order" && <OrderPanel
                  rollpaperId={rollpaperId}
                  onDone={() => setOpenPanel(null)}
                  getCanvas={() => {
                    const r = canvasExportRef.current?.getBoundingClientRect();
                    return r ? { width: r.width, height: r.height, paperSize } : null;
                  }}
                />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
