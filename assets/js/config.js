const STORAGE_KEY = "keuken-dashboard-v2";

const GOOGLE_API_KEY = "AIzaSyBXqKfx3xqnu7Ppuazlr82RkVWP9ZuxGyM";
const GOOGLE_CLIENT_ID = "939573807224-iobd60ce6q60fu3cah2dg7oad0fi7oqf.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly"
].join(" ");

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD8ku05ZKUfi0QL3ZDn4xFg7SSenX_llmo",
  authDomain: "board-keuken-adad7.firebaseapp.com",
  databaseURL: "https://board-keuken-adad7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "board-keuken-adad7",
  storageBucket: "board-keuken-adad7.firebasestorage.app",
  messagingSenderId: "478188018473",
  appId: "1:478188018473:web:c114c359e9e4b5ab37f538",
  measurementId: "G-12MJPKWLC9"
};

const PEOPLE = [
  {name:"Alexis",color:"#5cc8ff"},
  {name:"Amylia",color:"#b47cff"},
  {name:"Louize",color:"#ffb24d"},
  {name:"Hannah",color:"#3ddc97"},
  {name:"Loïc",color:"#ff6b7d"}
];

const DEMO_EVENTS = [
  {day:0,time:"07:30",title:"Werk starten",person:"Carlos",color:"blue"},
  {day:0,time:"18:00",title:"Samen eten",person:"Gezin",color:"orange"},
  {day:1,time:"17:00",title:"Turnen",person:"Amylia",color:"purple"},
  {day:2,time:"16:00",title:"Opvang",person:"Loïc",color:"green"},
  {day:4,time:"09:00",title:"Boodschappen",person:"Carlos & Steffi",color:"green"}
];
