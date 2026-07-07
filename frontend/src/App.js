import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('api');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('openrouter/free');
  const [serperKey, setSerperKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');

  const models = [
    { label: 'Free Model (Auto)', value: 'openrouter/free' },
    { label: 'Dolphin Mistral 24B (Free)', value: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free' },
    { label: 'Tencent Hunyuan 3 (Free)', value: 'tencent/hy3:free' },
    { label: 'Poolside Laguna XS 2.1 (Free)', value: 'poolside/laguna-xs-2.1:free' },
  ];

  const examples = ['stripe.com', 'Tesla', 'Microsoft', 'OpenAI'];

  const runSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('https://company-research-ai-swoc.onrender.com/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: query, model, serperKey, openrouterKey })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        if (botToken && channelId) {
          fetch('https://company-research-ai-swoc.onrender.com/send-discord', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              botToken, channelId, applicantName, applicantEmail,
              input: data.input, website: data.website, aiResult: data.aiResult
            })
          }).catch(() => { });
        }
      }
    } catch (err) {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    const res = await fetch('https://company-research-ai-swoc.onrender.com/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.input}-research-report.pdf`;
    a.click();
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">Company Research AI</div>
        <div className="tab-row">
          <button className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>API</button>
          <button className={`tab-btn ${activeTab === 'discord' ? 'active' : ''}`} onClick={() => setActiveTab('discord')}>DISCORD</button>
        </div>

        <div className="sidebar-content">
          {activeTab === 'api' && (
            <>
              <label className="field-label">OpenRouter API Key</label>
              <input
                className="sidebar-input"
                type="password"
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="sk-or-... (optional)"
              />

              <label className="field-label">Serper.dev API Key</label>
              <input
                className="sidebar-input"
                type="password"
                value={serperKey}
                onChange={(e) => setSerperKey(e.target.value)}
                placeholder="Your Serper key (optional)"
              />

              <label className="field-label">AI Model</label>
              <select className="sidebar-input" value={model} onChange={(e) => setModel(e.target.value)}>
                {models.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <button className="save-btn">Save Configuration</button>
            </>
          )}

          {activeTab === 'discord' && (
            <>
              <label className="field-label">Bot Token</label>
              <input className="sidebar-input" value={botToken} onChange={(e) => setBotToken(e.target.value)} placeholder="Your Discord bot token" />

              <label className="field-label">Channel ID</label>
              <input className="sidebar-input" value={channelId} onChange={(e) => setChannelId(e.target.value)} placeholder="000000000000000000" />

              <label className="field-label">Full Name</label>
              <input className="sidebar-input" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} placeholder="Your full name" />

              <label className="field-label">Email Address</label>
              <input className="sidebar-input" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} placeholder="email@example.com" />

              <button className="save-btn">Save Discord Config</button>
            </>
          )}
        </div>
      </aside>

      <main className="main-content">
        {!result && !loading && (
          <>
            <div className="hero-tag">AI-Powered Intelligence</div>
            <h1 className="hero-title">Know any company in minutes.</h1>
            <p className="hero-subtitle">
              Enter a company name or website URL to get AI-powered insights, competitor analysis, pain points, and a professional PDF report.
            </p>
            <div className="example-chips">
              {examples.map((ex) => (
                <div key={ex} className="chip" onClick={() => { setInput(ex); runSearch(ex); }}>{ex}</div>
              ))}
            </div>
          </>
        )}

        {loading && <p>Researching...</p>}
        {error && <p className="error-text">{error}</p>}

        {result && (
          <div className="result-card">
            <h3>{result.website}</h3>
            <ReactMarkdown>{result.aiResult}</ReactMarkdown>
            <button className="download-btn" onClick={handleDownloadPDF}>Download PDF Report</button>
          </div>
        )}

        <div className="bottom-bar">
          <input
            className="search-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch(input)}
            placeholder="Enter a company name (e.g. Stripe) or website URL (e.g. https://stripe.com)"
          />
          <button className="research-btn" onClick={() => runSearch(input)} disabled={loading}>
            {loading ? '...' : 'Research →'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;