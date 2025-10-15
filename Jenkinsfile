pipeline {
    agent any
    
    tools {
        nodejs 'nodejs18'
    }
    
    stages {
        stage('Build e Teste') {
            parallel {
                stage('Frontend') {
                    stages {
                        stage('Build Frontend') {
                            steps {
                                dir('frontend') {
                                    echo 'Iniciando build do frontend...'
                                    sh 'npm install'
                                    sh 'npm run build'
                                    echo 'Build do frontend finalizado com sucesso!'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}