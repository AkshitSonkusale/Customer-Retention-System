# CustomerIQ – Mall Customer Churn Prediction & Segmentation System

CustomerIQ is a full-stack Machine Learning web application that performs customer segmentation using K-Means Clustering and customer churn prediction using Random Forest Classification. Users can upload their own datasets, perform clustering analysis, visualize customer segments, and predict churn risk through an interactive dashboard.

## Features

### Customer Segmentation
- K-Means Clustering
- Elbow Method for optimal K selection
- Silhouette Score evaluation
- Cluster-wise customer analysis
- Risk categorization (High, Medium, Low)
- Interactive visualizations

### Churn Prediction
- Random Forest Classifier
- Predicts customer churn risk
- Confidence score generation
- Personalized recommendations
- Risk-level classification

### Dataset Upload
- Upload custom CSV datasets
- Automatic column mapping
- Dataset preview
- Dynamic clustering on uploaded datasets

### Dashboard Analytics
- Cluster distribution charts
- Income vs Spending scatter plots
- Elbow curve visualization
- Customer segmentation tables
- Risk breakdown summaries
- Model performance metrics

### Authentication
- User registration
- User login
- JWT authentication
- Secure API access

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Recharts
- Axios

### Backend
- FastAPI
- Python
- Pandas
- NumPy
- Scikit-Learn

### Machine Learning
- K-Means Clustering
- Random Forest Classification
- StandardScaler
- Silhouette Score
- Train-Test Split

### Database
- MongoDB

### Deployment
- Frontend: Render / Vercel
- Backend: Render

---

## Project Structure

```bash
CustomerIQ/
│
├── backend/
│   ├── main.py
│   ├── model.py
│   ├── data_loader.py
│   ├── auth.py
│   ├── database.py
│   ├── requirements.txt
│   └── runtime.txt
│
├── frontend/
│   ├── src/
│   │   ├── app.jsx
│   │   ├── main.jsx
│   │   ├── api.js
│   │   ├── components/
│   │   └── pages/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── datasets/
```

---

## Machine Learning Workflow

### Customer Segmentation

Features Used:

- AnnualIncome
- SpendingScore

Steps:

1. Data Loading
2. Data Preprocessing
3. Feature Scaling
4. K-Means Clustering
5. Elbow Method
6. Silhouette Score Evaluation
7. Cluster Analysis
8. Risk Assignment

### Churn Prediction

Features Used:

- Age
- AnnualIncome
- SpendingScore
- VisitFrequency
- SatisfactionScore
- ComplaintsCount
- LoyaltyPoints

Target Variable:

- ChurnRisk

Classes:

- Low
- Medium
- High

Model:

```python
RandomForestClassifier(
    n_estimators=100,
    random_state=42
)
```

Evaluation Metrics:

- Accuracy
- Precision
- Recall
- F1 Score

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|----------|----------|----------|
| POST | /auth/signup | Register User |
| POST | /auth/login | User Login |
| GET | /auth/me | Current User |

### Dataset Management

| Method | Endpoint | Description |
|----------|----------|----------|
| POST | /upload | Upload Dataset |
| POST | /upload/confirm | Confirm Column Mapping |
| GET | /dataset/info | Dataset Information |
| DELETE | /dataset | Reset Dataset |

### Clustering

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | /cluster?k=5 | Perform K-Means |
| GET | /summary?k=5 | Cluster Summary |
| GET | /elbow?max_k=10 | Elbow Method |
| GET | /metrics | Model Metrics |

### Prediction

| Method | Endpoint | Description |
|----------|----------|----------|
| POST | /predict | Churn Prediction |

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/customeriq.git
cd customeriq
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Dataset Format

Required Columns:

```text
CustomerID
Gender
Age
AnnualIncome
SpendingScore
```

Optional Columns:

```text
VisitFrequency
SatisfactionScore
ComplaintsCount
LoyaltyPoints
CustomerSegment
ChurnRisk
```

---

## Screenshots

### Dashboard

- Customer Segmentation
- Cluster Distribution
- Risk Analysis
- Churn Prediction

### Upload Dataset

- CSV Upload
- Column Mapping
- Dataset Preview

### Customer Prediction

- Risk Category
- Confidence Score
- Recommendations

---

## Future Improvements

- Deep Learning based churn prediction
- AutoML integration
- PDF report generation
- Downloadable analytics reports
- Real-time customer monitoring
- Advanced customer behavior analytics
- Multi-user workspace support

---

## Learning Outcomes

This project demonstrates:

- Machine Learning Model Development
- Unsupervised Learning (K-Means)
- Supervised Learning (Random Forest)
- Feature Engineering
- Data Preprocessing
- FastAPI Backend Development
- React Frontend Development
- REST API Integration
- MongoDB Integration
- Full-Stack Deployment

---

## Author

Akshit Sonkusale

Computer Science Engineering Student

Machine Learning • Data Science • Full Stack Development

---

## License

This project is developed for educational and academic purposes.
