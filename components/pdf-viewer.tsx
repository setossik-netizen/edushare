"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PdfViewerProps = {
  src: string;
  /** Maximum number of pages the user is allowed to read (null = all). */
  maxPages?: number | null;
  className?: string;
};

export function PdfViewer({ src, maxPages = null, className }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const allowedPages = maxPages ? Math.min(maxPages, numPages ?? maxPages) : numPages ?? 1;
  const canGoPrev = pageNumber > 1;
  const canGoNext = pageNumber < allowedPages;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={!canGoPrev}
            aria-label="Page précédente"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <span className="min-w-20 text-center text-sm tabular-nums">
            {numPages ? `${pageNumber} / ${allowedPages}` : "…"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setPageNumber((page) => Math.min(allowedPages, page + 1))}
            disabled={!canGoNext}
            aria-label="Page suivante"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale((value) => Math.max(0.6, value - 0.15))}
            aria-label="Zoom arrière"
          >
            <ZoomOut aria-hidden="true" />
          </Button>
          <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(scale * 100)} %
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale((value) => Math.min(2.5, value + 0.15))}
            aria-label="Zoom avant"
          >
            <ZoomIn aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border bg-muted/30 p-3">
        <div className="mx-auto w-fit">
          <Document
            file={src}
            onLoadSuccess={({ numPages: pages }) => {
              setNumPages(pages);
            }}
            onLoadError={(err) => {
              setError(err?.message ?? "Impossible de charger le document.");
            }}
            loading={
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Chargement du document…
              </div>
            }
            error={
              <div className="flex h-64 items-center justify-center text-sm text-destructive">
                {error ?? "Impossible de charger le document."}
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
              className="shadow-sm"
            />
          </Document>
        </div>
      </div>

      {maxPages && numPages && numPages > maxPages ? (
        <p className="text-center text-xs text-muted-foreground">
          Aperçu limité aux {maxPages} premières pages.
        </p>
      ) : null}
    </div>
  );
}
