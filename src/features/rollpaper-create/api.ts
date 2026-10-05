import { api } from "@/lib/api-client";
import { saveOwnerToken } from "@/lib/editToken";
import type { RollpaperMode } from "@/lib/theme";

interface CreateResult {
  id: string;
  ownerToken: string;
}

/** POST /api/rollpapers — Epic 2 Story 2.1 / Epic 6 Story 6.1 공용 */
export async function createRollpaper(toName: string, mode: RollpaperMode = "online") {
  const result = await api.post<CreateResult>("/api/rollpapers", { toName, mode });
  saveOwnerToken(result.id, result.ownerToken);
  return result;
}
