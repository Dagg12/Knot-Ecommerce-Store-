import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function getProducts(){
  const q=query(
    collection(db,'products'),
    where('active','==',true),
    orderBy('createdAt','desc'),
    limit(100)
  );
  const snap=await getDocs(q);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

export function money(v){
  const n=Number(v);
  if(!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:0}).format(n);
}
