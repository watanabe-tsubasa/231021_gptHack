import React, { useState, useRef } from 'react';
import '../App.css'

const Recorder: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      chunksRef.current = [];
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className='recorder'>
      <button onClick={startRecording} disabled={recording}>
        録音開始
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        録音停止
      </button>
      {audioURL && (
        <div>
          <audio ref={audioRef} controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
}

export default Recorder;
