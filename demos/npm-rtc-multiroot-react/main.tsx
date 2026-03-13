import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';

const container = document.getElementById( 'app' );

if ( !container ) {
	throw new Error( 'Root element #app not found.' );
}

createRoot( container ).render(
	<StrictMode>
		<App />
	</StrictMode>
);
