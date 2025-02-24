import React, { useState, useRef, useEffect } from 'react';

const FacialRecognition = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showDetectButton, setShowDetectButton] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Base URL for API requests - Make sure this matches your Flask server
  const API_BASE_URL = 'http://localhost:5001';
  
  const emotionColors = {
    happy: "bg-green-500",
    sad: "bg-blue-500",
    angry: "bg-red-500",
    fear: "bg-purple-500",
    surprise: "bg-yellow-500",
    neutral: "bg-gray-400",
    disgust: "bg-emerald-500"
  };

  useEffect(() => {
    // Clean up camera resources when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'capture' && !cameraActive) {
      startCamera();
    } else if (activeTab !== 'capture' && cameraActive) {
      stopCamera();
    }
  }, [activeTab]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(`Error accessing camera: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(
        videoRef.current, 
        0, 0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
      
      const imageData = canvasRef.current.toDataURL('image/png');
      setCapturedImage(imageData);
      setShowDetectButton(true);
      setAnalysisResults(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
        setAnalysisResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageSource) => {
    setIsLoading(true);
    
    try {
      let response;
      
      if (imageSource === 'upload') {
        // Handle file upload
        const formData = new FormData();
        const fileInput = fileInputRef.current;
        
        if (fileInput && fileInput.files.length > 0) {
          formData.append('image', fileInput.files[0]);
          
          // Update endpoint to match the Flask server
          response = await fetch(`${API_BASE_URL}/detect_emotion`, {
            method: 'POST',
            body: formData
          });
        } else {
          throw new Error('No image file selected');
        }
      } else if (imageSource === 'capture') {
        // Handle captured image from webcam - update endpoint to match Flask server
        response = await fetch(`${API_BASE_URL}/detect_emotion_base64`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: capturedImage })
        });
      } else {
        throw new Error('Invalid image source');
      }
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      setAnalysisResults(data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAnalysisResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmotionBars = (emotions) => {
    return Object.entries(emotions).map(([emotion, score]) => (
      <div key={emotion} className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{emotion}</span>
          <span className="text-sm font-medium">{score.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${emotionColors[emotion.toLowerCase()] || 'bg-indigo-500'}`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    ));
  };

  const renderResults = () => {
    if (!analysisResults) return null;
    
    if (analysisResults.error) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {analysisResults.error}
        </div>
      );
    }
    
    if (analysisResults.faces.length === 0) {
      return (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          No faces detected in the image.
        </div>
      );
    }
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">
          Detected {analysisResults.faces.length} face(s):
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisResults.faces.map((face, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="font-bold border-b pb-2 mb-3">
                Face {index + 1}
              </div>
              
              {face.error ? (
                <p className="text-red-500">Error analyzing this face: {face.error}</p>
              ) : (
                <>
                  <div className="mb-4">
                    <span className="font-medium">Dominant emotion: </span>
                    <span className="text-lg text-indigo-600">{face.dominant_emotion}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Face position: X={face.position.x}, Y={face.position.y}, 
                    Width={face.position.width}, Height={face.position.height}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">All emotions:</h4>
                    {renderEmotionBars(face.all_emotions)}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-800">Facial Emotion Analysis</h1>
          <p className="text-gray-600 mt-2">
            Detect and analyze emotions in real-time or from uploaded images
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === 'live'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('live')}
          >
            Live Camera
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === 'upload'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Image
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === 'capture'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('capture')}
          >
            Capture Image
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Live Camera Tab */}
          {activeTab === 'live' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Real-time Emotion Detection</h2>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-black">
                {/* Updated to use the correct video feed URL from Flask */}
                <img
                  src={`${API_BASE_URL}/video_feed`}
                  alt="Live video feed"
                  className="w-full max-w-full h-auto"
                />
              </div>
              <p className="mt-4 text-gray-600">
                All detected emotions are displayed directly on the video feed.
              </p>
            </div>
          )}

          {/* Upload Image Tab */}
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload Image for Emotion Analysis</h2>
              
              <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
                  >
                    Choose Image
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    JPG, PNG, or GIF files are accepted
                  </p>
                </div>
                
                {uploadedImage && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      className="max-h-80 rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                
                {uploadedImage && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => analyzeImage('upload')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {isLoading ? 'Analyzing...' : 'Analyze Emotions'}
                    </button>
                  </div>
                )}
              </div>
              
              {activeTab === 'upload' && renderResults()}
            </div>
          )}

          {/* Capture Image Tab */}
          {activeTab === 'capture' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Capture Image for Emotion Analysis</h2>
              
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-black mb-4">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-full max-w-full h-auto"
                  ></video>
                ) : (
                  <div className="h-80 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-500">Camera not active</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mb-6">
                <button
                  onClick={captureImage}
                  disabled={!cameraActive}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  Capture Photo
                </button>
              </div>
              
              <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
              
              {capturedImage && (
                <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex justify-center mb-4">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="max-h-80 rounded-lg border border-gray-300"
                    />
                  </div>
                  
                  {showDetectButton && (
                    <div className="text-center">
                      <button
                        onClick={() => analyzeImage('capture')}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {isLoading ? 'Analyzing...' : 'Analyze Emotions'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'capture' && renderResults()}
            </div>
          )}
        </div>
      </div>

      {/* <div className="mt-8 text-center text-gray-500">
        <p>Powered by DeepFace and OpenCV • Uses Haar Cascade for face detection</p>
      </div> */}
    </div>
  );
};

export default FacialRecognition;