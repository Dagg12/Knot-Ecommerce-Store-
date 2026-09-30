const KEY='kcc-cart-v2';
export function readCart(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
export function saveCart(cart){localStorage.setItem(KEY,JSON.stringify(cart));window.dispatchEvent(new Event('cart:updated'));return cart}
export function addToCart(product,variant={}){const cart=readCart();const key=`${product.id}-${variant.size||''}-${variant.color||''}`;const i=cart.findIndex(x=>x.key===key);if(i>=0)cart[i].qty+=1;else cart.push({key,id:product.id,name:product.name,price:Number(product.price)||0,image:product.image,qty:1,size:variant.size||'',color:variant.color||''});return saveCart(cart)}
export function updateQty(key,qty){const cart=readCart().map(x=>x.key===key?{...x,qty:Math.max(0,qty)}:x).filter(x=>x.qty>0);return saveCart(cart)}
export function removeItem(key){return updateQty(key,0)}
export function totals(){const cart=readCart();const subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0);return {subtotal,shipping:subtotal>=1500||subtotal===0?0:99,total:subtotal+(subtotal>=1500||subtotal===0?0:99),count:cart.reduce((s,x)=>s+x.qty,0)}}
