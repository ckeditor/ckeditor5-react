/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export { default as CKEditor } from './ckeditor';
export { default as CKEditorContext } from './ckeditorcontext';
export { default as useMultiRootEditor, type MultiRootHookProps, type MultiRootHookReturns } from './useMultiRootEditor';

// CDN related exports.
export {
	default as useCKEditorCloud,
	type CKEditorCloudResult
} from './cloud/useCKEditorCloud';

export {
	default as withCKEditorCloud,
	type WithCKEditorCloudHocProps
} from './cloud/withCKEditorCloud';
