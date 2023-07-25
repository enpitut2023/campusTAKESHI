import { stringToHtmlElement } from "./lib.js";

/**
 * @param {number} currentYear
 * @param {string} courseCode
 * @param {string} courseName
 * @returns {[HTMLDivElement, HTMLAnchorElement]}
 */
function createGoToSyllabus(currentYear, courseCode, courseName) {
  const div = stringToHtmlElement(`
    <div class="go-to-syllabus">
      <a href="https://kdb.tsukuba.ac.jp/syllabi/${currentYear}/${courseCode}/jpn/" target="_blank">
        「${courseName}」のシラバスを新しいタブで開く
      </a>
    </div>
  `);
  const anchor = div.firstChild;
  return [div, anchor];
}

/**
 * @param {string} style
 * @returns {void}
 */
function applyStyle(style) {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);
}

export async function main() {
  applyStyle(`
.go-to-syllabus {
  padding: 1em;
  background-color: #dffabd;
  border-color: #9ecf4c;
  border-width: 2px 0;
  border-style: solid;
}
  `);

  const currentYear = new Date().getFullYear();
  const courseCode = document.querySelector(".coursecode").innerHTML.trim();
  const courseName = document.querySelector("#coursename").innerHTML.trim();
  const pageHeader = document.querySelector(
    ".pageheader-course.pageheader-courseV2"
  );

  const [goToSyllabus, _] = createGoToSyllabus(
    currentYear,
    courseCode,
    courseName
  );
  pageHeader.insertAdjacentElement("afterend", goToSyllabus);
}
