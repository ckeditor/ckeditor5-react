/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export {
	default as CKEditor,
	type EditorErrorDetails
} from './ckeditor.js';

export {
	default as CKEditorContext,
	ContextWatchdogContext,
	useCKEditorWatchdogContext,
	type ContextErrorDetails,
	type ContextWatchdogValue
} from './context/ckeditorcontext.js';

export {
	useMultiRootEditor,
	type MultiRootHookProps,
	type MultiRootHookReturns,
	type AddRootOptions
} from './multiroot/useMultiRootEditor.js';

export { default as useCKEditorCloud } from './cloud/useCKEditorCloud.js';
export {
	default as withCKEditorCloud,
	type WithCKEditorCloudHocProps
} from './cloud/withCKEditorCloud.js';

export {
	loadCKEditorCloud,
	type CKEditorCloudResult,
	type CKEditorCloudConfig
} from '@ckeditor/ckeditor5-integrations-common';
