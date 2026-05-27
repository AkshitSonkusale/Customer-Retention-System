import io
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

from database import db  # reuse the existing MongoDB connection

# ── MongoDB collection for persisted uploads ──────────────────────────────────
_uploads_col = db["uploaded_dataset"]

# ── Default (hardcoded) dataset path ──────────────────────────────────────────
CSV_PATH = "Mall_Customers.csv"

# ── In-memory cache (populated from MongoDB on first access) ──────────────────
_uploaded: dict = {}


def _load_from_mongo() -> bool:
    """Pull the latest upload from MongoDB into the in-memory cache."""
    global _uploaded
    doc = _uploads_col.find_one({}, sort=[("_id", -1)])  # most recent
    if not doc:
        return False
    try:
        df = pd.read_csv(io.BytesIO(doc["csv_bytes"]))
        _uploaded = {
            "df":        df,
            "col_map":   doc["col_map"],
            "filename":  doc["filename"],
            "row_count": len(df),
        }
        return True
    except Exception as e:
        print(f"[data_loader] Failed to restore upload from MongoDB: {e}")
        return False


def has_upload() -> bool:
    if _uploaded:
        return True
    return _load_from_mongo()


def get_upload_info() -> dict:
    if not _uploaded:
        _load_from_mongo()
    if not _uploaded:
        return {}
    return {
        "filename":  _uploaded.get("filename", ""),
        "row_count": _uploaded.get("row_count", 0),
        "col_map":   _uploaded.get("col_map", {}),
    }


def store_upload(df: pd.DataFrame, col_map: dict, filename: str):
    """Persist an uploaded dataframe + column mapping to MongoDB and memory."""
    global _uploaded

    # Serialise DataFrame to CSV bytes for MongoDB storage
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    csv_bytes = buf.getvalue()

    # Upsert a single document (we only ever keep one active upload)
    _uploads_col.delete_many({})
    _uploads_col.insert_one({
        "csv_bytes": csv_bytes,
        "col_map":   col_map,
        "filename":  filename,
    })

    # Update in-memory cache
    _uploaded = {
        "df":        df,
        "col_map":   col_map,
        "filename":  filename,
        "row_count": len(df),
    }

    # Clear clustering cache so next call re-runs on new data
    import model as _m
    _m._cache.clear()
    _m._fitted_km.clear()
    _m._rf_model = None          # force RF re-train on new dataset


def clear_upload():
    global _uploaded
    _uploads_col.delete_many({})
    _uploaded.clear()
    import model as _m
    _m._cache.clear()
    _m._fitted_km.clear()
    _m._rf_model = None


# ── Load data (uploaded takes priority over default CSV) ──────────────────────
def load_data() -> pd.DataFrame:
    if not _uploaded:
        _load_from_mongo()

    if _uploaded:
        df = _uploaded["df"].copy()
        cm = _uploaded["col_map"]

        rename = {}
        if cm.get("id"):       rename[cm["id"]]       = "CustomerID"
        if cm.get("gender"):   rename[cm["gender"]]   = "Gender"
        if cm.get("age"):      rename[cm["age"]]       = "Age"
        if cm.get("income"):   rename[cm["income"]]   = "AnnualIncome"
        if cm.get("spending"): rename[cm["spending"]] = "SpendingScore"
        df = df.rename(columns=rename)

        if "Gender" not in df.columns:
            df["Gender"] = "Unknown"
        if "CustomerID" not in df.columns:
            df["CustomerID"] = range(1, len(df) + 1)
        if "Age" not in df.columns:
            df["Age"] = 30

        return df
    else:
        df = pd.read_csv(CSV_PATH)
        df.columns = ["CustomerID", "Gender", "Age", "AnnualIncome", "SpendingScore"]
        return df


# ── Pre-process for K-Means ───────────────────────────────────────────────────
def preprocess(df: pd.DataFrame):
    df = df.copy()

    missing = [c for c in ["AnnualIncome", "SpendingScore"] if c not in df.columns]
    if missing:
        raise ValueError(
            f"Dataset is missing required columns after mapping: {missing}. "
            "Please re-upload and map the income and spending columns correctly."
        )

    features = df[["AnnualIncome", "SpendingScore"]].values.astype(float)
    scaler = StandardScaler()
    scaled = scaler.fit_transform(features)
    return df, scaled, scaler


# ── Churn risk from cluster stats ─────────────────────────────────────────────
def assign_churn_risk(cluster_id: int, cluster_stats: dict) -> dict:
    stats = cluster_stats[cluster_id]
    spending = stats["avg_spending"]

    if spending < 35:
        return {"risk": "High Risk",   "level": 3, "color": "#EF4444", "badge": "🔴"}
    elif spending < 55:
        return {"risk": "Medium Risk", "level": 2, "color": "#F59E0B", "badge": "🟡"}
    else:
        return {"risk": "Low Risk",    "level": 1, "color": "#10B981", "badge": "🟢"}
