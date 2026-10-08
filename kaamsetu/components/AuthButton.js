"use client";import {useEffect,useState} from "react";import Link from "next/link";import {auth} from "../lib/api";
export default function AuthButton(){const [u,setU]=useState(null);useEffect(()=>{setU(auth.user())},[]);
if(!u)return <Link href="/login" className="btn sm">Join free</Link>;
return <span className="row"><b>{u.username}</b><span className="pill">{u.role}</span><button onClick={()=>{auth.clear();location.href="/"}}>Log out</button></span>}
