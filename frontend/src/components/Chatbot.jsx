import React, { useEffect, useState, useRef } from 'react';
import '../styles/Chatbot.css';
import '../styles/Global.css';
import { CHAT_HISTORY } from '../constants/STATIC_DATA.jsx';
import { TOPIC_OPTIONS } from '../constants/Common.jsx';

const Chatbot = ({ response }) => {
    const [topic, setTopic] = useState('None');
    const [userInput, setUserInput] = useState('');
    const [file, setFile] = useState(null);
    const [chatHistory, setChatHistory] = useState(CHAT_HISTORY);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        if (response && response.code) {
            console.log("Response: ", response.code);
            // const newMessage = { role: response.role, message: response.message };
            // setUserInput(`\`\`\`${response.code}\`\`\``);
            setUserInput(`Selected code: ${response.code.text}\n Selected lines: ${response.code.line}`);
        }
    }, [response]);

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload on form submission

        if (userInput.trim()) { // Check if user input is not empty
            // Append the new message to chatHistory
            const newMessage = { role: 'user', message: userInput };
            setChatHistory([...chatHistory, newMessage]);

            // Clear input after submit
            setUserInput('');
        }
    };

    const handleSetTopic = (e) => {
        e.preventDefault();
        console.log("Chosen topic: ", e.target.value);
        setTopic(e.target.value);
    }

    const handleFileInput = (e) => {
        const files = e.currentTarget.files
        if(files)
        setFile(files[0])
        // show success message on file upload
        setIsFileUploaded(true)
      } 

    const handleFileSubmit = async (e) => {
        e.preventDefault()
    
        const formData = new FormData()
        if (file) {
          formData.append('file', file)
        }
    
        try {
          const response = await axios.post(`your_api_endpoint`, formData, { headers: { "Content-Type": "multipart/form-data" } })
          console.log(response);
    
        } catch (error) {
          console.error(error);
        }
      }

    return (
        <div id='feature-container' className='box'>
            {/* Select Topic and Upload File */}
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
            </div>

            {/* Chat Area */}
            <div className='chatbot-chat-container box' ref={chatContainerRef}>
                {chatHistory.length > 0 ? (
                    chatHistory.map((msg, i) => {
                        if (msg.role === "agent") { // Use triple equals for comparison
                            return (
                                <div key={i} className='chatbubble agent'> {/* Added key */}
                                    <p>{msg.message}</p> {/* Replaced <text> with <p> */}
                                </div>
                            );
                        } else if (msg.role === "user") {
                            return (
                                <div key={i} className='chatbubble user'> {/* Added key */}
                                    <p>{msg.message}</p> {/* Replaced <text> with <p> */}
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
            <form className="chatbot-input box" onSubmit={handleSubmit}>
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
    );
};

export default Chatbot;