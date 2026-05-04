import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';
import './EditGuidePage.css';

const EditGuidePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, you would fetch the guide data based on the id
  const [title, setTitle] = useState("Ultimate Beginner's Guide");
  const [game, setGame] = useState('elden-ring');
  const [difficulty, setDifficulty] = useState('beginner');
  const [tags, setTags] = useState('pvp, farming');
  const [content, setContent] = useState('<h1>Welcome to the guide</h1><p>This is some default content.</p>');

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

  const handleDelete = () => {
    // Show a native confirm dialog for simplicity
    if (window.confirm('Are you sure you want to delete this guide? This action cannot be undone.')) {
      toast.success('Guide deleted successfully');
      navigate('/dashboard');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !game || !content || content === '<p><br></p>') {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    const loadingToast = toast.loading('Saving changes...');
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('Changes saved successfully!');
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="edit-guide-page">
      <div className="edit-container glass-panel">
        <h1 className="section-title">Edit Guide</h1>
        <p className="section-subtitle">Editing guide #{id}</p>
        
        <form className="edit-guide-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="title">Guide Title</label>
              <input 
                type="text" 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="game">Select Game</label>
              <select id="game" value={game} onChange={(e) => setGame(e.target.value)}>
                <option value="elden-ring">Elden Ring</option>
                <option value="wow">World of Warcraft</option>
                <option value="destiny-2">Destiny 2</option>
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
              <input 
                type="text" 
                id="tags" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="content">Guide Content</label>
            <JoditEditor
              value={content}
              config={config}
              onBlur={newContent => setContent(newContent)}
            />
          </div>
          
          <div className="form-actions-row">
            <button type="button" className="btn btn-outline btn-danger" onClick={handleDelete}>Delete Guide</button>
            <div className="right-actions">
              <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGuidePage;
