"use client";import {useState} from "react";import Link from "next/link";
export default function TopBar(){const [o,setO]=useState(true);if(!o)return null;const t="Post your first job free ● Escrow-protected payments ● Hindi voice posting ● No hidden charges ● ";
return(<div className="topbar"><div className="mq"><div>{t.repeat(6)}</div></div><Link href="/post" className="tb">POST A JOB</Link><button aria-label="Close banner" onClick={()=>setO(false)}>✕</button></div>)}
