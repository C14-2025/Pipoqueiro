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
                                    echo 'Iniciando testes do backend com mocks (sem banco de dados real)...'
                                    sh '''
                                        export NODE_ENV=test
                                        npm install
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

        stage('Notificação por Email') {
            steps {
                script {
                    try {
                        mail (
                            subject: "✅ Pipeline Pipoqueiro - Build #${BUILD_NUMBER} Sucesso",
                            body: """
                                Pipeline Executado com Sucesso!

                                Projeto: ${JOB_NAME}
                                Build: #${BUILD_NUMBER}
                                Branch: ${GIT_BRANCH}
                                Duração: ${currentBuild.durationString}
                                Status: SUCCESS

                                Resumo:
                                - Frontend: Build e testes concluídos
                                - Backend: Build e testes concluídos

                                Ver detalhes: ${BUILD_URL}
                            """,
                            to: "${TEAM_EMAILS}"
                        )
                        echo '📧 Email de sucesso enviado para todos os membros!'
                    } catch (Exception e) {
                        echo "⚠️ Erro ao enviar email: ${e.message}"
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
                try {
                    mail (
                        subject: "❌ Pipeline Pipoqueiro - Build #${BUILD_NUMBER} Falhou",
                        body: """
                            Pipeline Falhou!

                            Projeto: ${JOB_NAME}
                            Build: #${BUILD_NUMBER}
                            Branch: ${GIT_BRANCH}
                            Duração: ${currentBuild.durationString}
                            Status: FAILURE

                            Ação Necessária:
                            O build ou os testes falharam. Por favor, verifique os logs para mais detalhes.

                            Ver Logs: ${BUILD_URL}
                            Console Output: ${BUILD_URL}console
                        """,
                        to: "${TEAM_EMAILS}"
                    )
                    echo '📧 Email de falha enviado para todos os membros!'
                } catch (Exception e) {
                    echo "⚠️ Erro ao enviar email: ${e.message}"
                }
            }
        }
    }
}
