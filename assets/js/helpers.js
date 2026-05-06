function startOfDay(date){const d=new Date(date);d.setHours(0,0,0,0);return d;}
function monthStart(date){const d=new Date(date);d.setDate(1);d.setHours(0,0,0,0);return d;}
function addMonths(date,months){const d=new Date(date);d.setMonth(d.getMonth()+months);return d;}
function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d;}
function toDateKey(date){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function escapeHtml(value){return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function formatNumber(value){const n=Number(String(value).replace(",","."));if(Number.isNaN(n))return value;return n.toLocaleString("nl-BE",{maximumFractionDigits:1});}
function colorForTitle(title){const l=title.toLowerCase();if(l.includes("alexis"))return"blue";if(l.includes("amylia"))return"purple";if(l.includes("louize"))return"orange";if(l.includes("hannah"))return"green";if(l.includes("loïc")||l.includes("loic"))return"red";if(l.includes("werk"))return"blue";if(l.includes("school"))return"orange";return"green";}
