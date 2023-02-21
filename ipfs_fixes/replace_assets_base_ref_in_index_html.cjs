const fs = require('fs');
const path = require('path');
const { traverse } = require('./lib.cjs');

function replace_assets_base_ref_in_index_html(pages) {
	// get all page's index.html
	const pageIndexes = traverse(pages).filter((file) => file.name === 'index.html');

	for (const page of pageIndexes) {
		const indexHTMLPath = path.join(pages, page.relativePath);
		let indexHTMLContent = fs.readFileSync(indexHTMLPath).toString();

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
	replace_assets_base_ref_in_index_html
};

if (require.main === module) {
	// TODO: argument
	replace_assets_base_ref_in_index_html('build');
}
