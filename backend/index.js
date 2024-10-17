import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';


// initialize server

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

// initialize assistant

const openai = new OpenAI.OpenAI();
const ASSISTANT_NAME = 'Tutor';
const assistant = await getAssistant(ASSISTANT_NAME);

// backend endpoints

app.post('/chat', async (req, res) => {
  const { thread_id, prompt } = req.body;

  if (!thread_id || !prompt) {
    return res.status(400).json({ error: 'thread_id and prompt are required' });
  }

  try {
    const response = await invokeAssistant(assistant, thread_id, prompt);
    res.json({ response });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while processing your request: ' + (error.response ? error.response.data : error.message) });
  }
});

app.post('/thread/create', async (req, res) => {
  try {
    const thread = await createThread();
    res.json({ thread_id: thread.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create thread: ' + error });
  }
});

app.post('/thread/delete', async (req, res) => {
  const { thread_id } = req.body;

  if (!thread_id) {
    return res.status(400).json({ error: 'thread_id is required' });
  }

  try {
    await deleteThread(thread_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete thread: ' +  error});
  }
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

async function invokeAssistant(
  assistant,
  thread_id,
  prompt,
  model = 'gpt-4o-mini',
  instructions = 'A simple assistant'
) {
  addMessageToThread(thread_id, {
    role: 'user',
    content: prompt,
  });

  const run = await openai.beta.threads.runs.createAndPoll(thread_id, {
    assistant_id: assistant.id,
    instructions: prompt,
    model,
  });

  if (run.status === 'completed') {
    let messages = await openai.beta.threads.messages.list(thread_id);
    const answer = messages.data[0];
    return answer.content[0].text.value;
  } else {
    throw new Error("Couldn't complete the run");
  }
}