import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  Grid,
  Loader,
  Text,
} from '@mantine/core';
import { AudioRecorder } from 'react-audio-voice-recorder';
import {
  IconAlertCircle,
  IconFlower,
  IconMicrophone,
  IconRefresh,
  IconRobot,
  IconUser,
} from '@tabler/icons';

import { NextApiRequest, NextApiResponse } from 'next';
import torch from 'torch';
import imageio from 'imageio';
import { TextToVideoZeroPipeline } from 'diffusers';



interface MessageSchema {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

// roles
const botRolePairProgrammer =
  'You are an expert pair programmer helping build an AI bot application with the OpenAI ChatGPT and Whisper APIs. The software is a web application built with NextJS with serverless functions, React functional components using TypeScript.';
const nocontext = '';

// personalities
const quirky =
  'You are quirky with a sense of humor. You crack jokes frequently in your responses.';
const drugDealer =
  'You are a snarky black market drug dealer from the streets of Los Angeles. Sometimes you are rude and disrespectful. You often curse in your responses.';
const straightLaced =
  'You are a straight laced corporate executive and only provide concise and accurate information.';

// brevities
const briefBrevity = 'Your responses are always 1 to 2 sentences.';
const longBrevity = 'Your responses are always 3 to 4 sentences.';
const whimsicalBrevity = 'Your responses are always 5 to 6 sentences.';

// dials
const role = botRolePairProgrammer;
const personality = quirky;
const brevity = briefBrevity;

// FULL BOT CONTEXT
const botContext = `${role} ${personality} ${brevity}`;

export default function Home() {
  const defaultContextSchema: MessageSchema = {
    role: 'assistant',
    content: botContext,
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesArray, setMessagesArray] = useState([defaultContextSchema]);

  useEffect(() => {
    if (
      messagesArray.length > 1 &&
      messagesArray[messagesArray.length - 1].role !== 'system'
    ) {
      gptRequest();
    }
  }, [messagesArray]);

  // gpt request
  const gptRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('messagesArray in gptRequest fn', messagesArray);
      const response = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messagesArray,
        }),
      });

      const gptResponse = await response.json();
      setLoading(false);
      if (gptResponse.content) {
        setMessagesArray((prevState) => [...prevState, gptResponse]);
      } else {
        setError('No response returned from server.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateMessagesArray = (newMessage: string) => {
    const newMessageSchema: MessageSchema = {
      role: 'user',
      content: newMessage,
    };
    console.log({ messagesArray });
    setMessagesArray((prevState) => [...prevState, newMessageSchema]);
  };

  // whisper request
  const whisperRequest = async (audioFile: Blob) => {
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.append('file', audioFile, 'audio.wav');
    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });
      const { text, error } = await response.json();
      if (response.ok) {
        updateMessagesArray(text);
      } else {
        setLoading(false);
        setError(error.message);
      }
    } catch (error) {
      console.log({ error });
      setLoading(false);
      if (typeof error === 'string') {
        setError(error);
      }
      if (error instanceof Error) {
        setError(error.message);
      }
      console.log('Error:', error);
    }
  };

// // video generation
//   const generateVideo = async (req: NextApiRequest, res: NextApiResponse, text: string) => {
//     setError(null);
//     try {
//       const model_id = "runwayml/stable-diffusion-v1-5";
//       const pipe = TextToVideoZeroPipeline.from_pretrained(model_id, torch_dtype=torch.float16).to("cuda");

//       const prompt = "A panda is playing guitar on times square";
//       const result = pipe(prompt=prompt).images;
//       const video = result.map(r => (r * 255).astype("uint8"));

//       res.setHeader('Content-Type', 'video/mp4');
//       res.send(video);
//     };
//   };


  return (
    <>
      <Head>
        <title>StoryBuddy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container size="sm" mt={25}>
        <Center>
          <IconRobot size={30} color="teal" />
          <Text
            size={30}
            weight={300}
            pl={5}
            variant="gradient"
            gradient={{ from: 'blue', to: 'teal' }}
          >
            Story Buddy
          </Text>
        </Center>

        {error && (
          <Alert
            icon={<IconAlertCircle />}
            title="Bummer!"
            color="red"
            variant="outline"
          >
            {error}
          </Alert>
        )}

        {/* {!loading && <div>{gptResponse}</div>} */}
        {messagesArray.length > 1 && (
          <Box fz="l" maw={520} mx="auto">
            {messagesArray.map((message, index) => (
              <>
                {message.role === 'user' && (
                  <Grid mt={35}>
                    <Grid.Col span={1}>
                      <IconMicrophone size={25} />
                    </Grid.Col>
                    <Grid.Col span={11}>
                      <Text fw={700}>{message.content}</Text>
                    </Grid.Col>
                  </Grid>
                )}
                {message.role === 'system' && (
                  <Grid>
                    <Grid.Col span={1}>
                      <IconRobot size={25} />
                    </Grid.Col>
                    <Grid.Col span={11}>
                      <Text>{message.content}</Text>
                    </Grid.Col>
                  </Grid>
                )}
              </>
            ))}
          </Box>
        )}
      </Container>
      <Container size="sm">
        <Center style={{ height: 200 }}>
          {!loading && (
            <AudioRecorder
              onRecordingComplete={(audioBlob) => whisperRequest(audioBlob)}
            />
          )}
          {loading && <Loader />}
          {!loading && messagesArray.length > 1 && (
            <Button
              variant="gradient"
              radius={100}
              w={40}
              m={20}
              p={0}
              style={{ position: 'absolute', marginLeft: '140px' }}
              disabled={loading}
              loading={loading}
              gradient={{ from: 'indigo', to: 'cyan' }}
              onClick={() => {
                setMessagesArray([defaultContextSchema]);
              }}
              title="Start Over"
            >
              <IconRefresh size={25} />
            </Button>
          )}
        </Center>
      </Container>
    </>
  );
}
