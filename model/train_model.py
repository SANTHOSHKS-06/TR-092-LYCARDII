import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, silhouette_score
import pickle
import os

# Load data
df = pd.read_csv('data/user_activity.csv')

features = ['login_frequency', 'avg_session_duration',
            'actions_per_session', 'days_since_last_login', 'total_sessions']

X = df[features]
y = df['label']

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# KMeans Clustering
print("🔵 Running KMeans Clustering...")
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
cluster_labels = kmeans.fit_predict(X_scaled)

sil_score = silhouette_score(X_scaled, cluster_labels)
print(f"✅ Silhouette Score: {sil_score:.4f}")

# Classification
print("\n🟢 Training Random Forest Classifier...")
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"✅ Classification Accuracy: {acc * 100:.2f}%")
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# Save models
os.makedirs('model', exist_ok=True)
with open('model/classifier.pkl', 'wb') as f:
    pickle.dump(clf, f)
with open('model/scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
with open('model/kmeans.pkl', 'wb') as f:
    pickle.dump(kmeans, f)

print("\n✅ Models saved to /model folder!")