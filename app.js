// MathDash - Multiplication Labyrinth Game

class MathDash {
    constructor() {
        this.currentQuestionIndex = 0;
        this.challenges = [];
        this.answers = [];
        this.correctAnswers = 0;
        this.selectedTable = null;
        
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.showTableSelection());
        document.getElementById('backToStartBtn').addEventListener('click', () => this.showScreen('startScreen'));
        document.getElementById('playAgainBtn').addEventListener('click', () => this.showTableSelection());
        document.getElementById('sameTableBtn').addEventListener('click', () => this.startGame(this.selectedTable));
    }

    showTableSelection() {
        const tableGrid = document.getElementById('tableGrid');
        tableGrid.innerHTML = '';
        
        // Create table selection buttons (1-10)
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
                       '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];
        
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.className = 'table-btn';
            btn.style.background = colors[i - 1];
            btn.innerHTML = `
                <div class="table-number">${i}</div>
                <div class="table-label">Table</div>
            `;
            btn.addEventListener('click', () => this.startGame(i));
            tableGrid.appendChild(btn);
        }
        
        this.showScreen('tableSelectScreen');
    }

    startGame(table) {
        // Validate table number
        if (typeof table !== 'number' || table < 1 || table > 10) {
            console.error('Invalid table number:', table);
            return;
        }
        
        this.selectedTable = table;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.correctAnswers = 0;
        
        // Generate challenges for the selected table (1-10)
        this.challenges = this.generateTableChallenges(table);
        
        // Update table badge
        document.getElementById('tableBadge').textContent = `Table: ${table}`;
        
        // Create labyrinth path
        this.createLabyrinthPath(table);
        
        this.showScreen('gameScreen');
        this.displayQuestion();
    }

    generateTableChallenges(table) {
        const challenges = [];
        
        // Create challenges for table × 1 through table × 10
        for (let i = 1; i <= 10; i++) {
            challenges.push({
                question: `${table} × ${i} = ?`,
                answer: table * i,
                multiplier: i
            });
        }
        
        return challenges;
    }

    createLabyrinthPath(table) {
        const pathContainer = document.getElementById('labyrinthPath');
        pathContainer.innerHTML = '';
        
        // Create path nodes for each step in the multiplication sequence
        for (let i = 1; i <= 10; i++) {
            const node = document.createElement('div');
            node.className = 'path-node';
            node.id = `node-${i}`;
            const nodeValue = table * i;
            node.dataset.value = nodeValue;
            
            const nodeContent = document.createElement('div');
            nodeContent.className = 'node-content';
            nodeContent.textContent = nodeValue;
            
            node.appendChild(nodeContent);
            
            // Add click event listener for interactive gameplay
            node.addEventListener('click', () => this.handleNodeClick(parseInt(node.dataset.value), node));
            
            pathContainer.appendChild(node);
            
            // Add connector line (except after last node)
            if (i < 10) {
                const connector = document.createElement('div');
                connector.className = 'path-connector';
                pathContainer.appendChild(connector);
            }
        }
        
        // Highlight first node as active
        this.updateLabyrinthProgress(0);
    }

    updateLabyrinthProgress(index) {
        // Remove all active/completed classes
        document.querySelectorAll('.path-node').forEach(node => {
            node.classList.remove('active', 'completed');
        });
        
        // Mark completed nodes
        for (let i = 0; i < index; i++) {
            document.getElementById(`node-${i + 1}`).classList.add('completed');
        }
        
        // Mark current node as active
        if (index < 10) {
            document.getElementById(`node-${index + 1}`).classList.add('active');
        }
    }

    displayQuestion() {
        const challenge = this.challenges[this.currentQuestionIndex];
        document.getElementById('questionText').textContent = challenge.question;
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        
        // Enable all nodes for clicking
        document.querySelectorAll('.path-node').forEach(node => {
            node.classList.remove('error', 'shake');
            node.style.pointerEvents = 'auto';
            node.style.cursor = 'pointer';
        });
        
        // Disable already completed nodes
        for (let i = 0; i < this.currentQuestionIndex; i++) {
            const completedNode = document.getElementById(`node-${i + 1}`);
            if (completedNode) {
                completedNode.style.pointerEvents = 'none';
                completedNode.style.cursor = 'default';
            }
        }
    }

    handleNodeClick(clickedValue, clickedNode) {
        const challenge = this.challenges[this.currentQuestionIndex];
        const isCorrect = clickedValue === challenge.answer;
        
        this.answers.push({
            question: challenge.question,
            userAnswer: clickedValue,
            correctAnswer: challenge.answer,
            isCorrect: isCorrect
        });
        
        const encouragements = [
            'Awesome! 🌟', 'Great job! ✨', 'Perfect! 🎯', 
            'You got it! 🚀', 'Excellent! 🌈', 'Amazing! 💫',
            'Superb! 🎨', 'Brilliant! 🔥', 'Fantastic! 🎪', 'Wonderful! 🎁'
        ];
        
        if (isCorrect) {
            this.correctAnswers++;
            const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
            this.showFeedback(randomEncouragement, true);
            
            // Disable all nodes during transition
            document.querySelectorAll('.path-node').forEach(node => {
                node.style.pointerEvents = 'none';
            });
            
            // Move to next question or finish
            setTimeout(() => {
                this.currentQuestionIndex++;
                this.updateLabyrinthProgress(this.currentQuestionIndex);
                
                if (this.currentQuestionIndex < this.challenges.length) {
                    this.displayQuestion();
                } else {
                    this.endGame();
                }
            }, 1500);
        } else {
            // Show error feedback
            clickedNode.classList.add('error', 'shake');
            this.showFeedback(`Not quite! ✖️ Try again!`, false);
            
            // Remove error styling after animation
            setTimeout(() => {
                clickedNode.classList.remove('shake');
            }, 500);
        }
    }

    showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    }

    endGame() {
        const accuracy = Math.round((this.correctAnswers / this.challenges.length) * 100);
        
        // Display results
        document.getElementById('completedTable').textContent = this.selectedTable;
        document.getElementById('score').textContent = `${this.correctAnswers}/${this.challenges.length}`;
        
        // Calculate stars (1-3 based on accuracy)
        let stars = '';
        if (accuracy === 100) {
            stars = '⭐⭐⭐';
            document.getElementById('celebrationText').textContent = 'Perfect! You mastered this table! 🏆';
        } else if (accuracy >= 70) {
            stars = '⭐⭐';
            document.getElementById('celebrationText').textContent = 'Great job! Keep practicing! 🌟';
        } else {
            stars = '⭐';
            document.getElementById('celebrationText').textContent = 'Good try! Practice makes perfect! 💪';
        }
        
        document.getElementById('starsEarned').textContent = stars;
        
        this.showScreen('resultsScreen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        } else {
            console.error('Screen not found:', screenId);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MathDash();
});
