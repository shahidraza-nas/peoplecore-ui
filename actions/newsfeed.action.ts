import { API } from '@/lib/fetch';
import { Newsfeed } from '@/lib/types';

export async function getAllNewsfeed(): Promise<Newsfeed[]> {
    const { data, error } = await API.GetAll('newsfeed', { sort: [['pinned', 'desc'], ['publishDate', 'desc']] });
    if (error) return [];
    if (Array.isArray(data)) return data as Newsfeed[];
    if (typeof data === 'object' && data !== null && 'newsfeeds' in data) return (data as { newsfeeds: Newsfeed[] }).newsfeeds;
    return [];
}

export async function getNewsfeedById(id: number): Promise<Newsfeed | null> {
    const { data, error } = await API.GetById('newsfeed', id);
    if (error || !data) return null;
    return data as Newsfeed;
}
