/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

// const PINECONE_NAME_SPACE = 'personal-assistant'; //namespace is optional for your vectors
const PINECONE_NAME_SPACE_LM = 'personal-assistant-lm'; // namespace for long-term memory
const PINECONE_NAME_SPACE_SM = 'personal-assistant-sm'; // namespace for short-term memory
const PINECONE_NAME_SPACE_WM = 'personal-assistant-wm'; // namespace for working memory

export { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE_LM, PINECONE_NAME_SPACE_SM, PINECONE_NAME_SPACE_WM };
