let kindness = 4.5;
let difficulty = 2;
let kindnesstotal = 30;
let difficultytotal = 20;



const kindnessRatingValue = document.querySelector("#kindness-rating-value");
const kindnessRatingStar = document.querySelector("#kindness-rating-star");
const kindnessTotalVotes = document.querySelector("#kindness-total-votes");


const difficultyRatingValue = document.querySelector("#difficulty-rating-value");
const difficultyRatingStar = document.querySelector("#difficulty-rating-star");
const difficultyTotalVotes = document.querySelector("#difficulty-total-votes");


kindnessRatingValue.innerHTML = `${kindness}`;
kindnessTotalVotes.innerHTML = `計${kindnesstotal}票`;
difficultyRatingValue.innerHTML = `${difficulty}`;
difficultyTotalVotes.innerHTML = `計${difficultytotal}票`;


kindnessRatingStar.style.setProperty('--rating',kindness);
difficultyRatingStar.style.setProperty('--rating',difficulty);
