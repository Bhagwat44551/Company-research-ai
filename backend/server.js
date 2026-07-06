require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const PDFDocument = require('pdfkit');


const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());

//Serper search function
async function searchCompany(query, serperKey) {
  const res = await axios.post('https://google.serper.dev/search',
    { q: query },
    {
      headers: {
        'X-API-KEY': serperKey || process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    }
  );
  return res.data;
}

//OpenRouter function
async function askAI(prompt, model, openrouterKey) {
  const useModel = model || "openrouter/free";
  const useKey = openrouterKey || process.env.OPENROUTER_API_KEY;
  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: useModel,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800
    }, {
      headers: {
        Authorization: `Bearer ${useKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 25000
    });
    return res.data.choices[0].message.content;
  } catch (e) {
    console.log('OPENROUTER RAW ERROR:', JSON.stringify(e.response?.data));
    throw e;
  }
}

app.get('/', (req, res) => {
  res.json({
    status: 'Backend is running',
    message: 'This is the API server. Visit the frontend app to use the Company Research Assistant.'
  });
});

app.get('/test-search', async (req, res) => {
  try {
    const data = await searchCompany('Google official website');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/test-ai', async (req, res) => {
  try {
    const result = await askAI("Say hello and confirm you're working, in one line.");
    res.json({ result });
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Data:", err.response?.data);

    res.status(500).json(err.response?.data || {
      error: err.message
    });
  }
});

//Discord func
async function sendToDiscord(botToken, channelId, message) {
  const res = await axios.post(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    { content: message },
    {
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    }
  );
  return res.data;
}

//Serach Route
app.post('/research', async (req, res) => {
  const { input, model, serperKey, openrouterKey } = req.body;
  let website = input;
  let pageText = '';

  try {
    const searchData = await searchCompany(input, serperKey);
    const topResult = searchData.organic?.[0] || {};
    website = topResult.link || input;
    pageText = topResult.snippet || '';
  } catch (e) {
    console.log('SEARCH ERROR:', e.code || e.message);
    return res.status(500).json({ error: 'Search failed, please try again' });
  }

  try {
    const page = await axios.get(website, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    pageText = page.data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 3000);
  } catch (e) {
    console.log('CRAWL ERROR:', e.code || e.message);
  }

  try {
    const prompt = `Based on this information about "${input}":
${pageText}

Return a structured research report with these sections:
1. Company Name
2. Website
3. Phone Number (if found, else "Not available")
4. Address (if found, else "Not available")
5. Products/Services (bullet list)
6. AI-generated Pain Points (bullet list, 3-4 points)
7. Suggested Competitors (3-4 companies with their websites)

Format clearly with headers.`;

    const aiResult = await askAI(prompt, model, openrouterKey);
    res.json({ input, website, aiResult });
  } catch (e) {
    console.log('AI ERROR:', e.code || e.message);
    res.status(500).json({ error: 'AI service failed, please try again' });
  }
});

//Discord send route
app.post('/send-discord', async (req, res) => {
  try {
    const { botToken, channelId, applicantName, applicantEmail, input, website, aiResult } = req.body;

    const message = `**New Company Research Report**
Submitted by: ${applicantName} (${applicantEmail})

**Company:** ${input}
**Website:** ${website}

${aiResult.slice(0, 1800)}`; // Discord has a 2000 char limit per message

    await sendToDiscord(botToken, channelId, message);
    res.json({ success: true });
  } catch (err) {
    console.log('DISCORD ERROR:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to send to Discord' });
  }
});

//PDF Route
app.post('/generate-pdf', (req, res) => {
  try {
    const { input, website, aiResult } = req.body;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${input}-research-report.pdf"`);

    doc.pipe(res);

    doc.fontSize(22).text('Company Research Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Company: ${input}`);
    doc.text(`Website: ${website}`);
    doc.moveDown();
    doc.fontSize(12).text(aiResult, { align: 'left' });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
