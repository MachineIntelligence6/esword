import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Resizer from "react-image-file-resizer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractTextFromHtml(html: string) {
  return new DOMParser().parseFromString(html, "text/html").documentElement
    .textContent;
}

export const resizeImage = (file: File, maxWidth = 512, maxHeight = 512) =>
  new Promise<string | null>((resolve) => {
    try {
      Resizer.imageFileResizer(
        file,
        maxWidth,
        maxHeight,
        "JPEG",
        100,
        0,
        (uri) => {
          resolve(uri.toString());
        },
        "base64"
      );
    } catch (error) {
      console.log(error);
      resolve(null);
    }
  });

export const debounce = (
  func: (...args: any) => void,
  delay: number | undefined
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: any) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
