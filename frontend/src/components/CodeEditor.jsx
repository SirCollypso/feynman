import React, { useEffect, useState, useRef } from 'react';
import '../styles/CodeEditor.css';
import '../styles/Global.css';

import Editor from "@monaco-editor/react";


const CodeEditor = () => {
    const [value, setValue] = useState('');
    const editorRef = useRef();

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    }

    return (
        <div id='feature-container' className='dark-bg box' style={{backgroundColor: 'black'}}>
            <Editor
                className='.code-editor'
                theme='vs-dark'
                defaultLanguage='python'
                defaultValue='// some comment'
                value={value}
                onChange={(value) => setValue(value)}
                onMount = {onMount}
            />
            <div>
                Hellooo :D
            </div>
        </div>
    );
};

export default CodeEditor;