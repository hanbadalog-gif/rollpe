// POST /api/rollpapers — 롤링페이퍼 생성 (TRD §3, epics.md Story 2.1 / 6.1)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rollpapers } from "@/db/schema";
import { generateToken } from "@/lib/tokens";
import type { RollpaperMode } from "@/lib/theme";

const VALID_MODES: RollpaperMode[] = ["online", "mood_a", "mood_b_8", "mood_b_a4"];

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    toName?: string;
    mode?: string;
  } | null;

  if (!body?.toName || typeof body.toName !== "string") {
    return NextResponse.json(
      { code: "INVALID_TO_NAME", message: "toName은 필수입니다." },
      { status: 400 },
    );
  }

  const mode = (body.mode ?? "online") as string;
  if (!VALID_MODES.includes(mode as RollpaperMode)) {
    return NextResponse.json(
      { code: "INVALID_MODE", message: "유효하지 않은 모드입니다." },
      { status: 400 },
    );
  }

  const ownerToken = generateToken();

  const [rollpaper] = await db
    .insert(rollpapers)
    .values({
      toName: body.toName,
      mode: mode as RollpaperMode,
      ownerToken,
    })
    .returning({ id: rollpapers.id });

  return NextResponse.json({ id: rollpaper.id, ownerToken }, { status: 201 });
}
