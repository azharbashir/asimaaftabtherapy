'use client';
import {useEffect} from 'react';

// Elements that fade/slide in as they scroll into view. Siblings are staggered.
const REVEAL=['.s-head','.s-card','.s-post','.b-head','.b-card','.b-featured','.b-filters','.b-prose>p','.b-cta','.s-feature','.s-plan','.s-faq-list details','.s-about-art','.s-about-copy','.s-booking-grid>*','.s-stats .s-wrap>div','.s-price-box','.s-detail-main','.s-side-box','.s-side-cta','.s-still','.s-contacts>*','.s-carousel','.s-step','.s-cta-band','.s-foot-grid>div','.s-split>div:first-child>.s-actions','.s-center'].join(',');

/** Scroll-reveal animations for the public site. Skipped entirely when the visitor prefers reduced motion. */
export function useReveal(){
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  const tagged=new Set<HTMLElement>();
  const tag=()=>{
   document.querySelectorAll<HTMLElement>(REVEAL).forEach(el=>{
    if(el.dataset.rv)return;
    tagged.add(el);
    el.dataset.rv='1';
    // Already on screen when first seen: leave visible so nothing flashes.
    if(el.getBoundingClientRect().top<window.innerHeight*.92)return;
    const sibs=el.parentElement?[...el.parentElement.children].filter(x=>x.matches(REVEAL)):[];
    el.style.setProperty('--rv-d',Math.min(sibs.indexOf(el),5)*90+'ms');
    el.classList.add('rv');
    io.observe(el);
   });
  };
  tag();
  // Content loads after first paint and pages change client-side, so watch for new elements.
  let raf=0;
  const mo=new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(tag);});
  mo.observe(document.body,{childList:true,subtree:true});
  return()=>{
   io.disconnect();mo.disconnect();cancelAnimationFrame(raf);
   // Strict Mode replays effects. Restore visibility and allow the next setup
   // to observe these elements instead of leaving unobserved hidden sections.
   for(const el of tagged){
    delete el.dataset.rv;
    el.classList.remove('rv','in');
    el.style.removeProperty('--rv-d');
   }
  };
 },[]);
}

/** Header shadow/shrink, back-to-top visibility and the scroll progress bar. */
export function useScrollState(onChange:(state:{stuck:boolean;far:boolean})=>void){
 useEffect(()=>{
  const bar=document.querySelector<HTMLElement>('.s-progress');
  let last='';
  const on=()=>{
   const y=window.scrollY,max=document.documentElement.scrollHeight-window.innerHeight;
   bar?.style.setProperty('transform',`scaleX(${max>0?Math.min(y/max,1):0})`);
   const key=(y>40?'1':'0')+(y>400?'1':'0');
   if(key!==last){last=key;onChange({stuck:y>40,far:y>400});}
  };
  on();window.addEventListener('scroll',on,{passive:true});window.addEventListener('resize',on);
  return()=>{window.removeEventListener('scroll',on);window.removeEventListener('resize',on);};
 },[onChange]);
}

/** Soft light that follows the pointer across cards marked with `.spot`. Mouse/pen only; off for reduced motion. */
export function useSpotlight(){
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!window.matchMedia('(hover: hover)').matches)return;
  let raf=0;
  const on=(e:PointerEvent)=>{
   const el=(e.target as Element|null)?.closest?.('.spot') as HTMLElement|null;
   if(!el)return;
   cancelAnimationFrame(raf);
   raf=requestAnimationFrame(()=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',e.clientX-r.left+'px');el.style.setProperty('--my',e.clientY-r.top+'px');});
  };
  document.addEventListener('pointermove',on,{passive:true});
  return()=>{document.removeEventListener('pointermove',on);cancelAnimationFrame(raf);};
 },[]);
}
