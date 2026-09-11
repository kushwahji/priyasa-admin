export function money(value:unknown,currency='INR'){const n=Number(value);if(!Number.isFinite(n))return '—';return new Intl.NumberFormat('en-IN',{style:'currency',currency,maximumFractionDigits:2}).format(n)}
export function dateTime(value?:string|null){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short'}).format(d)}
export function titleCase(value?:string){return (value||'—').replace(/[_-]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase())}
export function apiMessage(e:unknown,fallback='Something went wrong'){return e instanceof Error&&e.message?e.message:fallback}
