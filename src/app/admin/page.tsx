import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";
import { AdminEntryForm } from "./AdminEntryForm";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminHomePage() {
  const ok = await isAdmin();
  if (!ok) return <AdminLoginForm />;

  const rows = await db
    .select({
      id: orders.id,
      rollpaperId: orders.rollpaperId,
      contactName: orders.contactName,
      contact: orders.contact,
      memo: orders.memo,
      status: orders.status,
      createdAt: orders.createdAt,
      toName: sql<string>`${orders.snapshot}->>'toName'`,
      noteCount: sql<number>`jsonb_array_length(${orders.snapshot}->'notes')`,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt));

  return (
    <>
      <AdminEntryForm />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 80px", fontSize: 13 }}>
        <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>무드등 제작 요청 ({rows.length})</h2>
        {rows.length > 0 && (
          <a href="/api/admin/orders" download style={{ display: "inline-block", marginBottom: 14, color: "#6c7fb7", fontWeight: 700 }}>
            ⬇ 전체 JSON 받기
          </a>
        )}
        {rows.map((r) => (
          <div key={r.id} style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: "12px 14px", marginBottom: 10, lineHeight: 1.7 }}>
            <b>To. {r.toName}</b> · 메모 {r.noteCount}개 · {r.status}
            <div>
              {r.contactName} / {r.contact}
              {r.memo ? ` / ${r.memo}` : ""}
            </div>
            <div style={{ color: "#767676" }}>{r.createdAt.toLocaleString("ko-KR")}</div>
            <a href={`/api/admin/orders/${r.id}`} download style={{ color: "#6c7fb7", fontWeight: 700, marginRight: 12 }}>
              ⬇ JSON
            </a>
            <a href={`/admin/${r.rollpaperId}`} style={{ color: "#6c7fb7" }}>
              문구 보기
            </a>
          </div>
        ))}
        {rows.length === 0 && <p style={{ color: "#767676" }}>아직 제작 요청이 없어요.</p>}
      </div>
    </>
  );
}
