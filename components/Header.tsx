
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
        Professional Profile Picture Editor
      </h1>
      <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
        Upload your photo and let our AI create a polished, LinkedIn-ready version while keeping you looking natural and recognizable.
      </p>
    </header>
  );
};

export default Header;
