import React, { useEffect, useState } from 'react';
import Chatbot from './components/Chatbot';
import CodeEditor from './components/CodeEditor';
import './styles/Global.css';
import { ThreadProvider } from './components/ThreadContext.jsx';

import { CURR_CHAT } from './constants/STATIC_DATA.jsx';

function App() {
  const [response, setResponse] = useState(CURR_CHAT);
  return (
    <ThreadProvider>
      <div className='container'>
        <Chatbot response={response}/>
        <CodeEditor setResponse={setResponse}/>
      </div>
    </ThreadProvider>
  );
}

export default App;
