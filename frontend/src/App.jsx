import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api') // This will be proxied to http://localhost:5000/api
      .then((res) => res.json())
      .then((data) => setData(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>{data ? data : 'Loading...'}</h1>
    </div>
  );
}

export default App;
