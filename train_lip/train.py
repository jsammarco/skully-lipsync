import os
import cv2
import librosa
import numpy as np
import mediapipe as mp
import tensorflow as tf
from sklearn.model_selection import train_test_split

# Function to extract frames from video
def extract_frames(video_path):
    frames = []
    cap = cv2.VideoCapture(video_path)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()
    return frames

# Function to extract audio features from video
def extract_audio_features(video_path):
    y, sr = librosa.load(video_path, sr=16000)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return mfcc.T

# Function to extract lip landmarks using MediaPipe
def extract_lip_landmarks(frames):
    mp_face_mesh = mp.solutions.face_mesh
    lip_landmarks = []
    with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1) as face_mesh:
        for frame in frames:
            results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if results.multi_face_landmarks:
                landmarks = results.multi_face_landmarks[0].landmark
                lips = [landmarks[i] for i in range(61, 81)]  # Lip landmarks indices
                lip_landmarks.append([(lm.x, lm.y) for lm in lips])
    return np.array(lip_landmarks)

# Paths
video_path = 'train.mp4'
model_save_path = 'lip_sync_model.h5'

# Extract frames and audio features
frames = extract_frames(video_path)
audio_features = extract_audio_features(video_path)
lip_landmarks = extract_lip_landmarks(frames)

# Flatten the lip landmarks array
lip_landmarks = lip_landmarks.reshape((lip_landmarks.shape[0], -1))

# Ensure audio features and lip landmarks have the same length
min_len = min(audio_features.shape[0], lip_landmarks.shape[0])
audio_features = audio_features[:min_len]
lip_landmarks = lip_landmarks[:min_len]

# Split data into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(audio_features, lip_landmarks, test_size=0.2, random_state=42)

# Define the model
model = tf.keras.models.Sequential([
    tf.keras.layers.LSTM(128, return_sequences=True, input_shape=(None, X_train.shape[1])),
    tf.keras.layers.LSTM(64, return_sequences=True),
    tf.keras.layers.TimeDistributed(tf.keras.layers.Dense(y_train.shape[1]))
])

model.compile(optimizer='adam', loss='mean_squared_error')

# Train the model
model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=50, batch_size=32)

# Save the model
model.save(model_save_path)

print(f'Model saved to {model_save_path}')
