from flask import Flask, request, jsonify, Response
import tensorflow as tf
import numpy as np
import pickle
import json
import re
from tensorflow.keras.preprocessing.sequence import pad_sequences
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
model = tf.keras.models.load_model("keyword_emotion_model.h5")

# Load the tokenizer
with open("tokenizer.pickle", "rb") as handle:
    tokenizer = pickle.load(handle)

# Load mood labels
with open("mood_labels.json", "r") as f:
    mood_labels = json.load(f)

# Load test examples for reference
with open("test_examples.json", "r") as f:
    test_examples = json.load(f)

# Create lists of keywords for each emotion category
emotion_keywords = {
    "Happy": [
        "happy", "joy", "excited", "thrilled", "delighted", "cheerful", "ecstatic", 
        "glad", "content", "pleased", "wonderful", "fantastic", "great", "amazing",
        "enjoy", "loving", "fun", "good", "positive", "awesome", "blessed", "grateful"
    ],
    "Sad": [
        "sad", "unhappy", "depressed", "gloomy", "miserable", "downcast", "blue",
        "melancholy", "heartbroken", "disappointed", "upset", "hurt", "lost", "lonely",
        "hopeless", "despair", "grief", "sorrow", "crying", "tears", "devastated", "broken"
    ],
    "Angry": [
        "angry", "mad", "furious", "outraged", "irritated", "annoyed", "frustrated",
        "enraged", "seething", "hostile", "bitter", "resentful", "hatred", "hate", 
        "rage", "livid", "fuming", "pissed", "aggravated", "irate", "infuriated", "disgusted"
    ],
    "Anxious": [
        "anxious", "worried", "nervous", "afraid", "scared", "fearful", "stressed",
        "uneasy", "tense", "apprehensive", "panic", "dread", "overwhelmed", "terrified", 
        "freaking", "paranoid", "alarmed", "concerned", "restless", "jittery", "troubled", "distressed"
    ],
    "Neutral": [
        "neutral", "fine", "okay", "alright", "normal", "average", "moderate", 
        "ordinary", "indifferent", "neither", "impartial", "balanced", "standard", "regular",
        "common", "typical", "bland", "plain", "mediocre", "fair", "usual", "so-so"
    ]
}

def extract_emotions_from_text(text):
    """
    Extract emotion keywords from text and count occurrences
    Returns emotion counts and a list of found keywords
    """
    text = text.lower()
    emotion_counts = {mood: 0 for mood in mood_labels}
    found_keywords = []
    
    # Split text into words and check each word against emotion keywords
    words = re.findall(r'\b\w+\b', text)
    
    for word in words:
        for emotion, keywords in emotion_keywords.items():
            if word in keywords:
                emotion_counts[emotion] += 1
                found_keywords.append({"word": word, "emotion": emotion})
    
    return emotion_counts, found_keywords

def get_keyword_predictions(text):
    """
    Extract keywords from text and analyze them individually
    """
    words = re.findall(r'\b\w+\b', text.lower())
    results = []
    
    for word in words:
        # Convert word to sequence
        sequences = tokenizer.texts_to_sequences([word])
        
        # Skip empty sequences (words not in vocabulary)
        if not sequences[0]:
            continue
            
        padded = pad_sequences(sequences, maxlen=5, padding='post', truncating='post')
        
        # Make prediction
        prediction = model.predict(padded, verbose=0)
        
        # Get the emotion index and confidence
        emotion_index = np.argmax(prediction[0])
        confidence = float(prediction[0][emotion_index])
        
        # Only include if confidence is above threshold
        if confidence > 0.4:
            results.append({
                "word": word,
                "emotion": mood_labels[emotion_index],
                "confidence": round(confidence * 100, 1)
            })
    
    return results

