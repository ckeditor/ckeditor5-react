/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CKEditor from '../src/ckeditor.jsx';

configure( { adapter: new Adapter() } );

// Mock of data model's document.
const modelDocument = {
	on() {}
};

// Mock of class that representing a basic, generic editor.
class Editor {
	constructor() {
		this.model = {
			document: modelDocument
		}
	}

	destroy() {
		return Promise.resolve();
	}

	// Implements the `DataApi` interface.
	// See: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_utils_dataapimixin-DataApi.html
	setData() {}
	getData() {}

	static create() {
		return Promise.resolve();
	}
}

describe( 'CKEditor Component', () => {
	let sandbox, wrapper;

	beforeEach( () => {
		sandbox = sinon.createSandbox();
		sandbox.stub( modelDocument, 'on' );
	} );

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}

		sandbox.restore();
	} );

	it( 'should call "Editor#create()" method during initialization the component', () => {
		sandbox.stub( Editor, 'create' ).resolves( new Editor() );

		wrapper = mount( <CKEditor editor={ Editor } /> );

		expect( Editor.create.calledOnce ).to.be.true;
		expect( Editor.create.firstCall.args[ 0 ] ).to.be.an.instanceof( HTMLDivElement );
		expect( Editor.create.firstCall.args[ 1 ] ).to.deep.equal( {} );
	} );

	it( 'passes configuration object directly to the "Editor#create()" method', () => {
		sandbox.stub( Editor, 'create' ).resolves( new Editor() );

		const editorConfig = {
			plugins: [
				function myPlugin() {}
			],
			toolbar: {
				items: [ 'bold' ]
			}
		};

		wrapper = mount( <CKEditor editor={ Editor } config={ editorConfig } /> );

		expect( Editor.create.calledOnce ).to.be.true;
		expect( Editor.create.firstCall.args[ 1 ] ).to.deep.equal( editorConfig );
	} );

	it( 'sets initial data if was specified', done => {
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );
		sandbox.stub( editorInstance, 'setData' );

		wrapper = mount( <CKEditor editor={ Editor } data="Hello CKEditor 5!" /> );

		setTimeout( () => {
			expect( editorInstance.setData.calledOnce ).to.be.true;
			expect( editorInstance.setData.firstCall.args[ 0 ] ).to.equal( 'Hello CKEditor 5!' );

			done();
		} );
	} );

	it( 'sets editor\'s data if properties have changed and contain the "data" key', done => {
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );
		sandbox.stub( editorInstance, 'setData' );
		sandbox.stub( editorInstance, 'getData' ).returns( '<p>&nbsp;</p>' );

		wrapper = mount( <CKEditor editor={ Editor } /> );

		setTimeout( () => {
			wrapper.setProps( { data: '<p>Foo Bar.</p>' });

			expect( editorInstance.setData.calledOnce ).to.be.true;
			expect( editorInstance.setData.firstCall.args[ 0 ] ).to.equal( '<p>Foo Bar.</p>' );

			done();
		} );
	} );

	it( 'does not update the editor\'s data if value under "data" key is equal to editor\'s data', done => {
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );
		sandbox.stub( editorInstance, 'setData' );
		sandbox.stub( editorInstance, 'getData' ).returns( '<p>Foo Bar.</p>' );

		wrapper = mount( <CKEditor editor={ Editor } /> );

		setTimeout( () => {
			wrapper.setProps( { data: '<p>Foo Bar.</p>' });

			expect( editorInstance.setData.calledOnce ).to.be.false;

			done();
		} );
	} );

	it( 'does not set editor\'s data if the editor is not ready', () => {
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );
		sandbox.stub( editorInstance, 'setData' );

		wrapper = mount( <CKEditor editor={ Editor }/> );

		const component = wrapper.instance();

		component.componentDidUpdate( { data: 'Foo' } );

		expect( component.editor ).to.be.null;
		expect( editorInstance.setData.called ).to.be.false;
	} );

	it( 'calls "onInit" callback if specified when the editor is ready to use', done => {
		const editorInstance = new Editor();
		const onInit = sandbox.spy();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );

		wrapper = mount( <CKEditor editor={ Editor } onInit={ onInit } /> );

		setTimeout( () => {
			expect( onInit.calledOnce ).to.be.true;
			expect( onInit.firstCall.args[ 0 ] ).to.equal( editorInstance );

			done();
		} );
	} );

	it( 'listens to the editor\'s changes in order to call "onChange" callback', done => {
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );
		sandbox.stub( editorInstance, 'getData' ).returns( '<p>Foo.</p>' );

		wrapper = mount( <CKEditor editor={ Editor } /> );

		setTimeout( () => {
			expect( modelDocument.on.calledOnce ).to.be.true;
			expect( modelDocument.on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
			expect( modelDocument.on.firstCall.args[ 1 ] ).to.be.a( 'function' );

			done();
		} );
	} );

	it( 'executes "onChange" callback if specified and editor has changed', done => {
		const onChange = sandbox.spy();
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );

		wrapper = mount( <CKEditor editor={ Editor } onChange={ onChange } /> );

		setTimeout( () => {
			const fireChanges = modelDocument.on.firstCall.args[ 1 ];
			const event = { name: 'change:data' };

			fireChanges( event );

			expect( onChange.calledOnce ).to.equal( true );
			expect( onChange.firstCall.args[ 0 ] ).to.equal( event );
			expect( onChange.firstCall.args[ 1 ] ).to.equal( editorInstance );

			done();
		} );
	} );

	it( 'executes "onChange" callback if it is available in runtime when the editor\'s data has changed', done => {
		const onChange = sandbox.spy();
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );

		wrapper = mount( <CKEditor editor={ Editor } /> );

		setTimeout( () => {
			wrapper.setProps( { onChange } );

			const fireChanges = modelDocument.on.firstCall.args[ 1 ];
			const event = { name: 'change:data' };

			fireChanges( event );

			expect( onChange.calledOnce ).to.equal( true );
			expect( onChange.firstCall.args[ 0 ] ).to.equal( event );
			expect( onChange.firstCall.args[ 1 ] ).to.equal( editorInstance );

			done();
		} );
	} );

	it( 'displays an error if something went wrong', done => {
		const error = new Error( 'Something went wrong.' );
		const consoleErrorStub = sandbox.stub( console, 'error' );

		sandbox.stub( Editor, 'create' ).rejects( error );

		wrapper = mount( <CKEditor editor={ Editor }/> );

		setTimeout( () => {
			consoleErrorStub.restore();

			expect( consoleErrorStub.calledOnce ).to.be.true;
			expect( consoleErrorStub.firstCall.args[ 0 ] ).to.equal( error );

			done();
		} );
	} );

	it( 'should call "Editor#destroy()" method during unmounting the component', done => {
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );
		sandbox.stub( editorInstance, 'destroy' ).resolves();

		wrapper = mount( <CKEditor editor={ Editor } /> );

		setTimeout( () => {
			wrapper.unmount();
			wrapper = null;

			expect( editorInstance.destroy.calledOnce ).to.be.true;

			done();
		} );
	} );

	it( 'should set to "null" the "editor" property inside the component', done => {
		const editorInstance = new Editor();

		sandbox.stub( Editor, 'create' ).resolves( editorInstance );
		sandbox.stub( editorInstance, 'destroy' ).resolves();

		wrapper = mount( <CKEditor editor={ Editor } /> );

		setTimeout( () => {
			const component = wrapper.instance();

			expect( component.editor ).is.not.null;

			wrapper.unmount();
			wrapper = null;

			setTimeout( () => {
				expect( component.editor ).is.null;

				done();
			} );
		} );
	} );
} );
