const fs = require('fs');
const path = require('path');
const { traverse, slash } = require('./lib.cjs');

function inject_base(pages) {
	// get all page's index.html
	const pageIndexes = traverse(pages).filter((file) => file.name === 'index.html');

	for (const page of pageIndexes) {
		const indexHTMLPath = path.join(pages, page.relativePath);
		let indexHTMLContent = fs.readFileSync(indexHTMLPath).toString();

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

		// inject the dynamic base
		const windowBaseScript = `
    <script>
			window.BASE = location.pathname.split('/').slice(0, -"${baseHref}".split('..').length).join('/');
    </script>
`;
		const firstScript = indexHTMLContent.indexOf('<script');
		const headEnd = indexHTMLContent.indexOf('</head');
		const insertion = firstScript > -1 && headEnd < firstScript ? headEnd : firstScript;
		indexHTMLContent =
			indexHTMLContent.slice(0, insertion) +
			`${windowBaseScript}` +
			indexHTMLContent.slice(insertion);

		// set the assets path to be the dynamic base
		indexHTMLContent = indexHTMLContent.replace('assets: "",', `assets: window.BASE,`);
		indexHTMLContent = indexHTMLContent.replace(
			'assets: new URL(".", location.href).pathname.replace(/^/$/, \'\'),',
			`assets: window.BASE,`
		);

		// set the base path to be the dynamic base
		indexHTMLContent = indexHTMLContent.replace('base: "",', `base: window.BASE,`);

		fs.writeFileSync(indexHTMLPath, indexHTMLContent);
	}
}

module.exports = {
	inject_base
};

if (require.main === module) {
	// TODO: argument
	inject_base('build');
}
