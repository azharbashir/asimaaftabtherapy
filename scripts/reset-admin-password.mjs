import nextEnv from '@next/env';
import {createConnection} from 'mysql2/promise';
import {databaseConfig} from '../lib/database-config.mjs';
import {hashPassword} from '../lib/password-core.mjs';
nextEnv.loadEnvConfig(process.cwd(),process.env.NODE_ENV!=='production');
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
if(!email||!password||password.length<12||password.length>256)throw Error('Set ADMIN_EMAIL and a new ADMIN_PASSWORD of 12–256 characters in your private environment.');
const client=await createConnection(databaseConfig());
try{
 await client.beginTransaction();
 const [accounts]=await client.execute("SELECT id FROM users WHERE email=? AND role='admin' FOR UPDATE",[email]);
 if(!accounts.length)throw Error('No administrator matches ADMIN_EMAIL.');
 await client.execute('UPDATE users SET password_hash=? WHERE id=?',[await hashPassword(password),accounts[0].id]);
 await client.execute('DELETE FROM sessions WHERE user_id=?',[accounts[0].id]);
 await client.execute('DELETE FROM login_attempts WHERE email=?',[email]);
 await client.commit();
 console.log('Administrator password updated; existing sessions revoked.');
}catch(error){await client.rollback();throw error;}finally{await client.end();}
