import {createInterface, emitKeypressEvents} from 'node:readline';
import {hashPassword} from '../lib/password-core.mjs';

if (!process.stdin.isTTY || !process.stdout.isTTY) {
 console.error('Run npm run admin:sql in an interactive terminal.');
 process.exit(1);
}
const reader=createInterface({input:process.stdin,output:process.stdout});
const email=await new Promise(resolve=>reader.question('Admin email [asimaftabtherapy@gmail.com]: ',resolve));
reader.close();
const account=email.trim().toLowerCase()||'asimaftabtherapy@gmail.com';
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)||account.length>254){
 console.error('Enter a valid admin email.');process.exit(1);
}
emitKeypressEvents(process.stdin);
async function secret(prompt){
 process.stdout.write(prompt);
 process.stdin.setRawMode(true);
 process.stdin.resume();
 return new Promise(resolve=>{
  let value='';
  const handler=(text,key)=>{
   if(key?.ctrl&&key.name==='c'){
    process.stdin.setRawMode(false);process.stdout.write('\n');process.exit(130);
   }
   if(key?.name==='return'){
    process.stdin.off('keypress',handler);process.stdin.setRawMode(false);
    process.stdin.pause();process.stdout.write('\n');resolve(value);return;
   }
   if(key?.name==='backspace'){value=Array.from(value).slice(0,-1).join('');return;}
   if(text&&!key?.ctrl&&!key?.meta&&!/[\x00-\x1f\x7f]/.test(text))value+=text;
  };
  process.stdin.on('keypress',handler);
 });
}
const password=await secret('New password (12–256 characters; typing is hidden): ');
if(password.length<12||password.length>256){console.error('Use 12–256 characters. Run the command again.');process.exit(1);}
if(password!==await secret('Type the password again: ')){console.error('Passwords do not match. Run the command again.');process.exit(1);}
const hash=await hashPassword(password);
// Hex encodes the email to avoid SQL string escaping and SQL-mode differences.
const emailHex=Buffer.from(account,'utf8').toString('hex');
console.log('\nCopy the SQL below into your live database in phpMyAdmin → SQL → Go.');
console.log('This updates an existing admin only. Confirm phpMyAdmin reports one affected row.\n');
console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = CONVERT(0x${emailHex} USING utf8mb4) AND role = 'admin';`);
console.log(`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = CONVERT(0x${emailHex} USING utf8mb4) AND role = 'admin');`);
console.log(`DELETE FROM login_attempts WHERE email = CONVERT(0x${emailHex} USING utf8mb4);`);
console.log(`SELECT email, role, password_hash = '${hash}' AS password_updated FROM users WHERE email = CONVERT(0x${emailHex} USING utf8mb4);`);
console.log('\nThen sign in using your admin email and the new password. Keep this output private.');
