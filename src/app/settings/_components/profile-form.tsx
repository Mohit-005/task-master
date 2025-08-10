"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfile } from "@/context/ProfileContext"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  avatar: z.string().url({ message: "Please enter a valid URL." }).or(z.string().startsWith("data:image/")).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
    const { profile, setProfile } = useProfile();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            username: profile?.username || '',
            avatar: profile?.avatar || '',
        },
        mode: "onChange",
    })

    React.useEffect(() => {
        if(profile) {
            form.reset({
                username: profile.username || '',
                avatar: profile.avatar || '',
            });
        }
    }, [profile, form]);

    async function onSubmit(data: ProfileFormValues) {
        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile.');
            }

            const updatedProfile = await response.json();
            setProfile(updatedProfile); // Update context with data from server

            toast({
                title: "Profile updated!",
                description: "Your profile has been successfully updated.",
            })
        } catch (error) {
            toast({
                title: 'Error updating profile',
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: 'destructive',
            });
        }
    }

    const handleAvatarChangeClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('avatar', reader.result as string, { shouldValidate: true, shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };


    return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={field.value || undefined} alt={form.getValues('username')} />
                                <AvatarFallback>{form.getValues('username')?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Button type="button" variant="outline" onClick={handleAvatarChangeClick}>
                                Change Avatar
                            </Button>
                            <Input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </FormControl>
                    <FormDescription>
                        Click the button to upload a new profile picture.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Your username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
            {form.formState.isSubmitting ? "Saving..." : "Update profile"}
        </Button>
      </form>
    </Form>
  )
}
