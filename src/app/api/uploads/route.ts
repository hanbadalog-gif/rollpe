// POST /api/uploads — presigned URL 발급 (TRD §5 "클라이언트 직접 업로드")
// 스토리지 벤더(Supabase Storage / Cloudflare R2) 선택은 TRD §1 "TRD 상 결정 필요" 항목 —
// 여기서는 어댑터 인터페이스만 정의해두고, 실제 SDK 연동은 벤더 확정 후 구현.
import { NextRequest, NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB (PRD §10#6 제안값)
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  } | null;

  if (!body?.fileName || !body.mimeType) {
    return NextResponse.json(
      { code: "INVALID_BODY", message: "fileName, mimeType은 필수입니다." },
      { status: 400 },
    );
  }

  if (!ALLOWED_MIME.includes(body.mimeType)) {
    return NextResponse.json(
      { code: "INVALID_MIME", message: "지원하지 않는 이미지 형식입니다." },
      { status: 400 },
    );
  }

  if (body.fileSize != null && body.fileSize > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { code: "FILE_TOO_LARGE", message: "5MB 이하 이미지만 업로드할 수 있어요." },
      { status: 400 },
    );
  }

  // TODO(스토리지 벤더 확정 후): 실제 presigned URL 발급 로직으로 교체
  // 예: Supabase Storage의 createSignedUploadUrl() 또는 R2 S3 호환 presignPutObject()
  return NextResponse.json(
    {
      code: "NOT_IMPLEMENTED",
      message:
        "스토리지 벤더 확정 전입니다 (TRD §1 미결정 항목). 벤더 선택 후 presigned URL 발급 로직을 연결하세요.",
    },
    { status: 501 },
  );
}
