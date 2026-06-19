import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up middleware to parse JSON
app.use(express.json());

// Initialize the server-side Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Ensure API-key failure states are handled gracefully
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    getGeminiClient();
    next();
  } catch (error: any) {
    console.error("API Key check failed:", error.message);
    res.status(500).json({
      error: "Gemini API key is not configured.",
      details: "Please configure your GEMINI_API_KEY in the Secrets panel."
    });
  }
};

// 1. Endpoint to generate a fully immersive curriculum course outline on a topic
app.post("/api/generate/course", checkApiKey, async (req, res) => {
  const { subject } = req.body;
  if (!subject || typeof subject !== "string") {
    res.status(400).json({ error: "Missing subject string in request body." });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Develop a structured, highly comprehensive educational course curriculum about: "${subject}". 
Create exactly 3 logically ordered modules that cover the topic from introductory concepts to more advanced applications. 
Each module must be dense with details, containing:
1. An engaging, clear module title.
2. A detailed 3-4 paragraph study summary (around 200-300 words per summary) packed with facts, explanations, and logical progression.
3. An optional technical note (e.g. a code sample, formula description, historical chronology block, or concrete example). Make it relevant to the topic. If there is no clear technical code/math formulas, write a clear visual or chronological example block.
4. Exactly 3 distinct core key takeaways (as full sentences).
5. Exactly 3 key terms of vocabulary with very clear definitions.

Ensure your tone is professional, authoritative, educational, and exceptionally clear. No markdown tags should wrap the outer array. Respond with a pure JSON array matching the required schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional university professor who designs world-class curricula and dense, high-retention study notes. Always respond with perfectly structured JSON that perfectly validates the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Title of the educational module."
              },
              summary: {
                type: Type.STRING,
                description: "Dense, detailed, multi-paragraph conceptual explanation of around 200-300 words without markdown. Strictly separate paragraphs with two newlines."
              },
              technicalNote: {
                type: Type.STRING,
                description: "A plain-text sample block with spacing, code, equations, timeline dates, or concrete syntax examples."
              },
              takeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 3 major distinct study bullet-points."
              },
              keyTerms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING, description: "The term or keyword." },
                    definition: { type: Type.STRING, description: "A robust definition of the term." }
                  },
                  required: ["term", "definition"]
                },
                description: "Exactly 3 primary key vocabulary terms and definitions."
              }
            },
            required: ["title", "summary", "takeaways", "keyTerms"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to extract text from Gemini response.");
    }

    const payload = JSON.parse(text.trim());
    res.json({ success: true, course: { id: Date.now().toString(), subject, modules: payload } });
  } catch (error: any) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to generate educational curriculum.", details: error.message });
  }
});

// 2. Endpoint to generate active-recall flashcards on a topic
app.post("/api/generate/flashcards", checkApiKey, async (req, res) => {
  const { subject, notes } = req.body;
  if (!subject) {
    res.status(400).json({ error: "Missing subject in request body." });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Create a high-retention set of exactly 6 active-recall study flashcards for the subject: "${subject}".
${notes ? `Focus primarily on these key details and notes:\n${notes}` : ""}
The questions should ask for definitions, fundamental concepts, core mechanics, or problem solving. 
Keep questions concise and answers thoroughly clear and informative but fit for short-card review.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert tutor creating study flashcards designed for maximum memory retention. Keep the question engaging and the answer highly clear and precise.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The flashcard question or recall prompt." },
              answer: { type: Type.STRING, description: "The clear, direct correct answer." }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty text returned from model.");
    const flashcards = JSON.parse(text.trim());
    res.json({ success: true, flashcards });
  } catch (error: any) {
    console.error("Error creating flashcards:", error);
    res.status(500).json({ error: "Failed to generate study flashcards.", details: error.message });
  }
});

// 3. Endpoint to generate a 5-question multiple choice adaptive study quiz
app.post("/api/generate/quiz", checkApiKey, async (req, res) => {
  const { subject, notes } = req.body;
  if (!subject) {
    res.status(400).json({ error: "Missing subject in request body." });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Generate a high-quality, conceptual, multiple-choice study exam with exactly 5 unique questions testing different cognitive levels on the topic: "${subject}".
${notes ? `Reference materials:\n${notes}` : ""}
Include:
- 1 basic recall or definition question
- 2 intermediate concept application questions
- 2 comprehensive analytical or problem-solving questions

Provide exactly 4 distinct and plausible options for each question. Identify the exact index (0 to 3) of the correct answer, and provide a welcoming explanation justifying the correct choice and explaining why standard misconception distractors are incorrect.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional educational assessor designing tests that check deep conceptual understanding. Provide precise questions and informative explanations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "Crucial question text." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 options."
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer." },
              explanation: { type: Type.STRING, description: "Instructional rationale explaining the correct answer, and clarifying misconceptions." }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty output received from model.");
    const questions = JSON.parse(text.trim());
    res.json({ success: true, questions });
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ error: "Failed to generate practice quiz.", details: error.message });
  }
});

// 4. Conversational Classroom Companion (Study Buddy)
app.post("/api/chat/study-buddy", checkApiKey, async (req, res) => {
  const { message, history, contextSubject, contextNotes } = req.body;
  if (!message) {
    res.status(400).json({ error: "Missing message in request body." });
    return;
  }

  try {
    const ai = getGeminiClient();
    
    // Construct structural system guidelines + context wrapper
    const systemInstruction = `You are "Professor Sage", a warm, inspiring, and extremely patient AI Tour-Guide and Tutors Assistant. 
Your goal is to answer student questions clearly, provide helpful analogies, test their knowledge with friendly open-ended questions when appropriate, and motivate them.
Keep answers formatted in simple clean paragraphs. Never dump dry code or raw markdown grids unless requested. 
Be concise but very educational (100-150 words average).
Current Topic: "${contextSubject || "General Education"}"
Topic Context: "${contextNotes || "Generic Study Session"}"`;

    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Start a chat session using the proper @google/genai format with history seeded directly
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    const response = await chat.sendMessage({ message });
    const replyText = response.text || "I apologize, let me collect my thoughts. How can I help you learn this subject better?";

    res.json({
      success: true,
      message: {
        id: Date.now().toString(),
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
  } catch (error: any) {
    console.error("Error in study-buddy chat:", error);
    res.status(500).json({ error: "Study buddy encountered an issue.", details: error.message });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite development server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Serve build artifacts in production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduStudio Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Could not start Express-Vite backend server:", err);
});
