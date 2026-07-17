# CustomerIQ – Customer Retention System

CustomerIQ is a full-stack Machine Learning web application that performs customer segmentation using K-Means Clustering and customer churn prediction using Random Forest Classification. Users can upload their own datasets, perform clustering analysis, visualize customer segments, predict churn risk, and generate AI-powered, profile-specific retention recommendations through an interactive dashboard.

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

### AI Retention Recommendations
- On-demand, LLM-generated retention strategy per customer (Groq — Llama 3.3 70B)
- Reasons over the full profile (age, income, spending trend, complaints, loyalty points) instead of returning a generic templated offer
- Kept as a separate, opt-in call so the core prediction endpoint stays fast and free
- Falls back gracefully to the static recommendation if the AI call is unavailable

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
- Custom CSS (no UI framework)
- Recharts
- Axios

### Backend
- FastAPI
- Python
- Pandas
- NumPy
- Scikit-Learn
- httpx

### Machine Learning
- K-Means Clustering
- Random Forest Classification
- StandardScaler
- Silhouette Score
- Train-Test Split

### Generative AI
- Groq API (Llama 3.3 70B) for retention recommendation generation

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
│   ├── ai_recommend.py
│   ├── data_loader.py
│   ├── auth.py
│   ├── database.py
│   ├── Mall_Customers.csv
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

### AI Retention Recommendation

Once a customer is scored, their profile and predicted risk can be sent to an LLM (Groq — Llama 3.3 70B) to generate a specific retention recommendation grounded in that customer's data, rather than a fixed string per risk tier.

Input to the model:

- Full customer profile (gender, age, income, spending score, visit frequency, satisfaction score, complaints count, loyalty points)
- Predicted churn risk, cluster, and confidence score

Output:

- A short, reasoned retention strategy (2–3 sentences) referencing the specific numbers that justify the recommendations provided and justify them.

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
| POST | /recommend | AI-Generated Retention Recommendation (Groq) |

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

Create a `.env` file inside `backend/` with:

```text
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
GROQ_API_KEY=your_groq_api_key
```

`GROQ_API_KEY` is free to generate at [console.groq.com](https://console.groq.com) and is only required for the AI retention recommendation feature — the rest of the app runs without it.

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
- Automated delivery of AI-generated recommendations via email/SMS
- Model explainability (e.g. SHAP) for Random Forest predictions

---

## Learning Outcomes

This project demonstrates:

- Machine Learning Model Development
- Unsupervised Learning (K-Means)
- Supervised Learning (Random Forest classifier)
- Feature Engineering
- Data Preprocessing
- LLM / Generative AI API Integration (Groq)
- FastAPI Backend Development
- React Frontend Development
- REST API Integration
- MongoDB Integration
- Full-Stack Deployment

---

## Author

Akshit Sonkusale

Computer Science Engineering student specializing in Data Science

Machine Learning • Data Science • Full Stack Development

---

## License

This project is developed for educational and academic purposes.
