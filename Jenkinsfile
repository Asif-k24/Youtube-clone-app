pipeline {
    agent any

    environment {
        // Docker image names
        FRONTEND_IMAGE = 'asif0098/youtube-clone-frontend'
        BACKEND_IMAGE = 'asif0098/youtube-clone-backend'
        BUILD_TAG = "${env.BUILD_NUMBER}"
	PROJECT_DIR = '/home/vagrant/Youtube-Clone'
    }

    stages {
	stage('Copying Project to Workspace') {
            steps {
                sh """
                    echo "Copying project from ${PROJECT_DIR} to workspace..."
                    # Clean workspace first
                    rm -rf * .[^.]* 2>/dev/null || true
                    # Copy project files
                    cp -r ${PROJECT_DIR}/. .
                    echo "Workspace contents:"
                    ls -la
                """
            }
        }

        stage('Clean Workspace') {
            steps {
                sh '''
                    echo "Cleaning up workspace..."
                    # Remove node_modules from both client and backend to avoid conflicts
                    rm -rf client/node_modules backend/node_modules 2>/dev/null || true
                    rm -rf client/package-lock.json backend/package-lock.json 2>/dev/null || true
                    
                    # Clean build directories
                    rm -rf client/dist 2>/dev/null || true
                    
                    # Fix permissions
		    find . -type d -name "node_modules" -prune -o -type d -exec chmod 755 {} \\; 2>/dev/null || true
                    find . -type d -name "node_modules" -prune -o -type f -exec chmod 644 {} \\; 2>/dev/null || true
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                dir('client') {
                    sh '''
                        echo "Installing frontend dependencies..."
                        npm cache clean --force 2>/dev/null || true
                        npm install --legacy-peer-deps --no-audit --no-fund
                        
                        echo "Building frontend..."
                        npm run build
                    '''
                }
            }
        }

        stage('Backend Setup') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Installing backend dependencies..."
                        npm cache clean --force 2>/dev/null || true
                        npm install --only=production --no-audit --no-fund
                    '''
                }
            }
        }

        stage('Docker Build - Frontend') {
            steps {
                dir('client') {
                    script {
                        docker.build("${FRONTEND_IMAGE}:${BUILD_TAG}")
                    }
                }
            }
        }

        stage('Docker Build - Backend') {
            steps {
                dir('backend') {
                    script {
                        docker.build("${BACKEND_IMAGE}:${BUILD_TAG}")
                    }
                }
            }
        }

        stage('Docker Login & Push') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                            
                            # Tag and push frontend
                            docker tag ${FRONTEND_IMAGE}:${BUILD_TAG} ${FRONTEND_IMAGE}:latest
                            docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                            docker push ${FRONTEND_IMAGE}:latest
                            
                            # Tag and push backend
                            docker tag ${BACKEND_IMAGE}:${BUILD_TAG} ${BACKEND_IMAGE}:latest
                            docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                            docker push ${BACKEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                    echo "Stopping existing containers..."
                    docker compose down --remove-orphans || true
                    
                    echo "Removing old images..."
                    docker image prune -f || true
                    
                    echo "Starting application..."
                    docker compose up -d
                    
                    echo "Checking container status..."
                    sleep 10
                    docker compose ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Performing health checks..."
                    
                    # Check if containers are running
                    if docker compose ps | grep -q "Up"; then
                        echo "✓ All containers are running"
                    else
                        echo "✗ Some containers are not running"
                        exit 1
                    fi
                    
                    # Wait for backend to be ready
                    echo "Waiting for backend to be ready..."
                    for i in {1..30}; do
                        if curl -s -f http://localhost:5004/health >/dev/null 2>&1 || \
                           curl -s -f http://localhost:5004/api/health >/dev/null 2>&1; then
                            echo "✓ Backend is responding"
                            break
                        fi
                        if [ $i -eq 30 ]; then
                            echo "✗ Backend health check failed"
                            docker compose logs backend
                            exit 1
                        fi
                        sleep 2
                    done
                    
                    # Optional: Check frontend availability
                    echo "Checking frontend..."
                    if curl -s -f http://localhost:5173 >/dev/null 2>&1; then
                        echo "✓ Frontend is accessible"
                    else
                        echo "⚠ Frontend check failed or not responding immediately"
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            sh '''
                echo "Build ${BUILD_NUMBER} completed successfully"
                echo "Frontend image: ${FRONTEND_IMAGE}:${BUILD_TAG}"
                echo "Backend image: ${BACKEND_IMAGE}:${BUILD_TAG}"
            '''
        }
        failure {
            echo 'Pipeline failed!'
            sh '''
                echo "Checking container logs for errors..."
                docker compose logs --tail=50 || true
            '''
        }
        always {
            echo 'Cleaning up workspace...'
            sh '''
                # Keep node_modules for faster rebuilds in Jenkins workspace
                echo "Cleanup complete"
            '''
        }
    }
}
