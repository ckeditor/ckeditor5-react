/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export { default as CKEditor } from './ckeditor';
export { default as CKEditorContext } from './ckeditorcontext';
export { default as useMultiRootEditor, type MultiRootHookProps, type MultiRootHookReturns } from './useMultiRootEditor';

// CDN related exports.
import './cloud/cdn/globals.d';

export { default as useCKEditorCloud } from './cloud/useCKEditorCloud';
export { loadCKCdnResourcesPack, type CKEditorCloudResult } from './cloud/cdn';

export {
	default as withCKEditorCloud,
	type WithCKEditorCloudHocProps
} from './cloud/withCKEditorCloud';
