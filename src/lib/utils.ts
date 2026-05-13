import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRemoteSessionId = () => {
  let sessionId = sessionStorage.getItem("jarvis_remote_session");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("jarvis_remote_session", sessionId);
  }
  return sessionId;
};
