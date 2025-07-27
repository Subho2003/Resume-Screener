const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center my-10 space-y-4">
    <div className="relative w-16 h-16 flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      <div className="absolute w-12 h-12 border-4 border-t-transparent border-purple-500 rounded-full animate-spin-reverse"></div>
    </div>
    <p className="text-lg font-medium text-gray-900 animate-pulse">
      Fetching your results... Please wait
    </p>
  </div>
);

export default LoadingSpinner;