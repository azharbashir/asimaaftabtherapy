 'use client';
import {useEffect,useState,type FormEvent} from 'react';
type User={id:string;name:string;email:string;role:'admin'|'manager'|'user';createdAt:string};
export default function UsersPanel(){
 const [users,setUsers]=useState<User[]>([]),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[role,setRole]=useState<User['role']>('user'),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[message,setMessage]=useState(''),[query,setQuery]=useState(''),[removing,setRemoving]=useState<string|null>(null),[changingRole,setChangingRole]=useState<string|null>(null);
 const [refreshKey,setRefreshKey]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/users',{cache:'no-store',signal:controller.signal})
   .then(async r=>{if(!r.ok)throw Error('Could not load users.');return await r.json() as User[];})
   .then(data=>{if(!controller.signal.aborted)setUsers(data);})
   .catch(e=>{if(!controller.signal.aborted)setMessage(e instanceof Error?e.message:'Could not load users.');})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[refreshKey]);
 async function add(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;setBusy(true);setMessage('');try{const r=await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password,role})});const data=await r.json() as User & {error?:string};if(!r.ok)throw Error(data.error||'Could not add user.');setUsers(v=>[...v,data].sort((a,b)=>a.name.localeCompare(b.name)));setName('');setEmail('');setPassword('');setRole('user');setMessage('User created. They can sign in using their email and password.');}catch(e){setMessage(e instanceof Error?e.message:'Could not add user.');}finally{setBusy(false);}}
 async function remove(user:User){
  if(removing||!window.confirm(`Remove ${user.name} (${user.email})? They will lose access to their practice account. This cannot be undone.`))return;
  setRemoving(user.id);setMessage('');
  try{const r=await fetch('/api/users',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:user.id})});const data=await r.json() as {error?:string};if(!r.ok)throw Error(data.error||'Could not remove user.');setUsers(v=>v.filter(u=>u.id!==user.id));setMessage(`${user.name} was removed.`);}catch(e){setMessage(e instanceof Error?e.message:'Could not remove user.');}finally{setRemoving(null);}
 }
 async function changeRole(user:User,role:User['role']){
  if(changingRole||role===user.role||!window.confirm(`Change ${user.name}'s role to ${role}?`))return;
  setChangingRole(user.id);setMessage('');
  try{const r=await fetch('/api/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:user.id,role})});const data=await r.json() as User & {error?:string};if(!r.ok)throw Error(data.error||'Could not update role.');setUsers(v=>v.map(u=>u.id===user.id?data:u));setMessage(`${user.name}'s role was updated.`);}catch(e){setMessage(e instanceof Error?e.message:'Could not update role.');}finally{setChangingRole(null);}
 }
 const shown=users.filter(u=>(u.name+' '+u.email).toLowerCase().includes(query.toLowerCase()));
 return <div className="editor"><section className="admin-panel"><h3>Create new user</h3><p>Admins can manage appointments, website content and users. Managers can view bookings, update their status and remove bookings. Standard users cannot access the dashboard. Site sharing permissions also apply; adding a record here does not change who can open this private site.</p><form onSubmit={add}><div className="form-row"><label>Name<input required maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label><label>Email<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label></div><label>Password (at least 12 characters)<input type="password" required minLength={12} maxLength={256} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Role<select value={role} onChange={e=>setRole(e.target.value as User['role'])}><option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option></select></label><button className="button" type="submit" disabled={busy}>{busy?'Adding…':'Add user'}</button></form><p role="status">{message}</p></section><section className="admin-panel"><h3>Users ({users.length})</h3><label>Search users<input placeholder="Search name or email" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="table-scroll"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>ADDED</th><th>ACTION</th></tr></thead><tbody>{shown.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><select aria-label={'Role for '+u.name} value={u.role} disabled={changingRole!==null||removing!==null} onChange={e=>changeRole(u,e.target.value as User['role'])}><option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option></select></td><td>{u.createdAt.slice(0,10)}</td><td><button type="button" className="text-link" style={{color:'#a34b3e'}} disabled={removing!==null} onClick={()=>remove(u)} aria-label={'Remove '+u.name}>{removing===u.id?'Removing…':'Remove'}</button></td></tr>)}</tbody></table></div>{loading?<p>Loading users…</p>:!shown.length&&<p>No users match your search.</p>}<button className="text-link" onClick={()=>{setLoading(true);setRefreshKey(v=>v+1);}} disabled={loading}>Refresh users</button></section></div>;
}
