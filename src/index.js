import { getRatings } from "./lib.js";

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

const kindnessRatingValue = document.querySelector("#kindness-rating-value");
const kindnessRatingStar = document.querySelector("#kindness-rating-star");
const difficultyRatingValue = document.querySelector(
  "#difficulty-rating-value"
);
const kindnessTotalVotes = document.querySelector("#kindness-total-votes");
const difficultyRatingStar = document.querySelector("#difficulty-rating-star");
const difficultyTotalVotes = document.querySelector("#difficulty-total-votes");

export async function main() {
  const courseId = "GB13614";
  const ratings = await getRatings(courseId);

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
