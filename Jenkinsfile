pipeline {
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Clonando repositorio AeroSIG...'
                checkout scm
            }
        }
        stage('Build Backend') {
            steps {
                echo 'Construyendo imagen Docker del backend...'
                sh 'docker build -t aerosig-backend ./backend'
            }
        }
        stage('Build Frontend') {
            steps {
                echo 'Construyendo imagen Docker del frontend...'
                sh 'docker build -t aerosig-frontend ./frontend'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Levantando contenedores con Docker Compose...'
                sh 'docker-compose up -d --build backend frontend'
                echo 'AeroSIG desplegado exitosamente.'
                echo 'Pipeline CI/CD finalizado correctamente.'
            }
        }
    }
}
