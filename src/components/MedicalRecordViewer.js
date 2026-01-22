"use client";

import { X, Download, FileIcon, Image as ImageIcon } from "lucide-react";

export default function MedicalRecordViewer({
  fileUrl,
  fileName,
  onClose,
  petId,
}) {
  const isPDF = fileName.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isDocument = /\.(doc|docx|xls|xlsx|txt)$/i.test(fileName);

  // Create proxy download URL for proper file handling
  const getDownloadUrl = () => {
    const params = new URLSearchParams({
      url: fileUrl,
      name: fileName,
    });
    if (petId) {
      params.append("petId", petId);
    }
    return `/api/pets/download?${params.toString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {fileName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={getDownloadUrl()}
              download={fileName}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
              title="Download"
            >
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {isImage ? (
            // Image viewer - directly display images
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
            />
          ) : isPDF || isDocument ? (
            // For PDFs and documents - show preview card with download
            <div className="text-center space-y-6 p-8 bg-white rounded-lg m-4">
              <div className="flex justify-center">
                <div className="w-24 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                  <FileIcon size={48} className="text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isPDF ? "PDF Document" : "Document"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{fileName}</p>
                <p className="text-xs text-gray-500 mb-6">
                  This file cannot be previewed in the browser.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href={getDownloadUrl()}
                  download={fileName}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  <Download size={18} />
                  Download File
                </a>
              </div>
            </div>
          ) : (
            // Fallback for unknown file types
            <div className="text-center space-y-6 p-8 bg-white rounded-lg m-4">
              <div className="flex justify-center">
                <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <FileIcon size={48} className="text-gray-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  File
                </h3>
                <p className="text-sm text-gray-600 mb-4">{fileName}</p>
                <p className="text-xs text-gray-500 mb-6">
                  Preview not available for this file type.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href={getDownloadUrl()}
                  download={fileName}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  <Download size={18} />
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
