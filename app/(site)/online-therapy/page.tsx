import {siteMetadata} from '../../../lib/site-metadata';
import type {Metadata} from 'next';
import {PageBanner,Testimonials} from '../../../components/site/sections';
import {OnlineTherapy} from '../../../components/site/pages';
export async function generateMetadata():Promise<Metadata>{return siteMetadata("Online Therapy | Asima Aftab Psychotherapy","Secure, professional online psychotherapy and counselling from the comfort of your home.");}
export default function Online(){return <><PageBanner title="Online Therapy" subtitle="Secure, professional psychotherapy from the comfort of your home."/><OnlineTherapy/><Testimonials/></>;}
