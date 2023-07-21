import { getRatings } from "./fetch.js";

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
  let aveCriterion;
  let labelContent;
  if (sumCriterion == 0) {
    aveCriterion = 0;
    labelContent = "票なし";
  } else {
    aveCriterion = round(totalCriterion / sumCriterion);
    labelContent = aveCriterion;
  }
  let dict = { criterion: aveCriterion, sum: sumCriterion, labelContent: labelContent };
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
  let aveCriterion;
  let labelContent;
  if (sumCriterion == 0) {
    aveCriterion = 0;
    labelContent = "票なし";
  } else {
    aveCriterion = round(totalCriterion / sumCriterion);
    labelContent = aveCriterion;
  }
  let dict = { criterion: aveCriterion, sum: sumCriterion, labelContent: labelContent };
  return dict;
}

const kindnessRatingValue = document.querySelector("#kindness-rating-value");
const kindnessRatingStar = document.querySelector("#kindness-rating-star");
const difficultyRatingValue = document.querySelector(
  "#difficulty-rating-value"
);
const kindnessTotalVotes = document.querySelector("#kindness-total-votes");
const difficultyRatingStar = document.querySelector("#difficulty-rating-star");
const difficultyTotalVotes = document.querySelector("#difficulty-total-votes");

async function main() {
  const courseId = "GB13614";
  const ratings = await getRatings(courseId);

  console.log(ratings);

  const kindnessCriterion = countKindness(ratings);
  const difficultyCriterion = countDifficulty(ratings);

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
}

main();
