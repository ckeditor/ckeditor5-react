import type MultiRootEditor from './MultiRootEditor';

declare global {
	interface Window {
		editor: MultiRootEditor;
		editor1: MultiRootEditor;
		editor2: MultiRootEditor;
	}
}
