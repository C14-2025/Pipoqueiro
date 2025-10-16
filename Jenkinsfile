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
                                script {
                                    // Iniciar container MySQL para testes
                                    sh '''
                                        docker run -d \
                                            --name mysql-test-${BUILD_NUMBER} \
                                            -e MYSQL_ROOT_PASSWORD=rootpassword \
                                            -e MYSQL_DATABASE=pipoqueiro \
                                            -p 3306:3306 \
                                            mysql:8.0
                                    '''

                                    // Aguardar MySQL iniciar
                                    sh '''
                                        echo "Aguardando MySQL iniciar..."
                                        for i in $(seq 1 30); do
                                            if docker exec mysql-test-${BUILD_NUMBER} mysqladmin ping -h localhost --silent 2>/dev/null; then
                                                echo "MySQL está pronto!"
                                                sleep 5
                                                break
                                            fi
                                            echo "Tentativa $i/30..."
                                            sleep 3
                                        done
                                    '''

                                    // Criar as tabelas
                                    sh '''
                                        docker exec -i mysql-test-${BUILD_NUMBER} mysql -uroot -prootpassword pipoqueiro < database/02-create-tables.sql
                                    '''

                                    try {
                                        dir('backend') {
                                            withCredentials([
                                                string(credentialsId: 'tmdb-api-key', variable: 'TMDB_API_KEY'),
                                                string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                                                string(credentialsId: 'openai_api_key', variable: 'OPENAI_API_KEY')
                                            ]) {
                                                sh '''
                                                    export DB_HOST=localhost
                                                    export DB_USER=root
                                                    export DB_PASSWORD=rootpassword
                                                    export DB_NAME=pipoqueiro
                                                    export DB_PORT=3306
                                                    npm install
                                                    npm test
                                                '''
                                            }
                                        }
                                    } finally {
                                        // Parar e remover container MySQL
                                        sh '''
                                            docker stop mysql-test-${BUILD_NUMBER} || true
                                            docker rm mysql-test-${BUILD_NUMBER} || true
                                        '''
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