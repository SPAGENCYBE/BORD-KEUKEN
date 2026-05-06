let firebaseDb = null;
let cloudReady = false;
let applyingCloudUpdate = false;
let weekMenuSyncTimer = null;

function initFirebaseSync(){
  try{
    if(!window.firebase){console.warn("Firebase SDK niet geladen.");return;}
    if(!firebase.apps.length){firebase.initializeApp(FIREBASE_CONFIG);}
    firebaseDb=firebase.database();
    cloudReady=true;
    startCloudListeners();
  }catch(error){console.error("Firebase fout:",error);}
}

function startCloudListeners(){
  if(!firebaseDb)return;
  firebaseDb.ref("shopping").on("value",snapshot=>{
    const data=snapshot.val();applyingCloudUpdate=true;
    state.shopping=data?(Array.isArray(data)?data:Object.values(data)):[];
    saveState();renderList("shopping");applyingCloudUpdate=false;
  });
  firebaseDb.ref("tasks").on("value",snapshot=>{
    const data=snapshot.val();applyingCloudUpdate=true;
    state.tasks=data?(Array.isArray(data)?data:Object.values(data)):[];
    saveState();renderList("tasks");applyingCloudUpdate=false;
  });
  firebaseDb.ref("weekMenu").on("value",snapshot=>{
    const data=snapshot.val();
    if(data){applyingCloudUpdate=true;state.weekMenu=data;saveState();
      const active=document.activeElement;
      const isEditingMeal=active&&active.classList&&active.classList.contains("meal-input");
      if(!isEditingMeal)renderWeekMenu();
      applyingCloudUpdate=false;
    }else if(state.weekMenu){syncCloudWeekMenu();}
  });
  firebaseDb.ref("homework").on("value",snapshot=>{
    const data=snapshot.val();applyingCloudUpdate=true;
    state.homework={amylia:data?.amylia||[],alexis:data?.alexis||[]};
    saveState();renderHomework();applyingCloudUpdate=false;
  });
}

function syncCloudCollection(type){
  if(!cloudReady||!firebaseDb||applyingCloudUpdate)return;
  const items=state[type]||[];
  const ref=firebaseDb.ref(type);
  const action=items.length?ref.set(items):ref.remove();
  action.catch(console.error);
}
function syncCloudWeekMenu(){if(!cloudReady||!firebaseDb||applyingCloudUpdate)return;firebaseDb.ref("weekMenu").set(state.weekMenu||{}).catch(console.error);}
function syncCloudHomework(){if(!cloudReady||!firebaseDb||applyingCloudUpdate)return;firebaseDb.ref("homework").set(state.homework||{amylia:[],alexis:[]}).catch(console.error);}
