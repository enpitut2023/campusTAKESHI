// Load src/index.js as an ESM
(async () => {
  const libJsUrl = chrome.runtime.getURL("src/lib.js");
  const indexJsUrl = chrome.runtime.getURL("src/index.js");
  const [libJs, indexJs] = await Promise.all([
    import(libJsUrl),
    import(indexJsUrl),
  ]);
  libJs.main();
  indexJs.main();
})();
