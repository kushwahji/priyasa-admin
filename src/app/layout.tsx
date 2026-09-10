import './globals.css';
import {Shell} from '@/components/ui';
export const metadata={title:'PRIYASA Admin',description:'PRIYASA commerce administration'};
export default function Layout({children}:{children:React.ReactNode}){return <Shell>{children}</Shell>}
