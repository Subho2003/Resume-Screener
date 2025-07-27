import { useState, useEffect } from "react";

const cache = {};

const FilePreview = ({ file, cacheKey }) => {
  const [fileContent, setFileContent] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!file) {
      setFileContent(null);
      setError(null);
      return;
    }

    const key = cacheKey || `${file.name}-${file.size}-${file.lastModified}`;

    if (cache[key]) {
      setFileContent(cache[key]);
      return;
    }

    const extractText = async () => {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:5000/extract-text", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!cancelled) {
          setFileContent(result.text);
          cache[key] = result.text;
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error extracting text:", err);
          setError("Failed to extract text from file");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    extractText();

    // Cleanup: cancel API response handling if effect re-runs
    return () => {
      cancelled = true;
    };
  }, [file, cacheKey]);

  if (!file) {
    return (
      <div className="bg-gray-200 rounded-lg p-4 mt-4">
        <p className="text-gray-900">No file selected</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-200 rounded-lg p-4 mt-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-200 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <span className="ml-2 text-gray-400">Loading preview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-bold mb-2 text-gray-900">File Preview</h3>
      <div className="text-container">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-[500px] overflow-auto p-4 bg-gray-200 rounded">
          {fileContent}
        </pre>
      </div>
    </div>
  );
};

export default FilePreview;