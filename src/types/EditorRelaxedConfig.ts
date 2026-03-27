/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * The editor's configuration may vary slightly depending on the version.
 * For example, some fields are present in the LTS version of the editor,
 * while others are no longer available in newer versions. Unfortunately,
 * when these fields are required by utilities that normalize them,
 * this can cause issues if the user has strict type checking enabled.
 * To reduce the number of casts, a relaxed type is used.
 */
export type EditorRelaxedConfig = Record<string, any>;
