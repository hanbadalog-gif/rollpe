// 관리자(/admin) 로그인 정보 — 서버 전용 파일. 로그인 API(app/api/admin/enter)에서만 가져다 쓴다.
// 비밀번호 평문은 코드에 두지 않고 해시만 둔다 (저장소가 노출돼도 비밀번호가 바로 드러나지 않게).
//
// ▶ 비밀번호 바꾸는 법
//   1) 터미널에서  node scripts/make-admin-hash.mjs "새 비밀번호"  실행
//   2) 출력된 한 줄(scrypt$...)을 아래 ADMIN_PASSWORD_HASH 에 붙여넣기
//   3) 배포 (vercel --prod)
// ▶ 아이디를 바꾸려면 ADMIN_ID 값을 수정하고 배포.
import { scryptSync, timingSafeEqual } from "node:crypto";

if (typeof window !== "undefined") throw new Error("adminCredentials는 서버에서만 사용할 수 있습니다.");

export const ADMIN_ID = "glimory";
const ADMIN_PASSWORD_HASH = "scrypt$3189c5bdac9d627bec8d7e8124b836c4$ffa77e4faa6a22772f14440ca8631b68fba6028f28c514b74692c78e4c03ff98";

/** 아이디·비밀번호 확인 — 항상 둘 다 계산하고 시간차 비교(timingSafeEqual)로 어느 쪽이 틀렸는지 알 수 없게 한다 */
export function verifyAdmin(id: string, password: string): boolean {
  const [, saltHex, hashHex] = ADMIN_PASSWORD_HASH.split("$");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  const passwordOk = timingSafeEqual(actual, expected);

  const a = Buffer.alloc(64);
  const b = Buffer.alloc(64);
  a.write(id.slice(0, 64));
  b.write(ADMIN_ID);
  const idOk = timingSafeEqual(a, b);

  return passwordOk && idOk;
}
