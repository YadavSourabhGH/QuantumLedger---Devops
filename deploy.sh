#!/bin/bash
# ====================================================
# QuantumLedger - EC2 Deployment Script
# ====================================================

EC2_IP="3.84.104.8"
PEM_KEY="QuantumLedger.pem"
USER_NAME="ubuntu" # Default user for Ubuntu AMIs. Change to "ec2-user" if using Amazon Linux.

echo "Checking SSH connectivity to ${EC2_IP}..."
ssh -i "${PEM_KEY}" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${USER_NAME}@${EC2_IP}" "echo 'SSH Connection Successful'" 2>/dev/null
if [ $? -ne 0 ]; then
  # Fallback to ec2-user
  USER_NAME="ec2-user"
  ssh -i "${PEM_KEY}" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${USER_NAME}@${EC2_IP}" "echo 'SSH Connection Successful'" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "ERROR: Unable to connect to ${EC2_IP} via SSH."
    echo "Please ensure the EC2 instance is running and the security group allows inbound SSH (Port 22)."
    exit 1
  fi
fi

echo "Deploying files to EC2 (${USER_NAME}@${EC2_IP})..."
# Sync the repository files to the EC2 instance (excluding git, node_modules, temp files)
rsync -avz -e "ssh -i ${PEM_KEY} -o StrictHostKeyChecking=no" \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.gemini/' \
  --exclude='*.pem' \
  ./ "${USER_NAME}@${EC2_IP}:~/QuantumLedger/"

echo "Configuring Docker on EC2..."
ssh -i "${PEM_KEY}" -o StrictHostKeyChecking=no "${USER_NAME}@${EC2_IP}" << 'EOF'
  # Update package manager
  sudo apt-get update -y || sudo yum update -y

  # Install Docker if not present
  if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get install -y docker.io || sudo amazon-linux-extras install docker -y || sudo yum install -y docker
  fi

  # Install Docker Compose if not present
  if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
  fi

  # Enable Docker service to run automatically on system boot / restart
  echo "Stopping host-level nginx if running to free port 80..."
  sudo systemctl stop nginx &>/dev/null || true
  sudo systemctl disable nginx &>/dev/null || true
  
  echo "Enabling Docker service to start on boot..."
  sudo systemctl enable docker
  sudo systemctl start docker

  # Ensure the user has permission to run docker commands
  sudo usermod -aG docker $USER

  # Run Docker Compose stack
  echo "Launching QuantumLedger operations stack..."
  cd ~/QuantumLedger
  
  # Support both "docker compose" and "docker-compose" commands
  if docker compose version &> /dev/null; then
    sudo docker compose -f docker/docker-compose.yml down
    sudo docker compose -f docker/docker-compose.yml up --build -d
  else
    sudo docker-compose -f docker/docker-compose.yml down
    sudo docker-compose -f docker/docker-compose.yml up --build -d
  fi

  echo "Verification: Listing running containers..."
  sudo docker ps
EOF

echo "Deployment finished! Please check http://${EC2_IP}/ in your browser."

