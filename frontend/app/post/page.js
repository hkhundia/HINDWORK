"use client";import {useState} from "react";import {api} from "../../lib/api";import Link from "next/link";
export default function Post(){const [f,setF]=useState({title:"",description:"",category:"Design",budget:3000,days:5,language:"Hindi",skills:""});const [err,setErr]=useState("");
const set=k=>e=>setF({...f,[k]:e.target.value});const fair=f.budget>=2500&&f.budget<=4500;
async function pub(){try{const d=await api("/jobs/",{method:"POST",body:{...f,budget:+f.budget,days:+f.days}});location.href=`/jobs/${d.id}`}catch(e){setErr(e.message)}}
return(<><h1>Post a job</h1><div className="card"><button className="btn alt" onClick={()=>alert("Voice input: connect the Web Speech API (hi-IN) here")}>🎙 Speak in Hindi</button>
<label>Title</label><input value={f.title} onChange={set("title")} placeholder="Logo for my bakery"/><label>Describe the work</label><textarea rows={3} value={f.description} onChange={set("description")}/>
<div className="row"><div style={{flex:1}}><label>Budget (₹)</label><input type="number" value={f.budget} onChange={set("budget")}/></div><div style={{flex:1}}><label>Days</label><input type="number" value={f.days} onChange={set("days")}/></div></div>
<div className="row"><div style={{flex:1}}><label>Category</label><select value={f.category} onChange={set("category")}>{["Design","Typing","Video","Coding","Writing"].map(c=><option key={c}>{c}</option>)}</select></div><div style={{flex:1}}><label>Language</label><select value={f.language} onChange={set("language")}>{["Hindi","English","Marathi"].map(c=><option key={c}>{c}</option>)}</select></div></div>
<label>Skills needed (comma separated)</label><input value={f.skills} onChange={set("skills")} placeholder="logo, canva"/>
<p className="pill" style={{marginTop:12}}>AI price check: similar jobs cost ₹2,500 to ₹4,500. {fair?"Your budget is fair.":"Your budget is outside the usual range."}</p>
{err&&<p className="err">{err} {err.includes("Authentication")&&<Link href="/login">Log in as an employer</Link>}</p>}<p><button className="btn" onClick={pub}>Publish job</button></p></div></>)}
