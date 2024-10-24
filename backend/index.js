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

  invokeAssistant(assistant, thread_id, prompt)
  .then((response) => {
    res.json({ response });
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
  model = 'gpt-4o-mini',
  instructions = 'A simple assistant'
) {
  return addMessageToThread(thread_id, { role: 'user', content: prompt })
    .then(() => {
      return openai.beta.threads.runs.createAndPoll(thread_id, {
        assistant_id: assistant.id,
        instructions: prompt,
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
      const answer = messages.data[0];
      return answer.content[0].text.value;
    });
}