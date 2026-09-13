import {notFound} from 'next/navigation';
import AdminWorkspace from '@/components/admin-workspace';
import {ADMIN_CAPABILITIES} from '@/lib/admin-capabilities';

export const dynamic = 'force-dynamic';

export default async function DynamicAdminWorkspace({params}:{params:Promise<{workspace:string}>}){
  const {workspace}=await params;
  const keyMap:Record<string,string>={
    inventory:'inventory',orders:'orders',customers:'customers',promotions:'marketing',returns:'returns',
    shipping:'shipping',cms:'website',notifications:'communications',automation:'automation',
    integrations:'integrations',admins:'security',settings:'security',audit:'security',analytics:'analytics',
    merchandising:'marketing',whatsapp:'communications',categories:'catalog',collections:'catalog',reviews:'catalog',
    support:'support',finance:'analytics',fulfillment:'shipping',api-ops:'operations'
  };
  const capabilityKey=keyMap[workspace];
  if(!capabilityKey || !ADMIN_CAPABILITIES.some(c=>c.key===capabilityKey)) return notFound();
  return <AdminWorkspace capabilityKey={capabilityKey}/>;
}
