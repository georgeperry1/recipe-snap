"use client";

import { ChangeEvent, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { getTextfromImage } from "./lib/actions";

const Camera = dynamic(() => import("./components/Camera"), { ssr: false });

export default function Home() {
  const [recipeText, setRecipeText] = useState<string>("");
  const [sharedUrl, setSharedUrl] = useState<string>("");
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCapture = async (imageDataUrl: string, file: File) => {
    setLoading(true);
    setCapturedImage(imageDataUrl);
    setShowCamera(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await getTextfromImage(formData);      

      const formattedText = res.all_text.replace(/\n/g, "\n\n");

      setRecipeText(formattedText);
    } catch (error) {
      console.error("Error detecting text", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectText = () => {};

  const handleTextEdit = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setRecipeText(e.target.value);
  };

  const handleSave = () => {
    const tempUrl = `https://yourapp.com/recipe/${Date.now()}`;
    setSharedUrl(tempUrl);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>Recipe Capture App</title>
        <meta name="description" content="Capture and save recipes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Recipe Capture</h1>

        {!showCamera && !capturedImage && (
          <button
            onClick={() => setShowCamera(true)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Open Camera
          </button>
        )}

        {showCamera && <Camera onCapture={handleCapture} />}

        {capturedImage && (
          <div className="mt-4">
            <img
              src={capturedImage}
              alt="Captured recipe"
              className="w-full h-auto"
            />

            <button
              onClick={() => setCapturedImage(null)}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition mt-4"
            >
              Retake Photo
            </button>

            <button
              onClick={() => handleDetectText()}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition mt-2"
            >
              Detect
            </button>
          </div>
        )}

        <textarea
          value={recipeText}
          onChange={handleTextEdit}
          className="w-full h-64 p-2 border rounded-lg resize-none"
          placeholder="Detected recipe text will appear here. Edit as needed."
        />

        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          Save Recipe
        </button>

        {sharedUrl && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <p className="font-semibold">Share your recipe:</p>
            <a href={sharedUrl} className="text-blue-500 break-all">
              {sharedUrl}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
