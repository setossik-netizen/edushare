"use client";

import dynamic from "next/dynamic";

export const PdfViewerLazy = dynamic(
  () => import("@/components/pdf-viewer").then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
        Chargement du lecteur…
      </div>
    ),
  },
);
