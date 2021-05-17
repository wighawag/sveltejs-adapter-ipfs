import {fixPages} from './lib.js';
/**
 * @param {{
 *   pages?: string;
 *   assets?: string;
 *   fallback?: string;
 *   removeBuiltInServiceWorkerRegistration?: boolean;
 *   injectPagesInServiceWorker?: boolean;
 * }} [opts]
 */
export default function ({ pages = 'build', assets = pages, fallback = null, removeBuiltInServiceWorkerRegistration = false, injectPagesInServiceWorker = false  } = {}) {
	/** @type {import('@sveltejs/kit').Adapter} */
	const adapter = {
		name: 'sveltejs-adapter-ipfs',

		async adapt(utils) {
			utils.copy_static_files(assets);
			utils.copy_client_files(assets);

			await utils.prerender({
				fallback,
				all: !fallback,
				dest: pages
			});

      fixPages({pages, assets, removeBuiltInServiceWorkerRegistration, injectPagesInServiceWorker});
		}
	};

	return adapter;
}
