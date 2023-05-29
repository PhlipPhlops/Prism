# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

### Other env variables
ENV FLASK_APP main

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Copy the script into the Docker image
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Install production dependencies.
RUN pip install --no-cache-dir -r requirements.txt

# Download the NLTK "punkt" package
RUN python -m nltk.downloader punkt

# Run the start script
CMD ["/start.sh"]