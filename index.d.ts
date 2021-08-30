import { Adapter } from '@sveltejs/kit';

interface AdapterOptions {
	pages?: string;
	assets?: string;
	fallback?: string;
  removeBuiltInServiceWorkerRegistration?: boolean;
  injectPagesInServiceWorker?: boolean;
}

declare function plugin(options?: AdapterOptions): Adapter;
export = plugin;
