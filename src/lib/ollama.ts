import {Ollama} from "ollama";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

export const ollama = new Ollama({
    host: OLLAMA_BASE_URL,
    headers: {
        Authorization: "Bearer " + OLLAMA_API_KEY,
    }
});
