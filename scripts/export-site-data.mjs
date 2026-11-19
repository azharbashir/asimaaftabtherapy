import nextEnv from '@next/env';
import {createConnection} from 'mysql2/promise';
import {mkdirSync,writeFileSync} from 'node:fs';
import {databaseConfig} from '../lib/database-config.mjs';

nextEnv.loadEnvConfig(process.cwd(),true);
let client;
try{
 client=await createConnection(databaseConfig());
 await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
 await client.query('START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY');
 const lines=[
  '-- Website content, images and reviews. Keep private; reviews can include unpublished submissions.',
  '-- Back up the destination first. Import into the initialized live database in phpMyAdmin.',
  '-- Existing rows are preserved. No users, passwords, sessions or appointments are included.',
  'SET NAMES utf8mb4;', 'START TRANSACTION;',
 ];
 let total=0;
 for(const table of ['images','content','reviews']){
  const [rows]=await client.query(`SELECT * FROM \`${table}\``);
  for(const row of rows){
   const columns=Object.keys(row);
   const values=columns.map(key=>{
    const value=row[key];
    if(value===null)return 'NULL';
    if(typeof value==='number')return String(value);
    if(String(value)==='')return "''";
    return `CONVERT(0x${Buffer.from(String(value),'utf8').toString('hex')} USING utf8mb4)`;
   });
   lines.push(`INSERT INTO \`${table}\` (${columns.map(c=>'`'+c+'`').join(',')}) VALUES (${values.join(',')}) ON DUPLICATE KEY UPDATE id=id;`);
  }
  total+=rows.length;
  console.log(`${table}: ${rows.length} rows exported.`);
 }
 await client.commit();
 if(!total)throw Object.assign(Error('empty'),{code:'EMPTY_SOURCE'});
 lines.push('COMMIT;');
 mkdirSync('.data',{recursive:true});
 writeFileSync('.data/live-site-data.sql',lines.join('\n')+'\n',{mode:0o600});
 console.log('Ready: .data/live-site-data.sql — import through live phpMyAdmin. Existing live rows will be preserved.');
}catch(error){
 console.error(`Export failed (${error.code||'UNKNOWN'}). Start your local MySQL server and check the local DB settings. No live database was changed.`);
 process.exitCode=1;
}finally{await client?.end();}
