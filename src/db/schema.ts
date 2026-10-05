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
