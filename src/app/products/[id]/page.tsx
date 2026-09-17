import ProductStudio from '@/components/product-studio';
import Link from 'next/link';
import {Grid3X3,Sparkles} from 'lucide-react';
import {Button} from '@/components/ui';

export default async function ProductDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return <>
    <div className="content" style={{paddingBottom:0}}>
      <div className="form-actions" style={{justifyContent:'flex-end'}}>
        <Link href={`/ai?product=${encodeURIComponent(id)}`}><Button className="primary"><Sparkles size={14}/> AI Assistant</Button></Link>
        <Link href="./variant-matrix"><Button><Grid3X3 size={14}/> Variant Matrix</Button></Link>
      </div>
    </div>
    <ProductStudio />
  </>;
}
