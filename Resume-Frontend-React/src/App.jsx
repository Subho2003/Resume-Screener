import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import MatchTab from './MatchTab';
import CategoryTab from './CategoryTab';

const JOB_CATEGORIES = [
  'Accountant', 'Advocate', 'Agriculture', 'Apparel', 'Architecture', 'Arts',
  'Automobile', 'Aviation', 'Banking', 'Blockchain', 'BPO', 'Building and Construction',
  'Business Analyst', 'Civil Engineer', 'Consultant', 'Data Science', 'Database',
  'Designing', 'DevOps', 'Digital Media', 'DotNet Developer', 'Education',
  'Electrical Engineering', 'ETL Developer', 'Finance', 'Food and Beverages',
  'Health and Fitness', 'Human Resources', 'Information Technology', 'Java Developer',
  'Management', 'Mechanical Engineer', 'Network Security Engineer', 'Operations Manager',
  'PMO', 'Public Relations', 'Python Developer', 'React Developer', 'Sales',
  'SAP Developer', 'SQL Developer', 'Testing', 'Web Designing'
];

function App() {
  const [mode, setMode] = useState('match');
  const [loading, setLoading] = useState(false);

  const [matchState, setMatchState] = useState({
    selectedCategory: '',
    uploadedFile: null,
    previewFile: null,
    showContent: false,
    result: {
      atsScore: 0,
      atsSuggestions: [],
      message: '',
      resume: '',
      selectedCategory: ''
    }
  });

  const [categoryState, setCategoryState] = useState({
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

  const toggleMode = () => {
    setMode(prev => (prev === 'match' ? 'category' : 'match'));
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (mode === 'match') {
        setMatchState(prev => ({ ...prev, uploadedFile: file, previewFile: file, showContent: false }));
      } else {
        setCategoryState(prev => ({ ...prev, uploadedFile: file, previewFile: file, showContent: false }));
      }
    }
  }, [mode]);

  const {
    getRootProps: getMatchRootProps,
    getInputProps: getMatchInputProps,
    isDragActive: matchDragActive
  } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 200 * 1024 * 1024,
    multiple: false
  });

  const {
    getRootProps: getCategoryRootProps,
    getInputProps: getCategoryInputProps,
    isDragActive: categoryDragActive
  } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 200 * 1024 * 1024,
    multiple: false
  });

  const handleMatchSubmit = async () => {
    if (!matchState.uploadedFile || !matchState.selectedCategory) {
      alert('Upload a file and select a category');
      return;
    }
    setLoading(true);
    setMatchState(prev => ({ ...prev, showContent: false }));

    const formData = new FormData();
    formData.append('mode', 'match');
    formData.append('jobCategory', matchState.selectedCategory);
    formData.append('resume', matchState.uploadedFile);

    try {
      const atsResponse = await fetch('http://127.0.0.1:5000/resume-ats', {
        method: 'POST',
        body: formData
      });
      const result = await atsResponse.json();
      setMatchState(prev => ({
        ...prev,
        result: {
          atsScore: result.atsScore || 0,
          atsSuggestions: result.atsSuggestions || [],
          message: result.message || '',
          resume: result.resume || '',
          selectedCategory: result.selectedCategory || ''
        },
        showContent: true
      }));
    } catch (error) {
      console.error('Error fetching ATS result:', error);
      alert('Something went wrong while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async () => {
    if (!categoryState.uploadedFile) {
      alert('Please upload a resume!');
      return;
    }
    setLoading(true);
    setCategoryState(prev => ({ ...prev, showContent: false }));

    const formData = new FormData();
    formData.append('mode', 'category');
    formData.append('jobCategory', 'Not Required');
    formData.append('resume', categoryState.uploadedFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/submit', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      const suggResponse = await fetch('http://127.0.0.1:5000/skills-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: result.suggestion || [] })
      });
      const skills_suggs = await suggResponse.json();

      const missingSkills = skills_suggs.skills_response.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.replace(/^[^a-zA-Z0-9]+/, ''));
      const improvementSuggestions = skills_suggs.suggestions_response.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.replace(/^[^a-zA-Z0-9]+/, ''));

      setCategoryState(prev => ({
        ...prev,
        result: {
          message: result.message || "N/A",
          jobCategory: result.jobCategory || 0,
          resume: result.resume || "N/A",
          predictedJobCategory: result.predictedJobCategory || "N/A",
          missingSkills,
          improvementSuggestions
        },
        showContent: true
      }));
    } catch (error) {
      console.error('Error fetching category result:', error);
      alert('Something went wrong while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <header className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg">
            <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Resume Evaluation System</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <p className="text-lg mb-8 text-gray-900 animate-fade-in">
          Welcome to the ATS Resume Evaluation System! Upload your resume and {mode === 'match' ? 'select a job category to get a detailed evaluation of your resume\'s match' : 'get a prediction of suitable job categories based on your resume'}.
        </p>

        <div className="mb-8 flex items-center gap-4">
          <span className={`text-sm font-medium toggle-text ${mode === 'match' ? 'text-cyan-400' : 'text-gray-400'}`}>
            Match Score
          </span>
          <button
            onClick={toggleMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full toggle-switch ${mode === 'category' ? 'bg-purple-500' : 'bg-cyan-500'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white toggle-switch-thumb ${mode === 'category' ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <span className={`text-sm font-medium toggle-text ${mode === 'category' ? 'text-purple-400' : 'text-gray-400'}`}>
            Job Category
          </span>
        </div>

        {mode === 'match' ? (
          <MatchTab
            state={matchState}
            setState={setMatchState}
            onSubmit={handleMatchSubmit}
            getRootProps={getMatchRootProps}
            getInputProps={getMatchInputProps}
            isDragActive={matchDragActive}
            JOB_CATEGORIES={JOB_CATEGORIES}
            loading={loading}
          />
        ) : (
          <CategoryTab
            state={categoryState}
            setState={setCategoryState}
            onSubmit={handleCategorySubmit}
            getRootProps={getCategoryRootProps}
            getInputProps={getCategoryInputProps}
            isDragActive={categoryDragActive}
            JOB_CATEGORIES={JOB_CATEGORIES}
            loading={loading}
          />
        )}

        <footer className="text-sm text-gray-400 mt-12">
          Powered by Bert
        </footer>
      </main>
    </div>
  );
}

export default App;
