
export const geminiService = {
  async summarizeDocument(text: string): Promise<string> {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Summary failed');
    const data = await res.json();
    return data.summary;
  },

  async chatWithDocument(text: string, history: { role: 'user' | 'model', text: string }[], query: string): Promise<string> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docText: text, messages: history, userMessage: query })
    });
    if (!res.ok) throw new Error('Chat failed');
    const data = await res.json();
    return data.response;
  },

  async generateResearchAssistantSuggestions(text: string): Promise<{
    topics: string[];
    connections: string[];
    questions: string[];
  }> {
    const res = await fetch('/api/ai/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Research suggestions failed');
    return await res.json();
  },

  async generateTutoringQuestion(text: string, history: Message[], difficulty: string = 'intermediate'): Promise<string> {
    const res = await fetch('/api/ai/tutor-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docText: text, history, difficulty })
    });
    if (!res.ok) throw new Error('Tutor question failed');
    const data = await res.json();
    return data.question;
  },

  async evaluateTutoringAnswer(text: string, question: string, answer: string): Promise<string> {
    const res = await fetch('/api/ai/tutor-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docText: text, question, answer })
    });
    if (!res.ok) throw new Error('Evaluation failed');
    const data = await res.json();
    return data.evaluation;
  }
};

export interface Message {
  role: 'user' | 'model';
  text: string;
}
