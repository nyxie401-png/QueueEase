# QueueEase ML — Waiting Time Predictor

**Random Forest regression model** that predicts patient waiting times
for private doctor clinics. Part of the QueueEase mobile application
(Group 24 — University of Sri Jayewardenepura, Faculty of Computing).

---

## Quick Start

```bash
# 1. Install
pip install -r requirements.txt

# 2. Train
python train_model.py

# 3. Start API
uvicorn ml_api:app --reload

# 4. Docs
open http://localhost:8000/docs
```

---

## Project Structure

```
QueueEase_ML/
├── config.py           All constants, paths, hyperparameters
├── logger.py           Structured logging (file + console)
├── data_generator.py   Synthetic data generation
├── features.py         Feature engineering & preprocessing pipeline
├── models.py           QueueWaitModel class (train / predict / save / load)
├── schemas.py          Pydantic request/response schemas
├── train_model.py      CLI training script
├── ml_api.py           FastAPI server
├── tests/
│   ├── test_models.py  Unit tests — model
│   ├── test_api.py     Integration tests — API
│   └── test_features.py Unit tests — feature engineering
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── Makefile
```

---

## API Endpoints

| Method | Path                  | Auth | Description                  |
|--------|-----------------------|------|------------------------------|
| GET    | `/health`             | No   | Liveness + model status      |
| GET    | `/info`               | Yes  | Model metadata + metrics     |
| POST   | `/predict`            | Yes  | Single prediction            |
| POST   | `/predict/batch`      | Yes  | Batch predictions (≤100)     |
| GET    | `/model/importances`  | Yes  | Feature importances (RF)     |

**Auth:** `X-API-Key: <key>` header  or  `?api_key=<key>` query param.

---

## Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "X-API-Key: queueease-dev-key-change-in-prod" \
  -H "Content-Type: application/json" \
  -d '{
    "queue_length": 8,
    "avg_consultation_minutes": 7.5,
    "hour_of_day": 10,
    "day_of_week": 1,
    "appointment_type": "general"
  }'
```

Response:

```json
{
  "predicted_wait_minutes": 42.5,
  "lower_bound": 39.5,
  "upper_bound": 45.5,
  "confidence": "high",
  "model_version": "1.0.0"
}
```

---

## Docker

```bash
docker compose up -d
```

---

## Tests

```bash
make test          # full suite with coverage
make test-fast     # fast run, no coverage
```
