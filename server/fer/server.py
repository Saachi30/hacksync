import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, render_template, Response
from deepface import DeepFace
import base64
from PIL import Image
import io

# Initialize Flask app
app = Flask(__name__)

# Global variables
face_cascade = None

def load_resources():
    """Load the face cascade classifier"""
    global face_cascade
    
    # Load the face cascade
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    print("Resources loaded successfully!")

@app.route('/')
def index():
    """Render the main page with webcam access"""
    return render_template('index.html')

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    """API endpoint to detect emotion from an uploaded image"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    # Get the file
    file = request.files['image']
    
    # Read the image
    img = Image.open(file.stream)
    img = np.array(img)
    
    # If the image is not in BGR format (common when uploaded from web), convert it
    if len(img.shape) == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    
    # Process the image
    results = process_image(img)
    
    return jsonify(results)

@app.route('/detect_emotion_base64', methods=['POST'])
def detect_emotion_base64():
    """API endpoint to detect emotion from a base64 encoded image"""
    data = request.json
    
    if 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400
    
    # Decode the base64 image
    try:
        encoded_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Process the image
        results = process_image(img)
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/video_feed')
def video_feed():
    """Video streaming endpoint for real-time emotion detection"""
    return Response(generate_frames(), 
                    mimetype='multipart/x-mixed-replace; boundary=frame')

def generate_frames():
    """Generator function for streaming video frames"""
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        yield (b'--frame\r\n'
               b'Content-Type: text/plain\r\n\r\n'
               b'Failed to open webcam\r\n')
        return
    
    while True:
        success, frame = cap.read()
        if not success:
            break
            
        # Process the frame for emotion detection
        results = process_image(frame, draw=True)
        
        # Encode the processed frame to JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        # Yield the frame in the response
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    
    cap.release()

def process_image(frame, draw=False):
    """Process an image to detect faces and emotions using DeepFace"""
    if frame is None:
        return {'error': 'Invalid image'}
    
    # Convert the frame to grayscale for face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    results = {'faces': []}
    
    # Process each detected face
    for (x, y, w, h) in faces:
        # Extract the face region
        face_roi = frame[y:y + h, x:x + w]
        
        try:
            # Use DeepFace to analyze emotions
            analysis = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            
            # Extract emotion data from the analysis
            emotions = analysis[0]['emotion']
            dominant_emotion = analysis[0]['dominant_emotion']
            
            # Create a result dictionary for this face
            face_result = {
                'position': {'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)},
                'dominant_emotion': dominant_emotion,
                'all_emotions': emotions
            }
            
            results['faces'].append(face_result)
            
            # Draw on the frame if requested
            if draw:
                # Draw a rectangle around the face
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
                
                # Draw emotion labels with percentages
                y_offset = y - 10
                for i, (emotion, score) in enumerate(emotions.items()):
                    # Format the text with the emotion name and score percentage
                    text = f"{emotion}: {score:.1f}%"
                    
                    # Different position for each emotion to avoid overlap
                    cv2.putText(frame, text, 
                                (x, y_offset - (i * 20)), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, 
                                (0, 0, 255), 1)
                
                # Draw a more prominent label for the dominant emotion
                cv2.putText(frame, f"{dominant_emotion}", 
                            (x + w + 10, y + h // 2), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, 
                            (0, 255, 0), 2)
        
        except Exception as e:
            print(f"Error during face analysis: {e}")
            # Still include the face in results, but mark as failed analysis
            face_result = {
                'position': {'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)},
                'error': str(e)
            }
            results['faces'].append(face_result)
            
            # Draw the face with an error indicator
            if draw:
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
                cv2.putText(frame, "Analysis failed", 
                            (x, y - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, 
                            (0, 0, 255), 2)
    
    return results

if __name__ == '__main__':
    load_resources()
    
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    # Create a simple HTML template for the index page
    with open('templates/index.html', 'w', encoding='utf-8') as f:
        f.write("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Enhanced Emotion Detection</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                    background-color: #f5f5f5;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    max-width: 900px;
                    margin: 0 auto;
                    background-color: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 15px rgba(0,0,0,0.1);
                }
                header {
                    margin-bottom: 20px;
                    width: 100%;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }
                .video-container {
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                    padding: 10px;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                .video-container img, .video-container video {
                    border-radius: 5px;
                }
                .upload-container {
                    margin-top: 20px;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    width: 90%;
                }
                .results {
                    margin-top: 20px;
                    padding: 15px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    text-align: left;
                    min-height: 100px;
                    max-width: 600px;
                    width: 100%;
                    background-color: white;
                }
                button {
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.3s;
                }
                button:hover {
                    background-color: #45a049;
                }
                input[type="file"] {
                    margin: 10px 0;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                h1 {
                    color: #333;
                    margin-bottom: 5px;
                }
                h2 {
                    color: #333;
                    font-size: 1.4em;
                    margin-bottom: 15px;
                }
                .subtitle {
                    color: #666;
                    margin-top: 0;
                }
                .tabs {
                    display: flex;
                    margin-bottom: 20px;
                    width: 100%;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .tab {
                    flex: 1;
                    padding: 12px 15px;
                    cursor: pointer;
                    background-color: #f1f1f1;
                    border: 1px solid #ccc;
                    transition: all 0.3s;
                    text-align: center;
                    font-weight: bold;
                }
                .tab:hover {
                    background-color: #e7e7e7;
                }
                .tab.active {
                    background-color: #4CAF50;
                    color: white;
                    border-color: #4CAF50;
                }
                .tab-content {
                    display: none;
                    width: 100%;
                }
                .tab-content.active {
                    display: block;
                }
                .emotion-bar {
                    height: 20px;
                    background-color: #4CAF50;
                    margin: 5px 0;
                    border-radius: 3px;
                }
                .emotion-item {
                    margin-bottom: 8px;
                }
                .preview-container {
                    margin: 15px 0;
                    max-width: 100%;
                }
                .preview-container img {
                    max-width: 100%;
                    max-height: 400px;
                    border-radius: 5px;
                    border: 1px solid #ddd;
                }
                footer {
                    margin-top: 30px;
                    color: #666;
                    font-size: 0.9em;
                }
                .emotion-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 15px;
                    margin-top: 10px;
                }
                .face-result {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    background-color: #f9f9f9;
                }
                .face-header {
                    font-weight: bold;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
                    margin-bottom: 10px;
                }
                .loading {
                    display: none;
                    text-align: center;
                    margin: 10px 0;
                }
                .loading::after {
                    content: "Processing...";
                    color: #666;
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>Advanced Facial Emotion Analysis</h1>
                    <p class="subtitle">Detect and analyze emotions in real-time or from uploaded images</p>
                </header>
                
                <div class="tabs">
                    <div class="tab active" onclick="openTab(event, 'liveTab')">Live Camera</div>
                    <div class="tab" onclick="openTab(event, 'uploadTab')">Upload Image</div>
                    <div class="tab" onclick="openTab(event, 'captureTab')">Capture Image</div>
                </div>
                
                <div id="liveTab" class="tab-content active">
                    <h2>Real-time Emotion Detection</h2>
                    <div class="video-container">
                        <img src="{{ url_for('video_feed') }}" width="640" height="480" alt="Live video feed">
                    </div>
                    <p>All detected emotions are displayed directly on the video feed.</p>
                </div>
                
                <div id="uploadTab" class="tab-content">
                    <h2>Upload Image for Emotion Analysis</h2>
                    <div class="upload-container">
                        <input type="file" id="imageUpload" accept="image/*">
                        <button onclick="uploadImage()">Analyze Emotions</button>
                        <div id="uploadLoading" class="loading"></div>
                    </div>
                    <div id="uploadPreview" class="preview-container"></div>
                    <div id="uploadResults" class="results"></div>
                </div>
                
                <div id="captureTab" class="tab-content">
                    <h2>Capture Image for Emotion Analysis</h2>
                    <div class="video-container">
                        <video id="video" width="640" height="480" autoplay></video>
                    </div>
                    <button id="captureButton">Capture Photo</button>
                    <div class="upload-container">
                        <canvas id="canvas" width="640" height="480" style="display: none;"></canvas>
                        <div id="capturePreview" class="preview-container"></div>
                        <button id="detectButton" style="display: none;">Analyze Emotions</button>
                        <div id="captureLoading" class="loading"></div>
                    </div>
                    <div id="captureResults" class="results"></div>
                </div>
                
                <footer>
                    <p>Powered by DeepFace and OpenCV • Uses Haar Cascade for face detection</p>
                </footer>
            </div>
            
            <script>
                function openTab(evt, tabName) {
                    var i, tabcontent, tabs;
                    tabcontent = document.getElementsByClassName("tab-content");
                    for (i = 0; i < tabcontent.length; i++) {
                        tabcontent[i].className = tabcontent[i].className.replace(" active", "");
                    }
                    tabs = document.getElementsByClassName("tab");
                    for (i = 0; i < tabs.length; i++) {
                        tabs[i].className = tabs[i].className.replace(" active", "");
                    }
                    document.getElementById(tabName).className += " active";
                    evt.currentTarget.className += " active";
                    
                    // If switching to capture tab, start the camera
                    if (tabName === 'captureTab') {
                        startCamera();
                    }
                }
                
                function uploadImage() {
                    const fileInput = document.getElementById('imageUpload');
                    if (fileInput.files.length === 0) {
                        alert('Please select an image to upload');
                        return;
                    }
                    
                    const file = fileInput.files[0];
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    // Show preview
                    const preview = document.getElementById('uploadPreview');
                    preview.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.alt = "Uploaded image preview";
                    preview.appendChild(img);
                    
                    // Show loading indicator
                    document.getElementById('uploadLoading').style.display = 'block';
                    document.getElementById('uploadResults').innerHTML = '';
                    
                    // Send to API
                    fetch('/detect_emotion', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Hide loading indicator
                        document.getElementById('uploadLoading').style.display = 'none';
                        displayResults(data, 'uploadResults');
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        document.getElementById('uploadLoading').style.display = 'none';
                        document.getElementById('uploadResults').innerHTML = 'Error: ' + error;
                    });
                }
                
                function startCamera() {
                    const video = document.getElementById('video');
                    const captureButton = document.getElementById('captureButton');
                    const canvas = document.getElementById('canvas');
                    const detectButton = document.getElementById('detectButton');
                    const preview = document.getElementById('capturePreview');
                    
                    // Clear previous results
                    document.getElementById('captureResults').innerHTML = '';
                    preview.innerHTML = '';
                    detectButton.style.display = 'none';
                    
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(stream => {
                            video.srcObject = stream;
                        })
                        .catch(err => {
                            console.error('Error accessing camera:', err);
                            alert('Error accessing camera: ' + err.message);
                        });
                    
                    captureButton.addEventListener('click', () => {
                        // Draw the current video frame to the canvas
                        const context = canvas.getContext('2d');
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        
                        // Show the captured image
                        preview.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = canvas.toDataURL('image/png');
                        img.alt = "Captured image preview";
                        preview.appendChild(img);
                        
                        // Show the detect button
                        detectButton.style.display = 'inline-block';
                        
                        // Clear previous results
                        document.getElementById('captureResults').innerHTML = '';
                    });
                    
                    detectButton.addEventListener('click', () => {
                        const imageData = canvas.toDataURL('image/png');
                        
                        // Show loading indicator
                        document.getElementById('captureLoading').style.display = 'block';
                        
                        // Send to API
                        fetch('/detect_emotion_base64', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ image: imageData })
                        })
                        .then(response => response.json())
                        .then(data => {
                            // Hide loading indicator
                            document.getElementById('captureLoading').style.display = 'none';
                            displayResults(data, 'captureResults');
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            document.getElementById('captureLoading').style.display = 'none';
                            document.getElementById('captureResults').innerHTML = 'Error: ' + error;
                        });
                    });
                }
                
                function displayResults(data, elementId) {
                    const resultsElement = document.getElementById(elementId);
                    
                    if (data.error) {
                        resultsElement.innerHTML = `<p>Error: ${data.error}</p>`;
                        return;
                    }
                    
                    if (data.faces.length === 0) {
                        resultsElement.innerHTML = '<p>No faces detected in the image.</p>';
                        return;
                    }
                    
                    let html = `<p>Detected ${data.faces.length} face(s):</p>`;
                    
                    data.faces.forEach((face, index) => {
                        html += `<div class="face-result">
                            <div class="face-header">Face ${index + 1}</div>`;
                        
                        if (face.error) {
                            html += `<p>Error analyzing this face: ${face.error}</p>`;
                        } else {
                            html += `<p>Dominant emotion: <strong>${face.dominant_emotion}</strong></p>
                            <p>Face position: X=${face.position.x}, Y=${face.position.y}, Width=${face.position.width}, Height=${face.position.height}</p>
                            <p>All emotions:</p>`;
                            
                            // Create emotion bars
                            html += `<div class="emotion-grid">`;
                            Object.entries(face.all_emotions).forEach(([emotion, score]) => {
                                // Calculate width based on score (percentage)
                                const barWidth = score;
                                html += `<div class="emotion-item">
                                    <div>${emotion}: ${score.toFixed(1)}%</div>
                                    <div class="emotion-bar" style="width: ${barWidth}%;"></div>
                                </div>`;
                            });
                            html += `</div>`;
                        }
                        
                        html += `</div>`;
                    });
                    
                    resultsElement.innerHTML = html;
                }
                
                // Initialize the default tab
                document.addEventListener('DOMContentLoaded', function() {
                    // If on capture tab, start camera automatically
                    if (document.getElementById('captureTab').classList.contains('active')) {
                        startCamera();
                    }
                });
            </script>
        </body>
        </html>
        """)
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5001)