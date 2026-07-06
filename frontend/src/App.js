import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('openrouter/free');

  //Discored state
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [discordSent, setDiscordSent] = useState(false);

  const models = [
    { label: 'Free Model (Auto)', value: 'openrouter/free' },
    { label: 'Claude Sonnet 4', value: 'anthropic/claude-sonnet-4' },
    { label: 'GPT-4o', value: 'openai/gpt-4o' },
    { label: 'Gemini 3.5 Flash', value: 'google/gemini-3.5-flash' },
  ];


  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setDiscordSent(false);

    try {
      const res = await fetch('https://company-research-ai-swoc.onrender.com/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, model })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        // Auto-send to Discord if configured
        if (botToken && channelId) {
          try {
            await fetch('https://company-research-ai-swoc.onrender.com/send-discord', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                botToken, channelId, applicantName, applicantEmail,
                input: data.input, website: data.website, aiResult: data.aiResult
              })
            });
            setDiscordSent(true);
          } catch (e) {
            console.log('Discord send failed:', e);
          }
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
        <h3>AI Model</h3>
        <select className="model-select" value={model} onChange={(e) => setModel(e.target.value)}>
          {models.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        {/* Discord config section in the sidebar */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
            Discord Integration
          </h3>
          <input
            className="search-input"
            placeholder="Discord Bot Token"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            style={{ marginBottom: 8, width: '100%' }}
          />
          <input
            className="search-input"
            placeholder="Discord Channel ID"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            style={{ marginBottom: 8, width: '100%' }}
          />
          <input
            className="search-input"
            placeholder="Applicant Full Name"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            style={{ marginBottom: 8, width: '100%' }}
          />
          <input
            className="search-input"
            placeholder="Applicant Email"
            value={applicantEmail}
            onChange={(e) => setApplicantEmail(e.target.value)}
            style={{ marginBottom: 8, width: '100%' }}
          />
        </div>
      </aside>

      <main className="main-content">
        <h1 className="hero-title">Know any company in minutes.</h1>
        <p className="hero-subtitle">Enter a company name or website URL to get AI-powered insights.</p>

        <div className="search-bar">
          <input
            className="search-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Stripe or https://stripe.com"
          />
          <button className="research-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Researching...' : 'Research'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {result && (
          <div className="result-card">
            <h3>{result.website}</h3>
            <ReactMarkdown>{result.aiResult}</ReactMarkdown>
            <button className="download-btn" onClick={handleDownloadPDF}>
              Download PDF Report
            </button>
            {discordSent && <p style={{ color: '#4ade80', marginTop: 8 }}>✓ Sent to Discord</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;