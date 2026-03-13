
/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React from 'react';

import { RTCEditor } from './RTCEditor.js';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
import './App.css';

export default function App(): JSX.Element {
	return (
		<div className="demo-root">
			<header className="demo-header">
				<h1 className="demo-title">CKEditor 5 · Multi-root Real-Time Collaboration</h1>
				<p className="demo-subtitle">
					Two independent editor clients connected to the same document.
					Add and remove roots on either side — changes sync instantly via Cloud Services.
				</p>
			</header>

			<div className="demo-editors-wrap">
				<section className="demo-editor-panel">
					<div className="demo-editor-header">
						<h2 className="demo-editor-label">Client A</h2>
					</div>
					<RTCEditor />
				</section>

				<div className="demo-divider" aria-hidden="true" />

				<section className="demo-editor-panel">
					<div className="demo-editor-header">
						<h2 className="demo-editor-label">Client B</h2>
					</div>
					<RTCEditor />
				</section>
			</div>
		</div>
	);
}
