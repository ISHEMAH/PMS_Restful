#!/bin/bash

# Start the server in the background
echo "Starting the server..."
cd ../server
npm run dev &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 5

# Run the tests
echo "Running tests..."
cd ../test
npx ts-node system.test.ts

# Store the test result
TEST_RESULT=$?

# Kill the server
echo "Stopping the server..."
kill $SERVER_PID

# Exit with the test result
exit $TEST_RESULT 