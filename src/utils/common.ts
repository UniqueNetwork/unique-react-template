import { encodeAddress } from "@polkadot/util-crypto";

export const noop = (): any => {};

export const isYouTubeLink = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return pattern.test(url);
};

interface Categories {
  images: string[];
  audio: string[];
  video: string[];
  youtube: RegExp;
}

export const categorizeFile = (fileOrUrl: string): string => {
  const categories: Categories = {
    images: ["jpg", "jpeg", "png", "gif", "bmp", "tiff"],
    audio: ["mp3", "wav", "aac", "ogg", "flac"],
    video: ["mp4", "avi", "mkv", "mov", "mpeg"],
    youtube:
      /^https?:\/\/(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/.+/,
  };

  function getFileExtension(fileOrUrl: string): string {
    const urlParts: string[] = fileOrUrl.split(".");
    return urlParts[urlParts.length - 1].toLowerCase();
  }

  if (categories.youtube.test(fileOrUrl)) {
    return "youtube";
  }

  const fileExtension: string = getFileExtension(fileOrUrl);

  for (const category in categories) {
    if (category !== "youtube") {
      const categoryList = categories[category as keyof Categories];
      if (Array.isArray(categoryList) && categoryList.includes(fileExtension)) {
        return category;
      }
    }
  }

  return "unknown";
};

export const extractVideoId = (url: string): string => {
  let videoId = "";

  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regExp);

  if (match) {
    videoId = match[1];
  }

  return videoId;
};

export const compareEncodedAddresses = (subAddress1: string, subAddress2: string): boolean => {
  if (!subAddress1 || !subAddress2) return false;

  return encodeAddress(subAddress1) === encodeAddress(subAddress2);
};