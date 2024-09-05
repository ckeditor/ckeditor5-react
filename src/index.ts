/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export { default as CKEditor } from './ckeditor';
export { default as CKEditorContext } from './context/ckeditorcontext';
export { default as useMultiRootEditor, type MultiRootHookProps, type MultiRootHookReturns } from './useMultiRootEditor';

export { default as useCKEditorCloud } from './cloud/useCKEditorCloud';
export {
	default as withCKEditorCloud,
	type WithCKEditorCloudHocProps
} from './cloud/withCKEditorCloud';

export {
	loadCKEditorCloud,
	type CKEditorCloudResult,
	type CKEditorCloudConfig
} from '@ckeditor/ckeditor5-integrations-common';
