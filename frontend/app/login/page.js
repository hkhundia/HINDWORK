"use client";import {useState} from "react";import {api,auth} from "../../lib/api";
export default function Login(){const [mode,setMode]=useState("register");const [f,setF]=useState({username:"",password:"",role:"freelancer",city:"",skills:""});const [err,setErr]=useState("");const [busy,setBusy]=useState(false);
const set=k=>e=>setF({...f,[k]:e.target.value});
async function go(){setErr("");setBusy(true);try{let t,u;
if(mode==="register"){const d=await api("/auth/register/",{method:"POST",body:f});t=d.token;u=d.user}
else{t=(await api("/auth/login/",{method:"POST",body:{username:f.username,password:f.password}})).token;localStorage.setItem("ks_token",t);u=await api("/me/")}
auth.save(t,u);location.href=u.role==="freelancer"?"/jobs":"/post"}catch(e){setErr(e.message)}setBusy(false)}
return(<div className="card" style={{maxWidth:440,margin:"24px auto"}}><h2>{mode==="register"?"Create your account":"Welcome back"}</h2>
<div className="row"><button className={mode==="register"?"btn sm":""} onClick={()=>setMode("register")}>Sign up</button><button className={mode==="login"?"btn sm":""} onClick={()=>setMode("login")}>Log in</button></div>
<label>Username</label><input value={f.username} onChange={set("username")} placeholder="priya"/><label>Password (6+ characters)</label><input type="password" value={f.password} onChange={set("password")}/>
{mode==="register"&&<><label>I am a</label><select value={f.role} onChange={set("role")}><option value="freelancer">Freelancer (I want work)</option><option value="employer">Employer (I want to hire)</option></select>
<label>City</label><input value={f.city} onChange={set("city")} placeholder="Roorkee"/>{f.role==="freelancer"&&<><label>Skills (comma separated)</label><input value={f.skills} onChange={set("skills")} placeholder="logo, canva, photoshop"/></>}</>}
{err&&<p className="err">{err}</p>}<p><button className="btn" disabled={busy} onClick={go}>{busy?"Please wait...":mode==="register"?"Create account":"Log in"}</button></p>
<p className="mute">Demo: priya (freelancer) or rahul (employer), password demo1234.</p></div>)}
