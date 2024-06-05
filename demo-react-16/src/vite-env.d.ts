import type ClassicEditor from './ClassicEditor';

declare global {
	interface Window {
		editor: ClassicEditor;
		editor1: ClassicEditor;
		editor2: ClassicEditor;
	}
}
