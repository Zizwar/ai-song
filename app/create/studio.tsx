"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MusicIcon } from "lucide-react";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
  .object({
    instrumental: z.boolean().default(false),
    customMode: z.boolean().default(false),
    prompt: z.string().optional(),
    title: z.string().optional(),
    lyrics: z.string().optional(),
    tags: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.customMode) {
      if (data.instrumental) {
        if (!data.prompt) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Prompt is required",
            path: ["prompt"],
          });
        }
      } else {
        if (!data.lyrics) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Lyrics is required",
            path: ["lyrics"],
          });
        }
      }
      if (!data.title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Title is required",
          path: ["title"],
        });
      }
      if (!data.tags) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Style is required",
          path: ["tags"],
        });
      }
    } else {
      if (!data.prompt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Prompt is required",
          path: ["prompt"],
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

const Studio = () => {
  const [pending, startTransition] = useTransition();
  const [isCreating, startCreateTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instrumental: false,
      customMode: false,
      prompt: "",
      title: "",
      lyrics: "",
      tags: "",
    },
  });

  const customMode = useWatch({
    control: form.control,
    name: "customMode",
  });
  const instrumental = useWatch({
    control: form.control,
    name: "instrumental",
  });

  const onGenerateLyricsClick = () => {
    form.clearErrors();
    const prompt = form.watch("prompt");
    if (!prompt) {
      form.setError("prompt", { message: "Prompt is required" });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/generate_lyrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });
        const data = await response.json();

        form.setValue("title", data.title);
        form.setValue("lyrics", data.text);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const onSubmit = (data: FormData) => {
    startCreateTransition(async () => {
      console.log(data);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="customMode"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Custom Mode</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your prompt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {customMode && !instrumental && (
          <FormField
            control={form.control}
            name="lyrics"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Lyrics</FormLabel>
                  <Button
                    size={"sm"}
                    type="button"
                    disabled={pending}
                    onClick={onGenerateLyricsClick}
                  >
                    Generate Lyrics
                    {pending && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Button>
                </div>
                <FormControl>
                  <Textarea placeholder="Enter your lyrics" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="instrumental"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Instrumental</FormLabel>
            </FormItem>
          )}
        />
        {customMode && (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Style of Music</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter style of music" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Button type="submit" disabled={isCreating}>
          Create <MusicIcon className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </Form>
  );
};

export default Studio;
