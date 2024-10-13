import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const getDescriptionPrompt = (bookTitle, bookAuthor) => {
//     return `Describe in a few sentences what type of classical music would be suitable for a story of the book ${bookTitle} by ${bookAuthor}. Don't mention any names or known pieces, just a general vibe of music that would be suitable.

// Don't mention the name of the book in your response.`;
// }

const getDescriptionPrompt = (bookTitle, bookAuthor) => {
    return `Describe in a few sentences what type of classical music would be suitable for a story of the book ${bookTitle} by ${bookAuthor}. Don't mention any names or known pieces, just a general vibe of music that would be suitable.`;
}

export const generateSoundtrackDescription = async (bookTitle, bookAuthor) => {
    const prompt = getDescriptionPrompt(bookTitle, bookAuthor);

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
    });

    return completion.choices[0].message.content;
}