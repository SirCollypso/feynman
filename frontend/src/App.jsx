import React, { useEffect, useState } from 'react';
import Chatbot from './components/Chatbot';
import CodeEditor from './components/CodeEditor';
import './styles/global.css';

import { CURR_CHAT } from './constants/static_data.jsx';

function App() {
  const [response, setResponse] = useState(CURR_CHAT);
  return (
    <div className='container'>
      <Chatbot response={response}/>
      <CodeEditor setResponse={setResponse}/>
    </div>
  );
}

export default App;
