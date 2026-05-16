import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const geminiServerService = {
  async chatWithDocument(docText: string, messages: any[], userMessage: string) {
    const prompt = `
      You are an expert academic assistant. Use the provided document text as your primary source of truth.
      If the answer is not in the document, say you don't know based on the document, but you can offer general knowledge if helpful.
      
      DOCUMENT TEXT:
      ${docText.substring(0, 30000)}

      CHAT HISTORY:
      ${messages.map((m: any) => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}

      USER QUESTION:
      ${userMessage}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return result.text;
  },

  async summarizeDocument(text: string) {
    const prompt = `Summarize the following document in a concise, professional executive summary. Use bullet points for key takeaways. \n\nDOCUMENT:\n${text.substring(0, 20000)}`;
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return result.text;
  },

  async generateTutoringQuestion(docText: string, history: any[], difficulty: string) {
    const prompt = `
      Based on this document, generate a challenging ${difficulty} level question to test a student's understanding.
      Avoid questions already asked in the history.
      
      DOCUMENT:
      ${docText.substring(0, 10000)}
      
      HISTORY:
      ${history.slice(-5).map((m: any) => m.text).join('\n')}
    `;
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return result.text;
  },

  async evaluateTutoringAnswer(docText: string, question: string, answer: string) {
    const prompt = `
      Question: ${question}
      Student Answer: ${answer}
      
      Evaluate the student's answer based on the following document.
      Provide constructive feedback and the correct explanation if they were wrong.
      Be encouraging but rigorous.
      
      DOCUMENT:
      ${docText.substring(0, 10000)}
    `;
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return result.text;
  },

  async generateResearchAssistantSuggestions(text: string) {
    const prompt = `
      Analyze this document and provide:
      1. Top 3 related research topics.
      2. 2 interesting academic connections or parallels.
      3. 3 deep-dive questions for further exploration.
      
      Format as JSON: { "topics": [], "connections": [], "questions": [] }
      
      DOCUMENT:
      ${text.substring(0, 15000)}
    `;
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    let responseText = result.text || '{}';
    // Clean JSON if needed
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  }
};
