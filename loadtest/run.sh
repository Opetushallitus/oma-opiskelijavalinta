#!/bin/bash
set -e

echo "Running k6 test"
k6 run script.js

echo "Done. Shutting down..."
sudo shutdown -h now
