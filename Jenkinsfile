# Remove o arquivo duplicado se ainda existir
del "c:\Users\otavi\OneDrive\Área de Trabalho\GITC14\Pipoqueiro\jenkins-pipeline\Jenkinsfile"
rmdir "c:\Users\otavi\OneDrive\Área de Trabalho\GITC14\Pipoqueiro\jenkins-pipeline"

# Atualiza o Git
git rm -r jenkins-pipeline/Jenkinsfile
git add Jenkinsfile
git commit -m "fix: corrige conteúdo do Jenkinsfile e remove arquivo duplicado"

pipeline {
    agent any
    
    tools {
        nodejs 'nodejs18'
    }

    stages {
        stage('Build e Teste') {
            parallel {
                stage('Backend') {
                    stages {
                        stage('Build Backend') {
                            steps {
                                dir('backend') {
                                    sh 'npm install'
                                    sh 'npm run build'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
