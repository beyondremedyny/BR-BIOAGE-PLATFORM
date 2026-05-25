interface LabImageViewerProps {
  imageUrl: string;
  fileName: string;
}

export function LabImageViewer({ imageUrl, fileName }: LabImageViewerProps) {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="sticky top-24 rounded-card border border-borderDark bg-cardDark overflow-hidden">
      <p className="section-label border-b border-borderDark px-4 py-3">Original Report</p>
      <div className="max-h-[70vh] overflow-auto p-2">
        {isPdf ? (
          <iframe
            src={imageUrl}
            title={fileName}
            className="h-[600px] w-full rounded-lg bg-white"
          />
        ) : (
          <img
            src={imageUrl}
            alt={fileName}
            className="w-full rounded-lg object-contain"
          />
        )}
      </div>
    </div>
  );
}
