import pandas as pd
import numpy as np
import os

np.random.seed(42)
n_users = 500

high = pd.DataFrame({
    'user_id': [f'U{i}' for i in range(1, 171)],
    'login_frequency': np.random.randint(20, 30, 170),
    'avg_session_duration': np.random.uniform(30, 60, 170),
    'actions_per_session': np.random.randint(20, 50, 170),
    'days_since_last_login': np.random.randint(0, 2, 170),
    'total_sessions': np.random.randint(80, 120, 170),
})

low = pd.DataFrame({
    'user_id': [f'U{i}' for i in range(171, 341)],
    'login_frequency': np.random.randint(1, 5, 170),
    'avg_session_duration': np.random.uniform(2, 10, 170),
    'actions_per_session': np.random.randint(1, 5, 170),
    'days_since_last_login': np.random.randint(15, 30, 170),
    'total_sessions': np.random.randint(1, 15, 170),
})

irregular = pd.DataFrame({
    'user_id': [f'U{i}' for i in range(341, 501)],
    'login_frequency': np.random.randint(5, 25, 160),
    'avg_session_duration': np.random.uniform(5, 55, 160),
    'actions_per_session': np.random.randint(1, 50, 160),
    'days_since_last_login': np.random.randint(0, 30, 160),
    'total_sessions': np.random.randint(10, 90, 160),
})

high['label'] = 'high_activity'
low['label'] = 'low_activity'
irregular['label'] = 'irregular_usage'

df = pd.concat([high, low, irregular]).sample(frac=1).reset_index(drop=True)

os.makedirs('data', exist_ok=True)
df.to_csv('data/user_activity.csv', index=False)
print("✅ Dataset created: data/user_activity.csv")
print(df['label'].value_counts())