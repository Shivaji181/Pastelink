import { useState } from 'react';
import axios from 'axios';

function CreatePaste() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdUrl, setCreatedUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedUrl(null);

    try {
      const payload = { content };
      if (ttl) payload.ttl_seconds = parseInt(ttl);
      if (maxViews) payload.max_views = parseInt(maxViews);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await axios.post(`${apiUrl}/api/pastes`, payload);
      setCreatedUrl(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Pastebin Lite</h1>
      
      {!createdUrl ? (
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>New Paste Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your text here..."
              required
            />
          </div>

          <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>TTL (Seconds) - Optional</label>
              <input
                type="number"
                min="1"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                placeholder="e.g. 60"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Max Views - Optional</label>
              <input
                type="number"
                min="1"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Creating...' : 'Create Paste'}
          </button>
        </form>
      ) : (
        <div className="success-box">
          <h2>Paste Created!</h2>
          <p>Share this link:</p>
          <a href={createdUrl} className="success-link" target="_blank" rel="noopener noreferrer">
            {createdUrl}
          </a>
          <button 
            onClick={() => { setCreatedUrl(null); setContent(''); }} 
            style={{ marginTop: '1.5rem', background: '#334155' }}
          >
            Create Another
          </button>
        </div>
      )}
    </div>
  );
}

export default CreatePaste;
