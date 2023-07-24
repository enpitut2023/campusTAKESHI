import {
  getTeacherKindnessRatings,
  getAssignmentDifficultyRatings,
  submitTeacherKindness,
  submitAssignmentDifficulty,
  stringToHtmlElement,
  escapeHtml,
} from "./lib.js";
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
    :root {
      --star-size: 30px;
      --star-color: #dbdbd9;
      --star-background: #f0bc43;
    }
    .txt {
      font-size: 20px;
    }
    .rate-form input[type=radio] {
      display: none;
    }
    .rate-form {
      display: inline;;
    }


    .hover{
      position: relative;
      padding: 0 3px;
      font-size: 30px;
    }
    .checked{
      position: relative;
      padding: 0 3px;
      font-size: 30px;
      color: #f0bc43;
    }
    .onhover{
      color: #f0bc43;
    }
    .offhover{

      color: #dbdbd9;
    }

    .rating{
      font-size: 20px;
      margin-right: 40px;
    }
    .rating-value{
      font-size: 20px;
    }

    .stars {
      --percent: calc(var(--rating) / 5 * 100%);
      display: inline-block;
      font-size: var(--star-size);
      font-family: Times;
      line-height: 1;
    }
    .total-votes {
      font-size: 15px;
    }

    .stars::after {
      content: "★★★★★";
      letter-spacing: 3px;
      background: linear-gradient(
        90deg,
        var(--star-background) var(--percent),
        var(--star-color) var(--percent)
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    } 
    .rating{
      display: inline;
    }

    .comment-container {
      height: 200px;
      overflow-y: scroll;
      border: 1px solid #0b0b0b;
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
  const kindnessElement = stringToHtmlElement(`
    <div class="rating" >
      <span class="rating-label">先生の優しさ:</span>
      <span class="rating-value" id="kindness-rating-value"></span>
      <span class="stars" id="kindness-rating-star"></span>
      <span class="total-votes" id="kindness-total-votes"></span>
    </div>
  `);
  const kindnessVoteSystem = stringToHtmlElement(`
  <div class="rate-form" id="rate-form-teacher-kindness">
  <span>クリックして投票</span>
  <input type="radio" id="star1" name="kindness-rate"><!-- 
  --><label for="star1" class="offhover hover">★</label><!-- 
  --><input type="radio" id="star2" name="kindness-rate"><!-- 
  --><label for="star2"class="offhover hover">★</label><!-- 
  --><input type="radio" id="star3" name="kindness-rate"><!-- 
  --><label for="star3" class="offhover hover">★</label><!-- 
  --><input type="radio" id="star4" name="kindness-rate"><!-- 
  --><label for="star4" class="offhover hover">★</label><!-- 
  --><input type="radio" id="star5" name="kindness-rate"><!-- 
  --><label for="star5" class="offhover hover">★</label>
  </div>
  `);
  const difficultyElement = stringToHtmlElement(`
  <div class="rating">
    <span class="rating-label">課題の難しさ:</span>
    <span class="rating-value" id="difficulty-rating-value"></span>
    <span class="stars" id="difficulty-rating-star"></span>
    <span class="total-votes" id="difficulty-total-votes"></span>
  </div>
  `);
  const difficultyVoteSystem = stringToHtmlElement(`
  <div class="rate-form" id="rate-form-assignment-difficulty">
        <span>クリックして投票</span>
        <input type="radio" id="star6" name="difficulty-rate"><!-- 
    --><label for="star6" class="offhover hover">★</label><!-- 
    --><input type="radio" id="star7" name="difficulty-rate"><!-- 
    --><label for="star7"class="offhover hover">★</label><!-- 
    --><input type="radio" id="star8" name="difficulty-rate"><!-- 
    --><label for="star8" class="offhover hover">★</label><!-- 
    --><input type="radio" id="star9" name="difficulty-rate"><!-- 
    --><label for="star9" class="offhover hover">★</label><!-- 
    --><input type="radio" id="star10" name="difficulty-rate"><!-- 
    --><label for="star10" class="offhover hover">★</label>
    </div>
  `);
  const brElement = stringToHtmlElement("<br>");
  const commentContainerElement = stringToHtmlElement(`
    <div class="comment-container">
      <div class="comment">
        <h2 class="quote">課題が50％、期末試験が50％</h2>
        <p>ちゃいますね</p>
        <p class="date">2023/7/24</p>
      </div>
      <div class="comment">
        <h2 class="quote">課題が50％、期末試験が50％</h2>
        <p>期末の制限時間が辛い...</p>
        <p class="date">2023/7/24</p>
      </div>
    </div>
  `);

  // course-titleというIDのh1をHTMLの要素として持ってきましょう
  const courseTitleElement = document.querySelector("#course-title");
  // course-titleの次の要素として上で作ったHTMLの要素を追加しましょう
  courseTitleElement.insertAdjacentElement("afterend", commentContainerElement);
  courseTitleElement.insertAdjacentElement("afterend", difficultyVoteSystem);
  courseTitleElement.insertAdjacentElement("afterend", difficultyElement);
  courseTitleElement.insertAdjacentElement("afterend", brElement);
  courseTitleElement.insertAdjacentElement("afterend", kindnessVoteSystem);
  courseTitleElement.insertAdjacentElement("afterend", kindnessElement);

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

  const [teacherKindnessRatings, assignmentDifficultyRatings] =
    await Promise.all([
      getTeacherKindnessRatings(courseId),
      getAssignmentDifficultyRatings(courseId),
    ]);

  console.log("teacherKindnessRatings", teacherKindnessRatings);
  console.log("assignmentDifficultyRatings", assignmentDifficultyRatings);

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

  // DBから持ってきたコメントからHTML生成する箇所始まり
  // DBから持ってきたコメントのデータのダミー
  const comments = [
    {
      uid: "987654",
      quote: "テスト",
      content: "あああああ",
      created_at: new Date("2023-01-03"),
    },
    {
      uid: "ABCDEFG",
      quote: "講義（50%）と演習（50%）を併用する。",
      content: "ちゃいますね",
      created_at: new Date("2023-01-02"),
    },
    {
      uid: "123456",
      quote: "講義（50%）と演習（50%）を併用する。",
      content: "講義0%と演習100%でした",
      created_at: new Date("2023-01-01"),
    },
  ];

  const textToBeInserted = escapeHtml("ユーザー生成のテキスト");

  // DBから持ってきたコメントからHTML生成する箇所終わり

  const hoverOfTeacherKindness = [
    ...document.querySelectorAll("#rate-form-teacher-kindness .hover"),
  ];
  const hoverOfAssignmentDifficulty = [
    ...document.querySelectorAll("#rate-form-assignment-difficulty .hover"),
  ];
  const labelElements = [...document.querySelectorAll(".rate-form label")];
  console.log(labelElements);

  function onHover(i, nthForm) {
    let changeTarget;
    if (nthForm) {
      changeTarget = hoverOfAssignmentDifficulty;
    } else {
      changeTarget = hoverOfTeacherKindness;
    }
    for (let index = 0; index <= i; index++) {
      changeTarget[index].classList.add("onhover");
      changeTarget[index].classList.remove("offhover");
    }
  }

  function offHover(i, nthForm) {
    let changeTarget;
    if (nthForm) {
      changeTarget = hoverOfAssignmentDifficulty;
    } else {
      changeTarget = hoverOfTeacherKindness;
    }
    for (let index = 0; index <= i; index++) {
      changeTarget[index].classList.remove("onhover");

      let ok = 1;
      for (const classElement of changeTarget[index].classList) {
        if (classElement == "checked") ok = 0;
      }
      if (ok) {
        changeTarget[index].classList.add("offhover");
      }
    }
  }

  function radioClick(i) {
    let value = (i % 5) + 1;
    let nthForm = Math.trunc(i / 5);

    if (nthForm == 0) {
      submitTeacherKindness(courseId, value);
    } else if (nthForm == 1) {
      submitAssignmentDifficulty(courseId, value);
    }
    console.log("value:", value, "nthForm=", nthForm);

    let changeTarget;
    if (nthForm) {
      changeTarget = hoverOfAssignmentDifficulty;
    } else {
      changeTarget = hoverOfTeacherKindness;
    }
    changeTarget[value - 1].checked = "checked";
    for (let index = 0; index <= value - 1; index++) {
      changeTarget[index].classList.add("checked");
    }
    for (let index = value; index <= 4; index++) {
      changeTarget[index].classList.remove("checked");
      changeTarget[index].classList.add("offhover");
    }
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
}
