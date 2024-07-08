"use server";

import { customAlphabet } from "nanoid";
import { put } from "@vercel/blob";

const API_KEY = process.env.API_LAYER_KEY as string;

const headers = new Headers();
headers.append("apikey", API_KEY);

const requestOptions: RequestInit = {
  method: "GET",
  redirect: "follow",
  headers,
};

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
); // 7-character random string

export async function getTextfromImage(data: FormData) {
  const file = data.get("file") as File;
  const filename = `${nanoid()}.${file.type.split("/")[1]}`;

  const { url } = await put(filename, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const res = await fetch(
    `https://api.apilayer.com/image_to_text/url?url=${url}`,
    requestOptions
  );

  return await res.json();
}
