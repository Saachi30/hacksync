import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import LSTM, GRU, Dense, Dropout, Input
from tensorflow.keras.layers import BatchNormalization
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

class EnhancedWellnessSystem:
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.model = None
        self.seq_length = 5  # Store sequence length as class attribute
        self.feature_names = [
            'AGE', 'FRUITS_VEGGIES', 'DAILY_STRESS', 'CORE_CIRCLE',
            'SUPPORTING_OTHERS', 'DONATION', 'BMI_RANGE', 'DAILY_STEPS',
            'SLEEP_HOURS', 'WEEKLY_MEDITATION'
        ]

    def load_data(self, filepath):
        """Load and validate wellness dataset"""
        try:
            df = pd.read_csv(filepath)
            # Validate columns
            missing_cols = [col for col in self.feature_names if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Missing columns in dataset: {missing_cols}")
            return df[self.feature_names]  # Only return needed columns
        except Exception as e:
            raise Exception(f"Error loading data: {str(e)}")

    def preprocess_data(self, df):
        """Enhanced preprocessing pipeline with better error handling"""
        try:
            # Convert age ranges to numeric values
            df['AGE'] = df['AGE'].apply(lambda x: self.convert_age(x))
            
            # Convert all columns to numeric
            for column in self.feature_names:
                df[column] = pd.to_numeric(df[column], errors='coerce')
            
            # Drop any rows with NaN values
            df = df.dropna()
            
            if df.empty:
                raise ValueError("No valid data rows after preprocessing")
            
            # Handle outliers using IQR method
            for column in self.feature_names:
                q1 = df[column].quantile(0.25)
                q3 = df[column].quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - (1.5 * iqr)
                upper_bound = q3 + (1.5 * iqr)
                df[column] = df[column].clip(lower_bound, upper_bound)
            
            # Scale the features
            scaled_data = self.scaler.fit_transform(df)
            
            print(f"Preprocessed data shape: {scaled_data.shape}")
            return scaled_data
            
        except Exception as e:
            raise Exception(f"Error in preprocessing: {str(e)}")

    def convert_age(self, value):
        """Enhanced age conversion with better error handling"""
        try:
            if pd.isna(value):
                return np.nan
            if isinstance(value, (int, float)):
                return float(value)
            if isinstance(value, str):
                if 'to' in value:
                    start, end = map(float, value.split(' to '))
                    return (start + end) / 2
                return float(value)
            return np.nan
        except:
            return np.nan

    def create_sequences(self, data, seq_length=5):  # Reduced sequence length
        """Create sequences with better error handling"""
        try:
            if len(data) <= seq_length:
                raise ValueError(f"Not enough data points. Need more than {seq_length} samples.")
            
            X, y = [], []
            for i in range(len(data) - seq_length):
                X.append(data[i:(i + seq_length)])
                y.append(data[i + seq_length])
            
            X = np.array(X)
            y = np.array(y)
            
            print(f"Sequence shapes - X: {X.shape}, y: {y.shape}")
            return X, y
            
        except Exception as e:
            raise Exception(f"Error creating sequences: {str(e)}")

    def build_advanced_model(self, input_shape):
        """Build model with proper input shape handling"""
        try:
            print(f"Building model with input shape: {input_shape}")
            
            inputs = Input(shape=input_shape)
            
            x = LSTM(64, return_sequences=True)(inputs)
            x = BatchNormalization()(x)
            x = Dropout(0.2)(x)
            
            x = GRU(32)(x)
            x = BatchNormalization()(x)
            x = Dropout(0.2)(x)
            
            x = Dense(16, activation='relu')(x)
            outputs = Dense(input_shape[-1], activation='sigmoid')(x)
            
            model = Model(inputs=inputs, outputs=outputs)
            
            model.compile(
                optimizer='adam',
                loss=tf.keras.losses.Huber(),
                metrics=['mae', 'mse']
            )
            
            self.model = model
            return model
            
        except Exception as e:
            raise Exception(f"Error building model: {str(e)}")

    def train_model(self, X_train, y_train, epochs=50, batch_size=32):
        """Train model with proper error handling"""
        try:
            if self.model is None:
                raise ValueError("Model not built. Call build_advanced_model first.")
            
            callbacks = [
                EarlyStopping(
                    monitor='val_loss',
                    patience=5,
                    restore_best_weights=True
                ),
                ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=3,
                    min_lr=0.0001
                )
            ]
            
            history = self.model.fit(
                X_train, y_train,
                epochs=epochs,
                batch_size=batch_size,
                validation_split=0.2,
                callbacks=callbacks,
                verbose=1
            )
            
            return history
            
        except Exception as e:
            raise Exception(f"Error training model: {str(e)}")

    def predict_wellness(self, user_data):
        """Make predictions with proper sequence handling"""
        try:
            if len(user_data) != len(self.feature_names):
                raise ValueError(f"Expected {len(self.feature_names)} features, got {len(user_data)}")
            
            # Reshape and scale input data
            user_data_array = np.array(user_data).reshape(1, -1)
            scaled_data = self.scaler.transform(user_data_array)
            
            # Create a sequence by repeating the input data
            sequence = np.tile(scaled_data, (self.seq_length, 1))
            
            # Reshape for LSTM input (samples, time steps, features)
            sequence_data = sequence.reshape(1, self.seq_length, len(user_data))
            
            # Make prediction
            prediction = self.model.predict(sequence_data, verbose=0)
            
            # Inverse transform
            prediction_original = self.scaler.inverse_transform(prediction)
            
            return prediction_original
            
        except Exception as e:
            raise Exception(f"Error making prediction: {str(e)}")

    def generate_recommendations(self, predictions, current_state):
        """Generate more detailed recommendations"""
        try:
            recommendations = []
            metrics_analysis = {}
            
            # Calculate changes
            for i, (pred, curr, feature) in enumerate(zip(predictions[0], current_state, self.feature_names)):
                change = ((pred - curr) / curr * 100) if curr != 0 else 0
                metrics_analysis[feature] = {
                    'current': curr,
                    'predicted': pred,
                    'change': change,
                    'status': 'improve' if change < -5 else ('maintain' if -5 <= change <= 5 else 'good')
                }
            
            # Stress Management
            if metrics_analysis['DAILY_STRESS']['change'] > 5:
                recommendations.append({
                    'category': 'Stress Management',
                    'suggestions': [
                        'Practice 10 minutes of mindful meditation daily',
                        'Take regular breaks during work (5 minutes every hour)',
                        'Try deep breathing exercises when feeling stressed'
                    ],
                    'priority': 'High'
                })
            
            # Physical Health
            if metrics_analysis['BMI_RANGE']['status'] == 'improve' or metrics_analysis['DAILY_STEPS']['status'] == 'improve':
                recommendations.append({
                    'category': 'Physical Health',
                    'suggestions': [
                        'Increase daily step count by 1000 steps',
                        'Add 20 minutes of moderate exercise 3 times a week',
                        'Monitor water intake (aim for 8 glasses daily)'
                    ],
                    'priority': 'High'
                })
            
            # Sleep Quality
            if metrics_analysis['SLEEP_HOURS']['status'] == 'improve':
                recommendations.append({
                    'category': 'Sleep Quality',
                    'suggestions': [
                        'Maintain consistent sleep and wake times',
                        'Create a calming bedtime routine',
                        'Avoid screens 1 hour before bed'
                    ],
                    'priority': 'Medium'
                })
            
            # Social Wellness
            if metrics_analysis['CORE_CIRCLE']['status'] == 'improve':
                recommendations.append({
                    'category': 'Social Connections',
                    'suggestions': [
                        'Schedule weekly check-ins with friends/family',
                        'Join a community group or club',
                        'Participate in social activities'
                    ],
                    'priority': 'Medium'
                })
            
            return recommendations, metrics_analysis
            
        except Exception as e:
            raise Exception(f"Error generating recommendations: {str(e)}")

