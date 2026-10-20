// 관리자 비밀번호 해시 만들기 — 사용법:  node scripts/make-admin-hash.mjs "새 비밀번호"
// 출력된 한 줄을 src/lib/adminCredentials.ts 의 ADMIN_PASSWORD_HASH 에 붙여넣고 배포하면 비밀번호가 바뀐다.
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('사용법: node scripts/make-admin-hash.mjs "새 비밀번호"');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32);
console.log(`scrypt$${salt.toString("hex")}$${hash.toString("hex")}`);
