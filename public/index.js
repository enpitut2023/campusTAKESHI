function round(value){
  let ret;
  ret = ((Math.round(value * 10))/10).toFixed(1);
  return ret
}

let kindness = Math.random()*4+1;
let difficulty = Math.random()*4+1;

kindness = round(kindness);
difficulty = round(difficulty);

const kindnessRatingValue = document.querySelector("#kindness-rating-value");
const kindnessRatingStar = document.querySelector("#kindness-rating-star");
const difficultyRatingValue = document.querySelector("#difficulty-rating-value");
const difficultyRatingStar = document.querySelector("#difficulty-rating-star");

kindnessRatingValue.innerHTML = `${kindness}`;
difficultyRatingValue.innerHTML = `${difficulty}`;

kindnessRatingStar.style.setProperty('--rating',kindness);
difficultyRatingStar.style.setProperty('--rating',difficulty);