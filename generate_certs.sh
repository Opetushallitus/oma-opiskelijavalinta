#!/bin/bash

# Step 1: Navigate to UI directory and create certificates
echo "Creating certificates using mkcert..."
mkdir -p oma-opiskelijavalinta-ui/certificates
cd oma-opiskelijavalinta-ui/certificates || exit

mkcert localhost

# Step 2: Navigate back to project root
echo "Returning to project root..."
cd ../..

# Step 3: Create the keystore in the backend resources directory
echo "Creating the keystore for localhost..."

openssl pkcs12 -export \
    -in oma-opiskelijavalinta-ui/certificates/localhost.pem \
    -inkey oma-opiskelijavalinta-ui/certificates/localhost-key.pem \
    -out src/test/resources/localhost-keystore.p12 \
    -name oma-opiskelijavalinta \
    -passout pass:oma-opiskelijavalintapass

if [ $? -eq 0 ]; then
    echo "Keystore created successfully at src/main/resources/localhost-keystore.p12"
else
    echo "Failed to create the keystore. Please check the logs above for errors."
fi