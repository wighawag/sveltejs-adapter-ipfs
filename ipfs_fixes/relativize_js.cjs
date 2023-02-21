const fs = require('fs');
const path = require('path');
const { traverse, slash } = require('./lib.cjs');

function relativize_js(assets) {
	// get all js
	const files = traverse(assets).filter(
		(file) => file.name.endsWith('.js') || file.name.endsWith('.mjs')
	);

	for (const file of files) {
		const filePath = path.join(assets, file.relativePath);
		const fileContent = fs.readFileSync(filePath).toString();

		const reFetch = new RegExp('fetch\\(`\\/', 'g');
		const reHrefAttr = new RegExp('"href","\\/', 'g');
		const reHrefAttr2 = new RegExp('"href", "\\/', 'g');

		const newFileContent = fileContent
			.replace(reFetch, 'fetch(`${window.BASE}/')
			.replace(reHrefAttr, '"href",window.BASE + "/')
			.replace(reHrefAttr2, '"href", window.BASE + "/');

		fs.writeFileSync(filePath, newFileContent);
	}
}

module.exports = {
	relativize_js
};

if (require.main === module) {
	// TODO: argument
	relativize_js('build');
}
