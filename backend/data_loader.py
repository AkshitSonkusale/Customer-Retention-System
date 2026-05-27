import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
 
# ── Default (hardcoded) dataset path ──────────────────────────────────────────
CSV_PATH = "Mall_Customers.csv"
 
# ── In-memory uploaded dataset store ─────────────────────────────────────────
# When a user uploads a CSV this dict is populated.
# { "df": pd.DataFrame, "col_map": {...}, "filename": str, "row_count": int }
_uploaded: dict = {}
 
 
def has_upload() -> bool:
    return bool(_uploaded)
 
 
def get_upload_info() -> dict:
    if not _uploaded:
        return {}
    return {
        "filename": _uploaded.get("filename", ""),
        "row_count": _uploaded.get("row_count", 0),
        "col_map": _uploaded.get("col_map", {}),
    }
 
 
def store_upload(df: pd.DataFrame, col_map: dict, filename: str):
    """Persist an uploaded dataframe + column mapping in memory."""
    _uploaded.clear()
    _uploaded["df"] = df
    _uploaded["col_map"] = col_map
    _uploaded["filename"] = filename
    _uploaded["row_count"] = len(df)
    # Also clear the clustering cache so next call re-runs on new data
    import model as _m
    _m._cache.clear()
 
 
def clear_upload():
    _uploaded.clear()
    import model as _m
    _m._cache.clear()
 
 
# ── Load data (uploaded takes priority over hardcoded) ────────────────────────
def load_data() -> pd.DataFrame:
    if _uploaded:
        df = _uploaded["df"].copy()
        cm = _uploaded["col_map"]
        # Normalise column names to the standard set
        rename = {}
        if cm.get("id"):      rename[cm["id"]]       = "CustomerID"
        if cm.get("gender"):  rename[cm["gender"]]   = "Gender"
        if cm.get("age"):     rename[cm["age"]]       = "Age"
        if cm.get("income"):  rename[cm["income"]]   = "AnnualIncome"
        if cm.get("spending"):rename[cm["spending"]] = "SpendingScore"
        df = df.rename(columns=rename)
 
        # If no gender col mapped, create a dummy
        if "Gender" not in df.columns:
            df["Gender"] = "Unknown"
        # If no id col mapped, use row index
        if "CustomerID" not in df.columns:
            df["CustomerID"] = range(1, len(df) + 1)
        return df
    else:
        df = pd.read_csv(CSV_PATH)
        df.columns = ["CustomerID", "Gender", "Age", "AnnualIncome", "SpendingScore"]
        return df
 
 
# ── Pre-process for K-Means ───────────────────────────────────────────────────
# Only AnnualIncome + SpendingScore are used for clustering.
# Age and Gender are kept in the DataFrame for display purposes only.
# Using just these 2 features gives silhouette ~0.55 on the Mall dataset
# vs ~0.32 when Age/Gender are included (they add noise, not signal).
def preprocess(df: pd.DataFrame):
    df = df.copy()
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
 