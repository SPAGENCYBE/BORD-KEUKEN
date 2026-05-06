let hlnNewsItems=[];
let hlnNewsIndex=0;
let hlnNewsTimer=null;
const FALLBACK_HLN_NEWS=[
  {title:"HLN nieuws tijdelijk niet beschikbaar — probeer later opnieuw",link:"https://www.hln.be/"},
  {title:"Open HLN.be voor het meest recente nieuws van vandaag",link:"https://www.hln.be/"}
];

async function loadHLNNews(){
  const target=document.getElementById("hlnHeadline");if(!target)return;
  const rssUrl="https://www.hln.be/home/rss.xml";
  const proxyUrls=[
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`
  ];
  for(const proxyUrl of proxyUrls){
    try{
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),7000);
      const res=await fetch(proxyUrl,{cache:"no-store",signal:controller.signal});clearTimeout(timeout);
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const xmlText=await res.text();const items=parseRssItems(xmlText).slice(0,10);
      if(!items.length)throw new Error("Geen RSS items gevonden");
      hlnNewsItems=items;hlnNewsIndex=0;renderHLNHeadline();
      clearInterval(hlnNewsTimer);
      hlnNewsTimer=setInterval(()=>{if(!hlnNewsItems.length)return;hlnNewsIndex=(hlnNewsIndex+1)%hlnNewsItems.length;renderHLNHeadline();},9000);
      return;
    }catch(error){console.warn("HLN proxy niet beschikbaar:",error);}
  }
  hlnNewsItems=FALLBACK_HLN_NEWS;hlnNewsIndex=0;renderHLNHeadline();
}
function parseRssItems(xmlText){const xml=new DOMParser().parseFromString(xmlText,"text/xml");return [...xml.querySelectorAll("item")].map(item=>({title:item.querySelector("title")?.textContent?.trim()||"Nieuwsitem",link:item.querySelector("link")?.textContent?.trim()||"https://www.hln.be/"})).filter(item=>item.title);}
function renderHLNHeadline(){const target=document.getElementById("hlnHeadline");if(!target)return;const item=hlnNewsItems[hlnNewsIndex];if(!item){target.textContent="Geen HLN nieuws gevonden";return;}target.innerHTML=`<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>`;}

async function updateWeather(){
  const cityEl=document.getElementById("weatherCity");if(!cityEl)return;
  cityEl.textContent=state.city;
  const cities={"dendermonde":{lat:51.03,lon:4.10},"wieze":{lat:50.98,lon:4.10},"deiremonne":{lat:51.03,lon:4.10},"asse":{lat:50.91,lon:4.20},"antwerpen":{lat:51.22,lon:4.40},"brussel":{lat:50.85,lon:4.35},"gent":{lat:51.05,lon:3.72}};
  const coords=cities[state.city.trim().toLowerCase()]||cities.dendermonde;
  try{
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max&timezone=Europe%2FBrussels`;
    const res=await fetch(url);const data=await res.json();const temp=Math.round(data.current.temperature_2m);
    document.getElementById("weatherTemp").textContent=`${temp}°`;
    document.getElementById("weatherCondition").textContent=weatherLabel(data.current.weather_code);
    applyWeatherTheme(data.current.weather_code);
    const days=(data.daily?.time||[]).slice(1,4).map((date,idx)=>`${new Date(date).toLocaleDateString("nl-BE",{weekday:"short"})} ${Math.round(data.daily.temperature_2m_max[idx+1])}°`).map(x=>`<span>${x}</span>`).join("");
    document.getElementById("weatherMini").innerHTML=days||`<span>${temp}°</span>`;
  }catch(e){document.getElementById("weatherTemp").textContent="--°";document.getElementById("weatherCondition").textContent="Niet beschikbaar";applyWeatherTheme(1);}
}
function weatherLabel(code){if([0].includes(code))return"Zonnig";if([1,2].includes(code))return"Licht bewolkt";if([3].includes(code))return"Bewolkt";if([45,48].includes(code))return"Mist";if([51,53,55,61,63,65,80,81,82].includes(code))return"Regen";if([71,73,75,77,85,86].includes(code))return"Sneeuw";if([95,96,99].includes(code))return"Onweer";return"Weer";}
function getWeatherTheme(code){if([0].includes(code))return"sunny";if([1,2,3].includes(code))return"cloudy";if([45,48].includes(code))return"fog";if([51,53,55,61,63,65,80,81,82].includes(code))return"rain";if([71,73,75,77,85,86].includes(code))return"snow";if([95,96,99].includes(code))return"storm";return"cloudy";}
function applyWeatherTheme(code){const box=document.querySelector(".weather");if(!box)return;box.classList.remove("sunny","cloudy","rain","fog","snow","storm");box.classList.add(getWeatherTheme(code));}
