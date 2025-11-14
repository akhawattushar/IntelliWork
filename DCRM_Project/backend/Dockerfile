FROM python:3.9

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY . .

# Expose port 7860 (required by Hugging Face)
EXPOSE 7860

# Run the Flask app on port 7860
CMD ["python", "stream_api.py"]
