import { getRatings } from "./fetch.js";

function round(value) {
  let ret;
  ret = (Math.round(value * 10) / 10).toFixed(1);
  return ret;
}

let kindness = Math.random() * 4 + 1;
let difficulty = Math.random() * 4 + 1;

kindness = round(kindness);
difficulty = round(difficulty);

let kindnesstotal = 30;
let difficultytotal = 20;

const kindnessRatingValue = document.querySelector("#kindness-rating-value");
const kindnessRatingStar = document.querySelector("#kindness-rating-star");
const difficultyRatingValue = document.querySelector(
  "#difficulty-rating-value"
);
const kindnessTotalVotes = document.querySelector("#kindness-total-votes");
const difficultyRatingStar = document.querySelector("#difficulty-rating-star");
const difficultyTotalVotes = document.querySelector("#difficulty-total-votes");

kindnessRatingValue.innerHTML = `${kindness}`;
kindnessTotalVotes.innerHTML = `計${kindnesstotal}票`;
difficultyRatingValue.innerHTML = `${difficulty}`;
difficultyTotalVotes.innerHTML = `計${difficultytotal}票`;

kindnessRatingStar.style.setProperty("--rating", kindness);
difficultyRatingStar.style.setProperty("--rating", difficulty);

async function main() {
  const courseId = "GB13614";
  const ratings = await getRatings(courseId);

  console.log(ratings);
}

main();
