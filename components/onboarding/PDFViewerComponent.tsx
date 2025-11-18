'use client'

import { Worker, Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { Loader2 } from 'lucide-react'

interface PDFViewerComponentProps {
  fileUrl: string
}

export default function PDFViewerComponent({ fileUrl }: PDFViewerComponentProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],  // Hide sidebar
    toolbarPlugin: {
      fullScreenPlugin: {
        onEnterFullScreen: () => {
          document.documentElement.style.overflow = 'hidden';
        },
        onExitFullScreen: () => {
          document.documentElement.style.overflow = 'auto';
        },
      },
    },
  });

  return (
    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
      <Viewer
        fileUrl={fileUrl}
        plugins={[defaultLayoutPluginInstance]}
        defaultScale={1}
        renderLoader={(percentages) => (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
      />
    </Worker>
  );
}