import { MyRollpapers } from "@/features/rollpaper-create/components/MyRollpapers";

// "롤링페이퍼 무드등 선물하기"로 만든 목록 — 일반 롤링페이퍼는 /my
export default function MyGiftPage() {
  return <MyRollpapers kind="gift" />;
}
