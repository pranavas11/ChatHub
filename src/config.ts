import toml from "@iarna/toml";
import fs from "fs";
import path from "path";

const configFileName = "config.toml";

interface Config {
  GENERAL: {
    PORT: number;
    SIMILARITY_MEASURE: string;
    CHAT_MODEL_PROVIDER: string;
    CHAT_MODEL: string;
  };
  API_KEYS: {
    OPENAI: string;
    GROQ: string;
    GEMINI: string;
  };
  API_ENDPOINTS: {
    SEARXNG: string;
    OLLAMA: string;
  };
}

const loadConfig = () => toml.parse(fs.readFileSync(path.join(__dirname, `../${configFileName}`), "utf-8")) as any as Config;

export const getPort = () => Number(process.env.PORT) || Number(process.env.BACKEND_PORT) || loadConfig().GENERAL.PORT || 3001;

export const getSimilarityMeasure = () => loadConfig().GENERAL.SIMILARITY_MEASURE;

export const getChatModelProvider = () => loadConfig().GENERAL.CHAT_MODEL_PROVIDER;

export const getOllamaApiEndpoint = () => loadConfig().API_ENDPOINTS.OLLAMA;

export const getChatModel = () => loadConfig().GENERAL.CHAT_MODEL;

export const getOpenaiApiKey = () => process.env.OPENAI_API_KEY || loadConfig().API_KEYS.OPENAI;

export const getGroqApiKey = () => process.env.GROQ_API_KEY || loadConfig().API_KEYS.GROQ;

export const getGeminiApiKey = () => process.env.GEMINI_API_KEY || loadConfig().API_KEYS.GEMINI;

export const getSearxngApiEndpoint = () => process.env.SEARXNG_API_URL || loadConfig().API_ENDPOINTS.SEARXNG;

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export const updateConfig = (config: RecursivePartial<Config>) => {
  const currentConfig = loadConfig();

  for (const key in currentConfig) {
    if (currentConfig[key] && typeof currentConfig[key] === "object") {
      for (const nestedKey in currentConfig[key]) {
        if (currentConfig[key][nestedKey] && !config[key][nestedKey] && config[key][nestedKey] !== "") {
          config[key][nestedKey] = currentConfig[key][nestedKey];
        }
      }
    } else if (currentConfig[key] && !config[key] && config[key] !== "") {
      config[key] = currentConfig[key];
    }
  }

  fs.writeFileSync(path.join(__dirname, `../${configFileName}`), toml.stringify(config));
};