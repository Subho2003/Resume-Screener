import LoadingSpinner from "./LoadingSpinner";
import AnalysisResult from "./AnalysisResult";
import FilePreview from './FilePreview';

const CategoryTab = ({
  state,
  setState,
  onSubmit,
  getRootProps,
  getInputProps,
  isDragActive,
  JOB_CATEGORIES,
  loading
}) => {
  const { uploadedFile, previewFile, showContent, result } = state;

  const handleReset = () => {
    setState({
      uploadedFile: null,
      previewFile: null,
      result: {
        message: "",
        jobCategory: "",
        resume: "",
        predictedJobCategory: "",
        missingSkills: [],
        improvementSuggestions: []
      },
      showContent: false
    });
  };

  const handleClearFile = () => {
    setState(prev => ({ ...prev, previewFile: null }));
  };

  const handleShowPreview = () => {
    if (uploadedFile) {
      setState(prev => ({ ...prev, previewFile: uploadedFile }));
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-6 gradient-text">Input Section</h2>
      <div className="gradient-border p-[2px] rounded-lg h-full">
        <div className="bg-white rounded-lg p-4 h-full">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Upload your resume (PDF)...
          </label>
          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all bg-gray-200 ${
              isDragActive ? 'upload-area-hover' : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-900">Drag and drop file here</p>
            <p className="text-sm text-gray-500">Limit 200MB per file • PDF</p>
            {uploadedFile && <p className="text-yellow-700 mt-2">Selected file: {uploadedFile.name}</p>}
          </div>
          {previewFile && <FilePreview file={previewFile} cacheKey={`match-${previewFile.name}-${previewFile.size}`} />}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
              {uploadedFile && (
                <>
                  {previewFile && (
                    <button
                      className="px-4 py-2 text-sm text-white bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded animate-gradient-x"
                      onClick={handleClearFile}
                    >
                      Clear File Preview
                    </button>
                  )}
                  
                  {!previewFile && (
                    <button
                      className="px-4 py-2 text-sm text-white bg-gradient-to-r from-green-400 via-teal-500 to-cyan-700 rounded animate-gradient-x"
                      onClick={handleShowPreview}
                    >
                      Show File Preview
                    </button>
                  )}
                </>
              )}
            </div>
            
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-8">
        <button
          className="px-6 py-3 bg-gradient-to-r from-blue-400 to-pink-700 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 rounded animate-gradient-x"
          onClick={onSubmit}
        >
          Predict Job Category
        </button>
      </div>

      {loading && <LoadingSpinner />}
      <div className="mt-8">
        {showContent && <AnalysisResult catData={result} />}
      </div>


      <div className="flex flex-col items-center">
        {showContent && (
          <button
            className="px-10 py-3 text-lg text-white bg-gradient-to-r from-gray-900 to-yellow-800 rounded-lg mt-8 hover:from-yellow-800 hover:to-gray-900"
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryTab;