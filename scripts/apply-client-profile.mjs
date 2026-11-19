import nextEnv from '@next/env';
import {createConnection} from 'mysql2/promise';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {databaseConfig} from '../lib/database-config.mjs';

// Apply the supplied biography without replacing saved photos, services or contact details.
nextEnv.loadEnvConfig(process.cwd(),true);
let client;
try {
 const profile=JSON.parse(readFileSync(new URL('../lib/client-profile.json',import.meta.url),'utf8'));
 client=await createConnection(databaseConfig());
 await client.beginTransaction();
 const [rows]=await client.query("SELECT value FROM content WHERE id = 'site' FOR UPDATE");
 if(rows.length){
  const current=JSON.parse(rows[0].value);
  mkdirSync('.data',{recursive:true});
  const backup=`.data/before-client-profile-${Date.now()}.json`;
  writeFileSync(backup,rows[0].value,{mode:0o600,flag:'wx'});
  await client.execute("UPDATE content SET value = ? WHERE id = 'site'",[JSON.stringify({...current,...profile})]);
  console.log(`Client profile applied. Previous content saved to ${backup}.`);
 }else{
  console.log('No saved content exists; the website will use the updated defaults.');
 }
 await client.commit();
}catch(error){
 await client?.rollback().catch(()=>{});
 console.error(`Profile update failed (${error.code||'UNKNOWN'}). Saved content was not changed.`);
 process.exitCode=1;
}finally{await client?.end();}
