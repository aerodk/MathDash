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
        
        // Create maze with multiple paths - 3 options per question
        for (let i = 1; i <= 10; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'maze-row';
            rowDiv.id = `row-${i}`;
            
            const correctAnswer = table * i;
            
            // Generate wrong answers (distractors)
            const options = this.generateMazeOptions(correctAnswer, table);
            
            // Shuffle options so correct answer isn't always in same position
            this.shuffleArray(options);
            
            // Create nodes for each option
            options.forEach((value, index) => {
                const node = document.createElement('div');
                node.className = 'path-node';
                node.id = `node-${i}-${index}`;
                node.dataset.value = value;
                node.dataset.isCorrect = (value === correctAnswer);
                node.dataset.row = i;
                
                const nodeContent = document.createElement('div');
                nodeContent.className = 'node-content';
                nodeContent.textContent = value;
                
                node.appendChild(nodeContent);
                
                // Add click event listener for interactive gameplay
                node.addEventListener('click', () => this.handleNodeClick(parseInt(node.dataset.value), node));
                
                rowDiv.appendChild(node);
            });
            
            pathContainer.appendChild(rowDiv);
        }
        
        // Highlight first row as active
        this.updateLabyrinthProgress(0);
    }
    
    generateMazeOptions(correctAnswer, table) {
        // Generate 2 wrong answers along with the correct answer
        const options = [correctAnswer];
        const wrongAnswers = new Set();
        
        // Safety counter to prevent infinite loops (20 attempts should be more than enough)
        let attempts = 0;
        const maxAttempts = 20;
        const FALLBACK_RANDOM_RANGE = 3;
        const FALLBACK_MIN_OFFSET = 2;
        
        // Strategy for generating plausible wrong answers
        while (wrongAnswers.size < 2 && attempts < maxAttempts) {
            attempts++;
            const strategy = Math.floor(Math.random() * 4);
            let wrongAnswer;
            
            switch(strategy) {
                case 0: // Off by table value
                    wrongAnswer = correctAnswer + (Math.random() < 0.5 ? table : -table);
                    break;
                case 1: // Off by 1
                    wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1);
                    break;
                case 2: // Related table answer - use different table with same multiplier
                    const offset = Math.floor(Math.random() * 3) + 1;
                    const relatedTable = Math.max(1, table + (Math.random() < 0.5 ? offset : -offset));
                    const multiplier = Math.ceil(correctAnswer / table);
                    wrongAnswer = relatedTable * multiplier;
                    break;
                case 3: // Random nearby value
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
                    break;
            }
            
            // Ensure wrong answer is positive and different from correct answer
            if (wrongAnswer > 0 && wrongAnswer !== correctAnswer && !wrongAnswers.has(wrongAnswer)) {
                wrongAnswers.add(wrongAnswer);
            }
        }
        
        // If we couldn't generate enough wrong answers (edge case), use smart fallbacks
        while (wrongAnswers.size < 2) {
            // Try table-based offset first, then small random offsets
            const fallbackStrategy = wrongAnswers.size === 0 ? table : Math.floor(Math.random() * FALLBACK_RANDOM_RANGE) + FALLBACK_MIN_OFFSET;
            const fallback = correctAnswer + fallbackStrategy;
            if (fallback > 0 && fallback !== correctAnswer && !wrongAnswers.has(fallback)) {
                wrongAnswers.add(fallback);
            }
        }
        
        return [correctAnswer, ...Array.from(wrongAnswers)];
    }
    
    // Fisher-Yates shuffle - mutates array in place
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    updateLabyrinthProgress(index) {
        // Remove all active classes and disable all rows
        document.querySelectorAll('.maze-row').forEach(row => {
            row.classList.remove('active');
        });
        
        document.querySelectorAll('.path-node').forEach(node => {
            node.classList.remove('active');
            node.style.pointerEvents = 'none';
        });
        
        // Enable current row
        if (index < 10) {
            const currentRow = document.getElementById(`row-${index + 1}`);
            if (currentRow) {
                currentRow.classList.add('active');
                currentRow.querySelectorAll('.path-node').forEach(node => {
                    node.classList.add('active');
                    node.style.pointerEvents = 'auto';
                });
            }
        }
    }

    displayQuestion() {
        const challenge = this.challenges[this.currentQuestionIndex];
        document.getElementById('questionText').textContent = challenge.question;
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        
        // Update the maze progress to enable current row
        this.updateLabyrinthProgress(this.currentQuestionIndex);
    }

    handleNodeClick(clickedValue, clickedNode) {
        // Check if this node is in the current active row
        const nodeRow = parseInt(clickedNode.dataset.row);
        if (nodeRow !== this.currentQuestionIndex + 1) {
            return; // Ignore clicks on wrong rows
        }
        
        const challenge = this.challenges[this.currentQuestionIndex];
        const isCorrect = clickedNode.dataset.isCorrect === 'true';
        
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
            
            // Mark the correct node as completed
            clickedNode.classList.remove('active');
            clickedNode.classList.add('completed');
            
            // Mark wrong nodes in current row as wrong
            const currentRow = document.getElementById(`row-${nodeRow}`);
            currentRow.querySelectorAll('.path-node').forEach(node => {
                if (node !== clickedNode) {
                    node.classList.add('wrong-path');
                    node.style.pointerEvents = 'none';
                }
            });
            
            // Disable all nodes during transition
            document.querySelectorAll('.path-node').forEach(node => {
                node.style.pointerEvents = 'none';
            });
            
            // Move to next question or finish
            setTimeout(() => {
                this.currentQuestionIndex++;
                
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
                // Keep the error class to show it was tried
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
