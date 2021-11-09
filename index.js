import {fixPages} from './lib.js';

/** @type {import('.')} */
export default function ({ pages = 'build', assets = pages, fallback = null, callbacks = undefined, copyBeforeSourceMapRemoval = undefined, removeSourceMap = false, removeBuiltInServiceWorkerRegistration = false, injectPagesInServiceWorker = false, injectDebugConsole = false  } = {}) {
	const adapter = {
		name: 'sveltejs-adapter-ipfs',

    	async adapt({ utils }) {
			utils.rimraf(assets);
			utils.rimraf(pages);

			utils.copy_static_files(assets);
			utils.copy_client_files(assets);

			await utils.prerender({
				fallback,
				all: !fallback,
				dest: pages
			});

      await fixPages({pages, assets, callbacks, copyBeforeSourceMapRemoval, removeSourceMap, removeBuiltInServiceWorkerRegistration, injectPagesInServiceWorker, injectDebugConsole});
		}
	};

	return adapter;
}
