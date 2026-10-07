"use client";import Link from "next/link";import {usePathname} from "next/navigation";
export default function NavLinks({items}){const p=usePathname()||"";return <div className="links">{items.map(([h,t])=><Link key={h} href={h} className={p===h||p.startsWith(h+"/")?"on":""}>{t}</Link>)}</div>}
