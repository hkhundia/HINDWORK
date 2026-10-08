"use client";import {useEffect,useState} from "react";import JobCard from "../../components/JobCard";import {api,auth,toJob} from "../../lib/api";
export default function Jobs(){const [q,setQ]=useState("");const [cat,setCat]=useState("All");const [max,setMax]=useState(0);const [lang,setLang]=useState("All");const [list,setList]=useState(null);const [err,setErr]=useState("");
useEffect(()=>{setQ(new URLSearchParams(location.search).get("q")||"")},[]);
useEffect(()=>{const p=new URLSearchParams();if(q)p.set("q",q);if(cat!=="All")p.set("category",cat);if(lang!=="All")p.set("language",lang);if(max)p.set("max_budget",max);
const u=auth.user();const rec=u&&u.role==="freelancer"?api("/recommendations/jobs/").catch(()=>[]):Promise.resolve([]);
Promise.all([api("/jobs/?"+p),rec]).then(([d,r])=>{const m={};r.forEach(x=>m[x.id]=x);setList(d.map(toJob).map(j=>m[j.id]?{...j,match:m[j.id].match,why:m[j.id].why}:j).sort((a,b)=>(b.match||0)-(a.match||0)));setErr("")}).catch(e=>setErr(e.message))},[q,cat,lang,max]);
return(<><h1>Find work</h1><div className="card row"><input style={{flex:2,minWidth:180}} placeholder="Search jobs" value={q} onChange={e=>setQ(e.target.value)}/>
<select style={{flex:1}} value={cat} onChange={e=>setCat(e.target.value)}>{["All","Design","Typing","Video","Coding","Writing"].map(c=><option key={c}>{c}</option>)}</select>
<select style={{flex:1}} value={lang} onChange={e=>setLang(e.target.value)}>{["All","Hindi","English","Marathi"].map(c=><option key={c}>{c}</option>)}</select>
<select style={{flex:1}} value={max} onChange={e=>setMax(+e.target.value)}><option value={0}>Any budget</option><option value={2500}>Up to ₹2,500</option><option value={5000}>Up to ₹5,000</option></select></div>
{err&&<p className="err">{err}</p>}{list&&<p className="mute">{list.length} open jobs{auth.user()?.role==="freelancer"?", best matches for your skills first":""}.</p>}
{list?.map(j=><JobCard key={j.id} j={j}/>)}{list&&!list.length&&<p>No jobs match. Clear a filter to see more.</p>}</>)}
