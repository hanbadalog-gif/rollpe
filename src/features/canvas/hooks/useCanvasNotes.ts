"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { gridPosition } from "@/lib/gridPosition";
import { MODE_CONFIG, type RollpaperMode } from "@/lib/theme";
import { showToast } from "@/components/Toast";
import { getEditToken, saveEditToken, removeEditToken, getOwnerToken } from "@/lib/editToken";
import type { CreateNoteInput, FixedFields, NoteDTO, RollpaperDTO } from "../types";

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
  const latest = useRef<RollpaperDTO | null>(null); // addNote가 현재 메모 목록을 동기적으로 읽기 위함

  useEffect(() => {
    latest.current = rollpaper;
  }, [rollpaper]);

  // 내가 바꾼 값(크기/위치 등)을 폴링 응답이 옛 값으로 되돌리지 못하게 막는 장치
  const mutating = useRef(0); // 저장 중인 내 변경 수
  const lastMutationAt = useRef(0);

  const refresh = useCallback(async (force = false) => {
    const startedAt = Date.now();
    try {
      const data = await api.get<RollpaperDTO>(`/api/rollpapers/${rollpaperId}`);
      // 조회를 시작한 뒤 내 변경이 있었거나 아직 저장 중이면, 이 응답은 변경 이전 상태라 버린다 (force: 저장 실패 되돌리기)
      if (!force && (mutating.current > 0 || lastMutationAt.current > startedAt)) return;
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

  // 낙관적 추가 — 누르는 즉시 임시 메모를 보여주고(위치도 서버와 같은 규칙으로 계산해 같이 보냄),
  // 서버 저장은 뒤에서. 성공하면 임시 메모를 진짜 메모로 바꾸고, 실패하면 지우고 안내한다.
  const addNote = useCallback(
    async (input: CreateNoteInput) => {
      const tempId = `tmp-${Math.random().toString(36).slice(2)}`;
      const current = latest.current?.notes ?? [];
      const auto = gridPosition(current.length, latest.current ? MODE_CONFIG[latest.current.mode as RollpaperMode].slots : undefined);
      const sent: CreateNoteInput = {
        ...input,
        posX: input.posX ?? auto.posX,
        posY: input.posY ?? auto.posY,
        rotation: input.rotation ?? auto.rotation,
      };
      const temp: NoteDTO = {
        id: tempId,
        rollpaperId,
        type: sent.type,
        fromName: sent.fromName ?? null,
        content: sent.content ?? null,
        font: sent.font ?? null,
        fontSize: sent.fontSize ?? null,
        bold: sent.bold ?? false,
        textColor: sent.textColor ?? null,
        bgColor: sent.bgColor ?? null,
        borderColor: sent.borderColor ?? null,
        photoUrl: sent.photoUrl ?? null,
        posX: sent.posX!,
        posY: sent.posY!,
        rotation: sent.rotation!,
        scale: sent.scale ?? 1,
        width: sent.width ?? null,
        height: sent.height ?? null,
        z: Math.max(0, ...current.map((n) => n.z)) + 1,
        createdAt: new Date().toISOString(),
      };
      setRollpaper((prev) => (prev ? { ...prev, notes: [...prev.notes, temp] } : prev));
      api
        .post<NoteDTO & { editToken: string }>(`/api/rollpapers/${rollpaperId}/notes`, sent)
        .then((note) => {
          saveEditToken(rollpaperId, note.id, note.editToken);
          // 폴링이 먼저 진짜 메모를 가져왔어도 중복되지 않게 id로 정리
          setRollpaper((prev) =>
            prev ? { ...prev, notes: [...prev.notes.filter((n) => n.id !== tempId && n.id !== note.id), note] } : prev,
          );
        })
        .catch((err) => {
          setRollpaper((prev) => (prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== tempId) } : prev));
          showToast(
            err instanceof ApiError && err.code === "CAPACITY_FULL"
              ? "정원이 다 찼어요"
              : "추가하지 못했어요. 잠시 후 다시 시도해주세요.",
          );
        });
    },
    [rollpaperId],
  );

  // 낙관적 업데이트 — 서버 응답을 기다리지 않고 화면부터 바꾸고, 실패하면 서버 상태로 되돌린다
  const updateNote = useCallback(
    async (noteId: string, patch: Partial<CreateNoteInput>) => {
      const token = getEditToken(rollpaperId, noteId);
      if (!token) throw new Error("NO_EDIT_TOKEN");
      setRollpaper((prev) =>
        prev ? { ...prev, notes: prev.notes.map((n) => (n.id === noteId ? { ...n, ...patch } : n)) } : prev,
      );
      try {
        await api.patch(`/api/rollpapers/${rollpaperId}/notes/${noteId}`, patch, { "x-edit-token": token });
      } catch (err) {
        await refresh(true);
        throw err;
      }
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
        await refresh(true); // 저장 실패 시 서버 상태로 되돌림
      }
    },
    [rollpaperId, refresh],
  );

  const resizeNote = useCallback(
    async (noteId: string, scale: number) => {
      const token = getEditToken(rollpaperId, noteId);
      if (!token) return; // moveNote와 동일하게 — 내 글이 아니면 조용히 무시(드래그가 스냅백됨)
      setRollpaper((prev) =>
        prev
          ? { ...prev, notes: prev.notes.map((n) => (n.id === noteId ? { ...n, scale } : n)) }
          : prev,
      );
      try {
        await api.patch(`/api/rollpapers/${rollpaperId}/notes/${noteId}`, { scale }, { "x-edit-token": token });
      } catch {
        await refresh(true);
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
        await refresh(true);
        throw new Error("BG_UPDATE_FAILED");
      }
    },
    [rollpaperId, refresh],
  );

  // 무드등 고정 칸 입력 — 방장만. 빈 문자열이면 칸을 비운다
  const updateFixed = useCallback(
    async (patch: FixedFields) => {
      const token = getOwnerToken(rollpaperId);
      if (!token) throw new Error("NO_OWNER_TOKEN");
      try {
        const updated = await api.patch<{ fixedFields: FixedFields | null }>(`/api/rollpapers/${rollpaperId}`, { fixedFields: patch }, { "x-owner-token": token });
        setRollpaper((prev) => (prev ? { ...prev, fixedFields: updated.fixedFields } : prev));
      } catch (e) {
        await refresh(true);
        throw e;
      }
    },
    [rollpaperId, refresh],
  );

  // 완성/다시 열기 — 방장만. 화면부터 바꾸고 실패하면 서버 상태로 되돌림
  const setFinished = useCallback(
    async (finished: boolean) => {
      const token = getOwnerToken(rollpaperId);
      if (!token) throw new Error("NO_OWNER_TOKEN");
      setRollpaper((prev) => (prev ? { ...prev, finishedAt: finished ? new Date().toISOString() : null } : prev));
      try {
        await api.patch(`/api/rollpapers/${rollpaperId}`, { finished }, { "x-owner-token": token });
      } catch (err) {
        await refresh(true);
        throw err;
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
      setRollpaper((prev) => (prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== noteId) } : prev));
      try {
        await api.delete(`/api/rollpapers/${rollpaperId}/notes/${noteId}`, headers);
      } catch (err) {
        await refresh(true);
        throw err;
      }
      removeEditToken(rollpaperId, noteId);
    },
    [rollpaperId, refresh],
  );

  const canEdit = useCallback(
    (noteId: string) => getEditToken(rollpaperId, noteId) != null,
    [rollpaperId],
  );

  const track =
    <A extends unknown[], R>(fn: (...args: A) => Promise<R>) =>
    async (...args: A): Promise<R> => {
      mutating.current++;
      lastMutationAt.current = Date.now();
      try {
        return await fn(...args);
      } finally {
        mutating.current--;
        lastMutationAt.current = Date.now();
      }
    };

  return {
    rollpaper,
    loading,
    error,
    addNote: track(addNote),
    updateNote: track(updateNote),
    moveNote: track(moveNote),
    resizeNote: track(resizeNote),
    deleteNote: track(deleteNote),
    updateBgColor: track(updateBgColor),
    updateFixed: track(updateFixed),
    setFinished: track(setFinished),
    canEdit,
    refresh,
  };
}
