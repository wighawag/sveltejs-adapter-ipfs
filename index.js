const {fixPages} = require('./lib');
module.exports = function ({ pages = 'build', assets = 'build' } = {}) {
  /** @type {import('@sveltejs/kit').Adapter} */
  const adapter = {
    name: 'sveltejs-adapter-ipfs',

    async adapt(utils) {
      utils.copy_static_files(assets);
      utils.copy_client_files(assets);

      await utils.prerender({
        force: true,
        dest: pages
      });

      fixPages(pages, assets);
    }
  };

  return adapter;
};
