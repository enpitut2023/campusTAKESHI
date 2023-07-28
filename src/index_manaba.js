/**
 * @param {string} s
 * @return {Node}
 */
function stringToHtmlElement(s) {
  const template = document.createElement("template");
  template.innerHTML = s.trim();
  return template.content.firstChild;
}

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
 * @param {string} pathname
 * @returns {boolean}
 */
function shouldRun(pathname) {
  const patterns = [
    /^\/ct\/course_\d+$/,
    /^\/ct\/course_\d+_query$/,
    /^\/ct\/course_\d+_survey$/,
    /^\/ct\/course_\d+_report$/,
    /^\/ct\/course_\d+_project$/,
    /^\/ct\/course_\d+_grade$/,
    /^\/ct\/course_\d+_news_\d+$/,
    /^\/ct\/page_[0-9a-f]+$/,
  ];

  for (const p of patterns) {
    if (pathname.match(p)) {
      return true;
    }
  }

  return false;
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
  if (!shouldRun(window.location.pathname)) {
    return;
  }

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
  const pageBody = document.querySelector(".pagebody");

  const [goToSyllabus, _] = createGoToSyllabus(
    currentYear,
    courseCode,
    courseName
  );
  pageBody.appendChild(goToSyllabus);
  pageBody.style.paddingBottom = "0";
}
