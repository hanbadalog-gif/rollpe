"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { getEditToken, saveEditToken, removeEditToken, getOwnerToken } from "@/lib/editToken";
import type { CreateNoteInput, NoteDTO, RollpaperDTO } from "../types";

const POLL_INTERVAL_MS = 7000; // TRD §3 "5~10초 폴링으로 충분" (NFR3)

/**
 * 캔버스 코어 상태 관리 — 다른 feature 모듈(write-panel/stickers/share)은
 * 이 훅이 반환하는 함수만 가져다 쓰고, 캔버스 내부 구현은 몰라도 된다.
 * (TRD §4 "화살표는 항상 기능 모듈 → canvas 한 방향")
 */
export function useCanvasNotes(rollpaperId: string) {
  const [rollpaper, setRollpaper] = useState<RollpaperDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<RollpaperDTO>(`/api/rollpapers/${rollpaperId}`);
      setRollpaper(data);
      setError(null);
    } catch {
      setError("롤링페이퍼를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [rollpaperId]);

  useEffect(() => {
    // 마운트 시 1회 즉시 조회 + 폴링 — refresh 내부 setState는 fetch 완료 후 비동기로
    // 실행되므로 effect 본문에서 동기적으로 setState하는 것과는 다르지만, 린트 규칙이
    // 구분하지 못해 명시적으로 예외 처리한다 (React 공식 "fetch on mount" 패턴).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    pollTimer.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [refresh]);

  const addNote = useCallback(
    async (input: CreateNoteInput) => {
      const note = await api.post<NoteDTO & { editToken: string }>(
        `/api/rollpapers/${rollpaperId}/notes`,
        input,
      );
      saveEditToken(rollpaperId, note.id, note.editToken);
      await refresh();
      return note;
    },
    [rollpaperId, refresh],
  );

  const updateNote = useCallback(
    async (noteId: string, patch: Partial<CreateNoteInput>) => {
      const token = getEditToken(rollpaperId, noteId);
      if (!token) throw new Error("NO_EDIT_TOKEN");
      await api.patch(`/api/rollpapers/${rollpaperId}/notes/${noteId}`, patch, {
        "x-edit-token": token,
      });
      await refresh();
    },
    [rollpaperId, refresh],
  );

  const moveNote = useCallback(
    async (noteId: string, posX: number, posY: number, rotation?: number) => {
      const token = getEditToken(rollpaperId, noteId);
      if (!token) return; // 내 글이 아니면 드래그 자체를 UI에서 막음 — 조용히 무시
      // 낙관적 업데이트: 다음 폴링(최대 7초)을 기다리지 않고 드롭 즉시 화면에 반영
      setRollpaper((prev) =>
        prev
          ? {
              ...prev,
              notes: prev.notes.map((n) =>
                n.id === noteId ? { ...n, posX, posY, rotation: rotation ?? n.rotation } : n,
              ),
            }
          : prev,
      );
      try {
        await api.post(
          `/api/rollpapers/${rollpaperId}/notes/${noteId}/position`,
          { posX, posY, rotation },
          { "x-edit-token": token },
        );
      } catch {
        await refresh(); // 저장 실패 시 서버 상태로 되돌림
      }
    },
    [rollpaperId, refresh],
  );

  const updateBgColor = useCallback(
    async (bgColor: string) => {
      const token = getOwnerToken(rollpaperId);
      if (!token) throw new Error("NO_OWNER_TOKEN");
      setRollpaper((prev) => (prev ? { ...prev, bgColor } : prev));
      try {
        await api.patch(`/api/rollpapers/${rollpaperId}`, { bgColor }, { "x-owner-token": token });
      } catch {
        await refresh();
        throw new Error("BG_UPDATE_FAILED");
      }
    },
    [rollpaperId, refresh],
  );

  const deleteNote = useCallback(
    async (noteId: string, ownerToken?: string | null) => {
      const editTok = getEditToken(rollpaperId, noteId);
      const headers: Record<string, string> = {};
      if (editTok) headers["x-edit-token"] = editTok;
      if (ownerToken) headers["x-owner-token"] = ownerToken;
      await api.delete(`/api/rollpapers/${rollpaperId}/notes/${noteId}`, headers);
      removeEditToken(rollpaperId, noteId);
      await refresh();
    },
    [rollpaperId, refresh],
  );

  const canEdit = useCallback(
    (noteId: string) => getEditToken(rollpaperId, noteId) != null,
    [rollpaperId],
  );

  return { rollpaper, loading, error, addNote, updateNote, moveNote, deleteNote, updateBgColor, canEdit, refresh };
}
