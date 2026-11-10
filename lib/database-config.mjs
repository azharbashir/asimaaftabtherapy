export function databaseConfig(){
 const common={charset:'utf8mb4',connectTimeout:10000};
 if(process.env.DATABASE_URL){
  const url=new URL(process.env.DATABASE_URL);
  if(url.protocol!=='mysql:')throw Object.assign(Error('DATABASE_URL must start with mysql://. SQLite and Turso are no longer runtime databases.'),{code:'DB_CONFIG_PROTOCOL'});
  if(!url.pathname.slice(1))throw Object.assign(Error('DATABASE_URL must include a database name.'),{code:'DB_CONFIG_DATABASE'});
  return {...common,host:url.hostname,port:Number(url.port||3306),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database:decodeURIComponent(url.pathname.slice(1))};
 }
 for(const key of ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'])if(!process.env[key])throw Object.assign(Error(`Set ${key} for your MySQL database (or configure DATABASE_URL).`),{code:`DB_CONFIG_MISSING_${key}`});
 const port=Number(process.env.DB_PORT||3306);
 if(!Number.isInteger(port)||port<1||port>65535)throw Object.assign(Error('DB_PORT must be a valid port number.'),{code:'DB_CONFIG_PORT'});
 return {...common,host:process.env.DB_HOST,port,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME};
}
