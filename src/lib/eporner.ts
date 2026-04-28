import { searchVideos } from "./hub";

export const searchEpornerVideos = async (query: string = 'all', page: number = 1) => {
  return searchVideos(query, page, 'eporner');
};
