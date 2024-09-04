import { config } from 'dotenv';
config();

import { backOff } from "exponential-backoff";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const getResponseBackOff = async (chat, message) => {
  return await backOff(() => {
    return chat.sendMessage(message);
  }, {
    startingDelay: 1000,
    timeMultiple: 2,
    jitter: 'full',
    numOfAttempts: 10,
    retry: (error) => {
      console.log('Error:', error);
      return true;
    }
  });
}

// Initialize the Gemini API client
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getDescriptionPrompt = (characterName) => {
    return `Now, based on the provided book, write a detailed description of the appearance of the character of ${characterName}.
    Your description will be used in a image generating model, so be very thorough.
    Include a description of the background that fits the story.
    The description should not exceed 150 words.
    Output the description in the following JSON format:
    {
      "description": "Detailed description of the character"
    }`;
}

export async function* extractCharacters(text) {
  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0,
      },
      safetySettings: safetySettings,
    });

    const prompt = `
    From the provided book, extract a list of up to 20 main characters. Order them in by their importance in the story. If the story contains harmful or dangerous parts, just ignore them.
    Also, extract the name of the book.
    
    Output your response as a JSON with following format:
    {
      "bookName": string,
      "characters": [string]
    }
    Here's the text:

    ${text}
    `

    const chat = model.startChat({
        history: [],
        generationConfig: { responseMimeType: "application/json" }
      });

    // Generate content
    const result = await getResponseBackOff(chat, prompt);
    const responseText = result.response.text();
    console.log('responseText', responseText);

    const bookName = JSON.parse(responseText).bookName;
    const characterList = JSON.parse(responseText).characters;

    for (const character of characterList) {
      const descriptionPrompt = getDescriptionPrompt(character);
      const descriptionResult = await getResponseBackOff(chat, descriptionPrompt);
      const descriptionText = descriptionResult.response.text();
      const characterWithDescription = {
        bookName: bookName,
        name: character,
        description: JSON.parse(descriptionText).description,
      };
      yield characterWithDescription;
    }

  } catch (error) {
    console.error('Error extracting characters:', error);
    // throw error;
  }
}
