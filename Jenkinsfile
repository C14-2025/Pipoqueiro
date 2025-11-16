pipeline {
    agent any

    tools {
        nodejs 'nodejs22'
    }

    environment {
        SENDER_EMAIL = 'alexandretoalves@gmail.com'
        TEAM_EMAILS = 'augusto.otavio@ges.inatel.br, a.augusto@ges.inatel.br, davi.padula@gec.inatel.br, jordan.lima@gec.inatel.br, alexandre.tommasi@ges.inatel.br, xandinhotalves@gmail.com'
    }

    stages {

        stage('Build e Test') {
            parallel {
                stage('Frontend') {
                    stages {
                        stage('Install Frontend') {
                            steps {
                                dir('frontend') {
                                    echo 'Instalando dependencias do frontend...'
                                    sh 'npm ci --prefer-offline --no-audit'
                                    echo 'Dependencias instaladas!'
                                }
                            }
                        }
                        stage('Build Frontend') {
                            steps {
                                dir('frontend') {
                                    echo 'Iniciando build do frontend...'
                                    sh 'npm run build'
                                    echo 'Build do frontend finalizado com sucesso!'
                                }
                            }
                        }
                        stage('Test Frontend') {
                            steps {
                                dir('frontend') {
                                    echo 'Iniciando testes do frontend...'
                                    sh 'npm test'
                                    echo 'Testes do frontend finalizados com sucesso!'
                                }
                            }
                        }
                    }
                }
                stage('Backend') {
                    stages {
                        stage('Install Backend') {
                            steps {
                                dir('backend') {
                                    echo 'Instalando dependencias do backend...'
                                    sh 'npm ci --prefer-offline --no-audit'
                                    echo 'Dependencias instaladas!'
                                }
                            }
                        }
                        stage('Build Backend') {
                            steps {
                                dir('backend') {
                                    echo 'Iniciando build do backend...'
                                    sh 'npm run build'
                                    echo 'Build do backend finalizado com sucesso!'
                                }
                            }
                        }
                        stage('Test Backend') {
                            steps {
                                dir('backend') {
                                    echo 'Iniciando testes do backend com mocks (sem banco de dados real)...'
                                    sh '''
                                        # Usa .env.test automaticamente (testes usam mocks)
                                        cp .env.test .env 2>/dev/null || true

                                        # Define NODE_ENV e roda testes
                                        export NODE_ENV=test
                                        npm test
                                    '''
                                    echo 'Testes do backend finalizados com sucesso!'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Notificacao Simulada') {
            steps {
                script {
                    echo '=========================================='
                    echo 'SIMULACAO DE NOTIFICACAO POR EMAIL'
                    echo '=========================================='
                    echo ''
                    echo "Para: ${TEAM_EMAILS}"
                    echo "Assunto: Pipeline Pipoqueiro - Build #${BUILD_NUMBER} Sucesso"
                    echo ''
                    echo '--- Corpo do Email ---'
                    echo 'Pipeline Executado com Sucesso!'
                    echo ''
                    echo "Projeto: ${JOB_NAME}"
                    echo "Build: #${BUILD_NUMBER}"
                    echo "Branch: ${env.GIT_BRANCH ?: 'N/A'}"
                    echo "Duracao: ${currentBuild.durationString}"
                    echo 'Status: SUCCESS'
                    echo ''
                    echo 'Resumo:'
                    echo '- Frontend: Build e testes concluidos'
                    echo '- Backend: Build e testes concluidos'
                    echo ''
                    echo "Ver detalhes: ${BUILD_URL}"
                    echo '--- Fim do Email ---'
                    echo ''
                    echo 'Email simulado com sucesso (nao enviado de fato)'
                    echo '=========================================='
                }
            }
        }
    }

    post {
        always {
            echo '=========================================='
            echo 'Pipeline finalizado!'
            echo '=========================================='
        }
        success {
            echo 'Build e testes concluidos com sucesso!'
        }
        failure {
            echo 'Build ou testes falharam. Verifique os logs.'
            script {
                echo ''
                echo '=========================================='
                echo 'SIMULACAO DE EMAIL DE FALHA'
                echo '=========================================='
                echo ''
                echo "Para: ${TEAM_EMAILS}"
                echo "Assunto: Pipeline Pipoqueiro - Build #${BUILD_NUMBER} Falhou"
                echo ''
                echo '--- Corpo do Email ---'
                echo 'Pipeline Falhou!'
                echo ''
                echo "Projeto: ${JOB_NAME}"
                echo "Build: #${BUILD_NUMBER}"
                echo "Branch: ${env.GIT_BRANCH ?: 'N/A'}"
                echo "Duracao: ${currentBuild.durationString}"
                echo 'Status: FAILURE'
                echo ''
                echo 'Acao Necessaria:'
                echo 'O build ou os testes falharam. Por favor, verifique os logs para mais detalhes.'
                echo ''
                echo "Ver Logs: ${BUILD_URL}"
                echo "Console Output: ${BUILD_URL}console"
                echo '--- Fim do Email ---'
                echo ''
                echo 'Email de falha simulado (nao enviado de fato)'
                echo '=========================================='
            }
        }
    }
}
