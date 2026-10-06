import Link from "next/link";import Avatar from "./Avatar";import Icon,{I} from "./Icon";
export default function JobCard({j}){return(<Link href={`/jobs/${j.id}`} className="card hov job"><Avatar name={j.by} i={j.id}/><div style={{flex:1,minWidth:0}}>
<div className="row" style={{justifyContent:"space-between"}}><h3>{j.title}</h3><b className="price">₹{j.budget.toLocaleString("en-IN")}</b></div>
<p className="mute clamp">{j.desc}</p><div className="row"><span className="pill">{j.cat}</span><span className="pill">{j.lang}</span>
<span className="mute row" style={{gap:4}}><Icon d={I.clock} size={15}/>{j.days} days</span>{j.match&&<span className="pill gold"><Icon d={I.spark} size={13}/> {j.match}% match</span>}</div></div></Link>)}
