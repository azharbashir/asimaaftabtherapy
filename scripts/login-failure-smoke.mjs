import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const base='http://127.0.0.1:3175';
for(const configuration of [
 {name:'database unavailable',APP_URL:base,DB_HOST:'127.0.0.1',DB_PORT:'9',DB_NAME:'test',DB_USER:'test',DB_PASSWORD:'private-test-value'},
 {name:'invalid public origin',APP_URL:'invalid-origin'},
 {name:'missing database settings',APP_URL:base,DB_HOST:'',DB_PORT:'',DB_NAME:'',DB_USER:'',DB_PASSWORD:''},
]){
 let logs='';
 const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3175'],{env:{...process.env,NODE_ENV:'production',DATABASE_URL:'',...configuration},stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
 try{
  let ready=false;
  for(let i=0;i<120;i++){
   if(logs.includes('Ready in')){ready=true;break;}
   if(server.exitCode!==null)break;
   await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert(ready,logs);
  const response=await fetch(base+'/api/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'failure-test@example.com',password:'never-log-this-password'})});
  assert.equal(response.status,503,configuration.name);
  assert.match(response.headers.get('content-type'),/application\/json/);
  const data=await response.json();
  assert.match(data.error,/temporarily unavailable/);
  assert.match(data.reference,/^[0-9a-f-]{36}$/);
  assert.equal(response.headers.get('set-cookie'),null);
  assert(!JSON.stringify(data).includes('private-test-value'));
 }finally{
  if(server.exitCode===null){server.kill('SIGTERM');await once(server,'exit');}
 }
 assert(logs.includes('[login] Sign-in failed'));
 assert(!logs.includes('private-test-value'));
 assert(!logs.includes('never-log-this-password'));
 assert(!logs.includes('failure-test@example.com'));
}
console.log('Login failure checks passed: unavailable database and invalid origin return safe JSON errors with diagnostic references.');
