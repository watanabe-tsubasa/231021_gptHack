import React, { useState, useRef } from 'react';
import '../App.css'

const Recorder: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {

    // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const constraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // const mediaRecorder = new MediaRecorder(stream);

    // MIMEタイプのサポートをチェック
    const mimeType = 'audio/mp4; codecs=mp4a.40.5';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn(`${mimeType} is not supported`);
        // 必要に応じて他のMIMEタイプを試してみるか、デフォルトの設定を使用します。
        return;
    }
    const mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType }); 

    mediaRecorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
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
        <div className="audio-container">
          <audio ref={audioRef} controls src={audioURL}></audio>
          <button>
            結果を送る
          </button>
        </div>
      )}
    </div>
  );
}

export default Recorder;
