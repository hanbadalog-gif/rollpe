import { NextResponse } from "next/server";

/** 방장이 "완성"한 롤링페이퍼에 쓰기/수정/삭제가 들어왔을 때의 공통 응답 */
export const finishedResponse = () =>
  NextResponse.json(
    { code: "FINISHED", message: "완성된 롤링페이퍼예요. 방장이 다시 열면 수정할 수 있어요." },
    { status: 403 },
  );
