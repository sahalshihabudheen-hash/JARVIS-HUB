export const searchVideos = async (query: string = 'all', page: number = 1, source: string = 'pornhub'): Promise<any> => {
  const url = new URL('/api/adult', window.location.origin);
  url.searchParams.set('search', query);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('source', source);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};
