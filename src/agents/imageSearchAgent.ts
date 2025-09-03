import { OpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";
import {
  RunnableSequence,
  RunnableMap,
  RunnableLambda,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import formatChatHistoryAsString from "../utils/formatHistory";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { searchSearxng } from "../lib/searxng";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

const imageSearchChainPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question so it is a standalone question that can be used by the LLM to search the web for images.
You need to make sure the rephrased question agrees with the conversation and is relevant to the conversation.
Example:
1. Follow up question: What is a cat?
Rephrased: A cat
2. Follow up question: What is a car? How does it works?
Rephrased: Car working
3. Follow up question: How does an AC work?
Rephrased: AC working
Conversation:
{chat_history}
Follow up question: {query}
Rephrased question:
`;

type ImageSearchChainInput = {
  chat_history: BaseMessage[];
  query: string;
};

const strParser = new StringOutputParser();

// const createImageSearchChain = (llm: BaseChatModel) => {
//   return RunnableSequence.from([
//     RunnableMap.from({
//       chat_history: (input: ImageSearchChainInput) => {
//         return formatChatHistoryAsString(input.chat_history);
//       },
//       query: (input: ImageSearchChainInput) => {
//         return input.query;
//       },
//     }),
//     PromptTemplate.fromTemplate(imageSearchChainPrompt),
//     llm,
//     strParser,
//     RunnableLambda.from(async (input: string) => {
//       const res = await searchSearxng(input, {
//         categories: ["images"],
//         engines: ["bing images", "google images"],
//       });

//       const images = [];

//       res.results.forEach((result) => {
//         if (result.img_src && result.url && result.title) {
//           images.push({
//             img_src: result.img_src,
//             url: result.url,
//             title: result.title,
//           });
//         }
//       });

//       return images.slice(0, 10);
//     }),
//   ]);
// };


const createImageSearchChain = (llm: BaseChatModel) => {
  const promptTemplate = PromptTemplate.fromTemplate(imageSearchChainPrompt);

  return RunnableLambda.from(async (input: ImageSearchChainInput) => {
    try {
      // Step 1: Format the input for the prompt template
      const formattedInput = {
        chat_history: formatChatHistoryAsString(input.chat_history),
        query: input.query,
      };
      
      // Step 2: Apply the prompt template
      const prompt = await promptTemplate.format(formattedInput);
      
      // Step 3: Get LLM response
      const llmResponse = await llm.invoke(prompt);
      
      // Step 4: Parse the response to string
      const parsedResponse = await strParser.invoke(llmResponse);
      
      // Step 5: Search for images using the rephrased query
      const res = await searchSearxng(parsedResponse, {
        categories: ["images"],
        engines: ["bing images", "google images"],
      });

      // Step 6: Process and return image results
      const images: Array<{
        img_src: string;
        url: string;
        title: string;
      }> = [];

      res.results.forEach((result) => {
        if (result.img_src && result.url && result.title) {
          images.push({
            img_src: result.img_src,
            url: result.url,
            title: result.title,
          });
        }
      });

      return images.slice(0, 10);
    } catch (error) {
      console.error("Error in image search chain:", error);
      return [];
    }
  });
};


/*                                              ALMOST WORKING VERSION                                                        */
// const createImageSearchChain = (llm: BaseChatModel) => {
//   // Create the input transformation step
//   const inputTransform = RunnableLambda.from(
//     async (input: ImageSearchChainInput) => {
//       return {
//         chat_history: formatChatHistoryAsString(input.chat_history),
//         query: input.query,
//       };
//     }
//   );

//   // Create the image search step
//   const imageSearchStep = RunnableLambda.from(async (input: string) => {
//     const res = await searchSearxng(input, {
//       categories: ["images"],
//       engines: ["bing images", "google images"],
//     });

//     const images: Array<{
//       img_src: string;
//       url: string;
//       title: string;
//     }> = [];

//     res.results.forEach((result) => {
//       if (result.img_src && result.url && result.title) {
//         images.push({
//           img_src: result.img_src,
//           url: result.url,
//           title: result.title,
//         });
//       }
//     });

//     return images.slice(0, 10);
//   });

//   return RunnableSequence.from([
//     inputTransform,
//     PromptTemplate.fromTemplate(imageSearchChainPrompt),
//     llm,
//     strParser,
//     imageSearchStep,
//   ]);
// };

const handleImageSearch = (
  input: ImageSearchChainInput,
  llm: BaseChatModel
) => {
  const imageSearchChain = createImageSearchChain(llm);
  return imageSearchChain.invoke(input);
};

export default handleImageSearch;
