export interface HNComment {
  author: string;
  comment_text: string;
  created_at: string;
  objectID: string;
  parent_id: number;
  points: number | null;
  story_id: number;
  story_title: string;
}

export interface HNSearchResponse {
  hits: HNComment[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

export async function fetchHNComments(query: string = '', timeRange: string = '24h', page: number = 0): Promise<HNSearchResponse> {
  const numericFilters = timeRange === '24h' ? 
    `created_at_i>${Math.floor(Date.now()/1000) - 86400}` : '';
  
  const url = new URL('http://hn.algolia.com/api/v1/search');
  url.searchParams.append('tags', 'comment');
  url.searchParams.append('query', query);
  if (numericFilters) {
    url.searchParams.append('numericFilters', numericFilters);
  }
  url.searchParams.append('page', page.toString());
  url.searchParams.append('hitsPerPage', '100');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch HN comments');
  }
  return response.json();
}
