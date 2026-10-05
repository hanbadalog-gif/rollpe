import { randomBytes } from "crypto";

/** edit_token / owner_token 발급 — TRD §5 "32바이트 crypto.randomBytes" */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
