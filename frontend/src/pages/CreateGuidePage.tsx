import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';
import './CreateGuidePage.css';

const CreateGuidePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  
  const navigate = useNavigate();

  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Write your guide content here...',
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

  const handleSaveDraft = () => {
    if (!title) {
      toast.error('Please enter a title before saving a draft.');
      return;
    }
    toast.success('Draft saved successfully!');
    navigate('/dashboard');
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !game || !content || content === '<p><br></p>') {
      toast.error('Please fill in all required fields (Title, Game, and Content).');
      return;
    }
    
    if (title.length < 5) {
      toast.error('Title must be at least 5 characters long.');
      return;
    }

    const loadingToast = toast.loading('Publishing guide...');
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('Guide published successfully!');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="create-guide-page">
      <div className="create-container glass-panel">
        <h1 className="section-title">Create New Guide</h1>
        <p className="section-subtitle">Share your knowledge with the community</p>
        
        <form className="create-guide-form" onSubmit={handlePublish}>
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="title">Guide Title</label>
              <input 
                type="text" 
                id="title" 
                placeholder="E.g., Ultimate Beginner's Guide" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="game">Select Game</label>
              <select id="game" value={game} onChange={(e) => setGame(e.target.value)}>
                <option value="">Choose a game...</option>
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
                placeholder="E.g., pvp, farming, build" 
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
            <button type="button" className="btn btn-outline" onClick={handleSaveDraft}>Save Draft</button>
            <button type="submit" className="btn btn-primary">Publish Guide</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGuidePage;
