"use client";

import { useRef, useState, useEffect } from "react";

export default function Camera({ onCapture }: { onCapture: Function }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  useEffect(() => {
    let stream: any = null;

    async function enableStream() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        console.error("Error accessing the camera", err);
      }
    }

    if (!isStreaming) {
      enableStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, [isStreaming]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context?.drawImage(videoRef.current, 0, 0, 640, 480);
      const imageDataUrl = canvasRef.current.toDataURL("image/jpeg");

      canvasRef.current.toBlob((blob) => {
        let file = new File([blob as Blob], "fileName.jpg", {
          type: "image/jpeg",
        });

        onCapture(imageDataUrl, file);
      }, "image/jpeg");
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto"
      />
      <canvas ref={canvasRef} className="hidden" width="640" height="480" />
      <button
        onClick={capturePhoto}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full"
      >
        Capture
      </button>
    </div>
  );
}
