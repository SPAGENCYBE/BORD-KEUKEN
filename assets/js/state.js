function loadState(){
  const defaults={
    name:"Carlos",
    city:"Dendermonde",
    googleConnected:false,
    calendarList:[],
    selectedCalendarIds:[],
    googleEvents:[],
    tasks:[{text:"Schooltassen klaarzetten",done:false},{text:"Vuilnis buitenzetten",done:false}],
    shopping:[{text:"Brood",done:false},{text:"Melk",done:false},{text:"Fruit",done:false}],
    notes:"Niet vergeten: schoolbrief tekenen · vuilnis buitenzetten",
    weekMenu:{ma:"Spaghetti",di:"Kip met rijst",wo:"Wraps",do:"Puree met vis",vr:"Frietjes",za:"Pizza / makkelijk",zo:"Familie-eten"},
    homework:{amylia:[],alexis:[]}
  };
  try{return {...defaults,...(JSON.parse(localStorage.getItem(STORAGE_KEY))||{})};}
  catch(e){return defaults;}
}
const state = loadState();
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
