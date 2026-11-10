import 'server-only';
import {createClient} from '@libsql/client';
import {drizzle} from 'drizzle-orm/libsql';
import {databaseConfig} from '../lib/database-config.mjs';
import * as schema from './schema';
let database:ReturnType<typeof drizzle<typeof schema>>|undefined;
export function getDb(){
 if(!database)database=drizzle(createClient(databaseConfig()),{schema});
 return database;
}
