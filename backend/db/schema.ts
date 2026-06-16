import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Minimal schema to bootstrap the project.
// Full schema will be implemented based on database_schema.md
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  created_at: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
});
