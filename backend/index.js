import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';


// initialize server
const app = express();
app.use(cors());
app.use(express.json());
const port = 5001;

// initialize assistant
const openai = new OpenAI.OpenAI();
const ASSISTANT_NAME = 'Tutor';
const assistant = await getAssistant(ASSISTANT_NAME);

// backend endpoints
app.post('/chat', async (req, res) => {
  const { thread_id, message, highlighted } = req.body;

  if (!thread_id || !message || !message.role || !message.message ) {
    return res.status(400).json({ error: 'thread_id and prompt are required' });
  }

  const prompt = message.message;

  invokeAssistant(assistant, thread_id, prompt, highlighted)
    .then((response) => {
      res.json({ 
        response 
      });
    })
    .catch((error) => {
      res.status(500).json({
        error:
          'An error occurred while processing your request: ' +
          (error.response ? error.response.data : error.message),
      });
    });
});

app.post('/thread/create', async (req, res) => {
  createThread()
  .then((thread) => {
    res.json({ thread_id: thread.id });
  })
  .catch((error) => {
    res.status(500).json({ error: 'Failed to create thread: ' + error });
  });
});

app.post('/thread/delete', async (req, res) => {
  const { thread_id } = req.body;

  if (!thread_id) {
    return res.status(400).json({ error: 'thread_id is required' });
  }

  deleteThread(thread_id)
  .then(() => {
    res.json({ success: true });
  })
  .catch((error) => {
    res.status(500).json({ error: 'Failed to delete thread: ' + error });
  });
});

// listen

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});

// Assistant helpers functions

async function getAssistant(
  name,
  model = 'gpt-4o-mini',
  instructions = 'A simple assistant'
) {
  const assistant = await openai.beta.assistants
    .list({
      limit: 100,
    })
    .then((res) => {
      return res.data.find((assistant) => assistant.name === name);
    });
  if (assistant) return assistant;

  return openai.beta.assistants.create({
    name,
    model,
    instructions,
  });
}

function deleteAssistant(assistant_id) {
  return openai.beta.assistants.del(assistant_id);
}

function createThread() {
  return openai.beta.threads.create();
}

async function deleteThread(thread_id) {
  const response = await openai.beta.threads.del(thread_id);
  return response;
}

function addMessageToThread(thread_id, message) {
  return openai.beta.threads.messages.create(thread_id, message);
}

function invokeAssistant(
  assistant,
  thread_id,
  prompt,
  highlighted,
  model = 'gpt-4o-mini',
  //instructions = 'A simple assistant'
  temperature = 0.3
) {

  // Currently ignoring the 'highlighted' parameter
  
  const systemContext =  `
    You are a first-year Computer Engineering student learning basic programming concepts
    You are currently trying to understand and work on solving problems using the bubble sort algorithm 
    You are having trouble understanding bubble sort algorithm concept 
    You never try to explain bubble sort.
    You should:
    - Never give an explanation for bubble sort yourself.
    - Start the conversation with this question "Hello, I am a student who is studying bubble sort. Can you help me understand it?"
    - Follow up with extra questions on explanations provided for further clarifications (at least once).
    - Keep your answers short and to the point, with no more than 3 sentences per response. 
    - Express confusion and ask questions to seek clarification.
    - When providing code, write it within a code block, like: \`\`\`python ... \`\`\`.
    Conversation Flow:
    - Start the conversation with this question "Hello, I am a student who is studying bubble sort. Can you help me understand it?"
    - First ask about how bubble sort algorithm works.
    - Next ask why bubble sort repeatedly compares adjacent elements.
    - Next ask how to swap elements in bubble sort.
    - Based on their response, ask 2-3 follow-up questions to understand the core of the algorithm
    - Start writing a faulty basic code for bubble sort algorithm.
    - After receiving a feedback make 1-2 more mistakes in code.
    - Correct your code after receiving feedback.
    `;  
    return addMessageToThread(thread_id, { role: 'user', content: prompt })
    .then(() => {
      return openai.beta.threads.runs.createAndPoll(thread_id, {
        assistant_id: assistant.id,
        instructions: systemContext,
        model,
      });
    })
    .then((run) => {
      if (run.status === 'completed') {
        return openai.beta.threads.messages.list(thread_id);
      } else {
        throw new Error("Couldn't complete the run");
      }
    })
    .then((messages) => {
      const answer = messages.data[0].content[0].text.value;

      
      // Extract the code block using a regular expression if it exists
      const codeBlockMatch = answer.match(/```(?:\w+)?\n([\s\S]*?)```/);
      let codeLines = [];
      let codeText = "";

      if (codeBlockMatch) {
        codeText = "Basic implementation of the bubble sort algorithm."; // Description for code
        codeLines = codeBlockMatch[1].split('\n').map(line => line.trim());
      }

      // Separate text response from code block if code exists
      const messageWithoutCode = codeBlockMatch ? answer.replace(/```[\s\S]*```/, "").trim() : answer;

      // Return the response in the required format
      return {
        role: 'agent',
        message: messageWithoutCode, // Text part of the response
        code: {
          text: codeText,
          lines: codeLines
        }
      };
    });
}
