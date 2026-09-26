import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const campaigns=sqliteTable('campaigns',{id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),title:text('title').notNull(),data:text('data').notNull(),version:integer('version').notNull().default(1),updatedAt:text('updated_at').notNull()},t=>[index('campaigns_owner_updated').on(t.ownerId,t.updatedAt)]);
export const usage=sqliteTable('usage',{id:text('id').primaryKey(),count:integer('count').notNull().default(0)});
