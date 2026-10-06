export const jobs=[
{id:1,title:"Logo for my bakery",budget:3000,days:5,cat:"Design",lang:"Hindi",by:"Rahul",desc:"Simple logo and 2 social banners for a home bakery. Hindi and English text.",skills:["Logo","Canva"]},
{id:2,title:"Hindi typing, 40 pages",budget:1800,days:3,cat:"Typing",lang:"Hindi",by:"Anita",desc:"Type scanned Hindi pages into Word.",skills:["Hindi typing"]},
{id:3,title:"Instagram reels editing",budget:5000,days:7,cat:"Video",lang:"English",by:"Karan",desc:"Edit 8 short reels from raw footage.",skills:["Video editing","Reels"]},
{id:4,title:"Landing page in React",budget:9000,days:10,cat:"Coding",lang:"English",by:"Meera",desc:"One responsive landing page for a tutoring startup.",skills:["React","CSS"]},
{id:5,title:"Translate brochure to Marathi",budget:2200,days:4,cat:"Writing",lang:"Marathi",by:"Sunil",desc:"Translate a 6-page brochure from English.",skills:["Translation","Marathi"]}];
export const people=[
{id:1,name:"Priya Sharma",city:"Roorkee",rate:400,rating:4.9,reviews:23,ontime:96,langs:["Hindi","English"],skills:["Logo","Canva","Photoshop","Packaging"],work:["Bakery logo set","Sweet box packaging","Festival posters"],review:"Delivered early and fixed every change."},
{id:2,name:"Aman Verma",city:"Dehradun",rate:600,rating:4.7,reviews:15,ontime:92,langs:["Hindi","English"],skills:["React","CSS","Next.js"],work:["Tutor site","Shop dashboard"],review:"Clean code, clear updates."}];
export const recommend=(skills)=>jobs.map(j=>({...j,match:Math.min(99,40+30*j.skills.filter(s=>skills.includes(s)).length+ (j.cat==="Design"?20:0))})).sort((a,b)=>b.match-a.match);
people.push(
{id:3,name:"Sneha Patil",city:"Pune",rate:350,rating:4.8,reviews:31,ontime:98,langs:["Marathi","Hindi","English"],skills:["Translation","Marathi","Content writing"],work:["Brochure translation","Blog series"],review:"Accurate and very polite."},
{id:4,name:"Rohit Negi",city:"Haridwar",rate:450,rating:4.6,reviews:12,ontime:90,langs:["Hindi","English"],skills:["Video editing","Reels","Premiere Pro"],work:["Wedding highlights","Shop reels"],review:"Fast edits, great sense of timing."});
export const cats=[["Design","Logos, posters, packaging","M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"],["Coding","Websites and apps","M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"],["Video","Reels and edits","M4 6h11v12H4zM15 10l5-3v10l-5-3"],["Writing","Content and translation","M5 19l1-4L17 4l3 3L9 18zM14 7l3 3"],["Typing","Hindi and English data","M3 7h18v10H3zM7 11h2M11 11h2M15 11h2M8 14h8"]];
