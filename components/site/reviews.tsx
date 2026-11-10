'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowRight,CheckCircle2,ChevronLeft,ChevronRight,LockKeyhole,MessageSquareQuote,Plus,SlidersHorizontal,Star,X} from 'lucide-react';
import {useContent} from './content';
import type {ReviewPage} from '../../lib/review-types';
import './reviews.css';

const empty:ReviewPage={reviews:[],total:0,page:1,pageSize:6,services:[],summary:{total:0,average:0,distribution:[0,0,0,0,0]}};
export function ReviewStars({rating}:{rating:number}){return <span className="review-stars" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>{[1,2,3,4,5].map(value=><Star key={value} size={17} fill={value<=Math.round(rating)?'currentColor':'none'} strokeWidth={1.5}/>)}</span>;}
const dateLabel=(value:string)=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value));

export default function ReviewsPage(){
 const content=useContent();
 const [data,setData]=useState<ReviewPage>(empty),[service,setService]=useState(''),[ratingFilter,setRatingFilter]=useState('0'),[sort,setSort]=useState('recent'),[page,setPage]=useState(1),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const [open,setOpen]=useState(false),[submitting,setSubmitting]=useState(false),[submitted,setSubmitted]=useState(false),[submitError,setSubmitError]=useState(''),[rating,setRating]=useState(0),[hoverRating,setHoverRating]=useState(0),[body,setBody]=useState(''),[reviewService,setReviewService]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),form=useRef<HTMLFormElement>(null);
 useEffect(()=>{
  const controller=new AbortController();
  const params=new URLSearchParams({service,rating:ratingFilter,sort,page:String(page)});
  fetch('/api/reviews?'+params,{signal:controller.signal,cache:'no-store'})
   .then(async response=>{const result=await response.json();if(!response.ok)throw Error(result.error||'Reviews could not be loaded.');return result as ReviewPage;})
   .then(result=>{if(!controller.signal.aborted){setData(result);setError('');}})
   .catch(cause=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'Reviews could not be loaded.');})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[service,ratingFilter,sort,page,retry]);
 useEffect(()=>{
  if(!open)return;
  const before=document.body.style.overflow;document.body.style.overflow='hidden';
  return ()=>{document.body.style.overflow=before;};
 },[open]);
 const services=Array.from(new Set([...content.services.map(s=>s.title),...data.services]));
 function changeService(value:string){if(value===service&&page===1)return;setService(value);setPage(1);setLoading(true);}
 function changeRating(value:string){if(value===ratingFilter&&page===1)return;setRatingFilter(value);setPage(1);setLoading(true);}
 function resetFilters(){setService('');setRatingFilter('0');setSort('recent');setPage(1);setLoading(true);setRetry(v=>v+1);}
 function writeReview(){
  form.current?.reset();
  setReviewService(content.services.some(s=>s.title===service)?service:'');setRating(0);setHoverRating(0);setBody('');setSubmitted(false);setSubmitError('');setOpen(true);dialog.current?.showModal();
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(submitting)return;
  if(!rating){setSubmitError('Please select a rating from 1 to 5 stars.');return;}
  const fields=new FormData(event.currentTarget);
  setSubmitting(true);setSubmitError('');
  try{
   const response=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service:reviewService,rating,displayName:fields.get('displayName'),body,consent:fields.get('consent')==='on',website:fields.get('website')})});
   const result=await response.json().catch(()=>null);
   if(!response.ok||!result?.ok)throw Error(result?.error||'Your review could not be sent. Please try again.');
   setSubmitted(true);
  }catch(cause){setSubmitError(cause instanceof Error?cause.message:'Your review could not be sent. Please try again.');}finally{setSubmitting(false);}
 }
 const pages=Math.max(1,Math.ceil(data.total/data.pageSize));
 const pageNumbers=Array.from(new Set([1,data.page-1,data.page,data.page+1,pages])).filter(n=>n>0&&n<=pages).sort((a,b)=>a-b);
 return <div className="reviews-page">
  <section className="reviews-intro"><div className="s-wrap">
   <nav className="reviews-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={13}/><span aria-current="page">Reviews</span></nav>
   <div className="reviews-hero"><div><span className="reviews-eyebrow">CLIENT EXPERIENCES</span><h1>Reflections on<br className="reviews-mobile-break"/> our services.</h1><p>Personal experiences, shared voluntarily.</p></div><button className="reviews-button" onClick={writeReview}><Plus size={18}/> Write a review</button></div>
  </div></section>
  <section className="reviews-main s-wrap" aria-label="Client reviews">
   <div className="reviews-summary" aria-busy={loading}>
    <div className="reviews-score"><strong>{data.summary.total?data.summary.average.toFixed(1):'—'}</strong><ReviewStars rating={data.summary.average}/><span>{data.summary.total?'Average rating':'No ratings yet'}</span></div>
    <div className="reviews-distribution"><span className="reviews-sr-only">Rating distribution for {service||'all services'}</span>{[5,4,3,2,1].map(stars=>{
     const count=data.summary.distribution[stars-1],percent=data.summary.total?Math.round(count/data.summary.total*100):0;
     return <button className={'reviews-bar-row'+(ratingFilter===String(stars)?' selected':'')} key={stars} onClick={()=>changeRating(ratingFilter===String(stars)?'0':String(stars))} aria-pressed={ratingFilter===String(stars)} aria-label={`Filter ${stars} star reviews: ${count}, ${percent} percent`}><span>{stars} {stars===1?'star':'stars'}</span><progress max={data.summary.total||1} value={count} aria-label={`${stars} star reviews`}/><span className="reviews-percent">{percent}%</span><span className="reviews-bar-count">({count})</span></button>;
    })}</div>
    <div className="reviews-total"><strong>{data.summary.total}</strong><span>{data.summary.total===1?'published review':'published reviews'}</span><small>{service||'Across all services'}</small></div>
   </div>
   <div className="reviews-toolbar"><div className="reviews-filter-heading"><SlidersHorizontal size={15}/><span>Find a reflection</span></div><div className="reviews-filter-fields">
    <label>Service<select value={service} onChange={e=>changeService(e.target.value)}><option value="">All services</option>{services.map(name=><option key={name}>{name}</option>)}</select></label>
    <label>Rating<select value={ratingFilter} onChange={e=>changeRating(e.target.value)}><option value="0">All ratings</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} {n===1?'star':'stars'}</option>)}</select></label>
    <label>Sort by<select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);setLoading(true);}}><option value="recent">Most recent</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></label>
    <button className="reviews-clear" onClick={resetFilters}>Clear filters</button>
   </div></div>
   <div className="reviews-chips" role="group" aria-label="Filter by service"><button className={!service?'active':''} aria-pressed={!service} onClick={()=>changeService('')}>All services</button>{services.map(name=><button key={name} className={service===name?'active':''} aria-pressed={service===name} onClick={()=>changeService(name)}>{name}</button>)}</div>
   <div className="reviews-list-heading"><h2>{service||'Client reflections'}</h2><span><LockKeyhole size={13}/> Published with permission</span></div>
   {error?<div className="reviews-empty" role="alert"><MessageSquareQuote size={28}/><h3>Reviews are temporarily unavailable.</h3><p>{error}</p><button className="reviews-button outline" onClick={()=>{setLoading(true);setRetry(v=>v+1);}}>Try again</button></div>:<>
    <div className="reviews-list" aria-busy={loading}>
     {loading?<div className="reviews-loading" role="status">Loading reflections…</div>:!data.reviews.length?<div className="reviews-empty"><MessageSquareQuote size={30}/><h3>{service||ratingFilter!=='0'?'No reviews match these filters.':'Every experience begins somewhere.'}</h3><p>{service||ratingFilter!=='0'?'Try another service or rating to explore more reflections.':'There are no published reviews yet. If you would like to share, your words are welcome.'}</p><button className="reviews-button outline" onClick={service||ratingFilter!=='0'?resetFilters:writeReview}>{service||ratingFilter!=='0'?'Clear filters':'Share your experience'}<ArrowRight size={16}/></button></div>:data.reviews.map(review=><article className="reviews-entry" key={review.id}>
      <div className="reviews-author"><strong>{review.displayName}</strong><time dateTime={review.createdAt}>{dateLabel(review.createdAt)}</time></div><div className="reviews-entry-content"><div className="reviews-entry-meta"><ReviewStars rating={review.rating}/><span className="reviews-service-tag">{review.service}</span></div><p>{review.body}</p>{review.displayName==='Anonymous'&&<small>Name withheld for privacy</small>}</div>
     </article>)}
    </div>
    <div className="reviews-pagination"><span role="status" aria-live="polite">{loading?'Loading reviews…':data.total?`Showing ${(data.page-1)*data.pageSize+1}–${Math.min(data.page*data.pageSize,data.total)} of ${data.total} ${data.total===1?'review':'reviews'}`:'No published reviews'}</span>{pages>1&&<nav aria-label="Review pages"><button disabled={loading||data.page<=1} onClick={()=>{setPage(data.page-1);setLoading(true);}} aria-label="Previous page"><ChevronLeft size={15}/></button>{pageNumbers.map((n,i)=><span key={n}>{i>0&&n-pageNumbers[i-1]>1&&<span className="reviews-ellipsis">…</span>}<button disabled={loading||n===data.page} className={n===data.page?'active':''} aria-current={n===data.page?'page':undefined} aria-label={'Page '+n} onClick={()=>{setPage(n);setLoading(true);}}>{n}</button></span>)}<button disabled={loading||data.page>=pages} onClick={()=>{setPage(data.page+1);setLoading(true);}} aria-label="Next page"><ChevronRight size={15}/></button></nav>}</div>
   </>}
   <div className="reviews-note"><LockKeyhole size={16}/><p>Sharing a review is always optional. Reviews reflect individual experiences and are published only with permission.</p></div>
  </section>
  <section className="reviews-cta"><div className="s-wrap"><div><h2>Begin with a conversation.</h2><p>Explore whether therapy feels right for you.</p></div><Link className="reviews-button" href="/booking">Book a Session<ArrowRight size={16}/></Link></div></section>
  <dialog ref={dialog} className="reviews-dialog" aria-labelledby="review-dialog-title" aria-describedby="review-dialog-description" onClose={()=>setOpen(false)} onCancel={e=>{if(submitting)e.preventDefault();}}>
   <button type="button" className="reviews-dialog-close" onClick={()=>dialog.current?.close()} disabled={submitting} aria-label="Close review form"><X size={23}/></button>
   {submitted?<div className="reviews-success"><span><CheckCircle2 size={34}/></span><h2 id="review-dialog-title">Thank you for sharing.</h2><p id="review-dialog-description">Your review has been sent for approval. It is not public yet.</p><button className="reviews-button" onClick={()=>dialog.current?.close()}>Done<ArrowRight size={17}/></button></div>:<>
    <div className="reviews-dialog-heading"><span><MessageSquareQuote size={24}/></span><div><span className="reviews-eyebrow">YOUR WORDS. YOUR CHOICE.</span><h2 id="review-dialog-title">Share your experience</h2></div></div><p id="review-dialog-description">Sharing is optional. Your privacy comes first.</p>
    <form ref={form} onSubmit={submit} className="reviews-form">
     <label>Service <span aria-hidden="true">*</span><select name="service" value={reviewService} onChange={e=>setReviewService(e.target.value)} required disabled={submitting}><option value="" disabled>Select a service</option>{content.services.map(s=><option key={s.title}>{s.title}</option>)}</select></label>
     <fieldset className="reviews-rating-input" onMouseLeave={()=>setHoverRating(0)} disabled={submitting}><legend>Your rating <span aria-hidden="true">*</span></legend><div>{[1,2,3,4,5].map(n=><label key={n} onMouseEnter={()=>setHoverRating(n)}><input type="radio" name="rating" value={n} checked={rating===n} onChange={()=>setRating(n)} required aria-label={`${n} ${n===1?'star':'stars'}`}/><Star size={32} strokeWidth={1.3} className={n<=(hoverRating||rating)?'filled':''}/></label>)}<span>{rating?`${rating} out of 5`:'Select a rating'}</span></div></fieldset>
     <label>Display name <small>(optional)</small><input name="displayName" maxLength={80} placeholder="Anonymous" autoComplete="off" disabled={submitting}/></label>
     <label>Your review <span aria-hidden="true">*</span><textarea name="body" rows={4} value={body} onChange={e=>setBody(e.target.value)} placeholder="Share your experience in your own words" minLength={10} maxLength={1000} required disabled={submitting} aria-describedby="review-privacy-note review-length"/></label><span className="reviews-character-count" id="review-length">{body.length.toLocaleString()} / 1,000</span>
     <p className="reviews-form-note" id="review-privacy-note">Please avoid personal or sensitive details about your care.</p>
     <label className="reviews-consent"><input type="checkbox" name="consent" required disabled={submitting}/><span>I consent to this review being published on the website.</span></label>
     <div className="reviews-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
     {submitError&&<p className="reviews-form-error" role="alert">{submitError}</p>}
     <div className="reviews-dialog-actions"><button type="button" className="reviews-button outline" disabled={submitting} onClick={()=>dialog.current?.close()}>Cancel</button><button type="submit" className="reviews-button" disabled={submitting||!content.services.length}>{submitting?'Sending…':'Submit for review'}<ArrowRight size={16}/></button></div>
     <p className="reviews-moderation-note">Reviews appear publicly only after approval.</p>
    </form>
   </>}
  </dialog>
 </div>;
}
