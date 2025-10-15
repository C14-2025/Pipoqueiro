pipeline {
    agent any

    stages {
        stage('Build') {
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