

"use client";
import { useEffect, useState } from "react";
import { API } from '@/lib/fetch';
import { Newsfeed } from '@/lib/types';
import { Pin } from 'lucide-react';
import Link from 'next/link';

export default function NewsfeedPage() {
    const [newsfeeds, setNewsfeeds] = useState<Newsfeed[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsfeed = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await API.GetAll('newsfeed', { sort: [['pinned', 'desc'], ['publishDate', 'desc']] });
                if (error) {
                    setError("Failed to load newsfeed.");
                    setNewsfeeds([]);
                } else {
                    const feeds: Newsfeed[] = (data && typeof data === 'object' && 'newsfeeds' in data && Array.isArray((data as any).newsfeeds))
                        ? (data as any).newsfeeds
                        : [];
                    setNewsfeeds(feeds);
                }
            } catch (err) {
                setError("Failed to load newsfeed.");
                setNewsfeeds([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNewsfeed();
    }, []);

    if (loading) {
        return <div className="text-gray-500">Loading newsfeed...</div>;
    }
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }
    if (!newsfeeds.length) {
        return <div className="text-gray-500">No newsfeed items found.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center text-zinc-900 dark:text-zinc-100">Company Newsfeed</h1>
            <ul className="space-y-8">
                {newsfeeds.map((item) => (
                    <Link key={item.id} href={`/newsfeed/${item.id}`} className="block">
                        <li className={`relative border rounded-xl p-6 shadow-lg transition hover:shadow-xl cursor-pointer ${item.pinned ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-500 dark:bg-zinc-900' : 'border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900'}`}>
                            {item.pinned && (
                                <span className="absolute top-4 right-4 flex items-center gap-1 text-xs px-2 py-1 bg-yellow-300 text-yellow-900 rounded font-bold shadow dark:bg-yellow-500 dark:text-yellow-50">
                                    <Pin size={16} className="inline-block text-yellow-900 dark:text-yellow-50" />
                                    Pinned
                                </span>
                            )}
                            {!item.published && (
                                <span className="absolute top-5 right-4 text-xs px-2 py-1 bg-zinc-300 text-zinc-700 rounded font-semibold shadow dark:bg-zinc-700 dark:text-zinc-200">Draft</span>
                            )}
                            <h2 className="text-xl font-semibold mb-2 text-zinc-800 dark:text-zinc-100">{item.title}</h2>
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-xs text-zinc-500 dark:text-zinc-300">By User #{item.authorId}</span>
                                <span className="text-xs text-zinc-400 dark:text-zinc-400">{item.publishDate ? new Date(item.publishDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="text-base text-zinc-700 dark:text-zinc-200 mb-4 leading-relaxed">{item.content}</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {typeof item.tags === 'string'
                                    ? item.tags.split(',').map((tag: string) => (
                                        <span key={tag} className="text-xs bg-zinc-200 text-zinc-700 px-3 py-1 rounded-full font-medium shadow-sm dark:bg-zinc-800 dark:text-zinc-100">#{tag.trim()}</span>
                                    ))
                                    : Array.isArray(item.tags)
                                        ? (item.tags as string[]).map((tag: string) => (
                                            <span key={tag} className="text-xs bg-zinc-200 text-zinc-700 px-3 py-1 rounded-full font-medium shadow-sm dark:bg-zinc-800 dark:text-zinc-100">#{tag.trim()}</span>
                                        ))
                                        : null}
                            </div>
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
}