#!/bin/sh
echo "Starting Yellow Brain"
if [ "$ENVIRONMENT" = "DEVELOPMENT" ]
then
    echo "Running Development Server"
    flask --debug run --host=0.0.0.0 --port $PORT
else
    echo "Running Production Server"
    # Run the web service on container startup. Here we use the gunicorn
    # webserver, with one worker process and 8 threads.
    # For environments with multiple CPU cores, increase the number of workers
    # to be equal to the cores available.
    # Timeout is set to 0 to disable the timeouts of the workers to allow Cloud Run to handle instance scaling.
    exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
fi
