import { useEffect, useState } from 'react';

const App = () => {
  const [backendStatus, setBackendStatus] = useState<string>('Checking backend...');

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Backend is not reachable.'));
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>CombERP MVP Scaffold</h1>
      <p><strong>Frontend:</strong> React + Vite is running!</p>
      <p><strong>Backend:</strong> {backendStatus}</p>
      <p><strong>Desktop:</strong> {window.navigator.userAgent.includes('Electron') ? 'Running in Electron' : 'Running in Browser'}</p>
    </div>
  );
};

export default App;
