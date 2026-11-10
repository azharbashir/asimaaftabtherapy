import nextEnv from '@next/env';
import {createClient} from '@libsql/client';
import {drizzle} from 'drizzle-orm/libsql';
import {migrate} from 'drizzle-orm/libsql/migrator';
import {databaseConfig} from '../lib/database-config.mjs';
import {hashPassword} from '../lib/password-core.mjs';
const production=process.env.NODE_ENV==='production'||process.env.npm_lifecycle_event==='build';
nextEnv.loadEnvConfig(process.cwd(),!production);
if(production){
 if(!process.env.DATABASE_URL)throw Error('Set DATABASE_URL before production builds.');
 if(!process.env.APP_URL)throw Error('Set APP_URL to your HTTPS website origin.');
 const url=new URL(process.env.APP_URL);
 if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw Error('APP_URL must use HTTPS in production.');
 if(url.pathname!=='/'||url.search||url.hash)throw Error('APP_URL must be an origin, such as https://yourdomain.com.');
}
const client=createClient(databaseConfig());
try{
 await client.execute('PRAGMA foreign_keys = ON');
 await migrate(drizzle(client),{migrationsFolder:'./migrations'});
 const admin=await client.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
 if(!admin.rows.length){
  const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
  if(!email||!email.includes('@')||email.length>254||!password||password.length<12||password.length>256)throw Error('For the first setup, set ADMIN_EMAIL and ADMIN_PASSWORD (12–256 characters).');
  const id=crypto.randomUUID();
  await client.execute({sql:'INSERT INTO users (id,name,email,role,created_at,password_hash) VALUES (?,?,?,?,?,?)',args:[id,process.env.ADMIN_NAME||'Practice administrator',email,'admin',new Date().toISOString(),await hashPassword(password)]});
  console.log('Initial administrator created.');
 }
 console.log('Database migrations complete.');
}finally{client.close();}
