import nodemailer from 'nodemailer';
import {z} from 'zod';

/** @typedef {{id:string,name:string,email:string,phone:string,sessionType:string,service:string,date:string,timezone:string,message?:string|null}} BookingMailDetails */
/** @typedef {'sent'|'failed'|'not_configured'|'disabled'} MailStatus */
/** @typedef {{practice:MailStatus,client:MailStatus}} BookingMailResult */
const email=z.string().email().max(254);
function configurationError(key){return Object.assign(Error(`Check the ${key} mail setting.`),{code:`SMTP_CONFIG_${key}`});}
/** @param {NodeJS.ProcessEnv} [env] */
export function readMailConfig(env=process.env){
 if(!['SMTP_HOST','SMTP_USER','SMTP_PASS','MAIL_FROM'].some(key=>env[key]))return null;
 for(const key of ['SMTP_HOST','SMTP_USER','SMTP_PASS'])if(!env[key])throw configurationError(key);
 if(/[\s/]/.test(env.SMTP_HOST))throw configurationError('SMTP_HOST');
 const port=Number(env.SMTP_PORT||465);
 if(![465,587].includes(port))throw configurationError('SMTP_PORT');
 const secureValue=env.SMTP_SECURE||String(port===465);
 if(!['true','false'].includes(secureValue)||(port===465&&secureValue!=='true'))throw configurationError('SMTP_SECURE');
 const from=env.MAIL_FROM||env.SMTP_USER,to=env.BOOKING_NOTIFY_EMAIL||env.ADMIN_EMAIL;
 if(!email.safeParse(from).success)throw configurationError('MAIL_FROM');
 if(!email.safeParse(to).success)throw configurationError('BOOKING_NOTIFY_EMAIL');
 const fromName=env.MAIL_FROM_NAME||'Asima Aftab Psychotherapy';
 if(/[\r\n]/.test(fromName)||fromName.length>120)throw configurationError('MAIL_FROM_NAME');
 const clientValue=env.BOOKING_CLIENT_EMAIL||'true';
 if(!['true','false'].includes(clientValue))throw configurationError('BOOKING_CLIENT_EMAIL');
 let appUrl;
 try{appUrl=new URL(env.APP_URL);if(appUrl.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(appUrl.hostname))throw Error();}catch{throw configurationError('APP_URL');}
 return {from,fromName,to,appUrl:appUrl.origin,sendClient:clientValue==='true',transport:{host:env.SMTP_HOST,port,secure:secureValue==='true',requireTLS:secureValue!=='true',auth:{user:env.SMTP_USER,pass:env.SMTP_HOST==='smtp.gmail.com'?env.SMTP_PASS.replace(/\s/g,''):env.SMTP_PASS},tls:{minVersion:/** @type {const} */('TLSv1.2')},connectionTimeout:5000,greetingTimeout:5000,socketTimeout:8000,logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true}};
}
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const rowsHtml=rows=>rows.map(([label,value])=>`<tr><th style="text-align:left;padding:9px 14px 9px 0;color:#53695f;font-size:13px;vertical-align:top">${escape(label)}</th><td style="padding:9px 0;color:#243d31;font-size:13px">${escape(value)}</td></tr>`).join('');
function layout(title,body){return `<!doctype html><html lang="en"><body style="margin:0;background:#faf8f3;font-family:Arial,sans-serif;color:#243d31"><div style="max-width:560px;margin:32px auto;padding:30px;background:white;border:1px solid #e3e9e3;border-radius:10px"><p style="font-size:11px;letter-spacing:2px;color:#4e8b7a">ASIMA AFTAB · PSYCHOTHERAPY</p><h1 style="font-size:24px;line-height:1.3">${escape(title)}</h1>${body}<p style="font-size:11px;color:#6e7b70;margin-top:28px">This email relates to an appointment request. It is not an emergency service.</p></div></body></html>`;}
/** @param {BookingMailDetails} booking @param {NonNullable<ReturnType<typeof readMailConfig>>} config */
export function bookingEmailMessages(booking,config){
 const details=[['Reference',booking.id],['Name',booking.name],['Email',booking.email],['Phone',booking.phone],['Session',booking.sessionType],['Support area',booking.service],['Preferred date',booking.date],['Timezone',booking.timezone]];
 const from={name:config.fromName,address:config.from};
 const practice={from,to:config.to,replyTo:booking.email,subject:'New appointment request',text:[`A new appointment request has been saved.`,...details.map(([label,value])=>`${label}: ${value}`),'',`Review and confirm it in your dashboard: ${config.appUrl}/admin`,'Additional notes are available only in the private dashboard.'].join('\n'),html:layout('New appointment request',`<p>A new request has been saved and is awaiting your response.</p><table style="width:100%;border-collapse:collapse">${rowsHtml(details)}</table><p><a href="${escape(config.appUrl)}/admin" style="color:#2b4f42">Open the practice dashboard</a></p><p style="font-size:12px;color:#6e7b70">Additional notes are available only in the private dashboard.</p>`)};
 const client={from,to:booking.email,replyTo:config.to,subject:'We received your appointment request',text:[`Hello ${booking.name},`,'','Thank you for getting in touch. Your appointment request has been received.',`Reference: ${booking.id}`,`Preferred date: ${booking.date}`,`Timezone: ${booking.timezone}`,'','Your appointment is not confirmed yet. We will contact you to discuss availability and confirm your session.','You can reply to this email if you have a question.','',config.fromName].join('\n'),html:layout('Your request has been received',`<p>Hello ${escape(booking.name)},</p><p>Thank you for getting in touch. Your appointment request has been received.</p><table style="width:100%;border-collapse:collapse">${rowsHtml([['Reference',booking.id],['Preferred date',booking.date],['Timezone',booking.timezone]])}</table><p><strong>Your appointment is not confirmed yet.</strong> We will contact you to discuss availability and confirm your session.</p><p>You can reply to this email if you have a question.</p>`)};
 return {practice,client};
}
function report(bookingId,recipient,error){
 const value=error&&typeof error==='object'&&'code' in error?String(error.code):'UNKNOWN';
 console.error('[booking-mail] Delivery failed',{bookingId,recipient,code:/^[A-Z0-9_]+$/.test(value)?value:'UNKNOWN'});
}
/**
 * Persist bookings before calling this function. SMTP failures never undo a saved request.
 * @param {BookingMailDetails} booking
 * @param {{env?:NodeJS.ProcessEnv,createTransport?:typeof nodemailer.createTransport}} [options]
 * @returns {Promise<BookingMailResult>}
 */
