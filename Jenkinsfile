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