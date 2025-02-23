from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import LSTM, GRU, Dense, Dropout, Input, BatchNormalization
from sklearn.preprocessing import MinMaxScaler
import os

app = Flask(__name__)
CORS(app)

class EnhancedWellnessSystem:
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.model = None
        self.seq_length = 5
        self.feature_names = [
            'FRUITS_VEGGIES', 'DAILY_STRESS', 'CORE_CIRCLE',
            'SUPPORTING_OTHERS', 'DONATION', 'BMI_RANGE', 'DAILY_STEPS',
            'SLEEP_HOURS', 'WEEKLY_MEDITATION'
        ]
        
    def load_and_preprocess_data(self, filepath):
        df = pd.read_csv(filepath)
        df = df[self.feature_names]
        
        # Convert all to numeric and handle NaN
        for column in self.feature_names:
            df[column] = pd.to_numeric(df[column], errors='coerce')
            
        # Handle outliers using IQR method
        for column in self.feature_names:
            q1 = df[column].quantile(0.25)
            q3 = df[column].quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - (1.5 * iqr)
            upper_bound = q3 + (1.5 * iqr)
            df[column] = df[column].clip(lower_bound, upper_bound)
            
        df = df.dropna()
        scaled_data = self.scaler.fit_transform(df)
        return scaled_data

    def create_sequences(self, data):
        X, y = [], []
        for i in range(len(data) - self.seq_length):
            X.append(data[i:(i + self.seq_length)])
            y.append(data[i + self.seq_length])
        return np.array(X), np.array(y)

    def build_and_train_model(self, X, y):
        inputs = Input(shape=(X.shape[1], X.shape[2]))
        
        x = LSTM(64, return_sequences=True)(inputs)
        x = BatchNormalization()(x)
        x = Dropout(0.2)(x)
        
        x = GRU(32)(x)
        x = BatchNormalization()(x)
        x = Dropout(0.2)(x)
        
        x = Dense(16, activation='relu')(x)
        outputs = Dense(X.shape[2], activation='sigmoid')(x)
        
        self.model = Model(inputs=inputs, outputs=outputs)
        self.model.compile(
            optimizer='adam',
            loss=tf.keras.losses.Huber(),
            metrics=['mae', 'mse']
        )
        
        self.model.fit(
            X, y,
            epochs=15,
            batch_size=32,
            validation_split=0.2,
            verbose=1
        )
        
        # Save the model and scaler
        self.model.save('wellness_model.h5')
        import joblib
        joblib.dump(self.scaler, 'scaler.pkl')

    def load_saved_model(self):
        if os.path.exists('wellness_model.h5') and os.path.exists('scaler.pkl'):
            import joblib
            self.model = load_model('wellness_model.h5')
            self.scaler = joblib.load('scaler.pkl')
            return True
        return False

    def initialize_model(self, filepath):
        if not self.load_saved_model():
            data = self.load_and_preprocess_data(filepath)
            X, y = self.create_sequences(data)
            self.build_and_train_model(X, y)
            print("Model trained and saved successfully!")
        else:
            print("Loaded pre-trained model successfully!")

    def predict_wellness(self, user_data):
        user_data_array = np.array(user_data).reshape(1, -1)
        scaled_data = self.scaler.transform(user_data_array)
        sequence = np.tile(scaled_data, (self.seq_length, 1))
        sequence_data = sequence.reshape(1, self.seq_length, len(user_data))
        prediction = self.model.predict(sequence_data, verbose=0)
        return self.scaler.inverse_transform(prediction)

    def generate_recommendations(self, predictions, current_state):
        recommendations = []
        metrics_analysis = {}
        
        # Calculate changes and analyze metrics
        for i, (pred, curr, feature) in enumerate(zip(predictions[0], current_state, self.feature_names)):
            change = ((pred - curr) / curr * 100) if curr != 0 else 0
            metrics_analysis[feature] = {
                'current': float(curr),
                'target': float(pred),  # Changed from 'predicted' to 'target'
                'change': float(change),
                'status': 'improve' if change < -5 else ('maintain' if -5 <= change <= 5 else 'good')
            }
        
        # Generate detailed recommendations
        categories = {
            'Stress Management': {
                'metrics': ['DAILY_STRESS', 'WEEKLY_MEDITATION'],
                'suggestions': [
                    'Practice mindful meditation for 10 minutes daily',
                    'Take regular breaks during work',
                    'Try deep breathing exercises',
                    'Consider stress-relief activities'
                ]
            },
            'Physical Health': {
                'metrics': ['BMI_RANGE', 'DAILY_STEPS', 'FRUITS_VEGGIES'],
                'suggestions': [
                    'Increase daily step count gradually',
                    'Maintain a balanced diet',
                    'Stay hydrated throughout the day',
                    'Consider regular exercise routine'
                ]
            },
            'Sleep Quality': {
                'metrics': ['SLEEP_HOURS'],
                'suggestions': [
                    'Maintain consistent sleep schedule',
                    'Create a relaxing bedtime routine',
                    'Limit screen time before bed',
                    'Optimize sleep environment'
                ]
            },
            'Social Wellness': {
                'metrics': ['CORE_CIRCLE', 'SUPPORTING_OTHERS', 'DONATION'],
                'suggestions': [
                    'Schedule regular social activities',
                    'Join community groups or clubs',
                    'Stay connected with family and friends',
                    'Consider volunteer opportunities'
                ]
            }
        }
        
        for category, data in categories.items():
            category_metrics = [m for m in data['metrics'] if metrics_analysis[m]['status'] == 'improve']
            if category_metrics:
                recommendations.append({
                    'category': category,
                    'suggestions': data['suggestions'],
                    'priority': 'High' if any(metrics_analysis[m]['change'] < -10 for m in category_metrics) else 'Medium'
                })
        
        return recommendations, metrics_analysis

# Initialize the wellness system
wellness_system = EnhancedWellnessSystem()

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        user_metrics = [
            float(data.get('fruitsVeggies', 3)),
            float(data.get('dailyStress', 5)),
            float(data.get('coreCircle', 5)),
            float(data.get('supportingOthers', 5)),
            float(data.get('donation', 3)),
            float(data.get('bmiRange', 2)),
            float(data.get('dailySteps', 5)),
            float(data.get('sleepHours', 7)),
            float(data.get('weeklyMeditation', 3))
        ]
        
        predictions = wellness_system.predict_wellness(user_metrics)
        recommendations, metrics = wellness_system.generate_recommendations(predictions, user_metrics)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'metrics': metrics
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    wellness_system.initialize_model('Wellbeing_and_lifestyle_data_Kaggle.csv')
    app.run(debug=True, port=5000)