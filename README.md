# sveltejs-adapter-ipfs

Adapter for Svelte apps that prerenders your entire site as a collection of static files with support for IPFS.

This is based on adapter-static but add a post-processing step that do the following :

It replace every absolute path to relative one based on the index.html position in the file system

Here are the values it prepend

- for the root index.html, the value would be `.`
- for the blog/index.html, the value would be `..`
- for the blog/1/index.html, the value would be `../..`

this is done via [ipfs_fixes/relativize_pages.cjs](ipfs_fixes/relativize_pages.cjs)

We also need to also relativize call to server function, this is done by [ipfs_fixes/relativize_js.cjs](ipfs_fixes/relativize_js.cjs) but is not full proof as some `fetch` call are renamed.
Svelte kit need to ensure the base (from `$app/paths`) is prepended for every server route fetch

At runtime (after hydration), we are in a different context though and we want the base path (from `$app/paths`) to be absolute so it works past navigation.
This applies to both `base` and `assets`. The way to achieve that is to simply set them at runtime, (the most early possible)

For that we use the following: `window.BASE = location.pathname.split('/').slice(0, -"${RELBASE}".split('..').length).join('/');`

This is done via [ipfs_fixes/inject_base.cjs](ipfs_fixes/inject_base.cjs)

This also inject the assets value via

```ts
  start({
    assets: window.BASE,
    env: {},
    ...
  });
```

We also then need to make use of window.BASE in the runtime for the base, which is hardocded in chunks/paths-....js or sometime chunks/singletons-....js

this is done via [ipfs_fixes/inject_base_in_paths_file.cjs](ipfs_fixes/inject_base_in_paths_file.cjs) and [ipfs_fixes/inject_base_in_singletons_file.cjs](ipfs_fixes/inject_base_in_singletons_file.cjs)

## link issues

now it would be great if we could still reference page link using absolute links like `href="/about/"`
but if we have to do the following instead, that is ok : `` href={`${base}/about/`} ``

Unfortunately the latter is not sufficient as vite/sveltekit will hardcode the result at build time to `/about/` because it detect that `base` is a constant.

To avoid that best is to use a function that trick the compiler that it might not always be the same and so we can get aroudn with

```svelte
<a href={`pathname(/about/)`}>About></a>
```
