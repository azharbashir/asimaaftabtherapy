import {siteMetadata} from '../../../lib/site-metadata';
import type {Metadata} from 'next';
import {PageBanner,Testimonials} from '../../../components/site/sections';
import {BlogIndex} from '../../../components/site/blog';
export async function generateMetadata():Promise<Metadata>{return siteMetadata("Blog | Asima Aftab Psychotherapy","Mind Matters: insights and reflections on wellbeing and therapy.");}
export default function Blog(){return <><PageBanner title="Mind Matters" subtitle="Insights & perspectives from a psychotherapist."/><BlogIndex/><Testimonials/></>;}
