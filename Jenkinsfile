pipeline {
    agent any

    tools {
        nodejs 'nodejs18'
    }

    environment {
        SENDER_EMAIL = 'alexandretoalves@gmail.com'
        TEAM_EMAILS = 'augusto.otavio@ges.inatel.br, a.augusto@ges.inatel.br, davi.padula@gec.inatel.br, jordan.lima@gec.inatel.br, alexandre.tommasi@ges.inatel.br, xandinhotalves@gmail.com'
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

        stage('Notificação por Email') {
            steps {
                script {
                    def buildStatus = currentBuild.result ?: 'SUCCESS'

                    if (buildStatus == 'SUCCESS') {
                        emailext (
                            subject: "✅ Pipeline Pipoqueiro - Build #${BUILD_NUMBER} Sucesso",
                            body: """
                                <html>
                                <body style="font-family: Arial, sans-serif;">
                                    <h2 style="color: #28a745;">✅ Pipeline Executado com Sucesso!</h2>
                                    <p><strong>Projeto:</strong> ${JOB_NAME}</p>
                                    <p><strong>Build:</strong> #${BUILD_NUMBER}</p>
                                    <p><strong>Branch:</strong> ${GIT_BRANCH}</p>
                                    <p><strong>Duração:</strong> ${currentBuild.durationString}</p>
                                    <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">SUCCESS</span></p>
                                    <hr>
                                    <h3>Resumo:</h3>
                                    <ul>
                                        <li>✅ Frontend: Build e testes concluídos</li>
                                        <li>✅ Backend: Build e testes concluídos</li>
                                    </ul>
                                    <hr>
                                    <p><a href="${BUILD_URL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Detalhes do Build</a></p>
                                    <p style="color: #666; font-size: 12px;">Build executado em: ${new Date()}</p>
                                </body>
                                </html>
                            """,
                            from: "${SENDER_EMAIL}",
                            to: "${TEAM_EMAILS}",
                            mimeType: 'text/html'
                        )
                        echo '📧 Email de sucesso enviado para todos os membros!'
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
            script {
                emailext (
                    subject: "❌ Pipeline Pipoqueiro - Build #${BUILD_NUMBER} Falhou",
                    body: """
                        <html>
                        <body style="font-family: Arial, sans-serif;">
                            <h2 style="color: #dc3545;">❌ Pipeline Falhou!</h2>
                            <p><strong>Projeto:</strong> ${JOB_NAME}</p>
                            <p><strong>Build:</strong> #${BUILD_NUMBER}</p>
                            <p><strong>Branch:</strong> ${GIT_BRANCH}</p>
                            <p><strong>Duração:</strong> ${currentBuild.durationString}</p>
                            <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">FAILURE</span></p>
                            <hr>
                            <h3>Ação Necessária:</h3>
                            <p style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 10px;">
                                O build ou os testes falharam. Por favor, verifique os logs para mais detalhes.
                            </p>
                            <hr>
                            <p><a href="${BUILD_URL}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Logs do Build</a></p>
                            <p><a href="${BUILD_URL}console" style="background-color: #6c757d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Ver Console Output</a></p>
                            <p style="color: #666; font-size: 12px;">Build executado em: ${new Date()}</p>
                        </body>
                        </html>
                    """,
                    from: "${SENDER_EMAIL}",
                    to: "${TEAM_EMAILS}",
                    mimeType: 'text/html'
                )
                echo '📧 Email de falha enviado para todos os membros!'
            }
        }
    }
}
