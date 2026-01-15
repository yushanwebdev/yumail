"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ComposePage() {
  const router = useRouter();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: to.split(",").map((email) => email.trim()),
          subject: subject.trim(),
          text: body.trim(),
          html: `<p>${body.trim().replace(/\n/g, "<br>")}</p>`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send email");
      }

      router.push("/sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    router.back();
  };

  const isValid = to.trim() && subject.trim() && body.trim();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              New Message
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleDiscard}
              >
                <X className="h-4 w-4" />
                Discard
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                onClick={handleSend}
                disabled={!isValid || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Compose Form */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          {/* To Field */}
          <div className="flex items-center border-b border-zinc-100 px-4 dark:border-zinc-800">
            <label className="w-16 shrink-0 text-sm font-medium text-zinc-500">
              To:
            </label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Subject Field */}
          <div className="flex items-center border-b border-zinc-100 px-4 dark:border-zinc-800">
            <label className="w-16 shrink-0 text-sm font-medium text-zinc-500">
              Subject:
            </label>
            <Input
              type="text"
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Body */}
          <div className="min-h-[400px] p-4">
            <textarea
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="h-full min-h-[350px] w-full resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4">
          <p className="text-center text-xs text-zinc-500">
            Tip: Separate multiple recipients with commas
          </p>
        </div>
      </div>
    </div>
  );
}
