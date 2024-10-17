import React, { useState, useRef } from 'react';
import Editor from "@monaco-editor/react";
import CodeOutput from './CodeOutput.jsx';
import { LANG_OPTIONS, pythonCode, editor_options } from '../constants/Common.jsx';

import '../styles/CodeEditor.css';
import '../styles/Global.css';


const CodeEditor = ({setResponse}) => {
    const editorRef = useRef();
    const [value, setValue] = useState('');
    const [language, setLanguage] = useState('None');
    const [selectedCode, setSelectedCode] = useState('');

    const handleMountEditor = (editor) => {
        editorRef.current = editor;
        editor.focus();
    }

    function handleEditorChange(value, event) {
        setValue(value);
    }

    const handleSetLanguage = (e) => {
        e.preventDefault();
        console.log("Chosen language: ", e.target.value);
        setLanguage(e.target.value);
    }

    const updateSelectedCode = () => {
        const editor = editorRef.current;
        if (editor) {
            const selectedText = editor.getModel().getValueInRange(editor.getSelection());
            setSelectedCode(selectedText);
            setResponse({
                role: 'user',
                message: `Selected code: ${selectedText}`,
                code: selectedText,
            });
            console.log("Selected: ", selectedText);
        }
    };

    return (
        <div id='feature-container' className='dark-box'>
            <div className='code-editor-header dark-box'>
                <div className='dropdown'>
                    <label>
                        <b className='text-dark'>Language</b>
                        <select value={language} onChange={handleSetLanguage} className='dropdown'>
                            {LANG_OPTIONS.map((item, i) => {
                                return (
                                    <option value={item.value} id={i}>{item.title}</option>
                                )
                            })}
                        </select>
                    </label>
                </div>

                <div className='dropdown'>
                    <button className='button' onClick={updateSelectedCode}>Quote Code</button>
                </div>
            </div>
            
            <div className='code-editor-container'>
                <Editor
                    {...editor_options}
                    theme='vs-dark'
                    defaultLanguage='python'
                    defaultValue={pythonCode}
                    value={value}
                    onChange={handleEditorChange}
                    onMount= {handleMountEditor}
                />
            </div>
            <CodeOutput editorRef={editorRef}/>
        </div>
        
    );
};

export default CodeEditor;