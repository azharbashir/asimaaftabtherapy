import {HomeHero} from '../../components/site/pages';
import {BlogSection} from '../../components/site/blog';
import {AboutSection,ServicesSection,StatsBar,BookingSection,Testimonials,ServiceTicker,ProcessSection} from '../../components/site/sections';
export default function Home(){return <><HomeHero/><ServiceTicker/><AboutSection/><div id="services"><ServicesSection/></div><StatsBar/><ProcessSection/><div id="contact"><BookingSection/></div><BlogSection/><Testimonials/></>;}
