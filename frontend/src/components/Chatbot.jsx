import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';

import { IoIosCloseCircle } from "react-icons/io";

import '../styles/Chatbot.css';
import '../styles/Global.css';

import { CHAT_HISTORY } from '../constants/STATIC_DATA.jsx';
import { backend_url, TOPIC_OPTIONS } from "../constants/Common.jsx";
import { ThreadContext } from '../components/ThreadContext.jsx';
import { Loading } from '../components/Loading.jsx';

const Chatbot = ({ response }) => {
    const [topic, setTopic] = useState('binarysort');
    const [userInput, setUserInput] = useState('');
    const [quotedCode, setQuotedCode] = useState({"text": "", "line": ""});
    const [file, setFile] = useState(null);
    const [chatHistory, setChatHistory] = useState(CHAT_HISTORY);
    
    const [sessionStatus, setSessionStatus] = useState(false);
    const [sessionEnded, setSessionEnded] = useState(false);

    const chatContainerRef = useRef(null);
    const { thread_id, createThread, deleteThread } = useContext(ThreadContext);
    

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        if (response && response.code) {
            // console.log("Response: ", response.code);
            const quotedCode = {
                "text": response.code.text,
                "line": response.code.line,
            };
            setQuotedCode(quotedCode);
        }
    }, [response]);

    const resetAll = () => {
        setUserInput('');
        setQuotedCode({"text": "", "line": ""});
        setChatHistory([]);
        setSessionStatus(true);
        setSessionEnded(false);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (userInput.trim()) {
            const newMessage = { role: 'user', message: userInput, code: quotedCode.text ? quotedCode : null };
            setChatHistory((prevHistory) => [...prevHistory, newMessage]);
            setUserInput('');
            setQuotedCode({"text": "", "line": ""});

            sendMessage(newMessage);
        }
    };

    const sendMessage = async (msg) => {
        try {
            const loadingMessage = {
                role: 'loading-agent',
                message: null, // Set message as null to trigger <Loading /> component
                code: {
                    text: "",
                    lines: "",
                }
            };
            setChatHistory((prevHistory) => [...prevHistory, loadingMessage]);

            const response = await axios.post(`${backend_url}/chat`, {
                thread_id: thread_id,
                prompt: msg.message,
                highlighted: msg.code,
            });

            const agentMsg = {
                'role': 'agent',
                'message': response.data.response,
                'code': {
                    'text': "",
                    'lines': "",
                }
            };
            
            setChatHistory((prevHistory) => {
                const updatedHistory = [...prevHistory];
                updatedHistory[updatedHistory.length - 1] = agentMsg; // Replace the last item
                return updatedHistory;
            });
        } catch (error) {
            console.error('Failed to get response from the server:', error);
        }
    }
    
    const handleSetTopic = (e) => {
        e.preventDefault();
        // console.log("Chosen topic: ", e.target.value);
        setTopic(e.target.value);
    }

    const handleRemoveQuoteCode = (e) => {
        e.preventDefault();
        setQuotedCode({"text": "", "line": ""});
    }

    const handleStartSession = async (e) => {
        e.preventDefault();
        console.log("Starting session with topic: ", topic);
        const thread_id = await createThread();
        if (thread_id) {
            resetAll();
            console.log("Thread ID: ", thread_id);
        } else {
            console.error("Failed to create thread!");
        }
    }

    const handleEndSession = async (e) => {
        e.preventDefault();
        console.log("Ending session...");
        await deleteThread().then(() => {
            setSessionStatus(false);
            setSessionEnded(true);
            console.log("Thread deleted!");
        }).catch((error) => {
            console.error("Failed to delete thread: ", error);
        })
    }

    // const handleFileInput = (e) => {
    //     const files = e.currentTarget.files
    //     if(files)
    //     setFile(files[0])
    //     // show success message on file upload
    //     setIsFileUploaded(true)
    //   } 

    // const handleFileSubmit = async (e) => {
    //     e.preventDefault()
    
    //     const formData = new FormData()
    //     if (file) {
    //       formData.append('file', file)
    //     }
    
    //     try {
    //       const response = await axios.post(`your_api_endpoint`, formData, { headers: { "Content-Type": "multipart/form-data" } })
    //       console.log(response);
    
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   }

    return (
        <div id='feature-container' className='box'>
            {/* Select Topic and Start Session */}
            <div className='chatbot-header box'>
                <div className='dropdown'>
                    <label>
                        <b>Topic</b>
                        <select value={topic} onChange={handleSetTopic} className='dropdown'>
                            {TOPIC_OPTIONS.map((item, i) => {
                                return (
                                    <option value={item.value} id={i}>{item.title}</option>
                                )
                            })}
                        </select>
                    </label>
                </div>
        
                {/* <div className='topic-dropdown'>
                    <label htmlFor="file-upload"><b>Lecture Note</b></label>
                    <input 
                        id="file-upload"
                        type="file"
                        className="dropdown"
                        accept='.pdf, .docx, .doc, .odt, .png' 
                        required 
                        onChange={handleFileInput}
                        name="Select a File"
                    />
                </div> */}

                <div className='topic-dropdown'>    
                    { sessionStatus ? (
                            <button className='button' onClick={handleEndSession}>End Session</button>
                        ) : (
                            <button className='button' onClick={handleStartSession}>Start Session</button>
                        )
                    }
                </div>
            </div>

            {/* Chat Area */}
            <div className='chatbot-chat-container box' ref={chatContainerRef}>
                {chatHistory.length > 0 ? (
                    chatHistory.map((msg, i) => {
                        if (msg.role === "agent") {
                            return (
                                <div key={i} className='chatbubble agent'>
                                    <p>{msg.message}</p>
                                </div>
                            );
                        } else if (msg.role === "user") {
                            return (
                                <div key={i} className='chatbubble user'>
                                    { msg.code && msg.code.text ? (
                                        (
                                            <div className='dark-box chatbot-input-code'>
                                                <p className='code text-dark'style={{color: '#45a049', marginBottom: '8px'}}>Selected lines: {msg.code.line}</p>
                                                <div className='horizontal-line' />
                                                <p className='code text-dark' dangerouslySetInnerHTML={{ __html: msg.code.text.replace(/\n/g, '<br>') }}></p>
                                            </div>
                                        )
                                    ) : (null)}
                                    <p>{msg.message}</p>
                                </div>
                            );
                        } else if (msg.role === "loading-agent") {
                            return (
                                <div key={i} className='chatbubble agent'>
                                    <Loading />
                                </div>
                            );
                        }
                        return null; // Add a return statement for cases where msg.role is neither "agent" nor "user"
                    })
                ) : (
                    <p className='placeholder'><em>Select a topic and upload your lecture notes!</em></p>
                )}
            </div>

            {/* User Input Area */}
            { sessionStatus ? (
                <div className='chatbot-input box'>
                    { quotedCode.text ? (
                        <div className='dark-box chatbot-input-code'>
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                                <p className='code text-dark' style={{color: '#45a049'}}>Selected lines: {quotedCode.line}</p>
                                <IoIosCloseCircle className='close-button' onClick={handleRemoveQuoteCode}/>
                            </div>
                            <div className='horizontal-line' />
                            <p className='code text-dark' dangerouslySetInnerHTML={{ __html: quotedCode.text.replace(/\n/g, '<br>') }}></p>
                        </div>
                    ) : (
                        null
                    )}
                    <form className="chatbot-input-text" onSubmit={handleSubmit}>
                        <input
                            className="chatbot-input-form"
                            type="text"
                            name="user"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button type="submit" className={`chatbot-send-button ${userInput ? 'button-active' : ''}`}>Send</button>
                    </form>
                </div>
            ) : (
                <div className='chatbot-input box'>
                    { sessionEnded ? (
                        <>
                            <p className='error session-ended'><b>Session ended.</b></p>    
                            <p className='session-ended'>Click "Start Session" to restart a new session.</p>
                        </>
                    ) : (
                        <p className='session-ended'>Click "Start Session" to start learning!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chatbot;