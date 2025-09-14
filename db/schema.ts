import { pgTable, text, varchar, uuid, integer, timestamp, json, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const cityEnum = pgEnum("city", ["Chandigarh","Mohali","Zirakpur","Panchkula","Other"]);
export const propertyTypeEnum = pgEnum("propertyType", ["Apartment","Villa","Plot","Office","Retail"]);
export const bhkEnum = pgEnum("bhk", ["1","2","3","4","Studio"]);
export const purposeEnum = pgEnum("purpose", ["Buy","Rent"]);
export const timelineEnum = pgEnum("timeline", ["0-3m","3-6m",">6m","Exploring"]);
export const sourceEnum = pgEnum("source", ["Website","Referral","Walk-in","Call","Other"]);
export const statusEnum = pgEnum("status", ["New","Qualified","Contacted","Visited","Negotiation","Converted","Dropped"]);

export const buyers = pgTable('buyers', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('fullName', { length: 80 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 15 }).notNull(),
  city: cityEnum('city').notNull(),
  propertyType: propertyTypeEnum('propertyType').notNull(),
  bhk: bhkEnum('bhk'),
  purpose: purposeEnum('purpose').notNull(),
  budgetMin: integer('budgetMin'),
  budgetMax: integer('budgetMax'),
  timeline: timelineEnum('timeline').notNull(),
  source: sourceEnum('source').notNull(),
  notes: text('notes'),
  tags: text('tags').array(),
  status: statusEnum('status').default('New').notNull(),
  ownerId: uuid('ownerId').notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const buyerHistory = pgTable('buyer_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  buyerId: uuid('buyerId').notNull(),
  changedBy: uuid('changedBy').notNull(),
  changedAt: timestamp('changedAt').defaultNow().notNull(),
  diff: json('diff').notNull(),
});


