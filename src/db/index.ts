import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Supabase 커넥션 풀링 사용 시 필수 (supabase-nextjs 스킬 권장)
});

export const db = drizzle(client, { schema });
