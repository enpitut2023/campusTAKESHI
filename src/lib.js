import { initializeApp } from "./vendor/firebase-app.js";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  getFirestore,
  setDoc,
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
let userId = undefined;

/**
 * @typedef {object} Rating
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
  return snapshot.docs.map((e) => e.data());
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

/**
 * @param {string} courseId
 * @param {string} collectionName
 * @returns {Promise<Rating>}
 */
async function getUserRating(courseId, collectionName) {
  if (userId === undefined) {
    throw new Error("userId is undefined");
  }

  const ratings = doc(db, "courses", courseId, collectionName, userId);
  const snapshot = await getDoc(ratings);
  return snapshot.data().value;
}

/**
 * @param {string} courseId
 * @returns {Promise<Rating>}
 */
export async function getUserTeacherKindnessRating(courseId) {
  return await getUserRating(courseId, "teacher-kindness-ratings");
}

/**
 * @param {string} courseId
 * @returns {Promise<Rating>}
 */
export async function getUserAssignmentDifficultyRating(courseId) {
  return await getUserRating(courseId, "assignment-difficulty-ratings");
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
