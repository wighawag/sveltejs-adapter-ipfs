declare function plugin(options: {
  pages?: string;
  assets?: string;
  fallback?: string;
  removeBuiltInServiceWorkerRegistration?: boolean;
  injectPagesInServiceWorker?: boolean;
}): import('@sveltejs/kit').Adapter;

export = plugin;
