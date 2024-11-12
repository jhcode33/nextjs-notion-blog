FROM jenkins/jenkins:latest

ARG docker_config=
ARG jenkins_config=

# Docker 설치에 필요한 패키지 업데이트 및 설치
USER root
RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    apt-get clean

# Docker Compose 바이너리 설치
RUN curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

# 기존 Jenkins 그룹과 유저를 수정하여 받은 UID 및 GID를 적용
RUN groupmod -g ${jenkins_config} jenkins && \
    usermod -u ${jenkins_config} -g ${jenkins_config} jenkins && \
    groupadd -g ${docker_config} docker && \
    gpasswd -a jenkins docker

# 기본 사용자로 설정
USER jenkins