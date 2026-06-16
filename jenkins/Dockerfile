FROM jenkins/jenkins:lts
USER root
RUN apt-get update && apt-get install -y lsb-release curl && \
    curl -fsSLo /usr/share/keyrings/docker-archive-keyring.asc \
      https://download.docker.com/linux/debian/gpg && \
    echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.asc] \
      https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y docker-ce-cli
USER jenkins
