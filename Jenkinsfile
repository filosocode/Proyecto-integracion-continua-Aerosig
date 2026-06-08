pipeline {
    agent any

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
    }
}