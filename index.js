const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
const { parse } = require('url');
const {Groq} = require('groq-sdk');



dotenv.config();

const app = express();
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });


const extractWikiContent = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Remove unwanted elements
    $('script, style, footer, header, nav, table').remove();

    // Get main content
    const content = $('#mw-content-text').first();
    if (!content.length) throw new Error('Could not find main content');

    // Get first few paragraphs
    const paragraphs = content.find('p').slice(0, 500);  // Limit to first 500 paragraphs
    let text = '';
    paragraphs.each((i, elem) => {
      text += $(elem).text();
    });

    // Clean up text
    text = text.replace(/\[\d+\]/g, '');  // Remove reference numbers
    text = text.replace(/\s+/g, ' ');  // Normalize whitespace
    return text.trim();
  } catch (err) {
    throw new Error(`Failed to fetch Wikipedia content: ${err.message}`);
  }
};

const generateSummaryWithGroq = async (content) => {
    console.log('api key :>> ', process.env.GROQ_API_KEY);
    
  try {
    const prompt = `
    You are a highly skilled content summarizer, capable of distilling complex information into clear, concise, and engaging summaries. Your goal is to create a summary that captures the essential information while maintaining readability and coherence.

    **Instructions:**
    - Create a well-structured summary that captures the main points and key details
    - Maintain a clear and engaging writing style that makes complex topics accessible
    - Include the most important facts, dates, and figures when relevant
    - Break down the summary into 2-3 concise paragraphs for better readability
    - Aim for a summary length of about 150-200 words
    - Ensure the summary flows naturally and remains engaging throughout
    - Avoid unnecessary technical jargon unless essential to understanding
    - End with a sentence that captures the broader significance or context

    **Content to summarize:**
    ${content.slice(0, 3000)}  // Limiting to 3000 chars to ensure we stay within token limits

    Write a clear, engaging summary that makes this information accessible while maintaining accuracy and key details.
    `;

    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }],
    //   temperature: 0.7,  // Balanced between creativity and accuracy
    //   max_tokens: 500    // Limiting summary length
    });

    return response.choices[0].message.content;
  } catch (err) {
    throw new Error(`Error generating summary: ${err.message}`);
  }
};

const isValidWikiUrl = (url) => {
  const parsed = parse(url);
  return parsed.hostname && parsed.hostname.endsWith('wikipedia.org') &&
         ['http:', 'https:'].includes(parsed.protocol);
};

app.get('/', (req, res) => {
  res.send('Welcome to the Wiki Summary Generator!');
});

app.get('/random', async (req, res) => {
  try {
    const randomUrl = 'https://en.wikipedia.org/wiki/Special:Random';
    const { request: { res: response } } = await axios.get(randomUrl);
    const actualUrl = response.responseUrl;

    const wikiContent = await extractWikiContent(actualUrl);
    if (!wikiContent) throw new Error('Failed to extract content from Wikipedia');

    const summary = await generateSummaryWithGroq(wikiContent);
    if (!summary) throw new Error('Failed to generate summary');

    res.json({
      url: actualUrl,
      content: wikiContent,
      summary: summary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/generate', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });

    if (!isValidWikiUrl(url)) return res.status(400).json({ error: 'Invalid Wikipedia URL' });

    const wikiContent = await extractWikiContent(url);
    const summary = await generateSummaryWithGroq(wikiContent);

    res.json({
      content: wikiContent,
      summary: summary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  if (!process.env.GROQ_API_KEY) {
    console.warn('Warning: GROQ_API_KEY environment variable not set!');
  }
  console.log(`Server is running on port ${PORT}`);
});
