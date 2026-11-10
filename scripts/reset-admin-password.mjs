import nextEnv from '@next/env';
import {createClient} from '@libsql/client';
import {databaseConfig} from '../lib/database-config.mjs';
import {hashPassword} from '../lib/password-core.mjs';
nextEnv.loadEnvConfig(process.cwd(),process.env.NODE_ENV!=='production');
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
if(!email||!password||password.length<12||password.length>256)throw Error('Set ADMIN_EMAIL and a new ADMIN_PASSWORD of 12–256 characters in your private environment.');
const client=createClient(databaseConfig());
try{
 const transaction=await client.transaction('write');
 try{
  const account=await transaction.execute({sql:"SELECT id FROM users WHERE email=? AND role='admin'",args:[email]});
  if(!account.rows.length)throw Error('No administrator matches ADMIN_EMAIL.');
  const id=account.rows[0].id;
  await transaction.execute({sql:'UPDATE users SET password_hash=? WHERE id=?',args:[await hashPassword(password),id]});
  await transaction.execute({sql:'DELETE FROM sessions WHERE user_id=?',args:[id]});
  await transaction.commit();
  console.log('Administrator password updated; existing sessions revoked.');
 }catch(error){await transaction.rollback();throw error;}finally{transaction.close();}
}finally{client.close();}
