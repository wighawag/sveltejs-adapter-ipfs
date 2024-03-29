import path from 'path';
import { platforms } from './platforms.js';
import { inject_base } from './ipfs_fixes/inject_base.cjs';
import { inject_base_in_paths_file } from './ipfs_fixes/inject_base_in_paths_file.cjs';
import { inject_base_in_singletons_file } from './ipfs_fixes/inject_base_in_singletons_file.cjs';
import { relativize_pages } from './ipfs_fixes/relativize_pages.cjs';
import { relativize_js } from './ipfs_fixes/relativize_js.cjs';
import { replace_assets_base_ref_in_index_html } from './ipfs_fixes/replace_assets_base_ref_in_index_html.cjs';

/** @type {import('.').default} */
export default function (options) {
	return {
		name: 'sveltejs-adapter-ipfs',

		async adapt(builder) {
			if (!options?.fallback) {
				if (builder.routes.some((route) => route.prerender !== true) && options?.strict !== false) {
					const prefix = path.relative('.', builder.config.kit.files.routes);
					const has_param_routes = builder.routes.some((route) => route.id.includes('['));
					const config_option =
						has_param_routes || JSON.stringify(builder.config.kit.prerender.entries) !== '["*"]'
							? `  - adjust the \`prerender.entries\` config option ${
									has_param_routes
										? '(routes with parameters are not part of entry points by default)'
										: ''
							  } — see https://kit.svelte.dev/docs/configuration#prerender for more info.`
							: '';

					builder.log.error(
						`sveltejs-adapter-ipfs: all routes must be fully prerenderable, but found the following routes that are dynamic:
${builder.routes.map((route) => `  - ${path.posix.join(prefix, route.id)}`).join('\n')}

You have the following options:
  - set the \`fallback\` option — see https://github.com/sveltejs/kit/tree/master/packages/adapter-static#spa-mode for more info.
  - add \`export const prerender = true\` to your root \`+layout.js/.ts\` or \`+layout.server.js/.ts\` file. This will try to prerender all pages.
  - add \`export const prerender = true\` to any \`+server.js/ts\` files that are not fetched by page \`load\` functions.
${config_option}
  - pass \`strict: false\` to \`adapter-ipfs\` to ignore this error. Only do this if you are sure you don't need the routes in question in your final app, as they will be unavailable. See https://github.com/sveltejs/kit/tree/master/packages/adapter-static#strict for more info.

If this doesn't help, you may need to use a different adapter. sveltejs-adapter-ipfs can only be used for sites that don't need a server for dynamic rendering, and can run on just a static file server.
See https://kit.svelte.dev/docs/page-options#prerender for more details`
					);
					throw new Error('Encountered dynamic routes');
				}
			}

			const platform = platforms.find((platform) => platform.test());

			if (platform) {
				if (options) {
					builder.log.warn(
						`Detected ${platform.name}. Please remove adapter-ipfs options to enable zero-config mode`
					);
				} else {
					builder.log.info(`Detected ${platform.name}, using zero-config mode`);
				}
			}

			const {
				pages = 'build',
				assets = pages,
				fallback,
				precompress
			} = options ?? platform?.defaults ?? /** @type {import('./index').AdapterOptions} */ ({});

			builder.rimraf(assets);
			builder.rimraf(pages);

			builder.writeClient(assets);
			builder.writePrerendered(pages);

			if (fallback) {
				await builder.generateFallback(path.join(pages, fallback));
			}

			// before precompress or after ?
			if (!options.ipfsFixDisabled) {
				if (pages !== assets) {
					throw new Error(`pages need to be same folder of assets for now`);
				}
				if (!options.skipInjectBase) {
					inject_base(pages);
				}
				if (!options.skipReplacementInIndexHTML) {
					replace_assets_base_ref_in_index_html(pages);
				}

				if (!options.skipSingletonsAndPathsFiles) {
					inject_base_in_paths_file(assets);
					inject_base_in_singletons_file(assets);
				}

				relativize_js(assets);
				relativize_pages(pages);
			}

			if (precompress) {
				builder.log.minor('Compressing assets and pages');
				if (pages === assets) {
					await builder.compress(assets);
				} else {
					await Promise.all([builder.compress(assets), builder.compress(pages)]);
				}
			}

			if (pages === assets) {
				builder.log(`Wrote site to "${pages}"`);
			} else {
				builder.log(`Wrote pages to "${pages}" and assets to "${assets}"`);
			}

			if (!options) platform?.done(builder);
		}
	};
}
