import React, { useState } from 'react';
import axios from 'axios';

export default function TestConnection() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const testBackend = async () => {
    try {
      const res = await axios.get('/health');  // uses proxy
      setStatus(res.data.status);
      setError('');
    } catch (err) {
      setStatus('');
      setError('Failed to connect to backend');
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Test Backend Connection</h3>
      <button onClick={testBackend}>Ping Backend</button>
      {status && <p style={{ color: 'green' }}> {status}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
