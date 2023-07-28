// Load src/index.js as an ESM
(async () => {
  const indexManabaJsUrl = chrome.runtime.getURL("src/index_manaba.js");
  const [indexManabaJs] = await Promise.all([import(indexManabaJsUrl)]);
  indexManabaJs.main();
})();
