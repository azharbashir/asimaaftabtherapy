import nextEnv from '@next/env';
import nodemailer from 'nodemailer';
import {readMailConfig} from '../lib/mail-core.mjs';
nextEnv.loadEnvConfig(process.cwd(),process.env.NODE_ENV!=='production');
let transport;
try{
 const config=readMailConfig();
 if(!config)throw Object.assign(Error('Configure SMTP settings in the private environment first.'),{code:'SMTP_NOT_CONFIGURED'});
 transport=nodemailer.createTransport(config.transport);
 await transport.verify();
 console.log('SMTP connection and authentication verified. No email was sent.');
}catch(error){console.error('SMTP verification failed:',error.code||'UNKNOWN');process.exitCode=1;}
finally{transport?.close();}
