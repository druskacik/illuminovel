import { config } from 'dotenv';
config();

import { backOff } from "exponential-backoff";
import { GoogleGenerativeAI } from '@google/generative-ai';

export const getResponseBackOff = async (chat, message) => {
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default genAI;
