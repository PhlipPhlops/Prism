import ChatFields from './ChatFields'
import styled from 'styled-components';
import { useEffect } from 'react';

function App() {

  // Set the theme color so it looks like a unified color on ios
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    // Create a new tag if doesn't exist
    if (!meta) {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      // Set the color
      newMeta.content = '#ffff00'; // yellow
      document.getElementsByTagName('head')[0].appendChild(newMeta);
    } else {
      // Change the color if the tag already exists
      meta.setAttribute('content', '#ffff00'); // yellow
    }
  }, []);

  // Inject metatags to prevent unwanted zooming on mobile devices
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    meta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(meta);
  })
    
  return (
    <StyledApp>
      <Spacer/>
      <ChatFields/>
    </StyledApp>
  );
}

export default App;

const StyledApp = styled.div`
  /* text-align: center; */
  /* background-color: #282c34; */
  background-color: yellow;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* justify-content: center; */
  font-size: calc(10px + 2vmin);
  color: black;
`

const Spacer = styled.div`
  height: 1vh;
`