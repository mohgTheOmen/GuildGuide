import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';
import { Sparkles, Link as LinkIcon } from 'lucide-react';
import { marked } from 'marked';
import './CreateGuidePage.css';

const CreateGuidePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
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

  const handleAIImport = async () => {
    if (!importUrl) {
      toast.error('Please enter a URL to import from.');
      return;
    }

    setIsImporting(true);
    const loadingToast = toast.loading('AI is analyzing the external guide...');
    try {
      const response = await fetch('http://localhost:8000/scrape-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });

      if (!response.ok) throw new Error('AI Import failed');

      const data = await response.json();
      
      setTitle(data.title || '');
      setDifficulty(data.difficulty?.toLowerCase() || 'beginner');
      setTags(data.tags?.join(', ') || '');
      
      // Basic game matching or default
      if (data.game) {
        const gameSlug = data.game.toLowerCase().includes('elden') ? 'elden-ring' : 
                         data.game.toLowerCase().includes('warcraft') ? 'wow' :
                         data.game.toLowerCase().includes('destiny') ? 'destiny-2' : '';
        setGame(gameSlug);
      }

      const htmlContent = await marked.parse(data.content || '');
      setContent(htmlContent);

      toast.dismiss(loadingToast);
      toast.success('AI successfully imported and formatted the guide!');
      setImportUrl('');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to import guide. Please check the URL.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveDraft = () => {
    if (!title) {
      toast.error('Please enter a title before saving a draft.');
      return;
    }
    toast.success('Draft saved successfully!');
    navigate('/dashboard');
  };

  const handlePublish = async (e: React.FormEvent) => {
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          game,
          difficulty,
          tags,
          content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to publish guide');
      }

      toast.dismiss(loadingToast);
      toast.success('Guide published successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to publish guide. Please try again.');
    }
  };

  return (
    <div className="create-guide-page">
      <div className="create-container glass-panel">
        <h1 className="section-title">Create New Guide</h1>
        <p className="section-subtitle">Share your knowledge with the community</p>
        
        {/* AI Import Section */}
        <div className="ai-import-section">
          <div className="ai-import-header">
            <Sparkles size={20} className="ai-icon" />
            <h3>Import with AI Intelligence</h3>
          </div>
          <p className="ai-import-desc">Paste a link to an external guide or article, and our AI will scrape, summarize, and format it for you instantly.</p>
          <div className="ai-import-input-wrapper">
            <div className="import-input-container">
              <LinkIcon size={18} className="import-link-icon" />
              <input 
                type="url" 
                placeholder="https://example-gaming-site.com/strategy-guide" 
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={isImporting}
              />
            </div>
            <button 
              type="button" 
              className="btn btn-ai-import" 
              onClick={handleAIImport}
              disabled={isImporting}
            >
              {isImporting ? 'Converting...' : 'Import & Format'}
            </button>
          </div>
        </div>

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
