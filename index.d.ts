import { Adapter } from '@sveltejs/kit';

declare type Callbacks = {
  preSourceMapRemoval?: ({pages, assets}: {pages: string, assets: string}) => Promise<void>
  end?: ({pages, assets}: {pages: string, assets: string}) => Promise<void>
};

interface AdapterOptions {
	pages?: string;
	assets?: string;
	fallback?: string;
  callbacks?: Callbacks;
  copyBeforeSourceMapRemoval?: string;
  removeSourceMap?: boolean;
  removeBuiltInServiceWorkerRegistration?: boolean;
  injectPagesInServiceWorker?: boolean;
}

declare function plugin(options?: AdapterOptions): Adapter;
export = plugin;
