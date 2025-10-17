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
                        stage('Test Frontend') {
                            steps {
                                dir('frontend') {
                                    echo 'Iniciando testes do frontend...'
                                    sh 'npm install'
                                    sh 'npm test'
                                    echo 'Testes do frontend finalizados com sucesso!'
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
                                    echo 'Iniciando testes do backend com mocks (sem MySQL)...'
                                    withCredentials([
                                        string(credentialsId: 'tmdb-api-key', variable: 'TMDB_API_KEY'),
                                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                                        string(credentialsId: 'openai_api_key', variable: 'OPENAI_API_KEY')
                                    ]) {
                                        // Configurar variáveis de ambiente para testes
                                        sh '''
                                            export NODE_ENV=test
                                            export JWT_SECRET="${JWT_SECRET}"
                                            export TMDB_API_KEY="${TMDB_API_KEY}"
                                            npm install
                                            npm test
                                        '''
                                    }
                                    echo 'Testes do backend finalizados com sucesso!'
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finalizado!'
        }
        success {
            echo '✅ Build e testes concluídos com sucesso!'
        }
        failure {
            echo '❌ Build ou testes falharam. Verifique os logs.'
        }
    }
}
