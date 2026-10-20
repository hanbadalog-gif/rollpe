// ROLLPE by GLIMORY — Drizzle 스키마
// 출처: ROLLPE_TRD.md §2 데이터 모델
// user_id / owner_user_id는 2순위 로그인 연동 대비 선반영 컬럼 — 현재는 항상 null (TRD §5-1)

import {
  pgTable,
  uuid,
  text,
  real,
  boolean,
  timestamp,
  pgEnum,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const rollpaperModeEnum = pgEnum("rollpaper_mode", [
  "online",
  "mood_a",
  "mood_b_8",
  "mood_b_a4",
]);

export const noteTypeEnum = pgEnum("note_type", ["text", "sticker", "photo"]);

export const rollpapers = pgTable("rollpapers", {
  id: uuid("id").primaryKey().defaultRandom(),
  toName: text("to_name").notNull(),
  mode: rollpaperModeEnum("mode").notNull().default("online"),
  bgColor: text("bg_color"),
  ownerToken: text("owner_token").notNull(), // 방장 식별용 (비로그인)
  ownerUserId: uuid("owner_user_id"), // nullable — 로그인 연동 전까지 항상 null
  finishedAt: timestamp("finished_at"), // 방장이 "완성"을 누른 시각 — 값이 있으면 작성/수정이 잠김, 방장이 다시 열면 null
  // 무드등 고정 레이아웃 칸(제목/사진/사진 아래 문구/라벨) 내용 — { title?, photoUrl?, caption?, label? }
  fixedFields: jsonb("fixed_fields"),
  orderStatus: text("order_status"), // nullable — 2순위(글리모리) 제작 상태
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rollpaperId: uuid("rollpaper_id")
      .notNull()
      .references(() => rollpapers.id, { onDelete: "cascade" }),

    type: noteTypeEnum("type").notNull().default("text"),
    fromName: text("from_name"),
    content: text("content"),
    font: text("font"),
    fontSize: real("font_size"),
    bold: boolean("bold").notNull().default(false),
    textColor: text("text_color"),
    bgColor: text("bg_color"),
    borderColor: text("border_color"),
    photoUrl: text("photo_url"),

    posX: real("pos_x").notNull().default(10), // % 기준, 0~100
    posY: real("pos_y").notNull().default(10), // % 기준, 0~100
    rotation: real("rotation").notNull().default(0),
    scale: real("scale").notNull().default(1), // 꼭짓점 드래그 리사이즈 (0.6~2.2)
    width: real("width"), // 메모 폭 — 캔버스 폭 대비 %, null이면 기본 폭 (옆으로 늘리기)
    height: real("height"), // 메모 최소 높이 — 캔버스 높이 대비 %, null이면 글 길이에 맞춤 (위·아래로 늘리기)
    z: real("z").notNull().default(0), // 겹침 순서 — 클수록 위. 실수라 "앞으로/뒤로"는 이웃 사이 중간값으로 끼워 넣음

    editToken: text("edit_token").notNull(), // 작성자 본인 식별용 (비로그인)
    userId: uuid("user_id"), // nullable — 로그인 연동 전까지 항상 null

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("notes_rollpaper_id_idx").on(table.rollpaperId)],
);

// 1순위 범위: 신고 접수만 기록 (TRD §5 "신고 기능")
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  rollpaperId: uuid("rollpaper_id").notNull(),
  noteId: uuid("note_id"),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 무드등 제작 요청 — 요청 시점의 문구/배치를 snapshot 으로 고정해 이후 수정과 무관하게 제작
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  rollpaperId: uuid("rollpaper_id")
    .notNull()
    .unique() // 롤링페이퍼당 요청 1건 (재요청은 status=requested 일 때만 덮어씀)
    .references(() => rollpapers.id, { onDelete: "cascade" }),
  contactName: text("contact_name").notNull(),
  contact: text("contact").notNull(), // 전화/카톡ID/이메일 자유 입력
  memo: text("memo"),
  status: text("status").notNull().default("requested"), // requested → in_progress → shipped
  snapshot: jsonb("snapshot").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rollpapersRelations = relations(rollpapers, ({ many }) => ({
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  rollpaper: one(rollpapers, {
    fields: [notes.rollpaperId],
    references: [rollpapers.id],
  }),
}));

export type Rollpaper = typeof rollpapers.$inferSelect;
export type NewRollpaper = typeof rollpapers.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
