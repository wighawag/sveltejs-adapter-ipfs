const fs = require('fs');
const path = require('path');
const { traverse } = require('./lib.cjs');

function inject_base_in_singletons_file(assets) {
	// get singletons- file
	const files = traverse(path.join(assets, '_app/immutable/chunks')).filter((file) =>
		file.name.startsWith('singletons-')
	);
	if (files.length === 0) {
		throw new Error(`no singletons- files found`);
	} else if (files.length > 1) {
		throw new Error(`too many "singletons-..." files found: ${files.map((f) => f.path).join(',')}`);
	} else {
		// inject window.BASE to set {base} for $app/paths
		const pathFile = files[0];
		let content = fs.readFileSync(pathFile.path, { encoding: 'utf-8' });
		content = content.replace(`const base = "";`, `const base = window.BASE;`);
		fs.writeFileSync(pathFile.path, content);
	}
}

module.exports = {
	inject_base_in_singletons_file
};

if (require.main === module) {
	// TODO: argument
	inject_base_in_singletons_file('build');
}
