export const getEmbedUrl = (videoId: string): string => {
  // xVideos embed - different domain avoids ISP blocks on eporner/pornhub
  return `https://www.xvideos.com/embedframe/${videoId}`;
};
