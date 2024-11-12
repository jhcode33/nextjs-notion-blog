FROM jenkins/jenkins:latest

# Docker 설치에 필요한 패키지 업데이트 및 설치
USER root
RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    apt-get clean

# 기존 jenkins 그룹과 유저를 수정하여 2000 UID 및 GID를 적용
RUN groupmod -g 2000 jenkins
RUN usermod -u 2000 -g 2000 jenkins
RUN groupadd -g 1001 docker
RUN gpasswd -a jenkins docker

# 기본 사용자로 설정
USER jenkins