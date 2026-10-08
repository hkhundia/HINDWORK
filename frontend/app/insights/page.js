"use client";import {useEffect,useState} from "react";import Link from "next/link";import {api} from "../../lib/api";
export default function Insights(){const [d,setD]=useState(null);const [err,setErr]=useState("");
useEffect(()=>{api("/insights/").then(setD).catch(e=>setErr(e.message))},[]);
if(err)return <p className="err">{err}</p>;if(!d)return <p>Loading...</p>;
const mc=Math.max(...d.categories.map(c=>c.open_jobs),1),ms=Math.max(...d.skills.map(s=>s.count),1);
return(<><h1>Market insights</h1><p className="mute">Live from {d.total_open} open jobs on HindWork.</p>
{d.tip?<div className="card tip">✦ <b>For you:</b> {d.tip}</div>:<div className="card tip">✦ <Link href="/login"><b>Log in as a freelancer</b></Link> to get personal tips on which skills to add.</div>}
{d.total_open===0&&<div className="card empty"><h3>No open jobs yet</h3><p className="mute">Insights appear here as soon as jobs are posted.</p></div>}<div className="grid"><div className="card"><h3>Jobs by category</h3>{d.categories.map(c=><div key={c.category} className="bar"><span>{c.category}</span><i style={{width:`${c.open_jobs/mc*100}%`}}/><b>{c.open_jobs} · avg ₹{c.avg_budget.toLocaleString("en-IN")}</b></div>)}</div>
<div className="card"><h3>Skills in demand</h3>{d.skills.slice(0,8).map(s=><div key={s.skill} className="bar"><span>{s.skill}</span><i style={{width:`${s.count/ms*100}%`}}/><b>{s.count}</b></div>)}</div></div>
<div className="card"><h3>Languages asked for</h3>{d.languages.map(l=><span className="pill" key={l.language}>{l.language}: {l.count}</span>)}</div></>)}
