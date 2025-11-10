FROM jenkins/jenkins:lts

USER root

# Instalar Node.js 22 LTS (resolve warnings de Vite e ESLint)
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verificar versões instaladas
RUN node --version && npm --version

# Instalar plugins essenciais do Jenkins
RUN jenkins-plugin-cli --plugins \
    git \
    workflow-aggregator \
    pipeline-stage-view \
    nodejs \
    email-ext \
    mailer \
    github \
    github-branch-source \
    blueocean

USER jenkins

# Expor portas
EXPOSE 8080
EXPOSE 50000
