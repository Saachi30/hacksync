import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import json
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split

# Focused keyword-based emotion dataset
emotion_data = [
    # Happy keywords
    "happy", "joy", "excited", "thrilled", "delighted", "cheerful", "ecstatic", 
    "glad", "content", "pleased", "wonderful", "fantastic", "great", "amazing",
    "enjoy", "loving", "fun", "good", "positive", "awesome", "blessed", "grateful",
    
    # Sad keywords
    "sad", "unhappy", "depressed", "gloomy", "miserable", "downcast", "blue",
    "melancholy", "heartbroken", "disappointed", "upset", "hurt", "lost", "lonely",
    "hopeless", "despair", "grief", "sorrow", "crying", "tears", "devastated", "broken",
    
    # Angry keywords
    "angry", "mad", "furious", "outraged", "irritated", "annoyed", "frustrated",
    "enraged", "seething", "hostile", "bitter", "resentful", "hatred", "hate", 
    "rage", "livid", "fuming", "pissed", "aggravated", "irate", "infuriated", "disgusted",
    
    # Anxious keywords
    "anxious", "worried", "nervous", "afraid", "scared", "fearful", "stressed",
    "uneasy", "tense", "apprehensive", "panic", "dread", "overwhelmed", "terrified", 
    "freaking", "paranoid", "alarmed", "concerned", "restless", "jittery", "troubled", "distressed",
    
    # Neutral keywords
    "neutral", "fine", "okay", "alright", "normal", "average", "moderate", 
    "ordinary", "indifferent", "neither", "impartial", "balanced", "standard", "regular",
    "common", "typical", "bland", "plain", "mediocre", "fair", "usual", "so-so"
]

# Create labels based on keyword categories (0:Happy, 1:Sad, 2:Angry, 3:Anxious, 4:Neutral)
labels = (
    [0] * 22 +  # Happy keywords
    [1] * 22 +  # Sad keywords
    [2] * 22 +  # Angry keywords
    [3] * 22 +  # Anxious keywords
    [4] * 22    # Neutral keywords
)

# Convert to numpy arrays
texts = np.array(emotion_data)
labels = np.array(labels)

# Split data into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(texts, labels, test_size=0.2, random_state=42, stratify=labels)

# Tokenization with a vocabulary focused on emotional keywords
tokenizer = Tokenizer(num_words=5000, oov_token="<OOV>")
tokenizer.fit_on_texts(X_train)

# Save tokenizer for later use
with open("tokenizer.pickle", "wb") as handle:
    pickle.dump(tokenizer, handle)

# Convert texts to sequences
X_train_seq = tokenizer.texts_to_sequences(X_train)
X_val_seq = tokenizer.texts_to_sequences(X_val)

# Pad sequences - shorter sequences for keyword-based analysis
X_train_pad = pad_sequences(X_train_seq, maxlen=5, padding='post', truncating='post')
X_val_pad = pad_sequences(X_val_seq, maxlen=5, padding='post', truncating='post')

# Convert labels to categorical
y_train_cat = tf.keras.utils.to_categorical(y_train, num_classes=5)
y_val_cat = tf.keras.utils.to_categorical(y_val, num_classes=5)

# Build a simpler model for keyword recognition
model = Sequential([
    Embedding(5000, 64, input_length=5),
    Bidirectional(LSTM(32)),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dropout(0.2),
    Dense(5, activation='softmax')  # 5 categories: Happy, Sad, Angry, Anxious, Neutral
])

# Compile the model
optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
model.compile(loss='categorical_crossentropy', optimizer=optimizer, metrics=['accuracy'])

# Add early stopping
early_stopping = tf.keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)

# Train the model
history = model.fit(
    X_train_pad, y_train_cat,
    epochs=30,
    validation_data=(X_val_pad, y_val_cat),
    callbacks=[early_stopping],
    verbose=1
)

# Evaluate the model
loss, accuracy = model.evaluate(X_val_pad, y_val_cat)
print(f"Validation accuracy: {accuracy:.4f}")

# Save the model
model.save("keyword_emotion_model.h5")
print("Model saved successfully!")

# Create and save additional examples for testing
test_examples = {
    "Happy": ["feeling great", "best day ever", "super happy", "really enjoying today", "so much fun"],
    "Sad": ["feeling down", "worst day", "so depressed", "very disappointed", "feel like crying"],
    "Angry": ["so frustrated", "totally mad", "extremely annoyed", "makes me angry", "absolutely furious"],
    "Anxious": ["really worried", "extremely nervous", "so stressed out", "feeling anxious", "panic attack"],
    "Neutral": ["just okay", "nothing special", "average day", "feeling normal", "regular routine"]
}
with open("test_examples.json", "w") as f:
    json.dump(test_examples, f)

# Save mood labels for the server
mood_labels = ["Happy", "Sad", "Angry", "Anxious", "Neutral"]
with open("mood_labels.json", "w") as f:
    json.dump(mood_labels, f)