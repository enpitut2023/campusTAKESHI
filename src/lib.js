import { initializeApp } from "./vendor/firebase-app.js";
import {
  getDocs,
  collection,
  getFirestore,
} from "./vendor/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXyFI7_Anzpx4W3dfYDJcnMICetu9NsOQ",
  authDomain: "takeshi-b12fa.firebaseapp.com",
  projectId: "takeshi-b12fa",
  storageBucket: "takeshi-b12fa.appspot.com",
  messagingSenderId: "877721236531",
  appId: "1:877721236531:web:75be2e58c710f8fc1b1f46",
  measurementId: "G-LR3KG38PSN",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * @typedef {object} Rating
 * @property {string} uid ユーザーID
 * @property {number} value 星の数 (1~5の整数)
 * @property {string} criterion 評価基準
 */

/**
 * @param {string} courseId
 * @returns {Promise<Rating[]>}
 */
export async function getRatings(courseId) {
  const ratings = collection(db, "courses", courseId, "ratings");
  const snapshot = await getDocs(ratings);
  return snapshot.docs.map((e) => e.data());
}
