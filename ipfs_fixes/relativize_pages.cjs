const fs = require('fs');
const path = require('path');
const { traverse, slash } = require('./lib.cjs');

function relativize_pages(pages) {
	// get all page's index.html
	const pageIndexes = traverse(pages).filter((file) => file.name === 'index.html');

	for (const page of pageIndexes) {
		const indexHTMLPath = path.join(pages, page.relativePath);
		const indexHTMLContent = fs.readFileSync(indexHTMLPath).toString();

		const pageIndexHTMLURLPath = slash(page.relativePath);
		const pageURLPath = path.dirname(pageIndexHTMLURLPath);
		let numSegment = 0;
		let baseHref = '.';
		if (pageURLPath != '' && pageURLPath != '.' && pageURLPath != './') {
			const numSlashes = pageURLPath.split('/').length - 1;
			numSegment++;
			baseHref = '..';
			for (let i = 0; i < numSlashes; i++) {
				baseHref += '/..';
				numSegment++;
			}
		}
		const findSrc = 'src="/';
		const reSrc = new RegExp(findSrc, 'g');
		const findSrcSet = 'srcset="/';
		const reSrcSet = new RegExp(findSrcSet, 'g');
		const findHref = 'href="/';
		const reHref = new RegExp(findHref, 'g');
		const findContent = 'content="/';
		const reContent = new RegExp(findContent, 'g');
		const findFromImport = 'from "/';
		const reFromImport = new RegExp(findFromImport, 'g');
		const findDynamicImport = 'import\\("/';
		const reDynamicImport = new RegExp(findDynamicImport, 'g');

		const newIndexHTMLContent = indexHTMLContent
			.replace(reSrc, 'src="' + baseHref + '/')
			.replace(reSrcSet, 'srcset="' + baseHref + '/')
			.replace(reHref, 'href="' + baseHref + '/')
			.replace(reContent, 'content="' + baseHref + '/')
			.replace(reFromImport, 'from "' + baseHref + '/')
			.replace(reDynamicImport, 'import("' + baseHref + '/');

		// TODO data-url=" ?

		fs.writeFileSync(indexHTMLPath, newIndexHTMLContent);
	}
}

module.exports = {
	relativize_pages
};

if (require.main === module) {
	// TODO: argument
	relativize_pages('build');
}
