const fs = require('fs');
const path = require('path');

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


function fixPages(folder) {

  const pages = traverse(folder).filter((file) => file.name === 'index.html');

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

  for (const page of pages) {
    const indexHTMLPath = path.join(folder, page.relativePath);
    const indexHTMLContent = fs.readFileSync(indexHTMLPath).toString();

    const indexHTMLFolder = path.dirname(page.relativePath);
    let baseHref = '';
    if (indexHTMLFolder != '' && indexHTMLFolder != '.' && indexHTMLFolder != './') {
      const numSlashes = page.relativePath.split('/').length - 1;
      baseHref = '../';
      for (let i = 0; i < numSlashes; i++) {
        baseHref += '../';
      }
    }

    console.log({baseHref, indexHTMLFolder, indexHTMLPath})

    const newIndexHTMLContent = indexHTMLContent
      .replace(reSrc, 'src="' + baseHref)
      .replace(reHref, 'href="' + baseHref)
      .replace(reContent, 'content="' + baseHref)
      .replace(reFromImport, 'from "' + baseHref)
      .replace(reDynamicImport, 'import("' + baseHref);

    // newIndexHTMLContent = newIndexHTMLContent.replace(reRelpath, 'window.relpath="' + baseHref);

    fs.writeFileSync(indexHTMLPath, newIndexHTMLContent);
  }


  // const assets = fs.readdirSync(path.join(exportFolder, '_assets'));
  // const findAssetPaths = '"/_assets';
  // const reAssetPaths = new RegExp(findAssetPaths, 'g');
  // for (const asset of assets) {
  //   if (asset.endsWith('.js')) {
  //     const assetPath = path.join(exportFolder, '_assets', asset);
  //     fs.writeFileSync(
  //       assetPath,
  //       fs
  //         .readFileSync(assetPath)
  //         .toString()
  //         .replace(reAssetPaths, 'window.basepath+"_assets')
  //     );
  //   }
  // }
}

module.exports = {
  fixPages
}
