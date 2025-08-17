#!/bin/bash

# Activate virtual environment and run the FastAPI server
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000