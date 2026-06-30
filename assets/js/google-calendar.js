let tokenClient = null;
let gapiInited = false;
let gisInited = false;

window.initializeGapiClient = async function initializeGapiClient(){
  if(!window.gapi)return;
  try{
    await gapi.load("client",async()=>{
      await gapi.client.init({apiKey:GOOGLE_API_KEY,discoveryDocs:DISCOVERY_DOCS});
      gapiInited=true;
      maybeEnableGoogleButtons();
    });
  }catch(error){console.error(error);setStatus("Google API kon niet starten. Controleer Calendar API, Classroom API en OAuth scopes.");}
};

window.onGisReady=function onGisReady(){gisInited=true;maybeEnableGoogleButtons();};
if(window.__gapiLoaded)window.initializeGapiClient();
if(window.__gisLoaded)window.onGisReady();

function maybeEnableGoogleButtons(){
  const authorizeButton=document.getElementById("authorizeButton");
  const loadButton=document.getElementById("loadCalendarsButton");
  const refreshButton=document.getElementById("refreshCalendarButton");
  const signoutButton=document.getElementById("signoutButton");
  if(!authorizeButton||!loadButton||!refreshButton||!signoutButton)return;
  loadButton.style.display=state.googleConnected?"inline-block":"none";
  refreshButton.style.display=state.googleConnected?"inline-block":"none";
  signoutButton.style.display=state.googleConnected?"inline-block":"none";
  if(!gapiInited||!gisInited){authorizeButton.textContent="Google laden...";setStatus("Google wordt geladen...");return;}
  tokenClient=google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CLIENT_ID,scope:SCOPES,callback:""});
  authorizeButton.textContent=state.googleConnected?"Google verbonden":"Inloggen met Google";
  setStatus(state.googleConnected?"Google is verbonden. Kies hieronder je agenda's.":"Klaar om in te loggen met Google.");
  renderCalendarList();
}

