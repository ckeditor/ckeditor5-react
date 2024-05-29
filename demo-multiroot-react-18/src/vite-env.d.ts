import type { MultiRootEditor } from 'ckeditor5';

declare global {
	interface Window {
		editor: MultiRootEditor;
		editor1: MultiRootEditor;
		editor2: MultiRootEditor;
	}
}
