import { initializeApp } from "./vendor/firebase-app.js";
import {
  doc,
  getDocs,
  collection,
  getFirestore,
  setDoc,
  addDoc,
  query,
  orderBy,
} from "./vendor/firebase-firestore.js";
import {
  onAuthStateChanged,
  getAuth,
  signInAnonymously,
} from "./vendor/firebase-auth.js";

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
const auth = getAuth();
const db = getFirestore(app);

/** @type {string | undefined} */
export let userId = undefined;

/**
 * @typedef {object} Rating
 * @property {number} uid
 * @property {number} value 星の数 (1~5の整数)
 */

/**
 * @param {string} courseId
 * @param {string} collectionName
 * @returns {Promise<Rating[]>}
 */
async function getRatings(courseId, collectionName) {
  const ratings = collection(db, "courses", courseId, collectionName);
  const snapshot = await getDocs(ratings);
  return snapshot.docs.map((e) => ({ uid: e.id, ...e.data() }));
}

/**
 * @param {string} courseId 科目番号
 * @returns {Promise<Rating[]>}
 */
export async function getTeacherKindnessRatings(courseId) {
  return await getRatings(courseId, "teacher-kindness-ratings");
}

/**
 * @param {string} courseId 科目番号
 * @returns {Promise<Rating[]>}
 */
export async function getAssignmentDifficultyRatings(courseId) {
  return await getRatings(courseId, "assignment-difficulty-ratings");
}

async function submitRating(courseId, value, collectionName) {
  if (userId === undefined) {
    throw new Error("userId is undefined");
  }

  const ratings = doc(db, "courses", courseId, collectionName, userId);
  await setDoc(ratings, { value });
}

/**
 * @param {string} courseId 科目番号
 * @param {number} value 星の数 (1~5)
 * @returns {Promise<void>}
 */
export async function submitTeacherKindness(courseId, value) {
  await submitRating(courseId, value, "teacher-kindness-ratings");
}

/**
 * @param {string} courseId 科目番号
 * @param {number} value 星の数 (1~5)
 * @returns {Promise<void>}
 */
export async function submitAssignmentDifficulty(courseId, value) {
  await submitRating(courseId, value, "assignment-difficulty-ratings");
}

/**
 * @typedef {object} Comment
 * @property {string} uid
 * @property {string} quote
 * @property {string} content
 * @property {Date} createdAt
 */

/**
 * @param {unknown} data
 * @returns {Comment}
 */
function parseComment(data) {
  return {
    uid: data.uid,
    quote: data.quote,
    content: data.content,
    createdAt: data.created_at.toDate(),
  };
}

/**
 * 日付の降順にコメント一覧を取得する。
 * @param {string} courseId 科目番号
 * @returns {Promise<Comment>}
 */
export async function getComments(courseId) {
  const ratings = collection(db, "courses", courseId, "comments");
  const q = query(ratings, orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((e) => parseComment(e.data()));
}

/**
 * @param {string} courseId 科目番号
 * @param {string} quote 引用
 * @param {string} content コメント内容
 * @returns {Promise<void>}
 */
export async function submitComment(courseId, quote, content) {
  if (userId === undefined) {
    throw new Error("userId is undefined");
  }
  if (typeof quote !== "string") {
    throw new Error("`quote` must be a string");
  }
  if (typeof content !== "string") {
    throw new Error("`content` must be a string");
  }

  quote = quote.trim();
  content = content.trim();
  if (content === "") {
    throw new Error("`content` cannot be empty");
  }

  const comments = collection(db, "courses", courseId, "comments");
  await addDoc(comments, {
    uid: userId,
    quote,
    content,
    created_at: new Date(),
  });
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

/**
 * HTMLの特殊文字をエスケープする。
 * ユーザーが生成したテキストなどをHTMLの中身として使う時は必ずこれを通す。
 * そうしないとユーザーが他のユーザーのマシン上でJSを実行するなどできる
 * XSS攻撃が可能になってしまう。
 *
 * @param {string} html
 * @return {string}
 */
export function escapeHtml(html) {
  const text = document.createTextNode(html);
  const p = document.createElement("p");
  p.appendChild(text);
  return p.innerHTML;
}

export async function main() {
  await signInAnonymously(auth);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      userId = user.uid;
    } else {
      // User has signed out
      userId = undefined;
    }
  });
}
