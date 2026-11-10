import {createClient} from '@libsql/client';
import {createConnection} from 'mysql2/promise';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
const directory=await mkdtemp(path.join(tmpdir(),'asima-production-'));
const base='http://127.0.0.1:3174',password=crypto.randomUUID()+crypto.randomUUID();
if(!process.env.MYSQL_TEST_URL)throw Error('Set MYSQL_TEST_URL to a MySQL server account allowed to create temporary test databases. Never use production credentials.');
const testUrl=new URL(process.env.MYSQL_TEST_URL);
if(testUrl.protocol!=='mysql:')throw Error('MYSQL_TEST_URL must start with mysql://.');
const control=await createConnection({host:testUrl.hostname,port:Number(testUrl.port||3306),user:decodeURIComponent(testUrl.username),password:decodeURIComponent(testUrl.password)});
const testDatabase='practice_test_'+crypto.randomUUID().replaceAll('-','');
testUrl.pathname='/'+testDatabase;
const env={...process.env,NODE_ENV:'production',APP_URL:base,DATABASE_URL:testUrl.href,ADMIN_EMAIL:'admin@example.com',ADMIN_PASSWORD:password,ADMIN_NAME:'Test administrator'};
let server,logs='';
async function request(endpoint,{method='GET',data,cookie,origin=base,headers={}}={}){
 const response=await fetch(base+endpoint,{method,redirect:'manual',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(data?{'Content-Type':'application/json'}:{}),...headers},body:data?JSON.stringify(data):undefined});
 const text=await response.text();let value;try{value=JSON.parse(text);}catch{value=text;}
 return {status:response.status,data:value,headers:response.headers};
}
async function login(email,secret){const r=await request('/api/login',{method:'POST',data:{email,password:secret}});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);return r.headers.get('set-cookie').split(';')[0];}
try{
 await control.query(`CREATE DATABASE \`${testDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
 const setup=spawnSync(process.execPath,['scripts/setup-database.mjs'],{env,encoding:'utf8'});
 assert.equal(setup.status,0,setup.stderr);
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3174'],{env,stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
 let started=false;
 for(let i=0;i<120;i++){try{if((await fetch(base+'/login')).status===200){started=true;break;}}catch{}if(server.exitCode!==null)break;await new Promise(r=>setTimeout(r,250));}
 assert(started,logs);
 assert.equal((await request('/')).status,200);
 assert.equal((await request('/admin')).status,307);
 assert.equal((await request('/api/users',{headers:{'oai-authenticated-user-id':'initial-owner','oai-authenticated-user-email':'admin@example.com'}})).status,403);
 assert.equal((await request('/api/appointments')).status,403);
 assert.equal((await request('/api/login',{method:'POST',origin:'https://untrusted.example',data:{email:'admin@example.com',password}})).status,403);
 assert.equal((await request('/api/login',{method:'POST',data:{email:'admin@example.com',password:'incorrect'}})).status,401);
 const admin=await login('admin@example.com',password);
 assert.equal((await request('/admin',{cookie:admin})).status,200);
 const users=await request('/api/users',{cookie:admin});assert.equal(users.status,200);assert(!('passwordHash' in users.data[0]));
 assert.equal((await request('/api/users',{method:'DELETE',cookie:admin,data:{id:users.data[0].id}})).status,409);
 const created=await request('/api/users',{method:'POST',cookie:admin,data:{name:'Manager check',email:'manager@example.com',role:'manager',password}});assert.equal(created.status,201);
 const manager=await login('manager@example.com',password);
 const dashboard=await request('/admin',{cookie:manager});assert.equal(dashboard.status,200);assert(dashboard.data.includes('New Appointment'));
 assert.equal((await request('/api/users',{cookie:manager})).status,403);
 assert.equal((await request('/api/content',{method:'PUT',cookie:manager,data:{}})).status,403);
 const booking={name:'Production check',email:'booking@example.com',phone:'+1234567890',sessionType:'Online',service:'Test service',date:new Date(Date.now()+3*86400000).toISOString().slice(0,10),timezone:'Asia/Bahrain',message:'Test request'};
 assert.equal((await request('/api/appointments',{method:'POST',data:booking})).status,201);
 const list=await request('/api/appointments',{cookie:manager});assert.equal(list.status,200);const id=list.data[0].id;
 for(const status of ['Confirmed','Cancelled'])assert((await request('/api/appointments',{method:'PATCH',cookie:manager,data:{id,status}})).data.ok);
 assert.equal((await request('/api/appointments',{method:'DELETE',cookie:manager,data:{id}})).status,200);
 assert.equal((await request('/api/users',{method:'PATCH',cookie:admin,data:{id:created.data.id,role:'user'}})).status,200);
 assert.equal((await request('/api/appointments',{cookie:manager})).status,403);
 assert.equal((await request('/api/users',{method:'DELETE',cookie:admin,data:{id:created.data.id}})).status,200);
 assert.equal((await request('/api/appointments',{cookie:manager})).status,403);
 const imageForm=new FormData();
 imageForm.set('file',new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')],'logo.png',{type:'image/png'}));
 const upload=await fetch(base+'/api/images',{method:'POST',headers:{Cookie:admin,Origin:base},body:imageForm});assert.equal(upload.status,201);const logo=await upload.json();
 assert.equal((await fetch(base+logo.url)).status,200);
 const content=await request('/api/content');assert.equal(content.status,200);
 assert.equal((await request('/api/content',{method:'PUT',cookie:admin,data:{...content.data,name:'Production smoke check',logoImage:logo.url,brandTagline:'A space for you',services:content.data.services.map((s,i)=>i===0?{...s,badge:'One-to-one',duration:'50 minutes',price:'Enquire for fees'}:s)}})).status,200);
 const savedBrand=(await request('/api/content')).data;
 assert.equal(savedBrand.name,'Production smoke check');assert.equal(savedBrand.logoImage,logo.url);assert.equal(savedBrand.brandTagline,'A space for you');assert.equal(savedBrand.services[0].badge,'One-to-one');assert.equal(savedBrand.services[0].duration,'50 minutes');assert.equal(savedBrand.services[0].price,'Enquire for fees');
 assert.equal((await request('/api/content',{method:'PUT',cookie:admin,data:{...savedBrand,logoImage:'',brandTagline:''}})).status,200);
 assert.equal((await request('/api/content')).data.logoImage,'');
 const sourceFile=path.join(directory,'source.db'),source=createClient({url:`file:${sourceFile}`});
 try{
  const fixtures={
   content:{id:'site',value:JSON.stringify({name:'Must not replace hosted content'})},
   users:{id:crypto.randomUUID(),name:'Old administrator',email:'admin@example.com',role:'admin',created_at:new Date().toISOString(),password_hash:'old-password-hash'},
   images:{id:crypto.randomUUID(),mime:'image/png',data:'aW1wb3J0ZWQ=',created_at:new Date().toISOString()},
   appointments:{id:crypto.randomUUID(),name:'Imported client',email:'import@example.com',phone:null,session_type:null,message:null,service:'Imported service',date:booking.date,timezone:'Asia/Bahrain',status:'New',created_at:new Date().toISOString()}
  };
  for(const [table,row] of Object.entries(fixtures)){
   const fields=Object.keys(row);
   await source.execute(`CREATE TABLE ${table} (${fields.map(f=>f+' TEXT').join(',')})`);
   await source.execute({sql:`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(()=>'?').join(',')})`,args:Object.values(row)});
  }
 }finally{source.close();}
 for(let i=0;i<2;i++){
  const imported=spawnSync(process.execPath,['scripts/import-local-data.mjs'],{env:{...env,SOURCE_DATABASE_URL:`file:${sourceFile}`},encoding:'utf8'});
  assert.equal(imported.status,0,imported.stderr);
 }
 assert.equal((await request('/api/content')).data.name,'Production smoke check');
 assert.equal((await request('/api/appointments',{cookie:admin})).data.length,1);
 assert.equal((await request('/api/users',{cookie:admin})).data.length,1);
 const repeatSetup=spawnSync(process.execPath,['scripts/setup-database.mjs'],{env:{...env,ADMIN_PASSWORD:crypto.randomUUID()},encoding:'utf8'});
 assert.equal(repeatSetup.status,0,repeatSetup.stderr);
 assert.equal((await request('/api/content')).data.name,'Production smoke check');
 await login('admin@example.com',password);
 const logout=await request('/api/logout',{method:'POST',cookie:admin});assert.equal(logout.status,303);assert.equal(logout.headers.get('location'),'/login');
 assert.equal((await request('/api/users',{cookie:admin})).status,403);
 const newPassword=crypto.randomUUID()+crypto.randomUUID();
 const active=await login('admin@example.com',password);
 const reset=spawnSync(process.execPath,['scripts/reset-admin-password.mjs'],{env:{...env,ADMIN_PASSWORD:newPassword},encoding:'utf8'});
 assert.equal(reset.status,0,reset.stderr);
 assert.equal((await request('/api/users',{cookie:active})).status,403);
 assert.equal((await request('/api/login',{method:'POST',data:{email:'admin@example.com',password}})).status,401);
 await login('admin@example.com',newPassword);
 console.log('Production smoke checks passed: fresh migrations, bootstrap, login, role permissions, booking lifecycle, content/image persistence, repeat initialization, SQLite import, password reset, logout and header-spoof protection.');
}finally{
 if(server&&server.exitCode===null){server.kill('SIGTERM');await once(server,'exit');}
 await control.query(`DROP DATABASE IF EXISTS \`${testDatabase}\``);
 await control.end();
 await rm(directory,{recursive:true,force:true});
}
