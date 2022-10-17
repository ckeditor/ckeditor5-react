/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

interface CKEditorInterface {
  commands: any;
  config: any;
  conversion: any;
  data: any;
  state: 'unloaded' | 'loaded' | 'ready' | 'destroyed';
  getData: () => string;
  editing: any;
  id: string;
  keystrokes: any;
  locale: {
    contentLanguage: string;
    contentLanguageDirection: string;
    uiLanguage: string;
    uiLanguageDirection: string;
  };
  model: any;
  plugins: any;
  sourceElement: any;
}

export interface CKEvent {
  name: string;
  path: any[];
  off: () => any;
  source: any;
  stop: () => any;
}

export interface CKEditorProps {
  editor: any;
  data?: string;
  disabled?: boolean;
  onReady?: ( editor: CKEditorInterface) => void;
  onBlur?: (event: CKEvent, editor: CKEditorInterface) => void;
  onChange?: (event: CKEvent, editor: CKEditorInterface) => void;
  onError?: (error: any, editor: CKEditorInterface) => void;
  onFocus?: (event: CKEvent, editor: CKEditorInterface) => void;
  name?: string;
}

// eslint-disable-next-line not working added ignorePatterns to .eslintrc.js
export const CKEditor: (args: CKEditorProps) => JSX.Element;