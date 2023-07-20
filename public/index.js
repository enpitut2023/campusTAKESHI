import { getRatings } from "./fetch.js";

let kindness = 4.5;
let difficulty = 2;
const kindnessRatingValue = document.querySelector("#kindness-rating-value");
const kindnessRatingStar = document.querySelector("#kindness-rating-star");
const difficultyRatingValue = document.querySelector(
  "#difficulty-rating-value"
);
const difficultyRatingStar = document.querySelector("#difficulty-rating-star");

kindnessRatingValue.innerHTML = `${kindness}`;
difficultyRatingValue.innerHTML = `${difficulty}`;

kindnessRatingStar.style.setProperty("--rating", kindness);
difficultyRatingStar.style.setProperty("--rating", difficulty);

async function main() {
  const courseId = "GB13614";
  const ratings = await getRatings(courseId);

  console.log(ratings);
}

main();
