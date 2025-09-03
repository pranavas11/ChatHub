// Manages WebSocket connections and routes incoming messages to the appropriate language model and embeddings
import { WebSocket } from "ws";
import { handleMessage } from "./messageHandler";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { getChatModel, getChatModelProvider, getOpenaiApiKey, getGeminiApiKey } from "../config";
import { getAvailableProviders } from "../lib/providers";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Embeddings } from "@langchain/core/embeddings";

export const handleConnection = async (ws: WebSocket) => {
  const models = await getAvailableProviders();
  const provider = getChatModelProvider();
  const chatModel = getChatModel();

  console.log("Has Gemini key?", !!getGeminiApiKey());

  let llm: BaseChatModel | undefined;
  let embeddings: Embeddings | undefined;

  if (models[provider] && models[provider][chatModel]) {
    llm = models[provider][chatModel] as BaseChatModel | undefined;
    embeddings = models[provider].embeddings as Embeddings | undefined;
  }

  if (!llm || !embeddings) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: "Invalid LLM or embeddings model selected. Check CHAT_MODEL_PROVIDER / CHAT_MODEL and API keys.",
      })
    );
    ws.close();            // close the socket to avoid undefined usage
    return;
  }

  ws.on(
    "message",
    async (message) =>
      await handleMessage(message.toString(), ws, llm, embeddings)
  );

  ws.on("close", () => console.log("Connection Closed"));
};