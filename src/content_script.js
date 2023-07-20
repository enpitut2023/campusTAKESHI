// Load src/index.js as an ESM
(async () => {
  const indexJsUrl = chrome.runtime.getURL("src/index.js");
  const indexJs = await import(indexJsUrl);
  indexJs.main();
})();
