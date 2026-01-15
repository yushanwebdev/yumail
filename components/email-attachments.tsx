import { Paperclip, FileText, Image, File, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Attachment = {
  id: string;
  filename: string;
  contentType: string;
};

function getFileIcon(contentType: string) {
  if (contentType.startsWith("image/")) {
    return Image;
  }
  if (
    contentType.includes("pdf") ||
    contentType.includes("document") ||
    contentType.includes("text")
  ) {
    return FileText;
  }
  return File;
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase() || "";
  return ext.length <= 4 ? ext : "";
}

export function EmailAttachments({
  attachments,
  resendId,
}: {
  attachments: Attachment[];
  resendId: string;
}) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <Paperclip className="h-4 w-4" />
        <span>
          {attachments.length} attachment{attachments.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => {
          const FileIcon = getFileIcon(attachment.contentType);
          const extension = getFileExtension(attachment.filename);
          const downloadUrl = `/api/email/attachment/${resendId}/${attachment.id}`;

          return (
            <a
              key={attachment.id}
              href={downloadUrl}
              download={attachment.filename}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto gap-3 px-3 py-2 text-left no-underline"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <FileIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {attachment.filename}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {extension}
                </p>
              </div>
              <Download className="h-4 w-4 shrink-0 text-zinc-400" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
