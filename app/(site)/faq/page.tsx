import {siteMetadata} from '../../../lib/site-metadata';
import {Copy} from '../../../components/site/copy';
import type {Metadata} from 'next';
import {PageBanner,Eyebrow,FaqList,StillQuestions,Testimonials} from '../../../components/site/sections';
export async function generateMetadata():Promise<Metadata>{return siteMetadata("FAQ | Asima Aftab Psychotherapy");}
export default function Faq(){return <><PageBanner title="Frequently Asked Questions" subtitle="Find answers to common questions about therapy."/><section className="s-sec s-cream"><div className="s-wrap s-narrow"><div className="s-head"><Eyebrow><Copy text="Have Questions?"/></Eyebrow><h2><Copy text="Everything You Need to Know"/></h2></div><FaqList/><StillQuestions/></div></section><Testimonials/></>;}
