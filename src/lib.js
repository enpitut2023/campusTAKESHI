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

/**
 * "<h1>hello</h1>" みたいな文字列からHTMLの要素を生成する。
 *
 * 感覚的な説明：
 * 本来はHTMLに書いてあったh1を `document.querySelector` で持ってきていたところを、
 * 流れをひっくり返してJS側でそのh1を作ってHTMLに突っ込み直そうという考え。
 * この関数で作ったh1などの要素はappendChildやinsertAdjacentElementなどでHTMLに突っ込める。
 * @param {string} s HTMLを記述してある文字列
 * @return {Node}
 */
export function stringToHtmlElement(s) {
  const template = document.createElement("template");
  template.innerHTML = s.trim();
  return template.content.firstChild;
}
