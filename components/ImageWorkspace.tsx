import React, { useState, useCallback } from 'react';
import { enhanceProfilePicture } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { UploadIcon, SparklesIcon, DownloadIcon } from './icons';

const LoadingOverlay: React.FC = () => {
    const messages = [
        "Polishing your photo...",
        "Adjusting brightness and contrast...",
        "Smoothing skin tones naturally...",
        "Minimizing flyaways...",
        "Creating a professional background...",
        "Applying the finishing touches...",
    ];

    const [message, setMessage] = useState(messages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-80 backdrop-blur-sm flex flex-col justify-center items-center z-20 rounded-lg">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-200 transition-opacity duration-500">{message}</p>
        </div>
    );
};

const ImageWorkspace: React.FC = () => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [backgroundStyle, setBackgroundStyle] = useState<string>('AI Choice');
    const [adjustBrightness, setAdjustBrightness] = useState<boolean>(true);
    const [smoothSkin, setSmoothSkin] = useState<boolean>(true);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file (PNG, JPG, etc.).');
                return;
            }
            setOriginalFile(file);
            setOriginalImagePreview(URL.createObjectURL(file));
            setEditedImage(null);
            setError(null);
        }
    };

    const handleEnhanceClick = useCallback(async () => {
        if (!originalFile) return;

        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const base64String = await fileToBase64(originalFile);
            const resultImage = await enhanceProfilePicture(
                base64String, 
                originalFile.type, 
                backgroundStyle,
                adjustBrightness,
                smoothSkin
            );
            setEditedImage(resultImage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [originalFile, backgroundStyle, adjustBrightness, smoothSkin]);

    const resetWorkspace = () => {
        setOriginalFile(null);
        setOriginalImagePreview(null);
        setEditedImage(null);
        setError(null);
        setIsLoading(false);
    };

    const resetFineTuneAdjustments = () => {
        setAdjustBrightness(true);
        setSmoothSkin(true);
    };

    if (!originalImagePreview) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-8 text-center flex flex-col items-center justify-center h-80 hover:border-blue-500 transition-colors duration-300">
                <UploadIcon className="w-16 h-16 text-gray-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-200">Upload Your Photo</h2>
                <p className="text-gray-400 mt-2">Drag and drop or click to select a file.</p>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="image/*"
                />
                {error && <p className="mt-4 text-red-400">{error}</p>}
            </div>
        );
    }

    const backgroundOptions = ['AI Choice', 'Office', 'Modern', 'Textured'];

    return (
        <div className="w-full">
            {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 max-w-4xl mx-auto" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto relative">
                {isLoading && <LoadingOverlay />}
                {/* Original Image */}
                <div className="flex flex-col items-center bg-gray-800 p-4 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-300 mb-4">Before</h3>
                    <div className="w-full aspect-square bg-gray-700 rounded-lg overflow-hidden flex justify-center items-center">
                        <img src={originalImagePreview} alt="Original" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Edited Image */}
                <div className="flex flex-col items-center bg-gray-800 p-4 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-300 mb-4">After</h3>
                    <div className="w-full aspect-square bg-gray-700 rounded-lg overflow-hidden flex justify-center items-center">
                        {editedImage ? (
                            <img src={editedImage} alt="Edited" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-500">Your enhanced photo will appear here</div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center max-w-6xl mx-auto">
              <h4 className="text-lg font-semibold text-gray-300 mb-3">Choose a Background Style</h4>
              <div className="flex justify-center flex-wrap gap-3">
                  {backgroundOptions.map(style => (
                      <button
                          key={style}
                          onClick={() => setBackgroundStyle(style)}
                          className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                              backgroundStyle === style
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                      >
                          {style}
                      </button>
                  ))}
              </div>
            </div>

            <div className="mt-6 text-center max-w-2xl mx-auto p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-300">Fine-Tune Adjustments</h4>
                    <button
                        onClick={resetFineTuneAdjustments}
                        className="px-3 py-1 text-xs font-medium text-indigo-300 bg-indigo-900/50 rounded-md hover:bg-indigo-900 transition-colors"
                        aria-label="Reset fine-tune adjustments to default"
                    >
                        Reset Adjustments
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-4 sm:gap-8">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={adjustBrightness}
                            onChange={(e) => setAdjustBrightness(e.target.checked)}
                            className="w-5 h-5 bg-gray-600 border-gray-500 rounded text-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition"
                        />
                        <span className="text-gray-300 group-hover:text-white transition">Adjust Brightness & Contrast</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={smoothSkin}
                            onChange={(e) => setSmoothSkin(e.target.checked)}
                            className="w-5 h-5 bg-gray-600 border-gray-500 rounded text-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition"
                        />
                        <span className="text-gray-300 group-hover:text-white transition">Subtle Skin Smoothing</span>
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    For best results, use adjustments subtly to maintain a natural look.
                </p>
            </div>


            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                 <button
                    onClick={handleEnhanceClick}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    <SparklesIcon className="w-6 h-6" />
                    {isLoading ? 'Enhancing...' : 'Enhance Photo'}
                </button>

                {editedImage && (
                    <a
                        href={editedImage}
                        download="professional_profile_picture.png"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        <DownloadIcon className="w-6 h-6" />
                        Download
                    </a>
                )}
                 <button
                    onClick={resetWorkspace}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                    Upload Another
                </button>
            </div>
        </div>
    );
};

export default ImageWorkspace;