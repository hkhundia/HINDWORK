"use client";import {useEffect,useState} from "react";
export default function Counter({to,suffix=""}){const [v,setV]=useState(0);
useEffect(()=>{let s=null,id;const f=t=>{s=s||t;const p=Math.min((t-s)/1600,1);setV(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)id=requestAnimationFrame(f)};id=requestAnimationFrame(f);return()=>cancelAnimationFrame(id)},[to]);
return <>{v.toLocaleString("en-IN")}{suffix}</>}
