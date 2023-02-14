const fs = require('fs');
const path = require('path');

const traverse = function (dir, result, topDir, filter) {
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
				directory: stats.isDirectory()
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

function slash(path) {
	const isExtendedLengthPath = /^\\\\\?\\/.test(path);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

	if (isExtendedLengthPath || hasNonAscii) {
		return path;
	}

	return path.replace(/\\/g, '/');
}

module.exports = {
	traverse,
	slash
};
