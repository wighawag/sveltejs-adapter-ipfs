# sveltejs-adapter-ipfs

Adapter for Svelte apps that prerenders your entire site as a collection of static files with support for IPFS.

This is based on adapter-static but add a post-processing step that do the following :

- replace absolute link in all index.html with their relative equivalent 
- inject base option passed to `start` so that it represent the actual base path. This is done dynamically so it support IPFS hosting
- replace `start` code so that trailing slash are appended to every route
- inject a script so all links in the header use full url, this allow favicon to work even after navigation



