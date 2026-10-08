"use client";import {useState} from "react";import Link from "next/link";import {api,auth} from "../../lib/api";
const SUG=["logo","canva","photoshop","react","hindi typing","video editing","translation"];
export default function Login(){
const [mode,setMode]=useState("register");const [f,setF]=useState({username:"",password:"",role:"freelancer",city:""});const [sk,setSk]=useState([]);const [tx,setTx]=useState("");const [show,setShow]=useState(false);const [err,setErr]=useState("");const [busy,setBusy]=useState(false);
const set=k=>e=>setF({...f,[k]:e.target.value});
const add=s=>{s=s.trim().toLowerCase();if(s&&!sk.includes(s))setSk(a=>[...a,s]);setTx("")};
async function go(u=f.username,p=f.password,m=mode){setErr("");setBusy(true);try{let t,usr;
if(m==="register"){const skills=[...sk,...(tx.trim()?[tx.trim().toLowerCase()]:[])].join(",");const d=await api("/auth/register/",{method:"POST",body:{...f,skills}});t=d.token;usr=d.user}
else{t=(await api("/auth/login/",{method:"POST",body:{username:u,password:p}})).token;localStorage.setItem("ks_token",t);usr=await api("/me/")}
auth.save(t,usr);location.href=usr.role==="freelancer"?"/jobs":"/post"}catch(e){setErr(e.message)}setBusy(false)}
const reg=mode==="register";
return(<div className="cl-stage"><div className="cl-card">
<section className="cl-form"><span className="cl-logo">HindWork</span>
<div className="cl-head"><h1>{reg?"Create an account":"Welcome back"}</h1><p>{reg?"Join free and start earning or hiring today":"Log in to continue where you left off"}</p></div>
{reg&&<div className="cl-roles">{[["freelancer","💼 Find work"],["employer","🏪 Hire talent"]].map(([k,t])=><button type="button" key={k} className={f.role===k?"on":""} onClick={()=>setF({...f,role:k})}>{t}</button>)}</div>}
<label className="cl-l">Username</label><input value={f.username} onChange={set("username")} placeholder="Choose a username" autoComplete="username"/>
<label className="cl-l">Password</label><div className="cl-pw"><input type={show?"text":"password"} value={f.password} onChange={set("password")} placeholder={reg?"At least 6 characters":"Your password"} autoComplete={reg?"new-password":"current-password"} onKeyDown={e=>e.key==="Enter"&&go()}/><button type="button" className="cl-eye" onClick={()=>setShow(!show)}>{show?"Hide":"Show"}</button></div>
{reg&&<><label className="cl-l">City</label><input value={f.city} onChange={set("city")} placeholder="Your city"/>
{f.role==="freelancer"&&<><label className="cl-l">Skills (press Enter to add)</label><div className="cl-chips">{sk.map(s=><span className="pill" key={s}>{s} <a onClick={()=>setSk(sk.filter(x=>x!==s))}>✕</a></span>)}<input value={tx} onChange={e=>setTx(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();add(tx)}}} placeholder={sk.length?"":"Type a skill and press Enter"}/></div>
<div className="cl-sugs">{SUG.filter(s=>!sk.includes(s)).slice(0,5).map(s=><button type="button" className="cl-sug" key={s} onClick={()=>add(s)}>+ {s}</button>)}</div></>}</>}
{err&&<p className="err" style={{margin:"10px 0 0 8px"}}>{err}</p>}
<button className="cl-go" disabled={busy} onClick={()=>go()}>{busy?"Please wait...":reg?"Create account":"Log in"}</button>
<div className="cl-foot"><span>{reg?"Have an account? ":"New here? "}<a onClick={()=>{setMode(reg?"login":"register");setErr("")}}>{reg?"Sign in":"Sign up"}</a></span><a>Terms &amp; Conditions</a></div></section>
<aside className="cl-side"><div className="cl-art"><b>काम भी,<br/>भरोसा भी</b></div><div className="cl-ph"/><Link href="/" className="cl-x" aria-label="Back to home">✕</Link><div className="cl-perks"><b>Why HindWork</b><p>✓ Payments held safely in escrow</p><p>✓ Sign up and post jobs in Hindi</p><p>✓ Jobs and talent matched by skill</p><p>✓ Free to join</p></div></aside></div></div>)}
