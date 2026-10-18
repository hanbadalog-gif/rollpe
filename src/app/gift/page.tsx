import { redirect } from "next/navigation";

// 무드등은 이 사이트에서 따로 작성하지 않는다 — 온라인 롤링페이퍼를 완성한 뒤 "제작 요청"으로 보내고,
// 제작은 별도 시스템에서 진행. 예전 링크(/gift)로 들어와도 온라인 롤링페이퍼 만들기로 안내한다.
export default function GiftPage() {
  redirect("/new");
}