async function waitForGoogleReady(timeoutMs=9000){
  const start=Date.now();
  if(window.__gapiLoaded && !gapiInited && typeof window.initializeGapiClient==="function"){
    try{window.initializeGapiClient();}catch(e){console.warn("GAPI opnieuw starten mislukt",e);}
  }
  if(window.__gisLoaded && !gisInited && typeof window.onGisReady==="function"){
    try{window.onGisReady();}catch(e){console.warn("GIS opnieuw starten mislukt",e);}
  }
  while(Date.now()-start<timeoutMs){
    if(gapiInited&&gisInited&&tokenClient)return true;
    maybeEnableGoogleButtons();
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  return false;
}

function handleAuthClick(){
  if(!gapiInited||!gisInited||!tokenClient){alert("Google is nog niet klaar. Wacht enkele seconden en probeer opnieuw.");return;}
  tokenClient.callback=async(resp)=>{
    if(resp.error!==undefined){console.error(resp);alert("Google login is mislukt. Controleer Test users, scopes en Authorized JavaScript origins.");return;}
    state.googleConnected=true;saveState();maybeEnableGoogleButtons();await loadCalendarList();
  };
  tokenClient.requestAccessToken({prompt:"consent"});
}

function handleSignoutClick(){
  const token=gapi.client.getToken();
  if(token!==null){google.accounts.oauth2.revoke(token.access_token);gapi.client.setToken("");}
  state.googleConnected=false;state.calendarList=[];state.selectedCalendarIds=[];state.googleEvents=[];saveState();renderAll();renderCalendarList();maybeEnableGoogleButtons();setStatus("Uitgelogd bij Google.");
}

async function ensureGoogleAccessToken(silent=true){
  if(!state.googleConnected)return false;
  if(!gapiInited||!gisInited||!tokenClient){
    const ready=await waitForGoogleReady(9000);
    if(!ready)return false;
  }
  if(gapi?.client?.getToken?.()?.access_token)return true;
  return new Promise(resolve=>{
    tokenClient.callback=(resp)=>{
      if(resp?.error){
        console.warn("Google token vernieuwen mislukt:",resp);
        resolve(false);
        return;
      }
      resolve(!!gapi?.client?.getToken?.()?.access_token);
    };
    try{
      tokenClient.requestAccessToken({prompt:silent?"":"consent"});
    }catch(error){
      console.warn("Google token request mislukt:",error);
      resolve(false);
    }
  });
}

async function loadCalendarList(){
  if(!state.googleConnected){handleAuthClick();return;}
  const tokenOk=await ensureGoogleAccessToken(true);
  if(!tokenOk){setStatus("Google opnieuw aanmelden nodig. Klik op Inloggen met Google.");return;}
  try{
    setStatus("Agenda's ophalen...");
    const response=await gapi.client.calendar.calendarList.list({minAccessRole:"reader",showHidden:false});
    const calendars=response.result.items||[];
    state.calendarList=calendars.map(cal=>({id:cal.id,summary:cal.summaryOverride||cal.summary||cal.id,primary:!!cal.primary,backgroundColor:cal.backgroundColor||"#5cc8ff"}));
    if(!state.selectedCalendarIds.length){const primary=state.calendarList.find(c=>c.primary);state.selectedCalendarIds=primary?[primary.id]:state.calendarList.slice(0,1).map(c=>c.id);}
    saveState();renderCalendarList();await loadSelectedCalendarEvents();setStatus(`${state.calendarList.length} agenda's gevonden.`);
  }catch(error){console.error(error);setStatus("Agenda's ophalen is tijdelijk mislukt. Probeer straks opnieuw.");}
}

function renderCalendarList(){
  const container=document.getElementById("calendarList");if(!container)return;
  if(!state.googleConnected){container.innerHTML=`<div class="settings-help">Log eerst in met Google.</div>`;return;}
  if(!state.calendarList.length){container.innerHTML=`<div class="settings-help">Klik op <strong>Agenda's ophalen</strong>.</div>`;return;}
  container.innerHTML=state.calendarList.map(cal=>{
    const checked=state.selectedCalendarIds.includes(cal.id)?"checked":"";
    const label=cal.primary?`${escapeHtml(cal.summary)} · hoofdagenda`:escapeHtml(cal.summary);
    return `<label class="calendar-row"><input type="checkbox" value="${escapeHtml(cal.id)}" ${checked} onchange="saveSelectedCalendarsFromUI()" /><div><div class="calendar-name">${label}</div><div class="calendar-id">${escapeHtml(cal.id)}</div></div></label>`;
  }).join("");
}

function saveSelectedCalendarsFromUI(){const checked=[...document.querySelectorAll('#calendarList input[type="checkbox"]:checked')].map(input=>input.value);state.selectedCalendarIds=checked;saveState();setStatus(`${checked.length} agenda${checked.length===1?"":"'s"} geselecteerd.`);}
async function saveSelectedCalendarsAndLoad(){saveSettings(false);saveSelectedCalendarsFromUI();await loadSelectedCalendarEvents();}

async function loadSelectedCalendarEvents(){
  if(!state.googleConnected)return;
  const tokenOk=await ensureGoogleAccessToken(true);
  if(!tokenOk){setStatus("Google opnieuw aanmelden nodig. Klik op Inloggen met Google.");return;}
  if(!state.selectedCalendarIds.length){state.googleEvents=[];saveState();renderAll();setStatus("Geen agenda geselecteerd.");return;}
  const now=new Date();const start=monthStart(now);const end=addDays(monthStart(addMonths(now,2)),1);const all=[];
  try{
    setStatus("Afspraken laden...");
    for(const calendarId of state.selectedCalendarIds){
      const calendarMeta=state.calendarList.find(c=>c.id===calendarId);
      const response=await gapi.client.calendar.events.list({calendarId,timeMin:start.toISOString(),timeMax:end.toISOString(),showDeleted:false,singleEvents:true,maxResults:120,orderBy:"startTime"});
      const events=response.result.items||[];
      all.push(...events.map(event=>{const startValue=event.start.dateTime||event.start.date;const isAllDay=!event.start.dateTime;const date=new Date(startValue);return{dateKey:toDateKey(date),time:isAllDay?"Hele dag":date.toLocaleTimeString("nl-BE",{hour:"2-digit",minute:"2-digit"}),title:event.summary||"Geen titel",person:calendarMeta?.summary||"Google Calendar",color:colorForTitle(`${event.summary||""} ${calendarMeta?.summary||""}`),google:true};}));
    }
    state.googleEvents=all;saveState();renderAll();setStatus(`${all.length} afspraken geladen.`);
  }catch(error){console.error(error);setStatus("Agenda tijdelijk niet vernieuwd. Bestaande afspraken blijven zichtbaar.");}
}
function setStatus(message){const el=document.getElementById("googleStatus");if(el)el.textContent=message;}
