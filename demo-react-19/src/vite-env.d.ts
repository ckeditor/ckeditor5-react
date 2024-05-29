import type { ClassicEditor } from 'ckeditor5';

declare global {
	interface Window {
		editor: ClassicEditor;
		editor1: ClassicEditor;
		editor2: ClassicEditor;
	}
}
