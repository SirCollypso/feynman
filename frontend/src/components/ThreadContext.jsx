import React, { createContext, useState } from 'react';
import axios from 'axios';
import { backend_url } from '../constants/Common.jsx';

export const ThreadContext = createContext();

export const ThreadProvider = ({ children }) => {
    console.log("ThreadProvider touched!");
    const [thread_id, setThreadId] = useState(null);
    const [displayedCode, setDisplayCode] = useState(null);

    const createThread = async () => {
        if (!thread_id) { 
            try {
                const response = await axios.post(`${backend_url}/thread/create`);
                setThreadId(response.data.thread_id);
                console.log('Thread created in ThreadContext: ', response.data.thread_id);
                return response.data.thread_id;
            } catch (error) {
                console.error('Failed to create thread: ', error);
                // throw error;
            }
        }
        return thread_id;
    };

    const deleteThread = async () => {
        if (!thread_id) {
            console.warn('No thread to delete');
            return;
        }

        try {
            const response = await axios.post(`${backend_url}/thread/delete`, { thread_id });
            console.log('Thread deleted in ThreadContext: ', response.data);
            setThreadId(null);
        } catch (error) {
            console.error('Failed to delete thread: ', error);
            throw error;
        }
    }

    const handleCodeChange = (code) => {
        setDisplayCode(code);
        console.log('Code changed in ThreadContext: ', code);
    };

    return (
        <ThreadContext.Provider value={{ thread_id, createThread, deleteThread, handleCodeChange, displayedCode }}>
            {children}
        </ThreadContext.Provider>
    );
};

