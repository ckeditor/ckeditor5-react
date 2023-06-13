/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global MultiRootEditor, document */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CKEditor from '../../src/ckeditor.tsx';

configure( { adapter: new Adapter() } );

class AppUsingState extends React.Component {
	constructor( props ) {
		super( props );

		this.initialRootsRefs = {};

		this.state = {
			data: {
				content: ''
			},
			attributes: {
				content: {
					order: 1
				}
			}
		};

		this.editor = null;
	}

	render() {
		return (
			<>
				<div ref={el => {
					this.initialRootsRefs.content = el;
				}}></div>

				<CKEditor
					editor={ MultiRootEditor }
					sourceElements={ this.initialRootsRefs }
					data={ this.state.data }
					attributes={ this.state.attributes }
					onReady={ editor => {
						this.editor = editor;
						this.props.onReady();
					} }

					config={ {
						rootsAttributes: {
							content: {
								order: 1
							}
						}
					} }
				/>
			</>
		);
	}
}

describe( 'CKEditor Component + MultiRootEditor Build', () => {
	let wrapper;
	const data = { content: '<h1>Test</h1>' };
	const sourceElements = {};

	beforeEach( () => {
		const div = document.createElement( 'div' );
		document.body.appendChild( div );

		sourceElements.content = div;
	} );

	it( 'should initialize the MultiRootEditor properly', async () => {
		await new Promise( res => {
			wrapper = mount( <CKEditor
				editor={ MultiRootEditor }
				sourceElements={ sourceElements }
				attributes={{}}
				data={ data }
				onReady={ res }
			/> );
		} );

		const component = wrapper.instance();

		expect( component.editor ).to.not.be.null;
		expect( component.editor.element ).to.not.be.null;
	} );

	describe( 'update the editor\'s', () => {
		let div, component;

		beforeEach( () => {
			div = document.createElement( 'div' );
			document.body.appendChild( div );

			return new Promise( resolve => {
				component = mount(
					<AppUsingState onReady={ resolve } data={ data } sourceElements={ sourceElements } />,
					{ attachTo: div }
				).instance();
			} );
		} );

		describe( 'content', () => {
			it( 'returns initial state', () => {
				expect( component.state.data ).to.deep.equal( { content: '' } );
			} );

			it( 'should modify new root after changing the state', () => {
				expect( component.editor.getFullData() ).to.deep.equal( {
					content: ''
				} );

				component.setState( {
					data: {
						content: 'new'
					}
				} );

				expect( component.editor.getFullData() ).to.deep.equal( {
					content: '<p>new</p>'
				} );
			} );

			it( 'should create new root after changing the state', () => {
				expect( component.editor.getFullData() ).to.deep.equal( {
					content: ''
				} );

				component.setState( {
					data: {
						...component.state.data,
						newRoot: 'New root content'
					}
				} );

				expect( component.editor.getFullData() ).to.deep.equal( {
					content: '',
					newRoot: '<p>New root content</p>'
				} );
			} );

			it( 'should remove root after changing the state', () => {
				expect( component.editor.getFullData() ).to.deep.equal( {
					content: ''
				} );

				component.setState( {
					data: {}
				} );

				expect( component.editor.getFullData() ).to.deep.equal( {} );
			} );
		} );

		describe( 'attributes', () => {
			it( 'should modify attributes of existing root', () => {
				expect( component.editor.getRootsAttributes() ).to.deep.equal( {
					content: {
						order: 1
					}
				} );

				component.setState( {
					...component.state,
					attributes: {
						content: {
							order: 10
						}
					}
				} );

				expect( component.editor.getRootsAttributes() ).to.deep.equal( {
					content: {
						order: 10
					}
				} );
			} );

			it( 'should remove attributes of existing root', () => {
				expect( component.editor.getRootsAttributes() ).to.deep.equal( {
					content: {
						order: 1
					}
				} );

				component.setState( {
					...component.state,
					attributes: {}
				} );

				expect( component.editor.getRootsAttributes() ).to.deep.equal( {
					content: {
						order: null
					}
				} );
			} );

			it( 'should add attributes for new root', () => {
				component.setState( {
					data: {
						newRoot: 'new'
					},
					attributes: {
						newRoot: {
							order: 50
						}
					}
				} );

				expect( component.editor.getRootsAttributes() ).to.deep.equal( {
					newRoot: {
						order: 50
					}
				} );
			} );
		} );
	} );
} );
