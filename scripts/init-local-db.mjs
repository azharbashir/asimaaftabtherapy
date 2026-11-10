import './sites-env.mjs';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const hosting=JSON.parse(readFileSync(path.join(root,'.openai/hosting.json'),'utf8'));
if(hosting.d1){
 const config=path.join(root,'.sites-runtime/local-db.json');
 mkdirSync(path.dirname(config),{recursive:true});
 writeFileSync(config,JSON.stringify({name:'site-local-db',compatibility_date:'2026-05-15',d1_databases:[{binding:hosting.d1,database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:path.join(root,'drizzle')}]}));
 const result=spawnSync(process.execPath,[path.join(root,'node_modules/wrangler/bin/wrangler.js'),'d1','migrations','apply',hosting.d1,'--local','--config',config,'--persist-to',path.join(root,'.wrangler/state')],{stdio:'inherit'});
 if(result.error)throw result.error;
 process.exitCode=result.status??1;
}
