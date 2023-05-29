import { useEffect, useState } from 'react';
import { brain_uri } from './globals';
import styled from 'styled-components';

function ChatFields() {

  const [inputText, setInputText] = useState(``);
  const [generatedText, setGeneratedText] = useState(``)

  const fetchSpeak = async (text) => {

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
        console.log("Chunk received")
        console.log(new TextDecoder("utf-8").decode(value));
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
  padding: 1rem;
`
