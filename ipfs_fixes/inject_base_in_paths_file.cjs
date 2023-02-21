const fs = require('fs');
const path = require('path');
const { traverse } = require('./lib.cjs');

function inject_base_in_paths_file(assets) {
	// get paths- file
	const pathFiles = traverse(path.join(assets, '_app/immutable/chunks')).filter(
		(file) => file.name.startsWith('paths-') || file.name.startsWith('paths.')
	);
	if (pathFiles.length === 0) {
		throw new Error(`no paths- files found`);
	} else if (pathFiles.length > 1) {
		throw new Error(`too many "paths-..." files found: ${pathFiles.map((f) => f.path).join(',')}`);
	} else {
		// inject window.BASE to set {base} for $app/paths
		const pathFile = pathFiles[0];
		let content = fs.readFileSync(pathFile.path, { encoding: 'utf-8' });

		content = content.replace(`const base = "";`, `const base = window.BASE;`);
		content = content.replace(`const a="";`, `const a=window.BASE;`); // required in some configuration, not full proof
		fs.writeFileSync(pathFile.path, content);
	}
}

module.exports = {
	inject_base_in_paths_file
};

if (require.main === module) {
	// TODO: argument
	inject_base_in_paths_file('build');
}
