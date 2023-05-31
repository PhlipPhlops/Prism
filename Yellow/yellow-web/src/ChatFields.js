import { useEffect, useState } from 'react';
import { brain_uri, yellow_color } from './globals';
import styled from 'styled-components';


class AudioQueue {
  constructor() {
    this.queue = []
    this.playing = false
  }

  async playQueue() {
    if (this.isPlaying) {
      return
    }

    this.isPlaying = true
    while (!this.isEmpty()) {
      await this.playAudio(this.dequeue())
    }
    this.isPlaying = false
  }

  playAudio(audio) {
    return new Promise(res=>{
      audio.play()
      audio.onended = res
    }) 
  }
  

  enqueue(audio) {
    this.queue.push(audio)
    this.playQueue()
  }

  dequeue() {
    return this.queue.shift()
  }

  isEmpty() {
    return this.queue.length === 0
  }
}


function ChatFields() {

  const [inputText, setInputText] = useState(``);
  const [generatedText, setGeneratedText] = useState(``)
  const audioQueue = new AudioQueue()

  useEffect(() => {
    // Calculate the initial viewport height
    const vh = window.innerHeight * 0.01;
    // Set the CSS variable to the initial height
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Add a listener to the resize event
    window.addEventListener('resize', () => {
      // Recalculate the viewport height after a resize
      const vh = window.innerHeight * 0.01;
      // Update the CSS variable
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }, []);

  const fetchSpeak = async (text) => {
    console.log("fetching speak for text: " + text)
    try {
      let resp = await fetch(`${brain_uri}/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text
        })
      });
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }

      // play the audio response
      const reader = resp.body.getReader();
      let chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream complete");
          break;
        }
        chunks.push(value);
      }
      const blob = new Blob(chunks, {
        type: 'audio/mpeg'
      });
      const audio = new Audio(URL.createObjectURL(blob));
      console.log("playing audio")
      audioQueue.enqueue(audio)

    } catch (e) {
      console.error(e);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let resp = await fetch(`${brain_uri}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText
        })
      });
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }


      const reader = resp.body.getReader();
      let chunks = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream complete");
          break;
        }

        // Look here to split the incoming values based on the key they contain
        let string_value = new TextDecoder("utf-8").decode(value)
        // sometimes we get multiple jsons strings in one chunk
        // like "{a:b}{c:d}", so we split on the "}{" just in case
        // first we insert a newline between the two jsons
        string_value = string_value.replace("}{", "}\n{")
        // then we split on the newline
        let json_strings = string_value.split("\n")

        for (let i = 0; i < json_strings.length; i++) {
          let chunk = JSON.parse(json_strings[i])
          if (Object.keys(chunk).includes("content")) {
            chunks += chunk["content"];
          } else if (Object.keys(chunk).includes("sentence")) {
            fetchSpeak(chunk["sentence"])
          }
          setGeneratedText(chunks);
        }
      }

      // do something with the response data here if necessary
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <FormColumn onSubmit={handleSubmit}>
      <ScrollableDiv>
        <TextSpan>{generatedText}</TextSpan>
      </ScrollableDiv>
      <InputContainer>
        <textarea value={inputText} onChange={e => setInputText(e.target.value)} />
        <button type="submit">Submit</button>
      </InputContainer>
    </FormColumn>
  );
}

export default ChatFields;

let FormColumn = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  /* Define a container for the text content */
  padding: 20px; /* Adds some space around the text */
  max-width: 800px; /* Sets the maximum width for the text */
  margin: 0 auto; /* Centers the container horizontally */

  @media (max-width: 768px) {
    /* Adjusts the container for mobile screens */
    max-width: 100%; /* Allows the text to take up the full width */
    padding-top: calc(env(safe-area-inset-top) + 15px); /* Adds some space around the text */
    padding: 20px; /* Reduces the padding on smaller screens */
  }
`

let TextSpan = styled.span`
  font-size: 1.5rem;
  font-weight: 500;
  color: 'black', 
`

let ScrollableDiv = styled.div`
  overflow: auto; /* Add scroll to this div */
  flex-grow: 1; /* Let it take all the available space */
`;

let InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  position: fixed;
  width: 100%;
  bottom: env(safe-area-inset-bottom);
  background-color: ${yellow_color};
`;