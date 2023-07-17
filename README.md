# StoryBuddy Demo

This project was created for ScaleAI Hackathon to create a story generator for middle school kids. 

![Story Buddy Demo Image](public/StoryBuddy_Demo.png?raw=true 'StoryBuddy Demo')

## Here's what it does:

- Uses the microphone on your web device to interact with ChatGPT like Siri.
- You can either type or talk into the mic
- When you are happy with the story plot, it will generate the story for you together with images and video (WIP) 
- Sets a default context for ChatGPT where you can configure the role, personality, and brevity of its responses.
- Just like ChatGPT, it remembers your conversation
- Button to reset the story plot.

## How is this adapted for youth?

- Talking is easier than typing for kids, and the Whisper API does a great job of translating speech to text.
- Refining the context of ChatGPT allows its responses to be extremely relevant for a young audience.
- The generated story is multimodal (with text, images, and video)
- Safety and age filters are used for all models

## Configuring StoryBuddy Context

Open up `pages/index.tsx` and note the following areas that can be configured:

```javascript
// roles
const storyTeller =
  'You are gathering information for a story for kids in middle school. The kids will give you details, and you need to ask them only one question every time to continue the story. Please keep your response in a format where the summary and question are separated.';

const nocontext = '';

// personalities
const quirky =
  'You are quirky with a sense of humor. You crack jokes frequently in your responses.';

// brevities
const briefBrevity = 'Your responses are always 1 to 2 sentences.';
const longBrevity = 'Your responses are always 3 to 4 sentences.';
const whimsicalBrevity = 'Your responses are always 5 to 6 sentences.';

// dials
const role = storyTeller;
const personality = quirky;
const brevity = briefBrevity;

// FULL BOT CONTEXT
const botContext = `${role} ${personality} ${brevity}`;
```

You can add your own roles to cater it to your needs.

## ENV setup

To use the OpenAI API you must generate an OpenAI API key, create a file called `.env.local` at the root level of this project, and set the following environment variable: `OPENAI_API_KEY={your OpenAI API key}`

## Deploying on Vercel

This project is setup to deploy on the free version of vercel, just clone and add it to your project and deploy it to production.

Special note: For this to deploy and work properly on Vercel, you must **use Node 16.x **for your serverless functions.

## Boilerplate stuff:

This is a [Next.js](https://nextjs.org/) building on this [template](https://github.com/coryshaw/chatgpt-whisper-nextjs) 

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can edit the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts.`

The `pages/api` directory is mapped to `/api/*.` Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
