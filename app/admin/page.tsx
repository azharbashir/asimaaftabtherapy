import {redirect} from 'next/navigation';
import {getAppUser} from '../../lib/admin';
import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function Admin(){
 const user=await getAppUser();
 if(!user)redirect('/login');
 if(user.role!=='admin'&&user.role!=='manager')return <main style={{maxWidth:600,margin:'80px auto',padding:24}}><h1>Workspace access required</h1><p>Your account does not have access to the practice dashboard. Ask an administrator to add your email with the Admin or Manager role.</p><form action="/api/logout" method="post"><button className="button">Sign out and use another account</button></form></main>;
 return <Dashboard role={user.role}/>;
}
