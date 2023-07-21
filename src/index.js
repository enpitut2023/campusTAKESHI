import { getRatings, stringToHtmlElement } from "./lib.js";

function round(value) {
  let ret;
  ret = (Math.round(value * 10) / 10).toFixed(1);
  return ret;
}

function countKindness(ratings) {
  let totalCriterion = 0;
  let sumCriterion = 0;
  for (let cri of ratings) {
    if (cri.criterion == "teacher-kindness") {
      totalCriterion += cri.value;
      sumCriterion += 1;
    }
  }
  let aveCriterion = round(totalCriterion / sumCriterion);
  let dict = { criterion: aveCriterion, sum: sumCriterion };
  return dict;
}

function countDifficulty(ratings) {
  let totalCriterion = 0;
  let sumCriterion = 0;
  for (let cri of ratings) {
    if (cri.criterion == "assignment-difficulty") {
      totalCriterion += cri.value;
      sumCriterion += 1;
    }
  }
  let aveCriterion = round(totalCriterion / sumCriterion);
  let dict = { criterion: aveCriterion, sum: sumCriterion };
  return dict;
}

// 拡張機能が読み込まれたら最初に実行される関数
export async function main() {
  const styleElement = stringToHtmlElement(`
    <style>
    :root {
      --star-size: 40px;
      --star-color: #dbdbd9;
      --star-background: #f0bc43;
    }
    .txt {
      font-size: 20px;
    }
    .rating {
      font-size: 20px;
      margin-right: 40px;
    }
    .rating-value {
      font-size: 30px;
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
    .rating {
      display: inline;
    }
    
    </style>
  `);
  document.head.appendChild(styleElement);

  // 文字列からHTMLの要素を作りましょう
  const kindnessElement = stringToHtmlElement(`
  
  <div class="rating" >
  <span class="rating-label">先生の優しさ:</span>
  <span class="rating-value" id="kindness-rating-value">2.4</span>
  <span class="stars" id="kindness-rating-star"></span>
  <span class="total-votes" id="kindness-total-votes"></span>
</div>
  `);
 const difficultyElement = stringToHtmlElement(`
  <div class="rating">
  <span class="rating-label">課題の難しさ:</span>
  <span class="rating-value" id="difficulty-rating-value">1.0</span>
  <span class="stars" id="difficulty-rating-star"></span>
  <span class="total-votes" id="difficulty-total-votes"></span>
</div>
  `);

  // course-titleというIDのh1をHTMLの要素として持ってきましょう
  const courseTitleElement = document.querySelector("#course-title");
  // course-titleの次の要素としてexampleElementを追加してみましょう
  courseTitleElement.insertAdjacentElement("afterend", difficultyElement);
  courseTitleElement.insertAdjacentElement("afterend", kindnessElement);

  // ↓これをやってみて
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

  // ↓この科目番号をURLからとかHTMLからとか何らかの方法で持ってきたい
  // const courseId = "GB13614";
  // const ratings = await getRatings(courseId);

  // 一旦DBへのアクセスを減らしたいのでダミーデータを直接ここに書いておく
  const ratings = [
    {
      uid: "456",
      value: 2,
      criterion: "teacher-kindness",
    },
    {
      uid: "111",
      value: 2,
      criterion: "teacher-kindness",
    },
    {
      uid: "222",
      value: 1,
      criterion: "teacher-kindness",
    },
    {
      uid: "123",
      value: 3,
      criterion: "teacher-kindness",
    },
    {
      uid: "111",
      value: 4,
      criterion: "assignment-difficulty",
    },
    {
      uid: "123",
      value: 5,
      criterion: "assignment-difficulty",
    },
  ];

  console.log(ratings);

  const kindnessCriterion = countKindness(ratings);
  const difficultyCriterion = countDifficulty(ratings);

  let kindness = kindnessCriterion.criterion;
  let kindnessTotal = kindnessCriterion.sum;
  let difficulty = difficultyCriterion.criterion;
  let difficultyTotal = difficultyCriterion.sum;

  kindnessRatingValue.innerHTML = `${kindness}`;
  difficultyRatingValue.innerHTML = `${difficulty}`;
  kindnessTotalVotes.innerHTML = `計${kindnessTotal}票`;
  difficultyTotalVotes.innerHTML = `計${difficultyTotal}票`;

  kindnessRatingStar.style.setProperty("--rating", kindness);
  difficultyRatingStar.style.setProperty("--rating", difficulty);
}
