"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Pin, Calendar, User } from "lucide-react";
import Link from "next/link";
import { getNewsfeedById, deleteNewsfeed } from "@/actions/newsfeed.action";
import { Newsfeed } from "@/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function NewsfeedDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [newsfeed, setNewsfeed] = useState<Newsfeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchNewsfeed = async () => {
      setLoading(true);
      const result = await getNewsfeedById(id, ['author']);
      if (result.success && result.data) {
        setNewsfeed(result.data.newsfeed);
      } else {
        toast.error(result.error || "Failed to load newsfeed post");
        router.push("/newsfeed");
      }
      setLoading(false);
    };
    fetchNewsfeed();
  }, [id, router]);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteNewsfeed(Number(id));
    if (result.success) {
      toast.success("Newsfeed post deleted successfully");
      router.push("/newsfeed");
    } else {
      toast.error(result.error || "Failed to delete newsfeed post");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!newsfeed) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/newsfeed">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Newsfeed
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/newsfeed/edit/${id}`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  newsfeed post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-3xl">{newsfeed.title}</CardTitle>
                {newsfeed.pinned && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                    <Pin className="w-3 h-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {!newsfeed.published && (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-4 text-sm">
                {newsfeed.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {newsfeed.author.name}
                  </span>
                )}
                {newsfeed.publishDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(newsfeed.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-base leading-relaxed">
              {newsfeed.content}
            </p>
          </div>

          {newsfeed.tags && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {typeof newsfeed.tags === "string"
                ? newsfeed.tags.split(",").map((tag: string) => (
                    <Badge key={tag.trim()} variant="outline">
                      #{tag.trim()}
                    </Badge>
                  ))
                : Array.isArray(newsfeed.tags)
                ? (newsfeed.tags as string[]).map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))
                : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
