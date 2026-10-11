import { isAdmin } from "@/lib/adminAuth";
import { AdminEntryForm } from "./AdminEntryForm";

export default async function AdminHomePage() {
  const ok = await isAdmin();
  if (!ok) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#767676", fontSize: 13 }}>
        접근 권한이 없어요. 전달받은 관리자 링크로 다시 들어와주세요.
      </div>
    );
  }
  return <AdminEntryForm />;
}
