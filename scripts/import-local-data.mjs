import nextEnv from '@next/env';
import {createClient} from '@libsql/client';
import {drizzle} from 'drizzle-orm/libsql';
import {migrate} from 'drizzle-orm/libsql/migrator';
import {databaseConfig} from '../lib/database-config.mjs';
nextEnv.loadEnvConfig(process.cwd(),true);
const sourceUrl=process.env.SOURCE_DATABASE_URL;
if(!sourceUrl?.startsWith('file:'))throw Error('Set SOURCE_DATABASE_URL to the local SQLite file to import.');
const config=databaseConfig();
if(config.url===sourceUrl)throw Error('Source and destination must be different databases.');
const source=createClient({url:sourceUrl}),destination=createClient(config);
try{
 await migrate(drizzle(destination),{migrationsFolder:'./migrations'});
 const columns={content:['id','value'],appointments:['id','name','email','phone','session_type','message','service','date','timezone','status','created_at'],images:['id','mime','data','created_at'],users:['id','name','email','role','created_at','password_hash']};
 const transaction=await destination.transaction('write');
 try{
  for(const [table,fields] of Object.entries(columns)){
   const rows=await source.execute(`SELECT ${fields.join(',')} FROM ${table}`);
   let imported=0;
   for(const row of rows.rows){
    // Preserve already-configured users, content and bookings on repeated imports.
    const result=await transaction.execute({sql:`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(()=>'?').join(',')}) ON CONFLICT DO NOTHING`,args:fields.map(field=>row[field]??null)});
    imported+=result.rowsAffected;
   }
   console.log(`${table}: ${imported} records imported; existing records preserved.`);
  }
  await transaction.commit();
 }catch(error){await transaction.rollback();throw error;}finally{transaction.close();}
 console.log('Import complete. Existing destination accounts keep their passwords. Sessions were not imported.');
}finally{source.close();destination.close();}
