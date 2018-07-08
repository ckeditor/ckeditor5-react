import React from "react";
import PropTypes from "prop-types";

class CKEditor extends React.Component {
  constructor(props) {
    super(props);

    this.editorInstance = null;
  }

  // Update editor data if data property is changed.
  UNSAFE_componentWillReceiveProps(newProps) {
    if (this.editorInstance && newProps.data) {
      this.editorInstance.setData(newProps.data);
    }
  }

  // Initialize editor when component is mounted.
  componentDidMount() {
    this._initializeEditor();
  }

  // This component should never be updated by React itself.
  shouldComponentUpdate() {
    return false;
  }

  // Destroy editor before unmouting component.
  componentWillUnmount() {
    this._destroyEditor();
  }

  _destroyEditor() {
    if (this.editorInstance) {
      this.editorInstance.destroy();
    }
  }

  _initializeEditor() {
    const { editor, config, data, onInit, onChange } = this.props;
    editor
      .create(this.domContainer, config)
      .then(editor => {
        this.editorInstance = editor;

        // TODO: Pass data via constructor.
        this.editorInstance.setData(data);

        // TODO: Add example using it.
        if (onInit) onInit(editor);

        if (onChange) {
          const document = this.editorInstance.model.document;
          document.on("change", () => {
            if (document.differ.getChanges().length > 0) {
              onChange(editor.getData());
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  // Render <div> element which will be replaced by CKEditor.
  render() {
    return <div ref={ref => (this.domContainer = ref)} />;
  }
}

// Properties definition.
CKEditor.propTypes = {
  config: PropTypes.object,
  data: PropTypes.string,
  editor: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onInit: PropTypes.func
};

// Default values for non-required properties.
CKEditor.defaultProps = {
  config: {},
  data: ""
};

export default CKEditor;
