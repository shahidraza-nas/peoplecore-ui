"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { updateNewsfeed } from "@/actions/newsfeed.action";
import { Newsfeed } from "@/lib/types";
import NewsfeedForm from "@/components/newsfeed/newsfeed-form";

interface EditNewsfeedFormProps {
    newsfeed: Newsfeed;
}

export default function EditNewsfeedForm({ newsfeed }: EditNewsfeedFormProps) {
    const router = useRouter();

    const handleSubmit = async (data: Partial<Newsfeed>) => {
        const response = await updateNewsfeed(newsfeed.id, data);
        if (!response.success) {
            toast.error(response.error || "Failed to update newsfeed post");
            return;
        }
        toast.success("Newsfeed post updated successfully");
        router.push("/newsfeed");
    };

    const handleCancel = () => {
        router.push("/newsfeed");
    };

    return (
        <NewsfeedForm
            newsfeed={newsfeed}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    );
}
