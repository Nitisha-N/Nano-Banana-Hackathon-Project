
import React from 'react';
import Header from './components/Header';
import ImageWorkspace from './components/ImageWorkspace';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <main className="mt-8">
          <ImageWorkspace />
        </main>
      </div>
    </div>
  );
};

export default App;
