import React, { useEffect, useState } from 'react';
import Chatbot from './components/Chatbot';
import CodeEditor from './components/CodeEditor';
import './styles/Global.css';

function App() {
  // const [data, setData] = useState(null);

  // useEffect(() => {
  //   fetch('/api') // This will be proxied to http://localhost:5000/api
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message))
  //     .catch((err) => console.error(err));
  // }, []);

  return (
    <div className='container'>
      <Chatbot />
      <CodeEditor />
    </div>
  );
}

export default App;
