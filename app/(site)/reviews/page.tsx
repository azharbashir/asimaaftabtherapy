import type {Metadata} from 'next';
import {siteMetadata} from '../../../lib/site-metadata';
import ReviewsPage from '../../../components/site/reviews';
export async function generateMetadata():Promise<Metadata>{return siteMetadata('Client Reviews | Asima Aftab Psychotherapy','Personal experiences, shared voluntarily. Read reviews by service or share your own reflection.');}
export default function Reviews(){return <ReviewsPage/>;}
