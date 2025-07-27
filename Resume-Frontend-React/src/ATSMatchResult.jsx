const ATSMatchResult = ({ result }) => {
  if (!result || !result.atsSuggestions || result.atsSuggestions.length === 0) {
    return null;
  }

  const { selectedCategory, atsSuggestions, atsScore } = result;

  // Extract sections from atsSuggestions
  const missingSkillsStart = atsSuggestions.indexOf("Missing Skills:") + 1;
  const suggestionsStart = atsSuggestions.indexOf("Suggestions:");

  const missingSkills = atsSuggestions.slice(missingSkillsStart, suggestionsStart).filter(skill => skill.trim() !== "");
  const suggestions = atsSuggestions.slice(suggestionsStart + 1).filter(s => s.trim() !== "");

  const showSummaryOnly = missingSkills.length === 0 && suggestions.length === 0;

  if (result.selectedCategory === "Not a resume") {
    return (
      <div className="gradient-border p-[2px] rounded-lg animate-fade-in mt-8">
        <div className="bg-white rounded-lg p-6 flex items-center justify-center min-h-[120px]">
          <p className="text-lg text-red-400 font-semibold text-center">
            The uploaded file does not appear to be a valid resume
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-border p-[2px] rounded-lg animate-fade-in mt-10">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 gradient-text">ATS Match Summary</h2>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md">
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">Selected Job Category</h3>
          </div>
          <div className="ml-9 bg-gray-200 p-4 rounded-lg">
            <p className="text-lg text-cyan-600 font-semibold">{selectedCategory}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-lime-500 rounded-md">
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">ATS Score (Out of 100)</h3>
          </div>
          <div className="ml-9 bg-gray-200 p-4 rounded-lg">
            <p className="text-lg text-green-600 font-semibold">{atsScore}</p>
          </div>
        </div>

        {showSummaryOnly ? (
          <div className="ml-2 mt-4 text-center text-red-500 text-lg font-semibold">
            This resume is not fit for the given Job Category.
          </div>
        ) : (
          <>
            {missingSkills.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-md">
                    <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Missing Skills</h3>
                </div>
                <div className="ml-9 bg-gray-200 p-4 rounded-lg">
                  <ul className="list-disc pl-5 space-y-1">
                    {missingSkills.map((skill, index) => (
                      <li key={index} className="text-gray-900">{skill.replace(/^\*\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-md">
                    <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Improvement Suggestions</h3>
                </div>
                <div className="ml-9 bg-gray-200 p-4 rounded-lg">
                  <ul className="list-disc pl-5 space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-900">{suggestion.replace(/^\*\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ATSMatchResult;
