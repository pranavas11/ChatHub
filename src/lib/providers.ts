import {
  getGroqApiKey,
  getOllamaApiEndpoint,
  getOpenaiApiKey,
  getGeminiApiKey,
} from "../config";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

export const getAvailableProviders = async () => {
  const openAIApiKey = getOpenaiApiKey();
  const groqApiKey = getGroqApiKey();
  const geminiApiKey = getGeminiApiKey();
  const ollamaEndpoint = getOllamaApiEndpoint();

  const models = {};

  if (openAIApiKey) {
    try {
      models["openai"] = {
        "GPT-3.5-turbo": new ChatOpenAI({
          openAIApiKey,
          modelName: "gpt-3.5-turbo",
          temperature: 0.7,
        }),
        "GPT-4": new ChatOpenAI({
          openAIApiKey,
          modelName: "gpt-4",
          temperature: 0.7,
        }),
        "GPT-4-turbo": new ChatOpenAI({
          openAIApiKey,
          modelName: "gpt-4-turbo",
          temperature: 0.7,
        }),
        embeddings: new OpenAIEmbeddings({
          openAIApiKey,
          modelName: "text-embedding-3-large",
        }),
      };
    } catch (err) {
      console.log(`Error loading OpenAI models: ${err}`);
    }
  }

  if (ollamaEndpoint) {
    try {
      const response = await fetch(`${ollamaEndpoint}/api/tags`);

      const { models: ollamaModels } = (await response.json()) as any;

      models["ollama"] = ollamaModels.reduce((acc, model) => {
        acc[model.model] = new ChatOllama({
          baseUrl: ollamaEndpoint,
          model: model.model,
          temperature: 0.7,
        });
        return acc;
      }, {});

      if (Object.keys(models["ollama"]).length > 0) {
        models["ollama"]["embeddings"] = new OllamaEmbeddings({
          baseUrl: ollamaEndpoint,
          model: models["ollama"][Object.keys(models["ollama"])[0]].model,
        });
      }
    } catch (err) {
      console.log(`Error loading Ollama models: ${err}`);
    }
  }

  if (groqApiKey) {
    try {
      models["groq"] = {
        "LLAMA3 8b": new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: "llama3-8b-8192",
            temperature: 0.7,
          },
          {
            baseURL: "https://api.groq.com/openai/v1",
          }
        ),
        "LLAMA3 70b": new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: "llama3-70b-8192",
            temperature: 0.7,
          },
          {
            baseURL: "https://api.groq.com/openai/v1",
          }
        ),
        "Gemma 7b": new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: "gemma-7b-it",
            temperature: 0.7,
          },
          {
            baseURL: "https://api.groq.com/openai/v1",
          }
        ),
        embeddings: new OpenAIEmbeddings({
          openAIApiKey: openAIApiKey,
          modelName: "text-embedding-3-large",
        }),
      };
    } catch (err) {
      console.error(`Error loading Groq models: ${err}`);
    }
  }

  if (geminiApiKey) {
    try {
      models["gemini"] = {
        "Gemini 1.5 Flash": new ChatGoogleGenerativeAI({
          apiKey: geminiApiKey,
          model: "gemini-1.5-flash", // free-tier, fast
          temperature: 0.7,
        }),
        // (Optional) Uncomment if you want to expose Pro as a selectable option
        // "Gemini 1.5 Pro": new ChatGoogleGenerativeAI({
        //   apiKey: geminiApiKey,
        //   model: "gemini-1.5-pro",
        //   temperature: 0.7,
        // }),
        embeddings: new GoogleGenerativeAIEmbeddings({
          apiKey: geminiApiKey,
          model: "text-embedding-004", // current embeddings model
        }),
      };
    } catch (err) {
      console.error(`Error loading Gemini models: ${err}`);
    }
  }

  return models;
};