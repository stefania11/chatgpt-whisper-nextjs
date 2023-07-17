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
  Input,
} from '@mantine/core';
import { AudioRecorder } from 'react-audio-voice-recorder';
import {
  IconAlertCircle,
  IconFlower,
  IconMicrophone,
  IconRefresh,
  IconRobot,
  IconUser,
  IconCat,
} from '@tabler/icons';
import { Fish, Unicorn } from '../public/images/imagePaths';

interface MessageSchema {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

const storyteller =
  'You are gathering information for a story for kids in middle school. The kids will give you details, and you need to ask them only one question every time to continue the story. Please keep your response in a format where the summary and question are separated.';

// roles
const botRolePairProgrammer =
  'You are an expert pair programmer helping build an AI bot application with the OpenAI ChatGPT and Whisper APIs. The software is a web application built with NextJS with serverless functions, React functional components using TypeScript.';
const nocontext = '';

// personalities
const quirky =
  'You are quirky with a sense of humor. You crack jokes frequently in your responses.';
const weird =
  'You are weird, you like to surprise the kid with your responses and have the personality of a mercurial 7 years old.';
const friend =
  'You are my best friend, you are always there for me and you are always kind.';
// brevities
const briefBrevity = 'Your responses are always 1 to 2 sentences.';
const longBrevity = 'Your responses are always 3 to 4 sentences.';
const whimsicalBrevity = 'Your responses are always 5 to 6 sentences.';

// dials
const role = storyteller;
const personality = quirky;
const brevity = briefBrevity;

// FULL BOT CONTEXT
const botContext = `${role} ${personality} ${brevity}`;

export default function Home() {
  const [imageInputValue, setImageInputValue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const defaultContextSchema: MessageSchema = {
    role: 'assistant',
    content: botContext,
  };

  const [apiKey, setApiKey] = useState('');

  const handleOAI = (event) => {
    event.preventDefault();
    process.env.OPENAI_API_KEY = apiKey;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialMessage =
    "Hey there! Let's start our amazing story together. Why don't you say something into the microphone or click on one of the ideas below to kick things off?";
  const [messagesArray, setMessagesArray] = useState([
    defaultContextSchema,
    { role: 'system', content: initialMessage },
  ]);

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

  const handleBoxClick = (message: string) => {
    updateMessagesArray(message);
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

  // keyboard backup
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setImageInputValue(event.target.value);
  };

  const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setImageInputValue(inputValue);
    handleSubmit('calling stable diffusion model');
    event.preventDefault();
    if (inputValue.trim() !== '') {
      updateMessagesArray(inputValue);
      setInputValue('');
    }
  };

  //diffusion model
  const handleSubmit = async (input: string) => {
    console.log(input);
    setLoading(true);

    const response = await fetch('/api/stablediffusion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: imageInputValue }),
    });

    if (response.ok) {
      const data = await response.json();
      setImageUrl(data[0]);
    } else {
      console.error('Error:', response.statusText);
    }
    setLoading(false);
  };
  return (
    <>
      <Head>
        <title>StoryBuddy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form onSubmit={handleOAI}>
      <label htmlFor="apiKey">OpenAI API Key:</label>
      <input
        type="text"
        id="apiKey"
        name="apiKey"
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
      />
      <input type="submit" value="Submit" />
    </form>
      <Container size="sm" mt={25}>
        <Center>
          <IconCat size={30} color="teal" />
          <Text
            size={30}
            weight={300}
            pl={5}
            variant="gradient"
            gradient={{ from: 'blue', to: 'yellow' }}
          >
            StoryBuddy
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
                      <IconCat size={25} />
                    </Grid.Col>
                    <Grid.Col span={11}>
                      <Text>{message.content}</Text>
                    </Grid.Col>
                  </Grid>
                )}
              </>
            ))}
            {messagesArray.length === 2 && (
              <Grid mt={20}>
                <Grid.Col span={6}>
                  <Box
                    p={20}
                    style={{
                      border: '3px solid',
                      borderColor: 'lightgrey',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleBoxClick('Fish reading a book')}
                  >
                    <Center>
                      <img src={Fish} alt="Sample fish 1" width="150" />
                    </Center>
                    <Text mt={10}>Fish Reading a Book</Text>
                  </Box>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Box
                    p={20}
                    style={{
                      border: '3px solid',
                      borderColor: 'lightgrey',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleBoxClick('Unicorn drinking coffee')}
                  >
                    <Center>
                      <img src={Unicorn} alt="Sample Image 2" width="150" />
                    </Center>
                    <Text mt={10}>Unicorn Drinking Coffee</Text>
                  </Box>
                </Grid.Col>
              </Grid>
            )}
          </Box>
        )}
          <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            {loading && (
              <div className="mt-12 flex justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
              </div>
            )}
            {imageUrl && !loading && (
              <div className="mt-12 flex justify-center items-center">
                <img
                  src={imageUrl}
                  alt="Generated image"
                  className="rounded-xl shadow-lg"
                />
              </div>
            )}
            <style jsx>{`
              .loader {
                animation: spin 1s linear infinite;
                border-top-color: #3498db;
              }

              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
      </Container>
      <Container size="sm">
        <Center style={{ height: 200 }}>
          <form onSubmit={handleInputSubmit} style={{ display: 'flex' }}>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
            />
            <Button
              variant="gradient"
              radius={100}
              m={3}
              gradient={{ from: 'indigo', to: 'cyan' }}
              type="submit"
            >
              Send
            </Button>
          </form>
          <div style={{ alignItems: 'center' }}>
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
          </div>
        </Center>
      </Container>
    </>
  );
}
