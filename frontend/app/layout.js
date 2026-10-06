import "./globals.css";import Link from "next/link";import AuthButton from "../components/AuthButton";import Icon,{I} from "../components/Icon";
export const metadata={title:"KaamSetu: Freelance work for India",description:"Find work. Hire talent. Pay safely."};
export default function Layout({children}){return(<html lang="en"><body><nav><div className="navin"><Link href="/" className="logo"><span className="lg"><Icon d="M3 18c3-9 15-9 18 0M3 18h18M8 18v-4M12 18v-6M16 18v-4" size={22}/></span>KaamSetu</Link>
<div className="links">{[["/jobs","Find work"],["/freelancers","Find talent"],["/post","Post a job"],["/dashboard","Dashboard"],["/escrow","Escrow"]].map(([h,t])=><Link key={h} href={h}>{t}</Link>)}</div><AuthButton/></div></nav>
<main className="wrap">{children}</main><footer><div className="navin"><b>KaamSetu</b><span>काम भी, भरोसा भी · Escrow-protected payments · Made in India</span></div></footer></body></html>)}
