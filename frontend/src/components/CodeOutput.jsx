import axios from "axios";
import { useState } from "react";

import "../styles/Global.css";
import "../styles/CodeEditor.css";


const CodeOutput = ({editorRef}) => {
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API = axios.create({
        baseURL: "https://emkc.org/api/v2/piston"
    });

    const executeCode = async (sourceCode) => {
        const response = await API.post("/execute", {
            language: "python",
            version: "3.10.0",
            files: [
                {
                "content": sourceCode
                }
            ],
        });
    
        return response.data;
    }

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue();
        if (sourceCode) {
            try {
                setLoading(true);
                setError(null);
                const {run:result} = await executeCode(sourceCode);
                setOutput(result.output);
            } catch (error) {
                console.log("Error: ", error);
                setError(error);
                setOutput(null);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div className="dark-box code-editor-output-container">
            <div>
                <button onClick={runCode} className="run-button">Run</button>
            </div>
            <div className="box">
                {
                    loading ? (
                        <p className="placeholder"><em>Running code...</em></p>
                    ) : error ? (
                        <p className="error">{error.message}</p>
                    ) : output ? (
                        // <p>{output}</p>
                        <p dangerouslySetInnerHTML={{ __html: output.replace(/\n/g, '<br>') }}></p>
                    ) : (
                        <p className="placeholder"><em>Click "Run Code" to show the output!</em></p>
                    )
                }
            </div>
        </div>
    )
}

export default CodeOutput;