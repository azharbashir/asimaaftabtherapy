import {siteMetadata} from '../../../lib/site-metadata';
import type {Metadata} from 'next';
import {Testimonials} from '../../../components/site/sections';
import {BookingPage} from '../../../components/site/pages';
export async function generateMetadata():Promise<Metadata>{return siteMetadata("Book a Session | Asima Aftab Psychotherapy");}
export default function Booking(){return <><BookingPage/><Testimonials/></>;}
