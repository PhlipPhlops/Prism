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
      setGeneratedText(await resp.text());
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
