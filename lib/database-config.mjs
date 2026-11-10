import path from 'node:path';
import {mkdirSync} from 'node:fs';
export function databaseConfig(){
 const url=process.env.DATABASE_URL||`file:${path.join(process.cwd(),'.data/app.db')}`;
 if(process.env.NODE_ENV==='production'&&!process.env.DATABASE_URL)throw Error('DATABASE_URL must be configured in production.');
 if(url.startsWith('file:'))mkdirSync(path.dirname(url.slice(5)),{recursive:true});
 if(!url.startsWith('file:')&&!process.env.DATABASE_AUTH_TOKEN)throw Error('DATABASE_AUTH_TOKEN is required for a remote database.');
 return {url,authToken:process.env.DATABASE_AUTH_TOKEN};
}
