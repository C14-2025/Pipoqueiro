pipeline {
    agent any

    tools {
        nodejs 'nodejs18'
    }

    stages {
        
        stage('Build') {
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
                stage('Backend') {
                    stages {
                        stage('Build Backend') {
                            steps {
                                dir('backend') {
                                    echo 'Iniciando build do backend...'
                                    sh 'npm install'
                                    sh 'npm run build'
                                    echo 'Build do backend finalizado com sucesso!'
                                }
                            }
                        }
                        stage('Test Backend') {
                            steps {
                                dir('backend') {
                                    withCredentials([
                                        string(credentialsId: 'tmdb-api-key', variable: 'TMDB_API_KEY'),
                                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
                                    ]) {
                                        sh 'npm install'
                                        sh 'npm test'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}