/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global window */

const { Plugin, Command, ButtonView } = window.CKEDITOR;

class HighlightCommand extends Command {
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'highlight' );

			for ( const range of ranges ) {
				if ( this.value ) {
					writer.removeAttribute( 'highlight', range );
				} else {
					writer.setAttribute( 'highlight', true, range );
				}
			}
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const isAllowed = model.schema.checkAttributeInSelection( selection, 'highlight' );

		this.isEnabled = isAllowed;
		this.value = this.isHighlightedNodeSelected();
	}

	isHighlightedNodeSelected() {
		const { model } = this.editor;
		const { schema } = model;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			return selection.hasAttribute( 'highlight' );
		}

		return selection.getRanges().some( range =>
			Array
				.from( range.getItems() )
				.some( item =>
					schema.checkAttribute( item, 'highlight' ) &&
					item.hasAttribute( 'highlight' )
				)
		);
	}
}

window.MyLocalPlugin = class MyCustomPlugin extends Plugin {
	static get pluginName() {
		return 'MyCustomPlugin';
	}

	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$text', { allowAttributes: 'highlight' } );

		editor.conversion.attributeToElement( {
			model: 'highlight',
			view: {
				name: 'span',
				styles: {
					'background-color': 'yellow'
				}
			}
		} );

		const command = new HighlightCommand( editor );

		editor.commands.add( 'highlight', command );

		editor.ui.componentFactory.add( 'highlight', locale => {
			const view = new ButtonView( locale );

			view.bind( 'isOn' ).to( command, 'value' );
			view.set( {
				label: 'Highlight',
				withText: true,
				tooltip: true
			} );

			view.on( 'execute', () => {
				editor.execute( 'highlight' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
};

