"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NewsfeedForm from "@/components/newsfeed/newsfeed-form";
import { createNewsfeed } from "@/actions/newsfeed.action";
import { Newsfeed } from "@/types";

export default function CreateNewsfeedForm() {
    const router = useRouter();

    const handleSubmit = async (data: Partial<Newsfeed>) => {
        const result = await createNewsfeed(data);
        if (result.success) {
            toast.success("Newsfeed post created successfully");
            router.push("/newsfeed");
        } else {
            toast.error(result.error || "Failed to create newsfeed post");
        }
    };

    const handleCancel = () => {
        router.push("/newsfeed");
    };

    return (
        <NewsfeedForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    );
}
