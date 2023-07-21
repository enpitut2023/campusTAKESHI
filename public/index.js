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
    if (cri.criterion == 'teacher-kindness') {
      totalCriterion += cri.value;
      sumCriterion += 1;
    }
  }
  let aveCriterion = round(totalCriterion/sumCriterion);
  let dict = {criterion:aveCriterion, sum:sumCriterion}
  return dict
}

function countDifficulty(ratings) {
  let totalCriterion = 0;
  let sumCriterion = 0;
  for (let cri of ratings) {
    if (cri.criterion == 'assignment-difficulty') {
      totalCriterion += cri.value;
      sumCriterion += 1;
    }
  }
  let aveCriterion = round(totalCriterion/sumCriterion);
  let dict = {criterion:aveCriterion, sum:sumCriterion}
  return dict
}

const kindnessRatingValue = document.querySelector("#kindness-rating-value");
const kindnessRatingStar = document.querySelector("#kindness-rating-star");
const difficultyRatingValue = document.querySelector(
  "#difficulty-rating-value"
);
const kindnessTotalVotes = document.querySelector("#kindness-total-votes");
const difficultyRatingStar = document.querySelector("#difficulty-rating-star");
const difficultyTotalVotes = document.querySelector("#difficulty-total-votes");

function onHover(i, nthForm){
  let changeTarget;
  if(nthForm){
    changeTarget = hoverOfAssignmentDifficulty;
  }
  else{
    changeTarget = hoverOfTeacherKindness;
  }
  for (let index = 0; index <= i; index++) {
    changeTarget[index].classList.add('onhover');
    changeTarget[index].classList.remove('offhover');
  }
}

function offHover(i, nthForm){
  let changeTarget;
  if(nthForm){
    changeTarget = hoverOfAssignmentDifficulty;
  }
  else{
    changeTarget = hoverOfTeacherKindness;
  }
  for (let index = 0; index <= i; index++) {
    changeTarget[index].classList.remove('onhover');

    let ok = 1;
    for (const classElement of changeTarget[index].classList) {
      if(classElement == 'checked')ok = 0;
    }
    if(ok){
      changeTarget[index].classList.add('offhover');
    }
  }
}


const hoverOfTeacherKindness = [...document.querySelectorAll("#rate-form-teacher-kindness .hover")];
const hoverOfAssignmentDifficulty = [...document.querySelectorAll("#rate-form-assignment-difficulty .hover")];

for (let i=0;i<5;i++) {
  hoverOfTeacherKindness[i].addEventListener("mouseout",  () => offHover(i, 0));
  hoverOfTeacherKindness[i].addEventListener("mouseover", () => onHover(i, 0));
  hoverOfAssignmentDifficulty[i].addEventListener("mouseout",  () => offHover(i, 1));
  hoverOfAssignmentDifficulty[i].addEventListener("mouseover", () => onHover(i, 1));
}

const elements = document.getElementsByName('kindness-rate');

function radioClick(value, nthForm){
  console.log("value:", value , "nthForm=", nthForm);

  let changeTarget;
  if(nthForm){
    changeTarget = hoverOfAssignmentDifficulty;
  }
  else{
    changeTarget = hoverOfTeacherKindness;
  }
  changeTarget[value-1].checked = "checked";
  for (let index = 0; index <= value-1; index++) {
    changeTarget[index].classList.add('checked');
  }
  for (let index = value; index <= 4; index++) {
    changeTarget[index].classList.remove('checked');
    changeTarget[index].classList.add('offhover');
  }
}
// htmlからonclickなどで関数を呼び出したい時はこの文言を入れる
window.radioClick = radioClick;




async function main() {
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
  let kindnesstotal = kindnessCriterion.sum;
  let difficulty = difficultyCriterion.criterion;
  let difficultytotal = difficultyCriterion.sum;

  kindnessRatingValue.innerHTML = `${kindness}`;
  difficultyRatingValue.innerHTML = `${difficulty}`;
  kindnessTotalVotes.innerHTML = `計${kindnesstotal}票`;
  difficultyTotalVotes.innerHTML = `計${difficultytotal}票`;

  kindnessRatingStar.style.setProperty("--rating", kindness);
  difficultyRatingStar.style.setProperty("--rating", difficulty);

}
main();
