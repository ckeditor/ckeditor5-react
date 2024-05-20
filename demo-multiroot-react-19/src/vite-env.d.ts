import type MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

declare global {
	interface Window {
		editor: MultiRootEditor;
		editor1: MultiRootEditor;
		editor2: MultiRootEditor;
	}
}
