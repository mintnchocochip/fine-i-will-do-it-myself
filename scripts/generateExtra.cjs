const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
let API_KEY = '';

if (fs.existsSync(envPath)) {
  API_KEY = fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .find(line => line.startsWith('VITE_GEMINI_API_KEY='))
    ?.split('=')[1]
    ?.trim();
}

if (!API_KEY) {
  console.error("No VITE_GEMINI_API_KEY found in .env (or file missing).");
  process.exit(1);
}

const map = {
  week1: 'Week 01 Lecture Material.pdf',
  week2: 'Week 02 Lecture Material.pdf',
  week3: 'Week 3_ Lecture Material.pdf',
  week4: 'Week 4_ Lecture Material.pdf',
  week5: 'Week 5_ Lecture Material.pdf',
  week6: 'Week 6_ Lecture Material.pdf',
  week7: 'week 7 Lecture Material.pdf',
  week8: 'week 8 Lecture Material.pdf',
  week9: 'week 9 Lecture Material.pdf',
  week10: 'week10 _46 to 50_Lecture Material.pdf',
  week11: 'week11 _ 51 to 55_Lecture Material.pdf',
  week12: 'week12_56 to 61_Lecture Material.pdf',
};

async function callGemini(b64, weekName) {
  const parts = [];
  parts.push({ inlineData: { mimeType: 'application/pdf', data: b64 } });
  parts.push({
    text: `Generate up to 50 multiple choice questions based on this lecture material for an Indian university course on "Education for Sustainable Development". 

Requirements:
- Each question must have 4 options labelled A, B, C, D
- Only 1 correct answer per question
- Vary difficulty
- Stop generating early if there are naturally less than 50 distinct isolated facts in the document. Quality over quantity.
- Do NOT repeat questions.

Respond ONLY with valid JSON structure:
{
  "questions": [
    {
      "text": "...",
      "options": [ {"letter": "A", "text": "..."}, {"letter": "B", "text": "..."}, {"letter": "C", "text": "..."}, {"letter": "D", "text": "..."} ],
      "answer": "A",
      "feedback": "..."
    }
  ]
}`
  });

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      }
    }),
  });
  
  if (!res.ok) {
     const t = await res.text();
     throw new Error(t);
  }
  
  const data = await res.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

async function run() {
  const finalOutput = {};
  
  // Rate limiting helper
  const delay = ms => new Promise(res => setTimeout(res, ms));

  for (const [weekId, filename] of Object.entries(map)) {
     console.log(`Processing ${weekId}...`);
     const fp = path.join(__dirname, '../public/Materials', filename);
     if (!fs.existsSync(fp)) {
        console.warn(`[!] File not found: ${fp}`);
        continue;
     }

     const b64 = fs.readFileSync(fp, 'base64');
     try {
       const raw = await callGemini(b64, weekId);
       const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
       const parsed = JSON.parse(cleaned);
       console.log(` -> Extracted ${parsed.questions.length} unique questions for ${weekId}`);
       
       finalOutput[weekId] = parsed.questions.map((q, i) => ({
          ...q,
          id: `${weekId}_extra_${Date.now()}_${i}`
       }));
     } catch (err) {
       console.error(` -> Failed on ${weekId}:`, err.message);
     }
     
     // 10 second delay between documents to respect free tier boundaries
     console.log(' -> Waiting 10 seconds to respect API rate limits...');
     await delay(10000);
  }
  
  const outPath = path.join(__dirname, '../src/data/extraQuestions.json');
  fs.writeFileSync(outPath, JSON.stringify(finalOutput, null, 2));
  console.log(`\n✅ Finished writing extra questions to ${outPath}`);
}

run();
