import ProductStudio from '@/components/product-studio';
import Link from 'next/link';
import {Grid3X3} from 'lucide-react';
import {Button} from '@/components/ui';

export default function ProductDetail(){
  return <>
    <div className="content" style={{paddingBottom:0}}>
      <div className="form-actions" style={{justifyContent:'flex-end'}}>
        <Link href="./variant-matrix"><Button className="primary"><Grid3X3 size={14}/> Variant Matrix</Button></Link>
      </div>
    </div>
    <ProductStudio />
  </>;
}
