pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

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
        stage('Tests') {
            steps {
                echo 'Ejecutando pruebas unitarias del backend con pytest...'
                sh 'docker run --rm aerosig-backend pytest test_api.py -v'
                echo 'Verificando calidad de codigo del frontend con ESLint...'
                sh 'docker run --rm --entrypoint sh aerosig-frontend -c "npm run lint"'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Levantando contenedores con Docker Compose...'
                sh 'docker rm -f aerosig-backend aerosig-frontend || true'
                sh 'docker-compose up -d --build backend frontend'
                echo 'AeroSIG desplegado exitosamente.'
                echo 'Pipeline CI/CD finalizado correctamente.'
                echo 'Trigger pollSCM activo - deteccion automatica de cambios.'
            }
        }
    }

    post {
        success {
            echo 'Pipeline CI/CD completado exitosamente. AeroSIG desplegado y operativo.'
        }
        failure {
            echo 'Pipeline fallido. Revisar logs de la etapa en rojo para identificar el error.'
        }
        always {
            echo 'Ejecucion finalizada. Rama: develop | Herramienta: Jenkins | Proyecto: AeroSIG'
        }
    }
}
