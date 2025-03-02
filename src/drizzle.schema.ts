import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


export const user = pgTable('user', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	email: varchar('email').notNull().unique(),
	password: varchar('password').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});


export const userRelations = relations(user, ({ many }) => ({
	chats: many(chat),
	messages: many(message),
}));


export const model = pgTable('model', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
	slug: varchar('slug').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});


export const chat = pgTable('chat', {
	id: varchar('id').primaryKey(),
	userID: varchar('user_id').references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	title: varchar('title').default('New Chat'),
	modelID: varchar('model_id').references(() => model.id, { onDelete: 'set null', onUpdate: 'cascade' }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});


export const chatRelations = relations(chat, ({ one, many }) => ({
	messages: many(message),
	user: one(user, {
		fields: [chat.userID],
		references: [user.id]
	}),
	model: one(model, {
		fields: [chat.modelID],
		references: [model.id]
	})
}));


export const message = pgTable('message', {
	id: varchar('id').primaryKey(),
	chatID: varchar('chat_id').references(() => chat.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	userID: varchar('user_id').references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	role: text('role', { enum: ['user', 'assistant'] }).notNull(),
	content: text('content').notNull(),
	isMessageFinished: boolean('is_message_finished').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const messageRelations = relations(message, ({ one }) => ({
	chat: one(chat, {
		fields: [message.chatID],
		references: [chat.id]
	}),
	user: one(user, {
		fields: [message.userID],
		references: [user.id]
	})
}));
