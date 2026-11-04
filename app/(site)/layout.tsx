import {ContentProvider} from '../../components/site/content';
import {Shell} from '../../components/site/shell';
export default function SiteLayout({children}:{children:React.ReactNode}){return <ContentProvider><Shell>{children}</Shell></ContentProvider>;}
