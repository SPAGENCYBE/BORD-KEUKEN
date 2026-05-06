async function connectClassroom(person){
  const ready=await waitForGoogleReady();
  if(!ready){alert("Google kon niet volledig laden. Doe Ctrl + F5 en probeer opnieuw.");return;}
  tokenClient.callback=async(resp)=>{
    if(resp.error){console.error(resp);alert("Classroom koppelen is mislukt. Controleer Test users, Classroom API en schoolrechten.");return;}
    await importClassroomHomework(person);
  };
  tokenClient.requestAccessToken({prompt:"select_account consent"});
}

async function importClassroomHomework(person){
  try{
    setHomeworkImportStatus(person,"Classroom laden...");
    const accessToken=gapi.client.getToken()?.access_token;
    if(!accessToken)throw new Error("Geen Google access token beschikbaar");
    const coursesData=await classroomFetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=50",accessToken);
    const courses=coursesData.courses||[];
    const imported=[];
    for(const course of courses){
      const workData=await classroomFetch(`https://classroom.googleapis.com/v1/courses/${encodeURIComponent(course.id)}/courseWork?pageSize=50`,accessToken);
      const works=workData.courseWork||[];
      works.forEach(work=>{
        imported.push({
          id:`classroom-${person}-${work.id}`,
          task:work.title||"Classroom taak",
          subject:course.name||"Classroom",
          deadline:classroomDueDateToInputValue(work.dueDate),
          done:false,
          source:"classroom",
          classroomCourseId:course.id,
          classroomWorkId:work.id,
          link:work.alternateLink||""
        });
      });
    }
    if(!state.homework)state.homework={amylia:[],alexis:[]};
    const existing=state.homework[person]||[];
    const nonImported=existing.filter(item=>item.source!=="classroom");
    const doneIds=new Set(existing.filter(item=>item.source==="classroom"&&item.done).map(item=>item.id));
    const freshImported=imported.map(item=>({...item,done:doneIds.has(item.id)}));
    state.homework[person]=mergeHomeworkById([...nonImported,...freshImported]);
    saveState();renderHomework();syncCloudHomework();setHomeworkImportStatus(person,`${freshImported.length} Classroom-taken geladen`);
  }catch(error){console.error("Classroom import mislukt:",error);alert("Classroom import is mislukt. Mogelijk blokkeert de school externe apps of heeft dit account geen Classroom-toegang.");setHomeworkImportStatus(person,"Classroom import mislukt");}
}

async function classroomFetch(url,accessToken){
  const res=await fetch(url,{headers:{Authorization:`Bearer ${accessToken}`}});
  if(!res.ok){const text=await res.text().catch(()=>"");throw new Error(`Classroom API fout ${res.status}: ${text}`);}
  return res.json();
}
function mergeHomeworkById(items){const map=new Map();items.forEach(item=>map.set(item.id,item));return [...map.values()].sort(sortHomework);}
function classroomDueDateToInputValue(dueDate){if(!dueDate)return"";const y=String(dueDate.year).padStart(4,"0");const m=String(dueDate.month).padStart(2,"0");const d=String(dueDate.day).padStart(2,"0");return `${y}-${m}-${d}`;}
function setHomeworkImportStatus(person,message){const count=document.getElementById(`${person}HomeworkCount`);if(count)count.textContent=message;}
function clearImportedHomework(){if(!confirm("Alle geïmporteerde Classroom-taken verwijderen? Handmatige taken blijven staan."))return;if(!state.homework)state.homework={amylia:[],alexis:[]};state.homework.amylia=(state.homework.amylia||[]).filter(item=>item.source!=="classroom");state.homework.alexis=(state.homework.alexis||[]).filter(item=>item.source!=="classroom");saveState();renderHomework();syncCloudHomework();}
