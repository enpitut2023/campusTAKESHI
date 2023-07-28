import {
  getTeacherKindnessRatings,
  getAssignmentDifficultyRatings,
  getComments,
  submitTeacherKindness,
  submitAssignmentDifficulty,
  stringToHtmlElement,
  escapeHtml,
  submitComment,
} from "./lib.js";

/**
 * @template T
 * @template U
 * @param {T[]} ts
 * @param {U[]} us
 * @returns {Generator<[T, U], unknown, unknown>}
 */
function* zip(ts, us) {
  const len = Math.min(ts.length, us.length);
  for (let i = 0; i < len; i++) {
    yield [ts[i], us[i]];
  }
}

/**
 * @typedef {object} Rating
 * @property {number | undefined} angerAtProf
 * @property {number | undefined} angerAtTasks
 */

/**
 * @param {unknown} x
 * @returns {Rating | undefined}
 */
function parseRating(x) {
  return x === null || x === undefined ? undefined : x;
}

class Storage {
  /** @type {globalThis.Storage} */
  localStorage;

  /**
   * @param {globalThis.Storage} localStorage
   */
  constructor(localStorage) {
    this.localStorage = localStorage;
  }

  /**
   * @param {string} key
   * @returns {unknown | undefined}
   */
  read(key) {
    const item = this.localStorage.getItem(key);
    if (item === null) {
      return undefined;
    }

    try {
      return JSON.parse(item);
    } catch {
      return undefined;
    }
  }

