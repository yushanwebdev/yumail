"use client";

import { useEffect, useRef } from "react";

interface EmailIframeProps {
  html: string;
}

export function EmailIframe({ html }: EmailIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const resizeObserver = new ResizeObserver(() => {
      if (iframe.contentDocument?.body) {
        const height = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = `${height}px`;
      }
    });

    const handleLoad = () => {
      if (iframe.contentDocument?.body) {
        // Set initial height
        const height = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = `${height}px`;

        // Observe for content changes
        resizeObserver.observe(iframe.contentDocument.body);
      }
    };

    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      resizeObserver.disconnect();
    };
  }, [html]);

  // Wrap HTML with base styles for better rendering
  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          a {
            color: #0066cc;
          }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `;

  return (
    <iframe
      ref={iframeRef}
      srcDoc={wrappedHtml}
      sandbox="allow-same-origin"
      className="w-full border-0"
      style={{ minHeight: "200px" }}
      title="Email content"
    />
  );
}
