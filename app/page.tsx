"use client";

import { ChangeEvent, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { customAlphabet } from "nanoid";
import { put } from "@vercel/blob";

const Camera = dynamic(() => import("./components/Camera"), { ssr: false });

const headers = new Headers();
headers.append("apikey", "TpoGbTzl7ZzlQm1HxIcVocwDWwigVoVr");

const requestOptions: RequestInit = {
  method: "GET",
  redirect: "follow",
  headers,
};

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
); // 7-character random string

export default function Home() {
  const [recipeText, setRecipeText] = useState<string>("");
  const [sharedUrl, setSharedUrl] = useState<string>("");
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = async (imageDataUrl: string, file: File) => {
    console.log("file", file);

    setCapturedImage(imageDataUrl);
    setShowCamera(false);
    setRecipeText("Detected recipe text will appear here.");

    const filename = `${nanoid()}.${file.type.split("/")[1]}`;

    const { url } = await put(filename, file, {
      access: "public",
    });

    console.log("url", url);
  };

  const handleDetectText = () => {
    fetch(
      `https://api.apilayer.com/image_to_text/url?url=${capturedImage}`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  };

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