def main():
    """Main function with improved error handling and user feedback"""
    try:
        print("Initializing Wellness Management System...")
        system = EnhancedWellnessSystem()
        
        print("\nLoading and preprocessing data...")
        df = system.load_data('Wellbeing_and_lifestyle_data_Kaggle.csv')
        processed_data = system.preprocess_data(df)
        
        print("\nCreating sequences...")
        X, y = system.create_sequences(processed_data)
        print(f"Training data shape: {X.shape}")
        
        print("\nBuilding and training model...")
        input_shape = (X.shape[1], X.shape[2])
        model = system.build_advanced_model(input_shape)
        history = system.train_model(X, y)
        
        print("\nModel training completed successfully!")
        
        # Collect user input with validation
        print("\nEnter your wellness metrics:")
        user_data = []
        
        prompts = [
            ("Age", "18-100"),
            ("Fruits and Vegetables consumption", "1-5 (1: Very Low, 5: Very High)"),
            ("Daily Stress level", "1-10 (1: Very Low, 10: Very High)"),
            ("Number of close friends/family", "1-10"),
            ("Time spent supporting others", "1-10 (hours per week)"),
            ("Monthly donation/charity involvement", "1-10 (1: None, 10: Very Active)"),
            ("BMI Range", "1-5 (1: Underweight, 2: Normal, 3: Overweight, 4: Obese, 5: Severely Obese)"),
            ("Daily Steps", "1-10 (1: <2000, 5: 5000, 10: >10000)"),
            ("Average Sleep Hours", "1-10 (hours per night)"),
            ("Weekly Meditation frequency", "1-10 (days per week)")
        ]
        
        for metric, scale in prompts:
            while True:
                try:
                    value = float(input(f"Enter your {metric} ({scale}): "))
                    if 1 <= value <= 100 if metric == "Age" else 1 <= value <= 10:
                        user_data.append(value)
                        break
                    else:
                        print(f"Please enter a value within the specified range")
                except ValueError:
                    print("Please enter a valid number")
        
        print("\nGenerating predictions and recommendations...")
        predictions = system.predict_wellness(user_data)
        recommendations, metrics = system.generate_recommendations(predictions, user_data)
        
        # Display results
        print("\nWellness Analysis:")
        print("=" * 50)
        
        for feature, data in metrics.items():
            status_color = (
                "\033[92m" if data['status'] == 'good' else  # Green
                "\033[93m" if data['status'] == 'maintain' else  # Yellow
                "\033[91m"  # Red
            )
            print(f"\n{feature}:")
            print(f"  Current: {data['current']:.1f}")
            print(f"  Predicted: {data['predicted']:.1f}")
            print(f"  Change: {status_color}{data['change']:.1f}%\033[0m")
            print(f"  Status: {status_color}{data['status'].upper()}\033[0m")
        
        print("\nPersonalized Recommendations:")
        print("=" * 50)
        
        for rec in recommendations:
            print(f"\n{rec['category']} (Priority: {rec['priority']})")
            print("Suggested Actions:")
            for i, suggestion in enumerate(rec['suggestions'], 1):
                print(f"  {i}. {suggestion}")
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        print("Please ensure you have the correct dataset file and valid input values.")

if __name__ == "__main__":
    main()