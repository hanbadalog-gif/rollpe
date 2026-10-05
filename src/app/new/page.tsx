import { ToInputForm } from "@/features/rollpaper-create/components/ToInputForm";
import { CorkPage } from "@/components/CorkPage";

export default function NewRollpaperPage() {
  return (
    <CorkPage title="롤링페이퍼 만들기">
      <ToInputForm />
    </CorkPage>
  );
}
