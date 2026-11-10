pipeline {
    agent any

    environment {
        // Add Docker Desktop binary directory to PATH for Jenkins Windows service
        PATH = "C:\\Users\\ADMIN\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;${env.PATH}"
        DOCKER_HUB_USER = 'suryadocker638253'
        IMAGE_BACKEND = 'suryadocker638253/copyoffb-backend'
        IMAGE_FRONTEND = 'suryadocker638253/copyoffb-frontend'
        REGISTRY_CREDS = credentials('docker-hub-credentials')
    }

    stages {
        stage('1. Code Checkout') {
            steps {
                echo '📥 Checking out latest source code from GitHub...'
                checkout scm
            }
        }

        stage('2. Backend Syntax Check') {
            steps {
                echo '🧪 Verifying backend JavaScript syntax...'
                bat 'node -c backend/server.js'
            }
        }

        stage('3. Docker Build') {
            steps {
                echo '🐳 Building Multi-Stage Docker Images...'
                bat 'docker build -t %IMAGE_BACKEND%:latest -t %IMAGE_BACKEND%:%BUILD_NUMBER% ./backend'
                bat 'docker build -t %IMAGE_FRONTEND%:latest -t %IMAGE_FRONTEND%:%BUILD_NUMBER% ./frontend'
            }
        }

        stage('4. Push to Docker Hub') {
            steps {
                echo '📦 Logging into Docker Hub & Pushing Images...'
                bat 'docker login -u %REGISTRY_CREDS_USR% -p %REGISTRY_CREDS_PSW%'
                retry(3) {
                    bat 'docker push %IMAGE_BACKEND%:latest'
                    bat 'docker push %IMAGE_BACKEND%:%BUILD_NUMBER%'
                    bat 'docker push %IMAGE_FRONTEND%:latest'
                    bat 'docker push %IMAGE_FRONTEND%:%BUILD_NUMBER%'
                }
            }
        }

        stage('5. Automated Deploy') {
            steps {
                echo '🚀 Preparing runtime secrets & Deploying containers...'
                bat 'if not exist secrets mkdir secrets'
                bat 'echo postgrespassword> secrets\\db_password.txt'
                bat 'docker compose down'
                bat 'docker compose up -d'
            }
        }

        stage('6. Health Check') {
            steps {
                echo '🩺 Checking application health on port 8085...'
                bat 'curl -I http://localhost:8085'
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up any dangling Docker images...'
            bat 'docker image prune -f'
        }
        success {
            echo '🎉 All stages passed! App is live at http://localhost:8085'
        }
        failure {
            echo '❌ Pipeline failed! Check stage logs for details.'
        }
    }
}
