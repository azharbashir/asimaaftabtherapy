import {mysqlTable,varchar,text,longtext,int,index} from 'drizzle-orm/mysql-core';
const id=()=>varchar('id',{length:64}).primaryKey();
const timestamp=(name:string)=>varchar(name,{length:30}).notNull();
export const content=mysqlTable('content',{id:id(),value:longtext('value').notNull()});
export const appointments=mysqlTable('appointments',{id:id(),name:varchar('name',{length:120}).notNull(),email:varchar('email',{length:254}).notNull(),phone:varchar('phone',{length:40}),sessionType:varchar('session_type',{length:80}),message:text('message'),service:varchar('service',{length:120}).notNull(),date:varchar('date',{length:10}).notNull(),timezone:varchar('timezone',{length:100}).notNull(),status:varchar('status',{length:20}).notNull().default('New'),createdAt:timestamp('created_at')});
export const images=mysqlTable('images',{id:id(),mime:varchar('mime',{length:80}).notNull(),data:longtext('data').notNull(),createdAt:timestamp('created_at')});
export const users=mysqlTable('users',{id:id(),authId:varchar('auth_id',{length:254}).unique(),passwordHash:varchar('password_hash',{length:255}),name:varchar('name',{length:120}).notNull(),email:varchar('email',{length:254}).notNull().unique(),role:varchar('role',{length:20,enum:['admin','manager','user']}).notNull().default('user'),createdAt:timestamp('created_at')});
export const sessions=mysqlTable('sessions',{id:id(),userId:varchar('user_id',{length:64}).notNull().references(()=>users.id,{onDelete:'cascade'}),expiresAt:timestamp('expires_at')},table=>[index('sessions_user_id_idx').on(table.userId)]);
export const loginAttempts=mysqlTable('login_attempts',{email:varchar('email',{length:254}).primaryKey(),count:int('count').notNull(),resetAt:timestamp('reset_at')});
