import {fixPages} from './lib.js';

/** @type {import('.')} */
export default function ({ pages = 'build', assets = pages, fallback = null, removeBuiltInServiceWorkerRegistration = false, injectPagesInServiceWorker = false, injectDebugConsole = false  } = {}) {
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

      		fixPages({pages, assets, removeBuiltInServiceWorkerRegistration, injectPagesInServiceWorker, injectDebugConsole});
		}
	};

	return adapter;
}
