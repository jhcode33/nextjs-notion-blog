FROM nginx

ARG nginx_config=

USER root
RUN groupmod -g ${nginx_config} nginx && \
    usermod -u ${nginx_config} -g ${nginx_config} nginx

# 기본 사용자로 설정
USER nginx