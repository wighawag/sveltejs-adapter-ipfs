import fs from 'fs';
import path from 'path';
// import slash from 'slash';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function slash(path) {
	const isExtendedLengthPath = /^\\\\\?\\/.test(path);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

	if (isExtendedLengthPath || hasNonAscii) {
		return path;
	}

	return path.replace(/\\/g, '/');
}

function copyDirSync(src, dest) {
	try {
		fs.mkdirSync(dest, { recursive: true });
	} catch (e) {}

	let entries = fs.readdirSync(src, { withFileTypes: true });

	for (let entry of entries) {
		let srcPath = path.join(src, entry.name);
		let destPath = path.join(dest, entry.name);

		entry.isDirectory() ? copyDirSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
	}
}

// TODO reimplement : https://github.com/wighawag/snowpack-plugin-ipfs/blob/main/src/lib.ts

// if network error emitter or inject ipfs gateway loading error
// do the following :
// - include <script> tag to catch errr (in head)
/*
    <!-- Add network Emitter -->
    <script>
      window.netErrorList = [];
      window.network = new EventTarget();
      window.netError = (event) => {netErrorList.push(event);network.dispatchEvent(new CustomEvent('error',{detail: event}));};
    </script>
*/
// - add onerror= on all link preload and stylesheet (in head), like this :
/*

    <link rel="stylesheet" href="./_app/assets/start-d977ffc4.css" onerror="netError(event)">
		<link rel="stylesheet" href="./_app/assets/MailingList-282876ba.css" onerror="netError(event)">
		<link rel="modulepreload" href="./_app/start-a1142b7a.js" onerror="netError(event)">
		<link rel="modulepreload" href="./_app/chunks/vendor-8f597b55.js" onerror="netError(event)">
		<link rel="modulepreload" href="./_app/chunks/paths-28a87002.js" onerror="netError(event)">
		<link rel="modulepreload" href="./_app/pages/__layout.svelte-514fd1d8.js" onerror="netError(event)">
		<link rel="modulepreload" href="./_app/chunks/MailingList-f6216b4c.js" onerror="netError(event)">
		<link rel="modulepreload" href="./_app/chunks/application-c21ae1e1.js" onerror="netError(event)">
		<link rel="modulepreload" href="./_app/pages/index.svelte-06dc1464.js" onerror="netError(event)">
		<link rel="modulepreload" href="./_app/chunks/stores-7545cfca.js" onerror="netError(event)">
*/

// if inject ipfs gateway loading error
// do the following :
// - add logic for loading new ipfs gateway
/*
<!-- script to handle ipfs loading -->
    <script>
      window.getGatewayLink = function() {
          return fetch('https://cloudflare-eth.com', {method: "POST", body: JSON.stringify({jsonrpc: "2.0", id: "3", method: "eth_call", params:[{to:"0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41", data:"0xbc1c58d1${hash}"}, "latest"]})}).then(v=>v.json()).then((json) => {
            if (json.error) {
              throw json.error;
            }
            const result = json.result;
            const hash = result && result.slice(130, 134).toLowerCase() === 'e301' && result.slice(134, 206);
            if (hash) {
              const a = 'abcdefghijklmnopqrstuvwxyz234567';
              const h = new Uint8Array(hash.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
              const l = 36;
              let b = 0;
              let v = 0;
              let o = '';
              for (let i = 0; i < l; i++) {
                v = (v << 8) | h[i];
                b += 8;
                while (b >= 5) {
                  o += a[(v >>> (b - 5)) & 31];
                  b -= 5;
                }
              }
              if (b > 0) {
                o += a[(v << (5 - b)) & 31];
              }
              const url = 'https://b' + o + '.ipfs.dweb.link';
              return url;
            }
          }).catch((e) => {
            console.error(e)
            return "https://duckduckgo.com"
          });
        }
    </script>
*/
// - add style tag for buttons (in head)
/*
    <!-- inject style for ipfs gateway failure notice -->
    <style>
      .gateway-failure-button {
        cursor:pointer;--tw-border-opacity: 1;border-color: rgb(239 68 68);border-width: 2px;border-radius: 16px;width: 6rem;height: 3rem;margin: 1rem;padding: 0;-webkit-appearance: button;background-color:transparent;background-image:none;color:inherit;
      }
      .gateway-failure-button:hover {
        border-color: rgb(239 68 68);background-color: rgb(239 68 68);color: rgb(239 200 200);;
      }
    </style>
*/
// - add script tag at end of body to handle error and show modal
/*
<!-- Modal -->
<script>
  let modal;
  function onError(event) {
    if (modal) {
      return;
    }
    modal = document.createElement('div', {});
    modal.id = '__modal__';
    modal.style =
      'position:fixed;z-index:999;padding-top:100px;left:0;top: 0;width:100%;height:100%;overflow: auto;background-color: rgb(0,0,0);background-color:rgba(0,0,0,0.4);';
    const pinata = true;
    let message = 'The gateway is having issue to load the website.';
    if (pinata) {
      message = 'Pinata gateway do not support modern webapp and their caching strategy unfortunately';
    }
    modal.innerHTML = `
    <div style="position: fixed; text-align: center; top: 0;background-color: rgb(254 226 226);width: 100%;border-bottom-right-radius: 0.5rem;border-bottom-left-radius: 0.5rem;">
      <div style="padding: 2px 16px;background-color: rgb(254 202 202);color:rgb(239 68 68);">
        <span id="__ipfs_close__" style="cursor: pointer;color: rgb(239 68 68);float: right;font-size: 28px;font-weight: bold;">&times;</span>
        <h2>IPFS Gateway Failure</h2>
      </div>
      <div style="padding: 2px 16px;">
        <p>${message}</p>
        <p>Please try with another gateway</p>
      </div>
      <div style="padding: 2px 16px; min-height: 6em;background-color: rgb(254 202 202);color: rgb(239 68 68); display: flex;align-items: center;justify-content: center;">
        <button id="__ipfs_io__" class="gateway-failure-button">Use ipfs.io</button>
      </div>
    </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('__ipfs_close__').onclick = () => {
      document.body.removeChild(modal);
    };
    document.getElementById('__ipfs_io__').onclick = () => {
      // document.body.removeChild(modal);
      getGatewayLink().then((url) => location.assign(url + location.pathname + location.search + location.hash))
    };
  }
  if (netErrorList.length > 0) {
    onError(netErrorList[0]);
  }
  network.addEventListener('error', onError);
</script>
*/

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

