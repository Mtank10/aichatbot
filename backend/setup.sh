#!/bin/bash

# Setup script for the Python backend
echo "Setting up Python virtual environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Setup complete! You can now run the backend with:"
echo "  cd backend && ./run.sh"
echo ""
echo "Or manually activate the environment with:"
echo "  source backend/venv/bin/activate"