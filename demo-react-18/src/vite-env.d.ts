import type ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

declare global {
	interface Window {
		editor: ClassicEditor | MultiRootEditor;
		editor1: ClassicEditor | MultiRootEditor;
		editor2: ClassicEditor | MultiRootEditor;
	}
}
