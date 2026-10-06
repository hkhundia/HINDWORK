import {people} from "../../../lib/data";import Link from "next/link";import Avatar from "../../../components/Avatar";import Icon,{I} from "../../../components/Icon";
export default function Profile({params}){const p=people.find(x=>x.id==params.id);if(!p)return <p>Profile not found.</p>;
return(<><div className="banner"/><div className="card prof"><div className="row" style={{alignItems:"flex-end"}}><Avatar name={p.name} i={p.id} size={92}/><div style={{flex:1}}><h1>{p.name} <span className="pill gold"><Icon d={I.check} size={13}/> Verified</span></h1><span className="mute">{p.city} · {p.langs.join(", ")}</span></div><Link className="btn alt" href="/post">Invite to job</Link></div>
<div className="stats3">{[[`★ ${p.rating}`,`${p.reviews} reviews`],[`${p.ontime}%`,"On time"],[`₹${p.rate}`,"Per hour"]].map(([a,b])=><div key={b}><b>{a}</b><span>{b}</span></div>)}</div></div>
<div className="card"><h3>Skills</h3>{p.skills.map(s=><span className="pill" key={s}>{s}</span>)}</div>
<h3>Portfolio</h3><div className="grid">{p.work.map((w,i)=><div className="card port" key={w}><div className={"thumb t"+(i%3)}/><b>{w}</b></div>)}</div>
<div className="card"><h3>Latest review</h3><p className="gstar">★★★★★</p><p>"{p.review}"</p></div></>)}
