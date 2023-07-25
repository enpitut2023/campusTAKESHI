// Load src/index.js as an ESM
(async () => {
  const libJsUrl = chrome.runtime.getURL("src/lib.js");
  const indexManabaJsUrl = chrome.runtime.getURL("src/index_manaba.js");
  const [libJs, indexManabaJs] = await Promise.all([
    import(libJsUrl),
    import(indexManabaJsUrl),
  ]);
  libJs.main();
  indexManabaJs.main();
})();
