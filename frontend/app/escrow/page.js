"use client";import {useEffect,useState} from "react";import Link from "next/link";import {api,auth} from "../../lib/api";
const S=["hired","funded","working","delivered","paid"],L=["Hired","Funded","Working","Delivered","Paid"];
const NEXT={hired:["employer","deposit","Pay into escrow"],funded:["freelancer","start","Start work"],working:["freelancer","deliver","Submit delivery"],delivered:["employer","approve","Approve and release payment"]};
export default function Escrow(){const [cs,setCs]=useState(null);const [sel,setSel]=useState(null);const [err,setErr]=useState("");const [me,setMe]=useState(null);const [rt,setRt]=useState(5);const [rc,setRc]=useState("");const [done,setDone]=useState(false);
const load=()=>api("/contracts/").then(d=>{setCs(d);const w=new URLSearchParams(location.search).get("id");setSel(s=>s||(w?+w:d[0]?.id))}).catch(e=>setErr(e.message));
useEffect(()=>{setMe(auth.user());load()},[]);
const c=cs?.find(x=>x.id===sel);const act=a=>api(`/contracts/${c.id}/${a}/`,{method:"POST"}).then(()=>{setErr("");load()}).catch(e=>setErr(e.message));
const pay=async()=>{try{setErr("");const o=await api(`/contracts/${c.id}/pay/create/`,{method:"POST"});if(o.mode==="test")return act("deposit");
await new Promise((ok,no)=>{if(window.Razorpay)return ok();const t=document.createElement("script");t.src="https://checkout.razorpay.com/v1/checkout.js";t.onload=ok;t.onerror=()=>no(new Error("Could not load Razorpay checkout."));document.body.appendChild(t)});
new window.Razorpay({key:o.key_id,amount:o.amount,currency:"INR",order_id:o.order_id,name:"KaamSetu Escrow",description:c.job_title,theme:{color:"#E5195A"},prefill:{name:me?.username},handler:r=>api(`/contracts/${c.id}/pay/verify/`,{method:"POST",body:r}).then(load).catch(e=>setErr(e.message))}).open()}catch(e){setErr(e.message)}};
const rev=()=>api(`/contracts/${c.id}/review/`,{method:"POST",body:{rating:rt,comment:rc}}).then(()=>setDone(true)).catch(e=>setErr(e.message));
if(err&&!cs)return <p className="err">{err} <Link href="/login">Log in</Link></p>;if(!cs)return <p>Loading...</p>;
if(!c)return <div className="card"><h2>No contracts yet</h2><p className="mute">Hire a freelancer from a job's proposals to start an escrow.</p><Link className="btn" href="/jobs">Browse jobs</Link></div>;
const i=S.indexOf(c.stage),n=NEXT[c.stage],mine=n&&me?.role===n[0];
return(<><h1>Escrow: {c.job_title}</h1>{cs.length>1&&<div className="row">{cs.map(x=><button key={x.id} className={x.id===sel?"btn sm":""} onClick={()=>setSel(x.id)}>{x.job_title}</button>)}</div>}
<div className="steps">{L.map((x,k)=><div key={x} className={"st "+(c.stage==="paid"||k<i?"d":k===i?"c":"")}>{x}</div>)}</div>
<div className="card"><div className="mute">Held safely by KaamSetu</div><h2>₹{c.amount.toLocaleString("en-IN")} {c.stage==="paid"?"paid out":["funded","working","delivered"].includes(c.stage)?"in escrow":c.stage==="disputed"?"frozen":"not yet deposited"}</h2>
{c.stage==="disputed"&&<p className="err">Dispute raised. Money is frozen until an admin decides.</p>}
{n&&(mine?<button className="btn" onClick={()=>n[1]==="deposit"?pay():act(n[1])}>{n[2]}</button>:<p className="mute">Waiting for the {n[0]} to act. (You are logged in as {me?.role}.)</p>)}
{["funded","working","delivered"].includes(c.stage)&&<p style={{marginTop:10}}><button onClick={()=>act("dispute")}>Raise dispute</button></p>}
{err&&<p className="err">{err}</p>}
{c.stage==="paid"&&(done?<p className="okmsg">Review submitted. Thank you!</p>:<><h3>Leave a review</h3><select value={rt} onChange={e=>setRt(+e.target.value)}>{[5,4,3,2,1].map(x=><option key={x} value={x}>{"★".repeat(x)}</option>)}</select><textarea rows={2} placeholder="How did it go?" value={rc} onChange={e=>setRc(e.target.value)} style={{marginTop:8}}/><p><button className="btn" onClick={rev}>Submit review</button></p></>)}
{c.transactions.length>0&&<><h3 style={{marginTop:14}}>Transactions</h3>{c.transactions.map(t=><p className="mute" key={t.id}>{t.kind}: ₹{t.amount} · ref {t.gateway_ref}</p>)}</>}</div></>)}