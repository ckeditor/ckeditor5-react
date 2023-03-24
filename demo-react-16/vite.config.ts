import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig( {
	plugins: [ react() ],
	optimizeDeps: {
		/**
		 * This is required only because we use "npm link" for
		 * testing purposes. See `dependencies` in `package.json`.
		 */
		include: [ '@ckeditor/ckeditor5-react' ]
	}
} );
