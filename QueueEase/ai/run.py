"""Entry point for running the FastAPI ML service with uvicorn."""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.ml_api:app", host="0.0.0.0", port=8001, reload=True)