function old_css_fix(args) {
	const { assets } = args;

	const appCSSFiles = traverse(path.join(assets, '_app')).filter((file) =>
		file.name.endsWith('.css')
	);
	for (const cssFile of appCSSFiles) {
		const filePath = path.join(assets, '_app', cssFile.relativePath);
		// console.log(cssFile);
		const content = fs.readFileSync(filePath).toString();
		let newContent = content;

		const regex = /url\((\/_app\/.*?)\)/g;
		let m;
		while ((m = regex.exec(content)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			const url = m[1];
			if (url) {
				const p = path.join('/_app', path.dirname(cssFile.relativePath));
				const rel = path.relative(p, url);
				newContent = newContent.replace(url, rel);
			}
		}
		fs.writeFileSync(filePath, newContent);
	}
}

function old_js_fix(args) {
	const { assets, options } = args;
	const { removeBuiltInServiceWorkerRegistration } = options;

	const appJSFiles = traverse(path.join(assets, '_app')).filter((file) =>
		file.name.endsWith('.js')
	);
	for (const jsFile of appJSFiles) {
		if (jsFile.name.startsWith('start-')) {
			const filePath = path.join(assets, '_app', jsFile.relativePath);
			// console.log({name: jsFile.name, filePath})
			const content = fs.readFileSync(filePath).toString();
			let newContent = content;

			{
				// old and new version use that :
				const find = '"/_app';
				const re = new RegExp(find, 'g');
				newContent = newContent.replace(re, 'window.BASE + "/_app');
			}

			{
				// at some version this was needed
				const find = '`/_app';
				const re = new RegExp(find, 'g');
				newContent = newContent.replace(re, '`${window.BASE}/_app');
			}

			// fix transformation
			const BROKEN = 'history.replaceState({},"",`${a.path}${location.search}`)';
			const FIXED = 'history.replaceState({},"",`${this.base}${a.path}${location.search}`)';
			if (newContent.indexOf(BROKEN) === -1) {
				// console.warn('could not find broken code, svelte-kit might have been updated with different code. if so sveltejs-adapter-ipfs need to be updated');
			} else {
				newContent = newContent.replace(BROKEN, FIXED);
			}

			// TODO try trailingSLash: ignore, trailingSlash: always is broken on static adapter
			const TO_REMOVE =
				'if("/"!==a.path){const t=a.path.endsWith("/");(t&&"never"===this.trailing_slash||!t&&"always"===this.trailing_slash&&!a.path.split("/").pop().includes("."))&&(a.path=t?a.path.slice(0,-1):a.path+"/",history.replaceState({},"",`${this.base}${a.path}${location.search}`))}';
			if (newContent.indexOf(TO_REMOVE) === -1) {
				// console.warn('could not find code to remove, svelte-kit might have been updated with different code. if so sveltejs-adapter-ipfs need to be updated');
			} else {
				newContent = newContent.replace(TO_REMOVE, '');
			}

			if (removeBuiltInServiceWorkerRegistration) {
				// this transformation remove auto service worker registration, allowing you to provide your own
				const SERVICE_WORKER_REGISTRATION_CODE =
					'"serviceWorker"in navigator&&navigator.serviceWorker.register("/service-worker.js");';
				if (newContent.indexOf(SERVICE_WORKER_REGISTRATION_CODE) === -1) {
					// console.warn('could not find service worker registration code, svelte-kit might have been updated with different code. if so sveltejs-adapter-ipfs need to be updated');
				} else {
					newContent = newContent.replace(SERVICE_WORKER_REGISTRATION_CODE, '');
				}
			}
			fs.writeFileSync(filePath, newContent);
		} else if (jsFile.relativePath.startsWith('pages/')) {
			// handle href reset to use window.BASE:
			// (should be handled by start- js file as it is aware of the base here, TODO need to report on svelte-kit repo)

			const filePath = path.join(assets, '_app', jsFile.relativePath);
			// console.log({name: jsFile.name, filePath})
			const content = fs.readFileSync(filePath).toString();
			let newContent = content;

			const find = '"href","/';
			const re = new RegExp(find, 'g');
			newContent = newContent.replace(re, '"href",window.BASE + "/');
			fs.writeFileSync(filePath, newContent);
		}
	}
}

function old_pages_fix(args) {
	const { pages, options } = args;
	const { removeBuiltInServiceWorkerRegistration, injectDebugConsole } = options;

	const filtered = traverse(pages).filter((file) => file.name === 'index.html');

	const findSrc = 'src="/';
	const reSrc = new RegExp(findSrc, 'g');
	const findHref = 'href="/';
	const reHref = new RegExp(findHref, 'g');
	const findContent = 'content="/';
	const reContent = new RegExp(findContent, 'g');
	const findFromImport = 'from "/';
	const reFromImport = new RegExp(findFromImport, 'g');

	// TODO dynamic window.basepath ?
	const findDynamicImport = 'import\\("/';
	const reDynamicImport = new RegExp(findDynamicImport, 'g');

	const findRelpath = 'window.relpath="/';
	const reRelpath = new RegExp(findRelpath, 'g');

	const linkReloadScript = `
    <script>
      // ensure we save href as they are loaded, so they do not change on page navigation
      document.querySelectorAll("link[href]").forEach((v) => v.href = v.href);
    </script>
`;

	const pageURLs = [];

	for (const page of filtered) {
		const indexHTMLPath = path.join(pages, page.relativePath);
		const indexHTMLContent = fs.readFileSync(indexHTMLPath).toString();

		const pageIndexHTMLURLPath = slash(page.relativePath);
		const pageURLPath = path.dirname(pageIndexHTMLURLPath);
		let numSegment = 0;
		let baseHref = './';
		if (pageURLPath != '' && pageURLPath != '.' && pageURLPath != './') {
			const numSlashes = pageURLPath.split('/').length - 1;
			numSegment++;
			baseHref = '../';
			for (let i = 0; i < numSlashes; i++) {
				baseHref += '../';
				numSegment++;
			}
		}
		if (pageURLPath === '.') {
			pageURLs.push('/');
		} else {
			let url = pageURLPath;
			if (!url.startsWith('/')) {
				url = '/' + url;
			}
			if (!url.endsWith('/')) {
				url = url + '/';
			}
			pageURLs.push(url);
		}

		// console.log({baseHref, pageURLPath, indexHTMLPath, pageIndexHTMLURLPath})

		const windowBaseScript = `
    <script>
      window.BASE = (() => {
        const normalised = (location.pathname.endsWith("/") ? location.pathname.substr(0, location.pathname.length -1) : location.pathname).substr(1);
        const split = normalised.split('/');
        const sliced = ${numSegment} ? split.slice(0, ${-numSegment}) : split;
        const str = (sliced.length > 0 && sliced[0] !== "") ? "/" + sliced.join('/') : "";
        return str;
      })();
    </script>
`;

		const findBase = `{"base":""`;
		const reBase = new RegExp(findBase, 'g');

		let newIndexHTMLContent = indexHTMLContent
			.replace(reSrc, 'src="' + baseHref)
			.replace(reHref, 'href="' + baseHref)
			.replace(reContent, 'content="' + baseHref)
			.replace(reFromImport, 'from "' + baseHref)
			.replace(reDynamicImport, 'import("' + baseHref)
			.replace(reBase, `{"base": window.BASE`);

		if (removeBuiltInServiceWorkerRegistration) {
			// with new version of svelte-kit the worker registration is done in the index.html
			newIndexHTMLContent = newIndexHTMLContent.replace(
				`navigator.serviceWorker.register('/service-worker.js');`,
				`//navigator.serviceWorker.register('/service-worker.js');`
			);
		}

		let debugScript = '';
		if (injectDebugConsole) {
			try {
				fs.mkdirSync(path.join(pages, 'scripts'));
			} catch (e) {}

			const erudaPath = path.join(pages, 'scripts', 'eruda.js');
			if (!fs.existsSync(erudaPath)) {
				fs.copyFileSync(path.join(__dirname, 'scripts', 'eruda.js'), erudaPath);
			}
			debugScript = `
      <script>
        (function () {
          if (!!/\\?_d_eruda/.test(window.location) || !!/&_d_eruda/.test(window.location)) {
            var src = '${baseHref}scripts/eruda.js';
            window._debug = true;
            document.write('<scr' + 'ipt src="' + src + '"></scr' + 'ipt>');
            document.write('<scr' + 'ipt>eruda.init();</scr' + 'ipt>');
          }
        })();
      </script>
  `;
		}

		// TODO handle case where there is zero script tag
		const firstScript = newIndexHTMLContent.indexOf('<script');
		newIndexHTMLContent =
			newIndexHTMLContent.slice(0, firstScript) +
			`${windowBaseScript}` +
			`${linkReloadScript}` +
			`${debugScript}` +
			newIndexHTMLContent.slice(firstScript);

		fs.writeFileSync(indexHTMLPath, newIndexHTMLContent);
	}

	return pageURLs;
}

function inject_pages_in_service_worker(pages, pageURLs) {
	const filePath = path.join(pages, 'service-worker.js');
	try {
		const content = fs.readFileSync(filePath).toString();
		const newContent = content.replace('"_INJECT_PAGES_"', `"${pageURLs.join('","')}"`);
		fs.writeFileSync(filePath, newContent);
	} catch (e) {
		console.error(`could not update service worker`);
	}
}

function new_mode(args) {
	const { pages, assets, options } = args;
	const {
		callbacks,
		copyBeforeSourceMapRemoval,
		removeBuiltInServiceWorkerRegistration,
		removeSourceMap,
		injectPagesInServiceWorker,
		injectDebugConsole,
		oldMode,
		replacePrerenderedAbsolutePath
	} = options;

	// get paths- file
	const pathFiles = traverse(path.join(assets, '_app/immutable/chunks')).filter((file) =>
		file.name.startsWith('paths-')
	);
	if (pathFiles.length === 0) {
		throw new Error(`no paths- files found`);
	} else if (pathFiles.length > 1) {
		throw new Error(`too many "paths-..." files found: ${pathFiles.map((f) => f.path).join(',')}`);
	} else {
		// inject window.BASE to set {base} for $app/paths
		const pathFile = pathFiles[0];
		const content = fs.readFileSync(pathFile.path, { encoding: 'utf-8' });
		const newContent = content.replace('=""', `=window.BASE`);
		fs.writeFileSync(pathFile.path, newContent);
	}

	// get all page's index.html
	const pageIndexes = traverse(pages).filter((file) => file.name === 'index.html');
	const linkReloadScript = `
    <script>
      // ensure we save href as they are loaded, so they do not change on page navigation
      document.querySelectorAll("link[href]").forEach((v) => v.href = v.href);
    </script>
`;

	const pageURLs = [];

	for (const page of pageIndexes) {
		const indexHTMLPath = path.join(pages, page.relativePath);
		const indexHTMLContent = fs.readFileSync(indexHTMLPath).toString();

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
		if (pageURLPath === '.') {
			pageURLs.push('/');
		} else {
			let url = pageURLPath;
			if (!url.startsWith('/')) {
				url = '/' + url;
			}
			if (!url.endsWith('/')) {
				url = url + '/';
			}
			pageURLs.push(url);
		}

		// console.log({baseHref, pageURLPath, indexHTMLPath, pageIndexHTMLURLPath})

		const windowBaseScript = `
  <script>
    window.BASE = "${baseHref}";
  </script>
`;

		const findSrc = 'src="/';
		const reSrc = new RegExp(findSrc, 'g');
		const findSrcSet = 'srcset="/';
		const reSrcSet = new RegExp(findSrcSet, 'g');
		const findHref = 'href="/';
		const reHref = new RegExp(findHref, 'g');
		const findContent = 'content="/';
		const reContent = new RegExp(findContent, 'g');
		const findFromImport = 'from "/';
		const reFromImport = new RegExp(findFromImport, 'g');

		// TODO dynamic window.basepath ?
		const findDynamicImport = 'import\\("/';
		const reDynamicImport = new RegExp(findDynamicImport, 'g');

		let newIndexHTMLContent = indexHTMLContent;
		if (replacePrerenderedAbsolutePath) {
			newIndexHTMLContent = newIndexHTMLContent
				.replace(reSrc, 'src="' + baseHref + '/')
				.replace(reSrcSet, 'srcset="' + baseHref + '/')
				.replace(reHref, 'href="' + baseHref + '/')
				.replace(reContent, 'content="' + baseHref + '/')
				.replace(reFromImport, 'from "' + baseHref + '/')
				.replace(reDynamicImport, 'import("' + baseHref + '/');
		}

		let debugScript = '';
		if (injectDebugConsole) {
			// fs.ensureDirSync(path.join(pages, 'scripts'));
			try {
				fs.mkdirSync(path.join(pages, 'scripts'));
			} catch (e) {}
			const erudaPath = path.join(pages, 'scripts', 'eruda.js');
			if (!fs.existsSync(erudaPath)) {
				fs.copyFileSync(path.join(__dirname, 'scripts', 'eruda.js'), erudaPath);
			}
			debugScript = `
    <script>
      (function () {
        if (!!/\\?_d_eruda/.test(window.location) || !!/&_d_eruda/.test(window.location)) {
          var src = '${baseHref}/scripts/eruda.js';
          window._debug = true;
          document.write('<scr' + 'ipt src="' + src + '"></scr' + 'ipt>');
          document.write('<scr' + 'ipt>eruda.init();</scr' + 'ipt>');
        }
      })();
    </script>
`;
		}

		// TODO handle case where there is zero script tag
		const firstScript = newIndexHTMLContent.indexOf('<script');
		newIndexHTMLContent =
			newIndexHTMLContent.slice(0, firstScript) +
			`${windowBaseScript}` +
			`${linkReloadScript}` +
			`${debugScript}` +
			newIndexHTMLContent.slice(firstScript);

		fs.writeFileSync(indexHTMLPath, newIndexHTMLContent);
	}
}

export async function fixPages(args) {
	const { pages, assets, options } = args;
	const {
		callbacks,
		copyBeforeSourceMapRemoval,
		removeBuiltInServiceWorkerRegistration,
		removeSourceMap,
		injectPagesInServiceWorker,
		injectDebugConsole,
		oldMode
	} = options;

	if (oldMode) {
		const pageURLs = old_pages_fix(args);

		old_js_fix(args);

		old_css_fix(args);

		if (injectPagesInServiceWorker) {
			inject_pages_in_service_worker(pages, pageURLs);
		}
	} else {
		if (injectPagesInServiceWorker) {
			throw new Error(`injectPagesInServiceWorker not implemented in new mode`);
		}
		new_mode(args);
	}

	if (callbacks && callbacks.preSourceMapRemoval) {
		await callbacks.preSourceMapRemoval({ assets, pages });
	}

	if (copyBeforeSourceMapRemoval) {
		if (fs.existsSync(copyBeforeSourceMapRemoval)) {
			fs.rmdirSync(copyBeforeSourceMapRemoval);
		}
		fs.mkdirSync(copyBeforeSourceMapRemoval);

		copyDirSync(pages, path.join(copyBeforeSourceMapRemoval, pages));
		if (pages !== assets) {
			copyDirSync(assets, path.join(copyBeforeSourceMapRemoval, assets));
		}
	}

	if (removeSourceMap) {
		let filtered = traverse(pages).filter((file) => file.name.endsWith('.map'));
		if (pages !== assets) {
			filtered = filtered.concat(traverse(assets).filter((file) => file.name.endsWith('.map')));
		}
		for (const file of filtered) {
			// fs.moveSync(path.join(pages, file.relativePath), path.join(moveSourceMap, file.relativePath));
			fs.unlinkSync(path.join(pages, file.relativePath));
		}
	}

	if (callbacks && callbacks.end) {
		await callbacks.end({ assets, pages });
	}
}
