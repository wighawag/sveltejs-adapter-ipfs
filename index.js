const {fixPages} = require('./lib');
module.exports = function ({ pages = 'build', assets = 'build' } = {}) {
  /** @type {import('@sveltejs/kit').Adapter} */
  const adapter = {
    name: 'sveltejs-adapter-ipfs',

    async adapt(builder) {
      builder.copy_static_files(assets);
      builder.copy_client_files(assets);

      await builder.prerender({
        force: true,
        dest: pages
      });

      fixPages(pages, assets);
    }
  };

  return adapter;
};