@app.route("/api/predict_mood", methods=["POST"])
def predict_mood():
    try:
        data = request.json
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Extract emotion keywords
        emotion_counts, found_keywords = extract_emotions_from_text(text)
        
        # Get keyword-specific predictions
        keyword_predictions = get_keyword_predictions(text)
        
        # Combine keyword counting with model predictions
        # If no keywords found, use model prediction for entire text
        if sum(emotion_counts.values()) == 0:
            sequences = tokenizer.texts_to_sequences([text])
            padded = pad_sequences(sequences, maxlen=5, padding='post', truncating='post')
            prediction = model.predict(padded)
            
            # Get the mood index and confidence
            mood_index = np.argmax(prediction[0])
            confidence = float(prediction[0][mood_index])
            primary_mood = mood_labels[mood_index]
            
            # Get confidence scores for all moods
            mood_scores = {mood_labels[i]: float(prediction[0][i]) for i in range(len(mood_labels))}
        else:
            # Determine primary mood based on keyword count
            primary_mood = max(emotion_counts.items(), key=lambda x: x[1])[0]
            total_keywords = sum(emotion_counts.values())
            mood_scores = {mood: count/total_keywords for mood, count in emotion_counts.items()}
            confidence = mood_scores[primary_mood]
        
        # Sort mood scores in descending order
        sorted_scores = sorted(mood_scores.items(), key=lambda x: x[1], reverse=True)
        
        return jsonify({
            "primary_mood": primary_mood,
            "confidence": confidence,
            "emotion_counts": emotion_counts,
            "found_keywords": found_keywords,
            "keyword_predictions": keyword_predictions,
            "mood_ranking": [{"mood": m, "score": round(s * 100, 1)} for m, s in sorted_scores]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Compatibility endpoint for the diary application.
    This endpoint will continue to work with the existing diary app structure.
    """
    try:
        data = request.json
        diary_text = data.get("diaryText", "")
        
        # Extract emotions if diary text is provided
        if diary_text:
            emotion_counts, _ = extract_emotions_from_text(diary_text)
            # Find dominant emotion
            dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if sum(emotion_counts.values()) > 0 else "Neutral"
        else:
            dominant_emotion = "Neutral"
        
        # Set stress level based on emotions
        if dominant_emotion in ["Anxious", "Angry"]:
            stress_level = 7
        elif dominant_emotion == "Sad":
            stress_level = 6
        elif dominant_emotion == "Neutral":
            stress_level = 4
        else:  # Happy
            stress_level = 2
            
        # Adjust values based on dominant emotion
        response = {
            "metrics": {
                "daily_stress": {
                    "current": float(data.get("dailyStress", stress_level)),
                    "target": 3.0,
                    "change": float(data.get("dailyStress", stress_level)) - 3.0,
                    "status": "improve" if float(data.get("dailyStress", stress_level)) > 4 else "good"
                },
                "core_relationships": {
                    "current": float(data.get("coreCircle", 5)),
                    "target": 8.0,
                    "change": 8.0 - float(data.get("coreCircle", 5)),
                    "status": "improve" if float(data.get("coreCircle", 5)) < 6 else "good"
                },
                "supporting_others": {
                    "current": float(data.get("supportingOthers", 5)),
                    "target": 7.0,
                    "change": 7.0 - float(data.get("supportingOthers", 5)),
                    "status": "maintain" if 5 <= float(data.get("supportingOthers", 5)) <= 8 else "improve"
                },
                "sleep_quality": {
                    "current": float(data.get("sleepHours", 7)),
                    "target": 8.0,
                    "change": float(data.get("sleepHours", 7)) - 8.0,
                    "status": "improve" if float(data.get("sleepHours", 7)) < 7 else "good"
                }
            },
            "recommendations": [
                {
                    "category": "Stress Management",
                    "priority": "High" if dominant_emotion in ["Anxious", "Angry"] else "Medium",
                    "suggestions": [
                        "Try a 5-minute breathing exercise when you feel overwhelmed",
                        "Schedule short breaks throughout your day to reset",
                        "Consider limiting news and social media consumption"
                    ]
                },
                {
                    "category": "Mood Improvement",
                    "priority": "High" if dominant_emotion in ["Sad", "Anxious"] else "Low",
                    "suggestions": [
                        "Take a short walk outside to change your environment",
                        "Listen to music that boosts your mood",
                        "Connect with someone who makes you feel good"
                    ]
                },
                {
                    "category": "Sleep Improvement",
                    "priority": "Medium",
                    "suggestions": [
                        "Create a consistent bedtime routine to signal your body it's time to rest",
                        "Avoid screens an hour before bedtime",
                        "Keep your bedroom cool and dark for optimal rest"
                    ]
                }
            ],
            "emotional_analysis": {
                "dominant_emotion": dominant_emotion,
                "emotion_detected": True if diary_text else False
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/keyword_test", methods=["GET"])
def keyword_test():
    """
    Test endpoint to see examples of keywords for each emotion
    """
    return jsonify({
        "emotion_keywords": emotion_keywords,
        "test_examples": test_examples
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)