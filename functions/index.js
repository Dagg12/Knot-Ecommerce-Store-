const {onCall,onRequest} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
const {getFirestore,FieldValue} = require('firebase-admin/firestore');
const {initializeApp} = require('firebase-admin/app');
const crypto=require('crypto');
initializeApp();
const db=getFirestore();
const PAYSTACK_SECRET=defineSecret('PAYSTACK_SECRET_KEY');

exports.createPaystackCheckout=onCall({region:'us-central1',secrets:[PAYSTACK_SECRET],cors:true},async(request)=>{
  if(!request.auth) throw new Error('Authentication required.');
  const {orderId,email,amount}=request.data||{};
  if(!orderId||!email||!amount||Number(amount)<=0) throw new Error('Invalid checkout details.');
  const ref=db.collection('orders').doc(orderId); const snap=await ref.get();
  if(!snap.exists||snap.data().customerId!==request.auth.uid) throw new Error('Order not found.');
  const response=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${PAYSTACK_SECRET.value()}`,'Content-Type':'application/json'},body:JSON.stringify({email,amount:Math.round(Number(amount)*100),currency:'ZAR',metadata:{orderId}})});
  const data=await response.json(); if(!response.ok||!data.status) throw new Error(data.message||'Unable to initialize payment.');
  await ref.update({paymentStatus:'initiated',paymentReference:data.data.reference,paymentUpdatedAt:FieldValue.serverTimestamp()});
  return {authorizationUrl:data.data.authorization_url,reference:data.data.reference};
});

exports.paystackWebhook=onRequest({region:'us-central1',secrets:[PAYSTACK_SECRET],cors:false},async(req,res)=>{
  const signature=req.headers['x-paystack-signature'];
  const expected=crypto.createHmac('sha512',PAYSTACK_SECRET.value()).update(JSON.stringify(req.body)).digest('hex');
  if(!signature||signature!==expected) return res.status(401).send('Invalid signature');
  const event=req.body; const orderId=event?.data?.metadata?.orderId;
  if(orderId){const status=event.event==='charge.success'?'paid':event.event==='charge.failed'?'failed':null;if(status){await db.collection('orders').doc(orderId).update({paymentStatus:status,paymentReference:event.data.reference,paymentUpdatedAt:FieldValue.serverTimestamp(),paymentChannel:event.data.channel||null});}}
  return res.status(200).send('ok');
});
