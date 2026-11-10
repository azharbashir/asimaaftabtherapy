import nextEnv from '@next/env';
import {createClient} from '@libsql/client';
import {createConnection} from 'mysql2/promise';
import {databaseConfig} from '../lib/database-config.mjs';
nextEnv.loadEnvConfig(process.cwd(),true);
const sourceUrl=process.env.SOURCE_DATABASE_URL;
if(!sourceUrl?.startsWith('file:'))throw Error('Set SOURCE_DATABASE_URL to the local SQLite file to import.');
const source=createClient({url:sourceUrl}),destination=await createConnection(databaseConfig());
try{
 // Run db:setup on the destination first. Never copy sessions or migration history.
 const columns={content:['id','value'],appointments:['id','name','email','phone','session_type','message','service','date','timezone','status','created_at'],images:['id','mime','data','created_at'],users:['id','name','email','role','created_at','password_hash']};
 await destination.beginTransaction();
 for(const [table,fields] of Object.entries(columns)){
  const rows=await source.execute(`SELECT ${fields.join(',')} FROM ${table}`);
  let imported=0;
  for(const row of rows.rows){
   try{
    await destination.execute(`INSERT INTO \`${table}\` (${fields.map(f=>'`'+f+'`').join(',')}) VALUES (${fields.map(()=>'?').join(',')})`,fields.map(field=>row[field]??null));
    imported++;
   }catch(error){if(error.code!=='ER_DUP_ENTRY')throw error;}
  }
  console.log(`${table}: ${imported} records imported; existing records preserved.`);
 }
 await destination.commit();
 console.log('Import complete. Existing destination accounts keep their passwords. Sessions were not imported.');
}catch(error){await destination.rollback();throw error;}finally{source.close();await destination.end();}
