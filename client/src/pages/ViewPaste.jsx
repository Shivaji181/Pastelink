import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ViewPaste() {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await axios.get(`${apiUrl}/api/pastes/${id}`);
        setPaste(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Paste not found or unavailable.');
        } else {
          setError('Failed to load paste.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaste();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <p>Loading paste...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--error)' }}>404</h1>
        <p className="error-msg">{error}</p>
        <Link to="/" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>
          Create New Paste
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>View Paste</h1>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>+ New</Link>
        </div>
      
      <div className="meta-info">
        <span>
          {paste.remaining_views !== null 
            ? `Views remaining: ${paste.remaining_views}` 
            : 'Views: Unlimited'}
        </span>
        <span>
            {paste.expires_at 
                ? `Expires: ${new Date(paste.expires_at).toLocaleString()}` 
                : 'No Expiry'}
        </span>
      </div>

      <div className="paste-content">
        {paste.content}
      </div>
    </div>
  );
}

export default ViewPaste;
