/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export { default as CKEditor } from './ckeditor.js';
export { default as CKEditorContext } from './context/ckeditorcontext.js';
export { default as useMultiRootEditor, type MultiRootHookProps, type MultiRootHookReturns } from './useMultiRootEditor.js';

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
