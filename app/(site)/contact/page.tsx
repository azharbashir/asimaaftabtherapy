import {siteMetadata} from '../../../lib/site-metadata';
import type {Metadata} from 'next';
import {PageBanner,BookingSection} from '../../../components/site/sections';
export async function generateMetadata():Promise<Metadata>{return siteMetadata("Contact | Asima Aftab Psychotherapy");}
export default function Contact(){return <><PageBanner title="Get in Touch" subtitle="Ready to begin? Reach out and we’ll set up your first session."/><BookingSection/></>;}
