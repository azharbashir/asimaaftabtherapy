import nextEnv from '@next/env';
import {createConnection} from 'mysql2/promise';
import {databaseConfig} from '../lib/database-config.mjs';

nextEnv.loadEnvConfig(process.cwd(),process.env.NODE_ENV!=='production');
const hints={
 ER_ACCESS_DENIED_ERROR:'Check DB_USER and DB_PASSWORD, and assign the user to the database in your hosting panel.',
 ER_DBACCESS_DENIED_ERROR:'Assign this MySQL user to the selected database in your hosting panel.',
 ER_BAD_DB_ERROR:'Check DB_NAME. Include the full account prefix shown in your hosting panel.',
 ECONNREFUSED:'Check DB_HOST and DB_PORT, and confirm MySQL is running.',
 ETIMEDOUT:'Check the database hostname and firewall. Remote connections must be allowed by the database host.',
 ENOTFOUND:'Check DB_HOST for spelling mistakes.',
};
let client;
try{
 client=await createConnection(databaseConfig());
 await client.query('SELECT 1');
 console.log('MySQL connection successful. No data was changed. Run npm run db:setup to initialize tables if needed.');
}catch(error){
 const code=error.code||'UNKNOWN';
 // Never print raw driver errors: they can include connection details.
 const hint=code.startsWith('DB_CONFIG_')?error.message:hints[code]||'Check your MySQL environment settings and hosting database availability.';
 console.error(`MySQL connection failed (${code}). ${hint}`);
 process.exitCode=1;
}finally{
 if(client)await client.end();
}
