"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Newsfeed } from "@/types";

interface NewsfeedFormProps {
  newsfeed?: Partial<Newsfeed>;
  onSubmit: (data: Partial<Newsfeed>) => void;
  onCancel: () => void;
}

export default function NewsfeedForm({ newsfeed = {}, onSubmit, onCancel }: NewsfeedFormProps) {
  const [title, setTitle] = useState(newsfeed.title || "");
  const [content, setContent] = useState(newsfeed.content || "");
  const [tags, setTags] = useState(
    typeof newsfeed.tags === "string"
      ? newsfeed.tags
      : Array.isArray(newsfeed.tags)
      ? (newsfeed.tags as string[]).join(", ")
      : ""
  );
  const [published, setPublished] = useState(newsfeed.published ?? true);
  const [pinned, setPinned] = useState(newsfeed.pinned ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...newsfeed,
      title,
      content,
      tags,
      published,
      pinned,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <label className="block text-sm font-medium mb-1" htmlFor="content">Content</label>
        <Textarea
          id="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={5}
          required
        />
        <label className="block text-sm font-medium mb-1" htmlFor="tags">Tags (comma separated)</label>
        <Input
          id="tags"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
        <div className="flex items-center gap-4">
          <Switch
            checked={published}
            onCheckedChange={setPublished}
            id="published"
          />
          <label htmlFor="published" className="text-sm">Published</label>
        </div>
        <div className="flex items-center gap-4">
          <Switch
            checked={pinned}
            onCheckedChange={setPinned}
            id="pinned"
          />
          <label htmlFor="pinned" className="text-sm">Pinned</label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="default">Save</Button>
      </div>
    </form>
  );
}
