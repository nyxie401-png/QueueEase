.PHONY: install train test lint api docker clean

install:
	pip install -r requirements.txt

train:
	python train_model.py

train-compare:
	python train_model.py --compare

data:
	python data_generator.py

test:
	pytest

test-fast:
	pytest -x -q --no-cov

lint:
	ruff check .

api:
	uvicorn ml_api:app --host 0.0.0.0 --port 8000 --reload

docker-build:
	docker build -t queueease-ml:latest .

docker-run:
	docker compose up -d

docker-logs:
	docker compose logs -f

clean:
	find . -type d -name __pycache__ | xargs rm -rf
	find . -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage htmlcov
