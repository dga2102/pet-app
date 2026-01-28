import { X } from "lucide-react";

export default function MedicalRecordViewer({ fileUrl, fileName, onClose }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold truncate">{fileName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full h-auto mx-auto"
            />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] border-0"
              title={fileName}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Preview not available for this file type
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
