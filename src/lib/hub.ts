export const searchVideos = async (query: string = 'all', page: number = 1): Promise<any> => {
  const url = new URL('/api/hub', window.location.origin);
  url.searchParams.set('search', query);
  url.searchParams.set('page', page.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};
