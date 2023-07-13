import * as fs from 'fs';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { JSONLoader } from "langchain/document_loaders/fs/json";

/* Name of directory to retrieve your files from */
const filePath_lm = 'memory/docs_lm';
const mem_guide = 'memory/memory_guide.json'

export const run = async () => {
  // Ingesting long term memory docs into Pinecone
  try {
    // load the memory guide json file, this file contains the list of all the docs in the memory
    const memGuide = fs.readFileSync(mem_guide, 'utf8');
    const MemGuideData = JSON.parse(memGuide);
    console.log('mem guide before: ', MemGuideData);

    // load raw docs from the all files in the directory, for now we only load pdf files
    const directoryLoader = new DirectoryLoader(filePath_lm, {
      '.pdf': (path) => new CustomPDFLoader(path),
    });
    const rawDocs = await directoryLoader.load();

    // iterate over the rawDocs and add the metadata to memory guide json file, if not already present, else remove it from rawDocs
    for (let i = 0; i < rawDocs.length; i++) {
      const doc = rawDocs[i];
      const docMetadata = doc.metadata;
      const source = docMetadata.source;
      const docName = source.split('\\').pop().split('/').pop();
      // append the doc name to the memGuideData.docs_lm array, if not already present, else remove it from rawDocs
      if (!MemGuideData.docs_lm.includes(docName)) {
        MemGuideData.docs_lm.push(docName);
      } else {
        rawDocs.splice(i, 1);
        i--;
      }
    }

    // show what is left in rawDocs
    // for (let i = 0; i < rawDocs.length; i++) {
    //   const doc = rawDocs[i];
    //   const docMetadata = doc.metadata;
    //   const source = docMetadata.source;
    //   const docName = source.split('\\').pop().split('/').pop();
    //   console.log('doc left in rawDocs: ', docName);
    // }

    // if there is no new doc to ingest, exit
    if (rawDocs.length === 0) {
      console.log('no new doc to ingest');
      return;
    }

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.splitDocuments(rawDocs);
    // console.log('split docs', docs);

    console.log('creating vector store...');
    // create and store the embeddings in the vectorStore
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

    // console log the memory guide json file
    console.log('mem guide after: ', MemGuideData);

    // save the memory guide json file
    fs.writeFileSync(mem_guide, JSON.stringify(MemGuideData));
    
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest long term memory data');
  }

};

(async () => {
  await run();
  console.log('ingestion complete');
})();