  /**
   * @param {string} key
   * @param {unknown} value
   * @returns {void}
   */
  write(key, value) {
    this.localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * @returns {Rating | undefined}
   */
  readRating() {
    return parseRating(this.read("rating"));
  }

  /**
   * @param {Rating} x
   * @returns {void}
   */
  writeRating(x) {
    this.write("rating", x);
  }
}

/**
 * @param {number} n
 * @returns {[boolean, boolean, boolean, boolean, boolean]}
 */
function newHighlights(n) {
  const hs = new Array(5);
  for (let i = 0; i < hs.length; i++) {
    hs[i] = i < n;
  }
  return hs;
}

/**
 * @param {number | undefined} valueFromLocalStorage
 * @param {number | undefined} valueFromDb
 * @returns {[boolean, boolean, boolean, boolean, boolean]}
 */
function initialHighlights(valueFromLocalStorage, valueFromDb) {
  let n;
  if (valueFromDb === undefined) {
    if (valueFromLocalStorage === undefined) {
      n = 0;
    } else {
      n = valueFromLocalStorage;
    }
  } else {
    n = valueFromDb;
  }

  return newHighlights(n);
}

function round(value) {
  let ret;
  ret = (Math.round(value * 10) / 10).toFixed(1);
  return ret;
}

function countCriterion(ratings) {
  let totalCriterion = 0;
  let sumCriterion = 0;
  for (let rating of ratings) {
    totalCriterion += rating.value;
    sumCriterion += 1;
  }
  let aveCriterion;
  let labelContent;
  if (sumCriterion == 0) {
    aveCriterion = 0;
    labelContent = "票なし";
  } else {
    aveCriterion = round(totalCriterion / sumCriterion);
    labelContent = aveCriterion;
  }
  let dict = {
    criterion: aveCriterion,
    sum: sumCriterion,
    labelContent: labelContent,
  };
  return dict;
}

// 拡張機能が読み込まれたら最初に実行される関数
export async function main() {
  const styleElement = stringToHtmlElement(`
    <style>
/* //////////////////// */
/* 評価を表示する機能のCSS */
/* //////////////////// */
:root {
  --star-size: 30px;
  --star-color: #dbdbd9;
  --star-background: #f0bc43;
}

.rate-form {
  display: flex;
}

.rate-form > input[type="radio"] {
  display: none;
}

.rate-form > span {
  font-size: 13px;
  margin-right: 10px;
}

.rate-form > label {
  cursor: pointer;
}

.hover {
  font-size: 30px;
  filter: grayscale(1);
}

.hover.preselected {
  filter: grayscale(0.5);
}

.hover.hovered,
.hover.selected {
  filter: grayscale(0);
}

.rating-row {
  display: flex;
  font-size: 20px;
  gap: 40px;
  margin-bottom: 20px;
}

.rating-row.submitting {
  opacity: 0.7;
}

.rating {
  display: flex;
  gap: 10px;
  align-items: center;
}

.rating > .faces {
  color: transparent;
  position: relative;
  font-size: 30px;
}

.rating > .faces > .neutral,
.rating > .faces > .mad {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  color: black;
}

.rating > .faces > .neutral {
  filter: grayscale(100%);
}

.rating > .faces > .mad {
  clip-path: inset(-100px calc((5 - var(--rating)) / 5 * 100%) -100px -100px);
}

.rating-value {
  font-size: 20px;
}

.total-votes {
  font-size: 15px;
}

.quote {
  border-left: 5px solid #fed005; /*線の設定*/
  padding: 2px 8px; /*余白の設定*/
  background: #f6f2b3;
}

.comment-container {
  overflow-y: scroll;
  border: 1px solid #0b0b0b;
  resize: vertical;
}

.comment {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #0b0b0b;
}

.comment > .quote {
  border-left:5px solid #fed005; /*線の設定*/
  padding:2px 8px; /*余白の設定*/
  background: #f6f2b3;
}

.comment > .date {
  text-align: right;
}
    </style>
  `);
  document.head.appendChild(styleElement);

  // 文字列からHTMLの要素を作りましょう
  const angerToTeacherElement = stringToHtmlElement(`
    <div class="rating-row">
      <div class="rating">
        <span class="rating-label">先生への怒り:</span>
        <span class="rating-value" id="kindness-rating-value">0.0</span>
        <span class="faces" id="kindness-rating-star">
          😡😡😡😡😡
          <div class="neutral">😡😡😡😡😡</div>
          <div class="mad" id="kindness-rating-star">
            😡😡😡😡😡
          </div>
        </span>
        <span class="total-votes" id="kindness-total-votes">計0票</span>
      </div>
      <div class="rate-form" id="rate-form-teacher-kindness">
        <span>クリックして投票</span>
        <input type="radio" id="star1" name="kindness-rate" /><!--
    --><label for="star1" class="hover"
          >😡</label
        ><!--
    --><input type="radio" id="star2" name="kindness-rate" /><!--
    --><label for="star2" class="hover"
          >😡</label
        ><!--
    --><input type="radio" id="star3" name="kindness-rate" /><!--
    --><label for="star3" class="hover"
          >😡</label
        ><!--
    --><input type="radio" id="star4" name="kindness-rate" /><!--
    --><label for="star4" class="hover"
          >😡</label
        ><!--
    --><input type="radio" id="star5" name="kindness-rate" /><!--
    --><label for="star5" class="hover"
          >😡</label
        >
      </div>
    </div>
  `);
  const angerToExamsElement = stringToHtmlElement(`
    <div class="rating-row">
      <div class="rating">
        <span class="rating-label">課題・テストへの怒り:</span>
        <span class="rating-value" id="difficulty-rating-value">0.0</span>
        <span class="faces" id="difficulty-rating-star">
          😡😡😡😡😡
          <div class="neutral">😡😡😡😡😡</div>
          <div class="mad" id="difficulty-rating-star">
            😡😡😡😡😡
          </div>
        </span>
        <span class="total-votes" id="difficulty-total-votes">計0票</span>
      </div>
      <div class="rate-form" id="rate-form-assignment-difficulty">
        <span>クリックして投票</span>
        <input type="radio" id="star6" name="difficulty-rate" /><!--
        --><label for="star6" class="hover"
          >😡</label
        ><!--
        --><input type="radio" id="star7" name="difficulty-rate" /><!--
        --><label for="star7" class="hover"
          >😡</label
        ><!--
        --><input type="radio" id="star8" name="difficulty-rate" /><!--
        --><label for="star8" class="hover"
          >😡</label
        ><!--
        --><input type="radio" id="star9" name="difficulty-rate" /><!--
        --><label for="star9" class="hover"
          >😡</label
        ><!--
        --><input type="radio" id="star10" name="difficulty-rate" /><!--
        --><label for="star10" class="hover"
          >😡</label
        >
      </div>
    </div>
  `);
  const commentContainerElement = stringToHtmlElement(`
    <div class="comment-container" style="display: none"></div>
  `);
  const commentControlsElement = stringToHtmlElement(`
    <div>
      <button id="toggle-comment-container">コメントを表示(0件)</button>
      <button id="show-form" type="button">
        コメントを投稿
      </button>
      <a style="margin-left: 10px" href="https://docs.google.com/forms/d/e/1FAIpQLScTSsxmUHzZFh1mqa43xttWBCplZxj0ksbANHdfCUnLZh_EAQ/viewform">この拡張機能への感想はコチラへ</a>
    </div>
  `);

  const courseTitleElement = document.querySelector("#course-title");
  const takeshiRoot = stringToHtmlElement(`
    <div id="takeshi-root"></div>
  `);
  courseTitleElement.insertAdjacentElement("afterend", takeshiRoot);

  takeshiRoot.appendChild(angerToTeacherElement);
  takeshiRoot.appendChild(angerToExamsElement);
  takeshiRoot.appendChild(commentControlsElement);
  takeshiRoot.appendChild(commentContainerElement);

  const kindnessRatingValue = document.querySelector("#kindness-rating-value");
  const kindnessRatingStar = document.querySelector("#kindness-rating-star");
  const difficultyRatingValue = document.querySelector(
    "#difficulty-rating-value"
  );
  const kindnessTotalVotes = document.querySelector("#kindness-total-votes");
  const difficultyRatingStar = document.querySelector(
    "#difficulty-rating-star"
  );
  const difficultyTotalVotes = document.querySelector(
    "#difficulty-total-votes"
  );

  const path = location.pathname.split("/");
  const courseId = path[3]; // URLから取得した科目番号

  const storage = new Storage(window.localStorage);

  // const [teacherKindnessRatings, assignmentDifficultyRatings, comments] =
  //   await Promise.all([
  //     getTeacherKindnessRatings(courseId),
  //     getAssignmentDifficultyRatings(courseId),
  //     getComments(courseId),
  //   ]);

  const teacherKindnessRatings = [{ value: 3 }, { value: 4 }];
  const assignmentDifficultyRatings = [{ value: 1 }, { value: 2 }];
  const comments = [];

  const numberOfComments = comments.length;

  const kindnessCriterion = countCriterion(teacherKindnessRatings);
  const difficultyCriterion = countCriterion(assignmentDifficultyRatings);

  let kindness = kindnessCriterion.criterion;
  let kindnessTotal = kindnessCriterion.sum;
  let kindnessExist = kindnessCriterion.labelContent;
  let difficulty = difficultyCriterion.criterion;
  let difficultyTotal = difficultyCriterion.sum;
  let difficultyExist = difficultyCriterion.labelContent;

  kindnessRatingValue.innerHTML = `${kindnessExist}`;
  difficultyRatingValue.innerHTML = `${difficultyExist}`;
  kindnessTotalVotes.innerHTML = `計${kindnessTotal}票`;
  difficultyTotalVotes.innerHTML = `計${difficultyTotal}票`;

  kindnessRatingStar.style.setProperty("--rating", kindness);
  difficultyRatingStar.style.setProperty("--rating", difficulty);

  function createCommentElement(comment) {
    const year = comment.createdAt.getFullYear();
    const month = comment.createdAt.getMonth() + 1;
    const date = comment.createdAt.getDate();

    const quoteHtml =
      comment.quote.trim() === ""
        ? ""
        : `<h2 class="quote">引用：「${escapeHtml(comment.quote)}」</h2>`;

    const commentHtml = `
        <div class="comment">
          ${quoteHtml}
          <p>${escapeHtml(comment.content)}</p>
          <p class="date">${year}/${month}/${date}</p>
        </div>
      `;
    return stringToHtmlElement(commentHtml);
  }

  for (const comment of comments) {
    commentContainerElement.appendChild(createCommentElement(comment));
  }

  const hoverOfTeacherKindness = [
    ...document.querySelectorAll("#rate-form-teacher-kindness .hover"),
  ];
  const hoverOfAssignmentDifficulty = [
    ...document.querySelectorAll("#rate-form-assignment-difficulty .hover"),
  ];
  const labelElements = [...document.querySelectorAll(".rate-form label")];

  const rating = storage.readRating();
  // TODO: fetch rating value from db if it doesn't exist in the local storage

  for (const [element, highlighted] of zip(
    hoverOfTeacherKindness,
    initialHighlights(rating?.angerAtProf, undefined)
  )) {
    if (highlighted) {
      element.classList.add("preselected");
    }
  }

  for (const [element, highlighted] of zip(
    hoverOfAssignmentDifficulty,
    initialHighlights(rating?.angerAtTasks, undefined)
  )) {
    if (highlighted) {
      element.classList.add("preselected");
    }
  }

  let isSubmitting = false;

  function onHover(i, nthForm) {
    if (isSubmitting) {
      return;
    }

    let changeTarget;
    if (nthForm) {
      changeTarget = hoverOfAssignmentDifficulty;
    } else {
      changeTarget = hoverOfTeacherKindness;
    }
    for (let index = 0; index <= i; index++) {
      changeTarget[index].classList.add("hovered");
    }
  }

  function offHover(i, nthForm) {
    if (isSubmitting) {
      return;
    }

    let changeTarget;
    if (nthForm) {
      changeTarget = hoverOfAssignmentDifficulty;
    } else {
      changeTarget = hoverOfTeacherKindness;
    }
    for (let index = 0; index <= i; index++) {
      changeTarget[index].classList.remove("hovered");
    }
  }

  async function radioClick(i) {
    if (isSubmitting) {
      return;
    }

    isSubmitting = true;
    for (const e of document.querySelectorAll(".rating-row")) {
      e.classList.add("submitting");
    }

    let value = (i % 5) + 1;
    let nthForm = Math.trunc(i / 5);

    const rating = storage.readRating() ?? {};
    let promise;
    if (nthForm == 0) {
      // promise = submitTeacherKindness(courseId, value);
      storage.writeRating({ ...rating, angerAtProf: value });
    } else if (nthForm == 1) {
      // promise = submitAssignmentDifficulty(courseId, value);
      storage.writeRating({ ...rating, angerAtTasks: value });
    }
    console.log({ value, nthForm });

    let changeTarget;
    let voteSystem;
    if (nthForm) {
      changeTarget = hoverOfAssignmentDifficulty;
      voteSystem = document.querySelector("#rate-form-assignment-difficulty");
    } else {
      changeTarget = hoverOfTeacherKindness;
      voteSystem = document.querySelector("#rate-form-teacher-kindness");
    }

    voteSystem.appendChild(stringToHtmlElement(`<span>投票中...</span>`));

    for (let index = 0; index < value; index++) {
      changeTarget[index].classList.add("selected");
    }

    await promise;
    // window.location.reload();
  }

  for (let i = 0; i < 5; i++) {
    hoverOfTeacherKindness[i].addEventListener("mouseout", () =>
      offHover(i, 0)
    );
    hoverOfTeacherKindness[i].addEventListener("mouseover", () =>
      onHover(i, 0)
    );
    hoverOfAssignmentDifficulty[i].addEventListener("mouseout", () =>
      offHover(i, 1)
    );
    hoverOfAssignmentDifficulty[i].addEventListener("mouseover", () =>
      onHover(i, 1)
    );
  }
  for (let i = 0; i < 10; i++) {
    labelElements[i].addEventListener("click", () => radioClick(i));
  }
  //コメントフォームを表示するためのボタン
  const showForm = document.querySelector("#show-form");
  const commentForm = stringToHtmlElement(`
  <form id="claim-form">
  <div>
    <label for="quote-from-syllabus">引用 (任意、シラバスの一部をコピペしてください)</label><br>
    <input id="i_furigana" type="text" name="quote" value="" placeholder="例：講義（50%）と演習（50%）を併用する。" style="width: 100%">
  </div>
  <div>
    <label for="claim-for-syllabus">本文</label><br>
    <textarea id="claim-for-syllabus" name="comment" placeholder="例：講義0%と演習100%でした" style="width: 100%; height: 10ch"></textarea>
  </div>
  <div class="btn_area">
    <input type="submit" name="shout" value="投稿">
  </div>
  </form>
  `);
  function handleShowButton(event) {
    commentControlsElement.insertAdjacentElement("afterend", commentForm);
  }

  showForm.addEventListener("click", handleShowButton);

  //コメントが投稿された時に内容を受け取る
  async function handleCommentForm(event) {
    // 再読み込み防止
    event.preventDefault();

    const submitButton = document.querySelector(
      '#claim-form input[type="submit"]'
    );
    submitButton.value = "投稿中...";

    const inputComment = commentForm.comment.value;
    const inputQuote = commentForm.quote.value;
    await submitComment(courseId, inputQuote, inputComment);
    window.location.reload();
  }
  commentForm.addEventListener("submit", handleCommentForm);

  // コメントの表示・非表示切り替え
  const toggleCommentContainerButton = document.querySelector(
    "#toggle-comment-container"
  );
  toggleCommentContainerButton.innerHTML = `コメントを表示(${numberOfComments}件)`;
  toggleCommentContainerButton.addEventListener("click", () => {
    const display = commentContainerElement.style.getPropertyValue("display");
    if (display === "block") {
      commentContainerElement.style.setProperty("display", "none");
      toggleCommentContainerButton.innerHTML = `コメントを表示(${numberOfComments}件)`;
    } else {
      commentContainerElement.style.setProperty("display", "block");
      toggleCommentContainerButton.innerHTML = "コメントを隠す";
    }
  });
}
