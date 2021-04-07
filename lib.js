const fs = require('fs');
const path = require('path');
const slash = require('slash');

const traverse = function (
  dir,
  result,
  topDir,
  filter,
) {
  if (!result) {
    result = [];
  }
  fs.readdirSync(dir).forEach((name) => {
    const fPath = path.resolve(dir, name);
    const stats = fs.statSync(fPath);
    if ((!filter && !name.startsWith('.')) || (filter && filter(name, stats))) {
      const fileStats = {
        name,
        path: fPath,
        relativePath: path.relative(topDir || dir, fPath),
        mtimeMs: stats.mtimeMs,
        directory: stats.isDirectory(),
      };
      if (fileStats.directory) {
        result.push(fileStats);
        return traverse(fPath, result, topDir || dir, filter);
      }
      result.push(fileStats);
    }
  });
  return result;
};


function fixPages(options) {
  const {pages, assets, removeBuiltInServiceWorkerRegistration, injectPagesInServiceWorker} = options;

  const filtered = traverse(pages).filter((file) => file.name === 'index.html');

  const findSrc = 'src="/';
  const reSrc = new RegExp(findSrc, 'g');
  const findHref = 'href="/';
  const reHref = new RegExp(findHref, 'g');
  const findContent = 'content="/';
  const reContent = new RegExp(findContent, 'g');
  const findFromImport = 'from "/';
  const reFromImport = new RegExp(findFromImport, 'g');

  // TODO dynamic window.basepath ?
  const findDynamicImport = "import\\(\"/";
  const reDynamicImport = new RegExp(findDynamicImport, 'g');

  const findRelpath = 'window.relpath="/';
  const reRelpath = new RegExp(findRelpath, 'g');


  const linkReloadScript = `
    <script>
      // ensure we save href as they are loaded, so they do not change on page navigation
      document.querySelectorAll("link[href]").forEach((v) => v.href = v.href);
    </script>
`;

  const pageURLs = [];

  for (const page of filtered) {
    const indexHTMLPath = path.join(pages, page.relativePath);
    const indexHTMLContent = fs.readFileSync(indexHTMLPath).toString();

    const pageIndexHTMLURLPath = slash(page.relativePath);
    const pageURLPath = path.dirname(pageIndexHTMLURLPath);
    let numSegment = 0;
    let baseHref = '';
    if (pageURLPath != '' && pageURLPath != '.' && pageURLPath != './') {
      const numSlashes = pageURLPath.split('/').length - 1;
      numSegment ++;
      baseHref = '../';
      for (let i = 0; i < numSlashes; i++) {
        baseHref += '../';
        numSegment ++;
      }
    }
    if (pageURLPath === '.') {
      pageURLs.push('/');
    } else {
      let url = pageURLPath;
      if (!url.startsWith('/')) {
        url = "/" + url;
      }
      if (!url.endsWith('/')) {
        url = url + '/';
      }
      pageURLs.push(url);
    }


    // console.log({baseHref, pageURLPath, indexHTMLPath, pageIndexHTMLURLPath})

    const findBase = `{"base":""`;
    const reBase = new RegExp(findBase, 'g');

    // console.log({normalised, split, sliced, str, numSegment: ${numSegment}});
    const baseFunc = `(() => {
      const normalised = (location.pathname.endsWith("/") ? location.pathname.substr(0, location.pathname.length -1) : location.pathname).substr(1);
      const split = normalised.split('/');
      const sliced = ${numSegment} ? split.slice(0, ${-(numSegment)}) : split;
      const str = (sliced.length > 0 && sliced[0] !== "") ? "/" + sliced.join('/') : "";
      return str;
    })()`;

    let newIndexHTMLContent = indexHTMLContent
      .replace(reSrc, 'src="' + baseHref)
      .replace(reHref, 'href="' + baseHref)
      .replace(reContent, 'content="' + baseHref)
      .replace(reFromImport, 'from "' + baseHref)
      .replace(reDynamicImport, 'import("' + baseHref)
      .replace(reBase, `{"base": ${baseFunc}`);

    // newIndexHTMLContent = newIndexHTMLContent.replace(reRelpath, 'window.relpath="' + baseHref);

    const headEnd = newIndexHTMLContent.indexOf('</head>');
    newIndexHTMLContent =
    newIndexHTMLContent.slice(0, headEnd) +
      `${linkReloadScript}` +
      newIndexHTMLContent.slice(headEnd);

    fs.writeFileSync(indexHTMLPath, newIndexHTMLContent);
  }

  const appJSFiles = traverse(path.join(assets, '_app')).filter((file) => file.name.endsWith(".js"));
  for (const jsFile of appJSFiles) {
    if (jsFile.name.startsWith('start-')) {
      const filePath = path.join(assets, '_app', jsFile.relativePath);
      // console.log({name: jsFile.name, filePath})
      const content = fs.readFileSync(filePath).toString();
      // this transformation make sure path ends with a slash
      const SLASH_REMOVAL_CODE = 'location.pathname.endsWith("/")&&"/"!==location.pathname&&history.replaceState({},"",`${location.pathname.slice(0,-1)}${location.search}`),';
      const SLASH_APPENDING_CODE = '!location.pathname.endsWith("/")&&history.replaceState({},"",`${location.pathname + "/"}${location.search}`),';
      let newContent = content;
      if (newContent.indexOf(SLASH_REMOVAL_CODE) === -1) {
        // console.warn('could not find slash removal code, svelte-kit might have been updated with different code. if so sveltejs-adapter-ipfs need to be updated');
      } else {
        newContent = newContent.replace(SLASH_REMOVAL_CODE, SLASH_APPENDING_CODE);
      }
      if (removeBuiltInServiceWorkerRegistration) {
        // this transformation remove auto service worker registration, allowing you to provide your own
        const SERVICE_WORKER_REGISTRATION_CODE = '"serviceWorker"in navigator&&navigator.serviceWorker.register("/service-worker.js");';
        if (newContent.indexOf(SERVICE_WORKER_REGISTRATION_CODE) === -1) {
          // console.warn('could not find service worker registration code, svelte-kit might have been updated with different code. if so sveltejs-adapter-ipfs need to be updated');
        } else {
          newContent = newContent.replace(SERVICE_WORKER_REGISTRATION_CODE, '');
        }
      }
      fs.writeFileSync(filePath, newContent);
    }

  }

  if (injectPagesInServiceWorker) {
    const filePath = path.join(pages, 'service-worker.js');
    const content = fs.readFileSync(filePath).toString();
    const newContent = content.replace('"_INJECT_PAGES_"', `"${pageURLs.join('","')}"`)
    fs.writeFileSync(filePath, newContent);
  }

}

module.exports = {
  fixPages
}
