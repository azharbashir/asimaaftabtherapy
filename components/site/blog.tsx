'use client';
import {Copy,useCopy} from './copy';
import {useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {CalendarDays,Clock,ArrowUpRight,ArrowLeft,ArrowRight,BookOpen} from 'lucide-react';
import {formatDate,readingTime,type Article,type SiteContent} from '../../lib/site-content';
import {useContent,img,articleImages,excerpt,firstName} from './content';
import {Eyebrow,PageBanner} from './sections';

export const articleImage=(a:Article,i:number,w=900)=>a.image||img(articleImages[i%articleImages.length],w);
const href=(i:number)=>'/blog/'+(i+1);

function Meta({a}:{a:Article}){
 return <div className="b-meta">{a.date&&<span><CalendarDays size={14}/>{formatDate(a.date)}</span>}<span><Clock size={14}/>{readingTime(a.body)} <Copy text="min read"/></span></div>;
}
function Author({c}:{c:SiteContent}){return <span className="b-author"><span className="b-avatar" aria-hidden>{c.name.trim()[0]?.toUpperCase()}</span><span><b>{c.name}</b><small>{c.tagline}</small></span></span>;}

/** Whole card is one link; the title is the accessible name. */
function PostCard({a,i,c}:{a:Article;i:number;c:SiteContent}){
 return <article className="b-card spot">
  <div className="b-img"><img src={articleImage(a,i,800)} alt="" loading="lazy"/>{a.category&&<span className="b-cat">{a.category}</span>}</div>
  <div className="b-body">
   <Meta a={a}/>
   <h3><Link href={href(i)} className="b-link">{a.title}</Link></h3>
   <p>{excerpt(a.body,150)}</p>
   <div className="b-foot"><Author c={c}/><span className="b-go" aria-hidden><ArrowUpRight size={18}/></span></div>
  </div>
 </article>;
}

export function BlogSection(){
 const c=useContent();
 if(!c.articles.length)return null;
 return <section className="s-blog s-sec"><div className="s-wrap">
  <div className="b-head"><div><Eyebrow left><Copy text="My Blog"/></Eyebrow><h2><Copy text="Mind Matters: Insights from a Psychotherapist"/></h2></div><Link className="s-btn outline" href="/blog"><Copy text="View All Articles"/> <ArrowRight size={17}/></Link></div>
  <div className="b-grid" data-n={Math.min(c.articles.length,3)}>{c.articles.slice(0,3).map((a,i)=><PostCard key={i} a={a} i={i} c={c}/>)}</div>
 </div></section>;
}

export function BlogIndex(){const t=useCopy();
 const c=useContent();
 const [cat,setCat]=useState('All');
 const cats=['All',...new Set(c.articles.map(a=>a.category).filter(Boolean))];
 if(!c.articles.length)return <section className="s-sec s-cream"><div className="s-wrap b-empty"><BookOpen size={34}/><h2><Copy text="Articles are on their way"/></h2><p><Copy text="Check back soon for reflections on wellbeing and therapy."/></p></div></section>;
 const [f,...rest]=c.articles;
 const list=(cat==='All'?rest.map((a,k)=>({a,i:k+1})):c.articles.map((a,i)=>({a,i})).filter(x=>x.a.category===cat));
 return <section className="s-sec s-cream"><div className="s-wrap">
  {cat==='All'&&<article className="b-featured">
   <div className="b-img"><img src={articleImage(f,0,1400)} alt=""/><span className="b-cat"><Copy text="Featured"/></span></div>
   <div className="b-body">
    {f.category&&<span className="b-kicker">{f.category}</span>}
    <h2><Link href={href(0)} className="b-link">{f.title}</Link></h2>
    <Meta a={f}/>
    <p>{excerpt(f.body,260)}</p>
    <div className="b-foot"><Author c={c}/><span className="s-btn sm" aria-hidden><Copy text="Read Article"/> <ArrowRight size={15}/></span></div>
   </div>
  </article>}
  {cats.length>2&&<div className="b-filters" role="group" aria-label={t("Filter articles by category")}>{cats.map(k=><button key={k} className={k===cat?'on':''} aria-pressed={k===cat} onClick={()=>setCat(k)}>{k==='All'?t('All'):k}</button>)}</div>}
  {list.length>0&&<div className="b-grid" data-n={Math.min(list.length,3)}>{list.map(({a,i})=><PostCard key={i+cat} a={a} i={i} c={c}/>)}</div>}
 </div></section>;
}

export function BlogArticle(){const t=useCopy();
 const c=useContent();
 const {id}=useParams<{id:string}>();
 const i=Number(id)-1,a=c.articles[i];
 if(!a)return <><PageBanner title={t("Article not found")}/><section className="s-sec"><div className="s-wrap s-center"><p className="s-lead"><Copy text="This article may have moved."/></p><Link className="s-btn" href="/blog"><Copy text="Back to the blog"/></Link></div></section></>;
 const related=c.articles.map((x,k)=>({x,k})).filter(({k})=>k!==i).sort((p,q)=>Number(q.x.category===a.category)-Number(p.x.category===a.category)).slice(0,3);
 return <>
  <section className="b-hero"><div className="s-wrap">
   <Link href="/blog" className="b-back"><ArrowLeft size={16}/> <Copy text="All articles"/></Link>
   {a.category&&<span className="b-kicker light">{a.category}</span>}
   <h1>{a.title}</h1>
   <div className="b-hero-meta"><Author c={c}/><Meta a={a}/></div>
  </div></section>
  <section className="s-cream b-article-wrap"><div className="s-wrap">
   <div className="b-cover"><img src={articleImage(a,i,1600)} alt=""/></div>
   <article className="b-prose">
    {a.body.split(/\n\s*\n/).filter(Boolean).map((p,k)=><p key={k}>{p}</p>)}
    <div className="b-cta"><div><h3><Copy text="Ready to talk?"/></h3><p><Copy text="If this resonates, you don’t have to work through it alone."/> {firstName(c.name)} <Copy text="offers confidential online sessions."/></p></div><Link className="s-btn" href="/booking"><CalendarDays size={17}/> <Copy text="Book a Session"/></Link></div>
    <nav className="s-article-nav" aria-label={t("More articles")}>{i>0?<Link href={href(i-1)}><ArrowLeft size={15}/> <Copy text="Previous"/></Link>:<span/>}{i<c.articles.length-1&&<Link href={href(i+1)}><Copy text="Next"/> <ArrowRight size={15}/></Link>}</nav>
   </article>
  </div></section>
  {related.length>0&&<section className="s-sec b-related"><div className="s-wrap">
   <div className="b-head"><div><Eyebrow left><Copy text="Keep Reading"/></Eyebrow><h2><Copy text="More from the blog"/></h2></div></div>
   <div className="b-grid" data-n={related.length}>{related.map(({x,k})=><PostCard key={k} a={x} i={k} c={c}/>)}</div>
  </div></section>}
 </>;
}
