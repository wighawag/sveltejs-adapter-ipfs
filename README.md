# sveltejs-adapter-ipfs

Adapter for Svelte apps that prerenders your entire site as a collection of static files with support for IPFS.

This is based on adapter-static but add a post-processing step that do the following :

- for all index.html (fix : https://github.com/sveltejs/kit/issues/595)
  - replace absolute link with their relative equivalent (corresponding to the depth of the index.html)
  - inject js script to generate the base path (folder on which the website is hosted) dynamically and asign it to `window.BASE`
  - use `window.BASE` for the base option passed to `start`
  - inject a script so all links in the header use full url, this allow favicon to work even after navigation

- for the `start-<hash>.js` script:
  <!-- - fix https://github.com/sveltejs/kit/issues/1476 by prepending `router.base` fix: https://github.com/sveltejs/kit/issues/1476-->
  - remove trailingSLashes check (TODO test with trailingSlash: ignore)
  - allow override service worker registration to support relative path (fix: https://github.com/sveltejs/kit/issues/922)

- for all css file (fix: https://github.com/sveltejs/kit/issues/1477)
  - replace absolute `url(...)` to relative path (relative to css file)

- inject pages in service worker so service worker can cache them (fix: https://github.com/sveltejs/kit/issues/923)


Some of these are not specific to ipfs but this also illustrate what is missing in svelte kit
