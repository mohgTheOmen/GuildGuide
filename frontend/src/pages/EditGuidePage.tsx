import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './EditGuidePage.css';

const EditGuidePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { username } = useAuth();

  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
        const response = await fetch(`http://localhost:8080/api/guides/${id}`, { headers });
        if (!response.ok) throw new Error('Guide not found');
        const data = await response.json();

        const currentUsername = username || localStorage.getItem('username');
        if (data.authorUsername !== currentUsername) {
          toast.error('You can only edit guides you created.');
          navigate(data.isDraft ? '/dashboard' : `/guide/${id}`, { replace: true });
          return;
        }

        setTitle(data.title);
        setGame(data.game);
        setDifficulty(data.difficulty || 'beginner');
        setTags(data.tags ? data.tags.join(', ') : '');
        setContent(data.content);
        setImageUrl(data.imageUrl || '');
      } catch {
        toast.error('Could not load guide data.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id, navigate, username]);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Start writing...',
    theme: 'dark',
    height: 450,
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'paragraph', '|',
      'image', 'video', 'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize'
    ],
    showXPathInStatusbar: false
  }), []);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this guide? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/guides/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      toast.success('Guide deleted successfully');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete guide.');
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!title || !game || (!isDraft && (!content || content === '<p><br></p>'))) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const loadingToast = toast.loading('Saving changes...');
    try {
      const token = localStorage.getItem('token');
      const trimmedImageUrl = imageUrl.trim();
      const response = await fetch(`http://localhost:8080/api/guides/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, game, difficulty, tags, content, imageUrl: trimmedImageUrl || undefined, isDraft })
      });
      if (!response.ok) throw new Error();
      toast.dismiss(loadingToast);
      toast.success(isDraft ? 'Draft saved successfully!' : 'Changes saved successfully!');
      if (!isDraft) navigate(`/guide/${id}`);
      else navigate('/dashboard');
    } catch {
      toast.dismiss(loadingToast);
      toast.error('Failed to save changes.');
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading guide...</div>;

  return (
    <div className="edit-guide-page">
      <div className="edit-container glass-panel">
        <h1 className="section-title">Edit Guide</h1>
        <p className="section-subtitle">Editing: {title}</p>

        <form className="edit-guide-form" onSubmit={(e) => { e.preventDefault(); handleSave(false); }}>
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="title">Guide Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="game">Select Game</label>
              <select id="game" value={game} onChange={(e) => setGame(e.target.value)}>
                <option value="">Choose a game...</option>
                <option value="elden-ring">Elden Ring</option>
                <option value="wow">World of Warcraft</option>
                <option value="destiny-2">Destiny 2</option>
                <option value="Valorant">Valorant</option>
                <option value="Cyberpunk 2077">Cyberpunk 2077</option>
                <option value="Hearts of Iron IV">Hearts of Iron IV</option>
                <option value="Minecraft">Minecraft</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="difficulty">Difficulty</label>
              <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group flex-2">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Cover Picture URL</label>
            <input 
              type="url" 
              id="imageUrl" 
              placeholder="https://example.com/image.jpg" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="content">Guide Content</label>
            <JoditEditor value={content} config={config} onBlur={newContent => setContent(newContent)} />
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn btn-outline btn-danger" onClick={handleDelete}>Delete Guide</button>
            <div className="right-actions">
              <button type="button" className="btn btn-outline" onClick={() => handleSave(true)}>Save Draft</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGuidePage;
