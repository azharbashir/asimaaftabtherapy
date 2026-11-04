import {siteMetadata} from '../../../lib/site-metadata';
import type {Metadata} from 'next';
import {PageBanner,AboutSection,StatsBar,Testimonials} from '../../../components/site/sections';
export async function generateMetadata():Promise<Metadata>{return siteMetadata("About Me | Asima Aftab Psychotherapy");}
export default function About(){return <><PageBanner title="About Me" subtitle="Who I am and how I work"/><AboutSection/><StatsBar/><Testimonials/></>;}
