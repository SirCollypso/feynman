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