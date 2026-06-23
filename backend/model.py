import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

from data_loader import load_data, preprocess, assign_churn_risk

_cache = {}
_model_metrics = {}
_rf_model = None
_rf_label_encoder = None


def compute_elbow(max_k: int = 10):
    df = load_data()
    _, scaled, _ = preprocess(df)

    wcss = []

    for k in range(1, max_k + 1):
        km = KMeans(
            n_clusters=k,
            init="k-means++",
            random_state=42,
            n_init=10
        )

        km.fit(scaled)
        wcss.append(round(km.inertia_, 2))

    return [{"k": i + 1, "wcss": w} for i, w in enumerate(wcss)]


def run_clustering(k: int = 5):
    cache_key = f"cluster_{k}"

    if cache_key in _cache:
        return _cache[cache_key]

    df = load_data()
    df_proc, scaled, scaler = preprocess(df)

    km = KMeans(
        n_clusters=k,
        init="k-means++",
        random_state=42,
        n_init=10
    )

    labels = km.fit_predict(scaled)
    df_proc["Cluster"] = labels

    sil = round(
        silhouette_score(scaled, labels),
        4
    ) if k > 1 else 0.0

    cluster_stats = {}

    for c in range(k):
        subset = df_proc[df_proc["Cluster"] == c]

        cluster_stats[c] = {
            "avg_spending": round(subset["SpendingScore"].mean(), 1),
            "avg_income": round(subset["AnnualIncome"].mean(), 1),
            "avg_age": round(subset["Age"].mean(), 1),
            "count": len(subset),
        }

    customers = []

    for _, row in df_proc.iterrows():
        cid = int(row["Cluster"])
        risk = assign_churn_risk(cid, cluster_stats)

        customers.append({
            "id": int(row["CustomerID"]),
            "gender": row["Gender"],
            "age": int(row["Age"]),
            "annualIncome": int(row["AnnualIncome"]),
            "spendingScore": int(row["SpendingScore"]),
            "cluster": cid,
            "churnRisk": risk["risk"],
            "riskLevel": risk["level"],
            "riskColor": risk["color"],
            "riskBadge": risk["badge"],
        })

    clusters = []

    for c in range(k):
        stats = cluster_stats[c]
        risk_info = assign_churn_risk(c, cluster_stats)

        clusters.append({
            "id": c,
            "count": stats["count"],
            "avgSpending": stats["avg_spending"],
            "avgIncome": stats["avg_income"],
            "avgAge": stats["avg_age"],
            "churnRisk": risk_info["risk"],
            "riskLevel": risk_info["level"],
            "riskColor": risk_info["color"],
            "riskBadge": risk_info["badge"],
        })

    clusters.sort(key=lambda x: -x["riskLevel"])

    result = {
        "k": k,
        "silhouetteScore": sil,
        "totalCustomers": len(customers),
        "clusters": clusters,
        "customers": customers,
        "scatterData": [
            {
                "x": int(row["AnnualIncome"]),
                "y": int(row["SpendingScore"]),
                "cluster": int(row["Cluster"]),
                "age": int(row["Age"]),
                "id": int(row["CustomerID"]),
            }
            for _, row in df_proc.iterrows()
        ],
    }

    _cache[cache_key] = result
    return result


def train_churn_model():
    global _rf_model
    global _rf_label_encoder
    global _model_metrics

    if _rf_model is not None:
        return

    df = load_data()
    print("DATASET COLUMNS:", df.columns.tolist())

    required_cols = [
        "Age",
        "AnnualIncome",
        "SpendingScore",
        "VisitFrequency",
        "SatisfactionScore",
        "ComplaintsCount",
        "LoyaltyPoints",
        "ChurnRisk"
    ]

    missing = [c for c in required_cols if c not in df.columns]

    if missing:
        print("MISSING COLUMNS:", missing)
        _model_metrics = {
            "accuracy": 0,
            "precision": 0,
            "recall": 0,
            "f1": 0
        }
        return

    X = df[
        [
            "Age",
            "AnnualIncome",
            "SpendingScore",
            "VisitFrequency",
            "SatisfactionScore",
            "ComplaintsCount",
            "LoyaltyPoints"
        ]
    ]

    le = LabelEncoder()
    y = le.fit_transform(df["ChurnRisk"])

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    rf = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)

    _model_metrics = {
        "accuracy": round(
            accuracy_score(y_test, y_pred) * 100,
            2
        ),
        "precision": round(
            precision_score(
                y_test,
                y_pred,
                average="weighted"
            ) * 100,
            2
        ),
        "recall": round(
            recall_score(
                y_test,
                y_pred,
                average="weighted"
            ) * 100,
            2
        ),
        "f1": round(
            f1_score(
                y_test,
                y_pred,
                average="weighted"
            ) * 100,
            2
        )
    }

    _rf_model = rf
    _rf_label_encoder = le


def get_model_metrics():
    train_churn_model()
    return _model_metrics


def predict_customer(
    age: int,
    income: int,
    spending: int,
    gender: str,
    visit_frequency: float = 0,
    satisfaction_score: float = 5,
    complaints_count: float = 0,
    loyalty_points: float = 0,
):
    result = run_clustering(5)

    df = load_data()
    _, scaled_all, scaler = preprocess(df)

    raw = np.array([[income, spending]], dtype=float)
    scaled_input = scaler.transform(raw)

    km = KMeans(
        n_clusters=5,
        init="k-means++",
        random_state=42,
        n_init=10
    )

    km.fit(scaled_all)

    cluster = int(km.predict(scaled_input)[0])

    cluster_stats = {
        c["id"]: {
            "avg_spending": c["avgSpending"],
            "avg_income": c["avgIncome"]
        }
        for c in result["clusters"]
    }

    segment_risk = assign_churn_risk(
        cluster,
        cluster_stats
    )

    # Default: use the cluster-based risk label
    churn_prediction = segment_risk["risk"]
    confidence = None

    train_churn_model()

    if _rf_model is not None:
        features = [[
            age,
            income,
            spending,
            visit_frequency,
            satisfaction_score,
            complaints_count,
            loyalty_points
        ]]

        pred = _rf_model.predict(features)[0]
        churn_prediction = _rf_label_encoder.inverse_transform([pred])[0]

        # Convert RF labels to UI labels
        if churn_prediction == "High":
            churn_prediction = "High Risk"
        elif churn_prediction == "Medium":
            churn_prediction = "Medium Risk"
        elif churn_prediction == "Low":
            churn_prediction = "Low Risk"

        probs = _rf_model.predict_proba(features)[0]

        print("Classes:", _rf_label_encoder.classes_)
        print("Prediction:", churn_prediction)
        print("Probabilities:", probs)
        print("Features:", features)

        confidence = round(
            float(max(probs) * 100),
            1
        )

    recommendations = {
        "High Risk":
            "Offer retention discounts and personalized engagement campaigns.",

        "Medium Risk":
            "Monitor activity and provide targeted promotions.",

        "Low Risk":
            "Maintain engagement and reward loyalty."
    }

    if churn_prediction == "High Risk":
        risk_badge = "🔴"
    elif churn_prediction == "Medium Risk":
        risk_badge = "🟡"
    else:
        risk_badge = "🟢"

    return {
        "cluster": cluster,

        "segmentRisk": segment_risk["risk"],

        "predictedChurnRisk": churn_prediction,

        "confidence": confidence,

        "recommendation": recommendations.get(
            churn_prediction,
            "Maintain engagement."
        ),

        "riskColor": segment_risk["color"],
        "riskBadge": risk_badge,
    }