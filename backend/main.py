import io, uuid
import pandas as pd
from fastapi import FastAPI, Query, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from pydantic import BaseModel
from model import get_model_metrics

from data_loader import has_upload, get_upload_info, store_upload, clear_upload
from model import compute_elbow, run_clustering, predict_customer
from database import db, users_collection
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

app = FastAPI(title="Mall Churn Prediction API", version="2.0.0")

# FIX: allow_origins=["*"] is rejected by browsers when allow_credentials=True.
# Specify the actual frontend origin(s) instead.
# Add every URL your frontend runs on (local dev + production).
ALLOWED_ORIGINS = [
    "https://customeriq-mdbl.onrender.com"
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    # Add your deployed frontend URL here, e.g.:
    # "https://your-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_pending: dict = {}  # token -> {"df": DataFrame, "filename": str}


@app.get("/")
def root():
    return {"message": "Mall Churn API v2", "status": "running"}


@app.get("/test-db")
def test_db():
    return {"connected": True, "database": db.name}


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/auth/signup")
def signup(req: SignupRequest):
    existing_user = users_collection.find_one({"email": req.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(req.password)
    user = {
        "username":      req.username,
        "email":         req.email,
        "password_hash": hashed_password,
    }
    users_collection.insert_one(user)

    token = create_access_token({"email": req.email, "username": req.username})
    return {"message": "Signup successful", "access_token": token, "token_type": "bearer"}


@app.post("/auth/login")
def login(req: LoginRequest):
    user = users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    valid = verify_password(req.password, user["password_hash"])
    if not valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"email": user["email"], "username": user["username"]})
    return {"message": "Login successful", "access_token": token, "token_type": "bearer"}


@app.get("/auth/me")
def me(current_user=Depends(get_current_user)):
    return {"username": current_user["username"], "email": current_user["email"]}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Only CSV files are supported.")
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(400, f"Could not parse CSV: {e}")
    if len(df) < 5:
        raise HTTPException(400, "Dataset too small — need at least 5 rows.")

    numeric_cols     = df.select_dtypes(include="number").columns.tolist()
    categorical_cols = df.select_dtypes(exclude="number").columns.tolist()
    all_cols         = df.columns.tolist()

    def guess(candidates, keywords):
        for col in candidates:
            for kw in keywords:
                if kw in col.lower():
                    return col
        return None

    suggestion = {
        "id":       guess(all_cols,                    ["id", "customerid", "customer_id", "cust"]),
        "gender":   guess(categorical_cols + all_cols, ["gender", "sex"]),
        "age":      guess(numeric_cols,                ["age"]),
        "income":   guess(numeric_cols,                ["income", "salary", "earning", "annual"]),
        "spending": guess(numeric_cols,                ["spending", "score", "spend", "purchase"]),
    }

    token = str(uuid.uuid4())
    _pending[token] = {"df": df, "filename": file.filename}
    preview = df.head(5).fillna("").to_dict(orient="records")

    return {
        "token":              token,
        "filename":           file.filename,
        "totalRows":          len(df),
        "columns":            all_cols,
        "numericColumns":     numeric_cols,
        "categoricalColumns": categorical_cols,
        "suggestion":         suggestion,
        "preview":            preview,
    }


class ConfirmBody(BaseModel):
    token:   str
    col_map: dict


@app.post("/upload/confirm")
def confirm_upload(body: ConfirmBody):
    if body.token not in _pending:
        raise HTTPException(400, "Upload token expired or not found. Please re-upload.")

    df       = _pending[body.token]["df"].copy()
    filename = _pending[body.token]["filename"]

    required = ["age", "income", "spending"]
    for r in required:
        if not body.col_map.get(r):
            raise HTTPException(400, f"Missing required mapping: '{r}'")
        if body.col_map[r] not in df.columns:
            raise HTTPException(400, f"Column '{body.col_map[r]}' not in CSV.")

    for role in required:
        col = body.col_map[role]
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=[body.col_map[r] for r in required])

    store_upload(df, body.col_map, filename)
    del _pending[body.token]

    return {
        "status":     "ok",
        "filename":   filename,
        "rowsLoaded": len(df),
        "colMap":     body.col_map,
    }


@app.get("/dataset/info")
def dataset_info():
    if has_upload():
        info = get_upload_info()
        return {"source": "upload", **info}
    return {
        "source":    "default",
        "filename":  "Mall_Customers.csv",
        "row_count": 200,
        "col_map": {
            "id":       "CustomerID",
            "gender":   "Gender",
            "age":      "Age",
            "income":   "AnnualIncome",
            "spending": "SpendingScore",
        },
    }


@app.delete("/dataset")
def reset_dataset():
    clear_upload()
    return {"status": "reset", "source": "default"}


@app.get("/elbow")
def elbow_data(max_k: int = Query(default=10, ge=2, le=15)):
    return {"data": compute_elbow(max_k)}


@app.get("/cluster")
def cluster_data(k: int = Query(default=5, ge=2, le=10)):
    return run_clustering(k)


@app.get("/customers")
def get_customers(k: int = Query(default=5, ge=2, le=10)):
    result = run_clustering(k)
    return {"total": result["totalCustomers"], "customers": result["customers"]}


@app.get("/summary")
def get_summary(k: int = Query(default=5, ge=2, le=10)):
    result = run_clustering(k)
    return {
        "k":               result["k"],
        "silhouetteScore": result["silhouetteScore"],
        "totalCustomers":  result["totalCustomers"],
        "clusters":        result["clusters"],
        "riskBreakdown": {
            "high":   sum(1 for c in result["customers"] if c["riskLevel"] == 3),
            "medium": sum(1 for c in result["customers"] if c["riskLevel"] == 2),
            "low":    sum(1 for c in result["customers"] if c["riskLevel"] == 1),
        },
    }


class PredictRequest(BaseModel):
    age:               float
    annualIncome:      float
    spendingScore:     float
    gender:            str   = "Unknown"
    visitFrequency:    float = 0
    satisfactionScore: float = 5
    complaintsCount:   float = 0
    loyaltyPoints:     float = 0


@app.post("/predict")
def predict(req: PredictRequest):
    return predict_customer(
        req.age,
        req.annualIncome,
        req.spendingScore,
        req.gender,
        req.visitFrequency,
        req.satisfactionScore,
        req.complaintsCount,
        req.loyaltyPoints,
    )


@app.get("/metrics")
def metrics():
    return get_model_metrics()
