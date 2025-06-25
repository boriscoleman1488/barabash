import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-U1jgM7J1HdnAklTLCM9TKnMkLV3Vuqs",
  authDomain: "bestflix-3fcd2.firebaseapp.com",
  projectId: "bestflix-3fcd2",
  storageBucket: "bestflix-3fcd2.appspot.com",
  messagingSenderId: "606044681327",
  appId: "1:606044681327:web:76c2e0a2db369d5d16899a",
  //measurementId: "G-B43F8D93DL",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export default storage;
