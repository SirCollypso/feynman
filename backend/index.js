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
  const { thread_id, prompt, highlighted } = req.body;

  if (!thread_id || !prompt) {
    return res.status(400).json({ error: 'thread_id and prompt are required' });
  }

  invokeAssistant(assistant, thread_id, prompt, highlighted)
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
  highlighted,
  model = 'gpt-4o-mini',
  instructions = 'A simple assistant'
) {

  // Currently ignoring the 'highlighted' parameter
  
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
import { config } from "dotenv";
config();
import axios from "axios";
//import OpenAI from 'openai';
import chalk from 'chalk';

//const openai = new OpenAI();


const prompt = getPrompt([
  {
    role: 'system',
    content: 
    'You are a first-year Computer Engineering student learning Python3' + 
    'You are currently trying to understand and work on solving problems using the bubble sort algorithm' + 
    'You are having trouble understanding bubble sort algorithm concept' +
    'Always start the conversation with this question "Hello, I am a student who is studying binary search. Can you help me understand it?"' +
    'Keep your answers short and to the point, with no more than 3 sentences per response.' +
    'Never write more than 3 sentences in a single response.' +
    'Never apologize or say you can help.' +
    'Your persona:'+
    '- A first-year student in the Computer Engineering Department.' +
    '- You have a basic understanding of Python syntax from your introdutory programming course.' +
    '- You are currently learning bubble sort but struggling with the concept and implementation.' +
    'Here are your difficulties:' +
    '- You are initially confused about how the algorithm works.' +
    '- You do not understand why bubble sort repeatedly compares adjacent elements' +
    '- You are unclear on how to swap the elements and how many passes are needed to sort the array'
  }
]); 

process.stdout.write('You: ');

process.stdin.addListener('data', async (data) => {
  const aiResponse = await prompt(data.toString().trim());
  console.log(chalk.magenta('Your Student: ' + aiResponse.content));
  process.stdout.write('You: ');
});


function getPrompt(thread = []) {
  return function (userPrompt, options = {}) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const promptMessage = {
      role: 'user',
      content: userPrompt,
    };
    return axios({
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      }, 
      data: {
        model: 'gpt-3.5-turbo',
        max_tokens: 500,
        temperature: 1,
        ...options,
        messages: [...thread, promptMessage],
      },
    }).then((res) => {
      const choice = res.data.choices[0];
      if (choice.finish_reason === 'stop'){
        //console.log(thread);
        thread.push(promptMessage);
        thread.push(choice.message);
        return choice.message;
      }
      throw new Error('no response from AI');
    });
  };
}