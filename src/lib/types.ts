export type ApiResult<T=unknown>={success?:boolean;data?:T;message?:string;errors?:Record<string,string[]>};
export type Inventory={quantity:number;reserved_quantity?:number;reserved?:number;available?:number;low_stock_threshold?:number};
export type Product={id:number|string;name:string;slug:string;sku?:string;price:number;mrp?:number;status:string;category?:{id:number|string;name:string};variants?:Variant[]};
export type Variant={id:number|string;sku?:string;barcode?:string;name?:string;size?:string;color?:string;price?:number;mrp?:number;weight_grams?:number;image_url?:string;attributes?:Record<string,unknown>;is_active?:boolean;inventory?:Inventory};
export type Order={id:number|string;order_number?:string;status:string;total?:number;grand_total?:number;currency?:string;created_at?:string;customer?:{name?:string;phone?:string;email?:string};items?:unknown[];statusHistory?:unknown[];payment?:unknown};
export type Paginated<T>={data:T[];current_page:number;last_page:number;total:number;per_page:number};
