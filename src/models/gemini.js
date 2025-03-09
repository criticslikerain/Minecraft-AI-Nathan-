import fetch from 'node-fetch';
import { toSinglePrompt } from '../utils/text.js';
import { getKey } from '../utils/keys.js';

export class Gemini {
    constructor(model_name, url) {
        this.model_name = model_name || "google/gemini-2.0-pro-exp-02-05:free"; // OpenRouter model
        this.url = url || "https://openrouter.ai/api/v1"; // OpenRouter API endpoint
        this.apiKey = getKey('GEMINI_API_KEY'); // Fetch API key
    }

    async sendRequest(turns, systemMessage) {
        const stop_seq = '***';
        const prompt = toSinglePrompt(turns, systemMessage, stop_seq, 'model');

        console.log("Awaiting OpenRouter API response...");

        try {
            const response = await fetch(`${this.url}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`,
                    "HTTP-Referer": "<YOUR_SITE_URL>",
                    "X-Title": "<YOUR_SITE_NAME>"
                },
                body: JSON.stringify({
                    model: this.model_name,
                    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }]
                })
            });

            const data = await response.json();

            console.log("Received OpenRouter response:", data);
            if (!data.choices || !data.choices.length) {
                return "Error: No response from AI.";
            }

            const text = data.choices[0].message.content;
            if (!text.includes(stop_seq)) return text;
            return text.split(stop_seq)[0]; // Stop at sequence
        } catch (error) {
            console.error("Error calling OpenRouter:", error);
            return "Error: Unable to process request.";
        }
    }

    async embed(text) {
        console.log("Embedding text with OpenRouter...");
        try {
            const response = await fetch(`${this.url}/embeddings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({ model: "embedding-001", input: text })
            });

            const data = await response.json();
            return data.embedding || [];
        } catch (error) {
            console.error("Error embedding text:", error);
            return [];
        }
    }
}
