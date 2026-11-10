import nextEnv from '@next/env';
import {createConnection} from 'mysql2/promise';
import {drizzle} from 'drizzle-orm/mysql2';
import {migrate} from 'drizzle-orm/mysql2/migrator';
import {databaseConfig} from '../lib/database-config.mjs';
import {hashPassword} from '../lib/password-core.mjs';
nextEnv.loadEnvConfig(process.cwd(),process.env.NODE_ENV!=='production');
if(process.env.NODE_ENV==='production'){
 if(!process.env.APP_URL)throw Error('Set APP_URL to your HTTPS website origin.');
 const url=new URL(process.env.APP_URL);
 if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw Error('APP_URL must use HTTPS in production.');
 if(url.pathname!=='/'||url.search||url.hash)throw Error('APP_URL must be an origin, such as https://asimaaftabtherapy.com.');
}
const client=await createConnection(databaseConfig());
let locked=false;
try{
 // MySQL DDL commits implicitly. Serialize startup migrations and administrator bootstrap.
 const [[lock]]=await client.query("SELECT GET_LOCK(SHA2(CONCAT('practice:',DATABASE()),256),60) AS acquired");
 if(Number(lock.acquired)!==1)throw Error('Could not acquire the database migration lock.');
 locked=true;
 await migrate(drizzle(client),{migrationsFolder:'./migrations/mysql'});
 const [admin]=await client.execute("SELECT id FROM users WHERE role='admin' LIMIT 1");
 if(!admin.length){
  const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
  if(!email||!email.includes('@')||email.length>254||!password||password.length<12||password.length>256)throw Error('For the first setup, set ADMIN_EMAIL and ADMIN_PASSWORD (12–256 characters).');
  await client.execute('INSERT INTO users (id,name,email,role,created_at,password_hash) VALUES (?,?,?,?,?,?)',[crypto.randomUUID(),process.env.ADMIN_NAME||'Practice administrator',email,'admin',new Date().toISOString(),await hashPassword(password)]);
  console.log('Initial administrator created.');
 }
 console.log('Database migrations complete.');
}finally{
 if(locked)await client.query("SELECT RELEASE_LOCK(SHA2(CONCAT('practice:',DATABASE()),256))");
 await client.end();
}
