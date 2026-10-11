// 다음 이벤트 날짜를 .ics 캘린더 파일로 저장 — 로그인/연락처 수집 없이 가능한 유일한 재접촉 장치
function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function downloadNextEventIcs(dateStr: string, toName: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return;
  const dt = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ROLLPE by GLIMORY//KO",
    "BEGIN:VEVENT",
    `UID:${stamp}-rollpe@rollpe-app.vercel.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt}`,
    `SUMMARY:${toName}에게 롤링페이퍼 만들어주기`,
    "DESCRIPTION:ROLLPE에서 다시 롤링페이퍼를 만들어보세요: https://rollpe-app.vercel.app/new",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rollpe-다음일정.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
