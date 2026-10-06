"use client";import {useEffect,useState} from "react";import {useParams} from "next/navigation";import {api,auth,toJob} from "../../../lib/api";import Proposal from "./Proposal";
export default function Job(){const {id}=useParams();const [j,setJ]=useState(null);const [err,setErr]=useState("");const [props,setProps]=useState(null);const [me,setMe]=useState(null);
useEffect(()=>{setMe(auth.user());api(`/jobs/${id}/`).then(d=>setJ(toJob(d))).catch(e=>setErr(e.message));api(`/jobs/${id}/proposals/`).then(setProps).catch(()=>{})},[id]);
const hire=pid=>api(`/proposals/${pid}/hire/`,{method:"POST"}).then(()=>location.href="/escrow").catch(e=>setErr(e.message));
if(err&&!j)return <p className="err">{err}</p>;if(!j)return <p>Loading...</p>;
return(<><h1>{j.title}</h1><span className="pill">{j.cat}</span><span className="pill">₹{j.budget}</span><span className="pill">{j.days} days</span><span className="pill">{j.status.replace("_"," ")}</span><span className="pill">Payment secured</span>
<p>{j.desc}</p><p className="mute">Posted by {j.by}</p>{err&&<p className="err">{err}</p>}
{props?<><h2>Proposals ({props.length})</h2>{props.map(p=><div className="card row" key={p.id} style={{justifyContent:"space-between"}}><div><b>{p.freelancer_name}</b> · ₹{p.price} · {p.days} days<p className="mute">{p.message}</p></div>{j.status==="open"?<button className="btn sm" onClick={()=>hire(p.id)}>Hire</button>:<span className="pill">{p.status}</span>}</div>)}{!props.length&&<p className="mute">No proposals yet.</p>}</>
:me?.role!=="employer"&&j.status==="open"&&<Proposal id={j.id} budget={j.budget} days={j.days}/>}</>)}
