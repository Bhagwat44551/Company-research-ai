import { useState } from 'react';


function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('anthropic/claude-sonnet-4');

  const models = [
  { label: 'Claude Sonnet 4', value: 'anthropic/claude-sonnet-4' },
  { label: 'GPT-4o', value: 'openai/gpt-4o' },
  { label: 'Gemini Pro 1.5', value: 'google/gemini-pro-1.5' },
  ];

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('https://company-research-ai-swoc.onrender.com/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          model
        })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
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
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Know any company in minutes.</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        Enter a company name or website URL to get AI-powered insights.
      </p>

      <select value={model} onChange={(e) => setModel(e.target.value)} style={{ marginBottom: 10, padding: 8 }}>
        {models.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter company name or URL (e.g. Stripe or https://stripe.com)"
          style={{ flex: 1, padding: 10, fontSize: 16 }}
        />
        <button onClick={handleSearch} style={{ padding: '10px 20px', fontSize: 16 }}>
          {loading ? 'Researching...' : 'Research'}
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 30, padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3>Website: {result.website}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}>
            {result.aiResult}
          </pre>
          <button onClick={handleDownloadPDF} style={{ marginTop: 10, padding: '8px 16px' }}>
            Download PDF Report
          </button>
        </div>
      )}
    </div>
  );
}

export default App;