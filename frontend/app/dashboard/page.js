"use client";import {useEffect,useState} from "react";import Link from "next/link";import {api,auth} from "../../lib/api";
const S=["hired","funded","working","delivered","paid"],L=["Hired","Funded","Working","Delivered","Paid"];
export default function Dash(){const [cs,setCs]=useState(null);const [err,setErr]=useState("");const [me,setMe]=useState(null);
useEffect(()=>{setMe(auth.user());api("/contracts/").then(setCs).catch(e=>setErr(e.message))},[]);
if(err)return <p className="err">{err} <Link href="/login">Log in</Link></p>;if(!cs)return <p>Loading...</p>;
const sum=f=>cs.filter(f).reduce((a,c)=>a+c.amount,0);
return(<><h1>My projects{me&&<span className="pill" style={{marginLeft:10}}>{me.username} · {me.role}</span>}</h1><div className="grid">{[["Active",cs.filter(c=>c.stage!=="paid").length],["In escrow","₹"+sum(c=>["funded","working","delivered"].includes(c.stage)).toLocaleString("en-IN")],["Paid out","₹"+sum(c=>c.stage==="paid").toLocaleString("en-IN")]].map(([a,b])=><div className="card" key={a}><div className="mute">{a}</div><h2>{b}</h2></div>)}</div>
{cs.map(c=>{const i=S.indexOf(c.stage);return <div className="card" key={c.id}><h3>{c.job_title} · ₹{c.amount}</h3><div className="steps">{L.map((x,k)=><div key={x} className={"st "+(c.stage==="paid"||k<i?"d":k===i?"c":"")}>{x}</div>)}</div><Link className="btn sm" href={`/escrow?id=${c.id}`}>Open escrow</Link></div>})}
{!cs.length&&<div className="card"><p>No projects yet. Employers: open a job and hire from its proposals. Freelancers: send a proposal.</p><Link className="btn" href="/jobs">Browse jobs</Link></div>}
<div className="card"><b>AI insight:</b> Design jobs rose 18% this month. Adding "packaging" could raise your rate by about ₹100/hr.</div></>)}
