import React, { useState } from "react";
import Webcam from "react-webcam";
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';  // Import the CSS for Resizable

const WebcamComponent = () => {
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [webcamSize, setWebcamSize] = useState({ width: 128, height: 128 });
  
    const videoConstraints = {
      width: webcamSize.width,
      height: webcamSize.height,
      facingMode: 'user'
    };
  
    const handleResize = (event, { element, size }) => {
      setWebcamSize({ width: size.width, height: size.height });
    };
  
    return (
      <div class="z-50">
        {webcamEnabled ? (
          <Draggable>
            <Resizable width={webcamSize.width} height={webcamSize.height} onResize={handleResize}>
              <div style={{ width: webcamSize.width, height: webcamSize.height }} className="rounded-full overflow-hidden">
                <Webcam 
                  audio={false}
                  height={webcamSize.height}
                  width={webcamSize.width}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMediaError={(error) => alert('Please enable webcam access in your browser settings.')}
                />
              </div>
            </Resizable>
          </Draggable>
        ) : (
          <button onClick={() => setWebcamEnabled(true)}>Enable Webcam</button>
        )}
      </div>
    );
  };

export default WebcamComponent;