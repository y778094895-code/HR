VENV?=.venv
PY=$(VENV)/bin/python
PIP=$(VENV)/bin/pip

.PHONY: install install-dev fmt lint test precommit mlflow serve

install:
	$(PIP) install -r requirements.txt

install-dev:
	$(PIP) install -r requirements.txt -r requirements-dev.txt

fmt:
	$(PY) -m ruff format .
	$(PY) -m ruff check --fix .
	$(PY) -m black .

lint:
	$(PY) -m ruff check .
	$(PY) -m mypy src || true

test:
	$(PY) -m pytest

precommit:
	$(PY) -m pre_commit install
	$(PY) -m pre_commit run --all-files

mlflow:
	mlflow server --host 0.0.0.0 --port 5000 --backend-store-uri sqlite:///mlflow.db --default-artifact-root ./artifacts/mlflow

serve:
	$(PY) -m uvicorn hr_ai_layer.serving.app:app --host 0.0.0.0 --port 8000
