'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Check,Clock3,ExternalLink,MessageSquareQuote,Search,Star,Trash2,X} from 'lucide-react';
import type {ModeratedReview,ReviewStatus} from '../../lib/review-types';
import './reviews-panel.css';
export default function ReviewsPanel(){
 const [rows,setRows]=useState<ModeratedReview[]>([]),[status,setStatus]=useState<ReviewStatus|'all'>('pending'),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(''),[reload,setReload]=useState(0),[page,setPage]=useState(1);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/admin/reviews',{cache:'no-store',signal:controller.signal})
   .then(async response=>{const result=await response.json();if(!response.ok)throw Error(result.error||'Reviews could not be loaded.');return result as ModeratedReview[];})
   .then(result=>{if(!controller.signal.aborted){setRows(result);setError('');}})
   .catch(cause=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'Reviews could not be loaded.');})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[reload]);
 async function moderate(review:ModeratedReview,next:ReviewStatus){
  if(busy)return;setBusy(review.id);setError('');setMessage('');
  try{
   const response=await fetch('/api/admin/reviews',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:review.id,status:next})});
   const result=await response.json().catch(()=>null);
   if(!response.ok||!result?.id)throw Error(result?.error||'The review could not be updated.');
   setRows(current=>current.map(row=>row.id===review.id?result:row));
   setMessage(next==='approved'?'Review approved. It is now visible on the public reviews page.':next==='rejected'?'Review rejected. It is not visible publicly.':'Review returned to pending and removed from the public page.');
  }catch(cause){setError(cause instanceof Error?cause.message:'The review could not be updated.');}finally{setBusy('');}
 }
 async function remove(review:ModeratedReview){
  if(busy||!window.confirm('Permanently delete this review? This cannot be undone.'))return;
  setBusy(review.id);setError('');setMessage('');
  try{
   const response=await fetch('/api/admin/reviews',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:review.id})});
   const result=await response.json().catch(()=>null);
   if(!response.ok||!result?.ok)throw Error(result?.error||'The review could not be deleted.');
   setRows(current=>current.filter(row=>row.id!==review.id));setMessage('Review permanently deleted.');
  }catch(cause){setError(cause instanceof Error?cause.message:'The review could not be deleted.');}finally{setBusy('');}
 }
 const filtered=rows.filter(row=>(status==='all'||row.status===status)&&`${row.displayName} ${row.service} ${row.body}`.toLowerCase().includes(query.toLowerCase()));
 const pages=Math.max(1,Math.ceil(filtered.length/12)),current=Math.min(page,pages),visible=filtered.slice((current-1)*12,current*12);
 return <section className="admin-reviews">
  <div className="admin-panel admin-reviews-intro"><div><MessageSquareQuote size={24}/><h3>Thoughtful feedback, shared with care.</h3><p>Review each submission before publishing. Approve genuine feedback regardless of rating, and check for personal information. Rejected and pending reviews stay private.</p></div><Link className="text-link" href="/reviews" target="_blank">View public reviews<ExternalLink size={14}/></Link></div>
  <div className="admin-reviews-tabs" role="group" aria-label="Review status">{(['pending','approved','rejected','all'] as const).map(value=><button key={value} className={status===value?'active':''} aria-pressed={status===value} onClick={()=>{setStatus(value);setPage(1);}}>{value==='pending'?<Clock3 size={15}/>:value==='approved'?<Check size={15}/>:value==='rejected'?<X size={15}/>:<MessageSquareQuote size={15}/>} {value==='all'?'All reviews':value[0].toUpperCase()+value.slice(1)}<span>{value==='all'?rows.length:rows.filter(row=>row.status===value).length}</span></button>)}</div>
  <div className="admin-reviews-search"><label><Search size={17}/><input placeholder="Search reviews, names or services" aria-label="Search reviews" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></label><button className="text-link" disabled={loading||Boolean(busy)} onClick={()=>{setLoading(true);setReload(value=>value+1);}}>Refresh</button></div>
  {error&&<p className="admin-reviews-error" role="alert">{error}</p>}{message&&<p className="admin-reviews-message" role="status">{message}</p>}
  {loading?<div className="admin-panel admin-reviews-empty" role="status">Loading reviews…</div>:visible.length?visible.map(review=><article className="admin-panel admin-review" key={review.id}>
   <div className="admin-review-top"><div><strong>{review.displayName}</strong><span>{new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(review.createdAt))}</span></div><span className={'admin-review-status '+review.status}>{review.status}</span></div>
   <div className="admin-review-meta"><span className="admin-review-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>{[1,2,3,4,5].map(value=><Star key={value} size={15} fill={value<=review.rating?'currentColor':'none'}/>)}</span><span>{review.service}</span></div><p className="admin-review-body">{review.body}</p>
   <div className="admin-review-actions">{review.status!=='approved'&&<button disabled={Boolean(busy)} className="button small" onClick={()=>moderate(review,'approved')}><Check size={15}/>{busy===review.id?'Saving…':'Approve & publish'}</button>}{review.status!=='rejected'&&<button className="text-link" disabled={Boolean(busy)} onClick={()=>moderate(review,'rejected')}><X size={15}/>Reject</button>}{review.status!=='pending'&&<button className="text-link" disabled={Boolean(busy)} onClick={()=>moderate(review,'pending')}><Clock3 size={15}/>Return to pending</button>}<button className="text-link danger" disabled={Boolean(busy)} onClick={()=>remove(review)}><Trash2 size={15}/>Delete</button></div>
  </article>):<div className="admin-panel admin-reviews-empty"><MessageSquareQuote size={30}/><h3>{query?'No matching reviews.':`No ${status==='all'?'':status+' '}reviews yet.`}</h3><p>New feedback will appear here after a visitor submits the review form.</p></div>}
  {pages>1&&<div className="admin-reviews-pagination"><button disabled={current===1} onClick={()=>setPage(current-1)}>Previous</button><span>{current} of {pages}</span><button disabled={current===pages} onClick={()=>setPage(current+1)}>Next</button></div>}
 </section>;
}
