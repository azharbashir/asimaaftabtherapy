import 'server-only';
import {createPool} from 'mysql2/promise';
import {drizzle} from 'drizzle-orm/mysql2';
import {databaseConfig} from '../lib/database-config.mjs';
import * as schema from './schema';
const createDatabase=()=>drizzle(createPool({...databaseConfig(),connectionLimit:5,waitForConnections:true,queueLimit:50}),{schema,mode:'default'});
const globalDatabase=globalThis as typeof globalThis & {practiceDatabase?:ReturnType<typeof createDatabase>};
export function getDb(){return globalDatabase.practiceDatabase??=createDatabase();}
