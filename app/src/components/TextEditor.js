import React, { useState } from 'react';
import RichTextEditor from 'react-rte';

const TextEditorComponent = (props) => {
  const [editorState, setEditorState] = useState(
    RichTextEditor.createValueFromString(props.value, 'html')
  );

  const onChange = (val) => {
    // call parent component handler
    setEditorState(val)
    props.handleChange(val.toString('html'));
  }

  return(
    <div>
      <RichTextEditor
        autoFocus
        value={editorState}
        onChange={ value => onChange(value) }
        />
    </div>
  )
}


export default TextEditorComponent;