export async function sendBookingEmails(booking,{env=process.env,createTransport=nodemailer.createTransport}={}){
 let config;
 try{config=readMailConfig(env);}catch(error){report(booking.id,'configuration',error);return {practice:'failed',client:'failed'};}
 if(!config){console.warn('[booking-mail] SMTP_NOT_CONFIGURED');return {practice:'not_configured',client:'not_configured'};}
 let transport;
 try{
  transport=createTransport(config.transport);
  const messages=bookingEmailMessages(booking,config);
  const targets=config.sendClient?['practice','client']:['practice'];
  const result=await Promise.allSettled(targets.map(async target=>{
   const info=await transport.sendMail({...messages[target],disableFileAccess:true,disableUrlAccess:true});
   if(info.rejected?.length||info.accepted?.length===0)throw Object.assign(Error('SMTP recipient rejected'),{code:'ERECIPIENT'});
  }));
  const statuses={practice:/** @type {MailStatus} */('failed'),client:/** @type {MailStatus} */('disabled')};
  result.forEach((outcome,index)=>{const target=targets[index];statuses[target]=outcome.status==='fulfilled'?'sent':'failed';if(outcome.status==='rejected')report(booking.id,target,outcome.reason);});
  return statuses;
 }catch(error){report(booking.id,'transport',error);return {practice:'failed',client:config.sendClient?'failed':'disabled'};}
 finally{transport?.close();}
}
