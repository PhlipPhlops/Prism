import { useEffect, useState } from 'react';
import { brain_uri } from './globals';
import styled from 'styled-components';

function ChatFields() {

  const [inputText, setInputText] = useState(``);
  const [generatedText, setGeneratedText] = useState(``)

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
        chunks += new TextDecoder("utf-8").decode(value);
        setGeneratedText(chunks);
        
        // // You may want to process chunks here
        // // For instance, if your server is streaming JSON objects separated by newline
        // // You can check if there is a complete JSON object in the chunks string,
        // // parse it and then remove it from the string
        // const newlineIndex = chunks.indexOf('\n');
        // if (newlineIndex !== -1) {
        //   const message = JSON.parse(chunks.slice(0, newlineIndex));
        //   chunks = chunks.slice(newlineIndex + 1);
        //   // Now you can do something with the message
        //   console.log(message);
        // }
      }

      // do something with the response data here if necessary
    } catch (e) {
      console.error(`brain_uri: ${brain_uri}`);
      console.error(e);
    }
  };

  return (
    <FormColumn onSubmit={handleSubmit}>
        <textarea value={inputText} onChange={e => setInputText(e.target.value)} />
        <button type="submit">Submit</button>
        <span>{generatedText}</span>
    </FormColumn>
  );
}

export default ChatFields;

let FormColumn = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
