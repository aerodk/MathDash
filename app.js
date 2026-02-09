// MathDash - Multiplication Labyrinth Game

class MathDash {
    constructor() {
        this.currentQuestionIndex = 0;
        this.challenges = [];
        this.answers = [];
        this.correctAnswers = 0;
        this.firstAttemptCorrect = 0;
        this.attemptedQuestions = new Set();
        this.selectedTable = null;
        this.selectedMode = null; // 'tables' or 'mixed'
        this.wrongAttempts = {}; // Track wrong attempts per question
        
        // Constants for distractor generation
        this.MAX_DISTRACTOR_GENERATION_ATTEMPTS = 20;
        this.FALLBACK_RANDOM_RANGE = 3;
        this.FALLBACK_MIN_OFFSET = 2;
        this.MAX_FALLBACK_ATTEMPTS = 10;
        this.OPTIONS_COUNT = 5; // Number of multiple choice options
        
        // Initialize language manager
        this.langManager = new LanguageManager();
        
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up language switcher
        this.setupLanguageSwitcher();
        
        // Apply initial language
        this.langManager.updatePageLanguage();
    }
    
    setupLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.langManager.setLanguage(lang);
                // Update dynamic game content if in game
                this.updateDynamicGameContent();
            });
        });
        
        // Set initial active language
        const activeBtn = document.querySelector(`[data-lang="${this.langManager.currentLanguage}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    updateDynamicGameContent() {
        // Update table badge if on game screen
        if (this.selectedTable && document.getElementById('gameScreen').classList.contains('active')) {
            document.getElementById('tableBadge').textContent = `${this.langManager.getTranslation('tableBadge')}: ${this.selectedTable}`;
            
            // Update step progress safely without innerHTML
            const progressSpan = document.querySelector('.progress-info span');
            progressSpan.textContent = `${this.langManager.getTranslation('stepProgress')} `;
            const questionSpan = document.createElement('span');
            questionSpan.id = 'currentQuestion';
            questionSpan.textContent = String(this.currentQuestionIndex + 1);
            progressSpan.appendChild(questionSpan);
            progressSpan.appendChild(document.createTextNode('/10'));
        }
        
        // Update table selection screen if active
        if (document.getElementById('tableSelectScreen').classList.contains('active')) {
            this.showTableSelection();
        }
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.showModeSelection());
        document.getElementById('backToStartBtn').addEventListener('click', () => this.showScreen('startScreen'));
        document.getElementById('backToModeBtn').addEventListener('click', () => this.showModeSelection());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.showModeSelection());
        document.getElementById('sameTableBtn').addEventListener('click', () => {
            if (this.selectedMode === 'tables') {
                this.startGame(this.selectedTable);
            } else {
                this.startMixedGame();
            }
        });
        document.getElementById('tablesBtn').addEventListener('click', () => {
            this.selectedMode = 'tables';
            this.showTableSelection();
        });
        document.getElementById('mixedBtn').addEventListener('click', () => {
            this.selectedMode = 'mixed';
            this.startMixedGame();
        });
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
                <div class="table-label">${this.langManager.getTranslation('tableLabel')}</div>
            `;
            btn.addEventListener('click', () => this.startGame(i));
            tableGrid.appendChild(btn);
        }
        
        this.showScreen('tableSelectScreen');
    }

    showModeSelection() {
        this.showScreen('modeSelectScreen');
    }

    startMixedGame() {
        this.selectedTable = null;
        this.selectedMode = 'mixed';
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.correctAnswers = 0;
        this.firstAttemptCorrect = 0;
        this.attemptedQuestions = new Set();
        this.wrongAttempts = {};
        
        // Generate mixed challenges (addition, subtraction, multiplication, division)
        this.challenges = this.generateMixedChallenges();
        
        // Update table badge
        document.getElementById('tableBadge').textContent = this.langManager.getTranslation('mixedModeBadge');
        
        // Update step progress text
        const progressSpan = document.querySelector('.progress-info span');
        progressSpan.textContent = `${this.langManager.getTranslation('stepProgress')} `;
        const questionSpan = document.createElement('span');
        questionSpan.id = 'currentQuestion';
        questionSpan.textContent = '1';
        progressSpan.appendChild(questionSpan);
        progressSpan.appendChild(document.createTextNode('/10'));
        
        // Create labyrinth path
        this.createLabyrinthPath(null);
        
        this.showScreen('gameScreen');
        this.displayQuestion();
    }

    startGame(table) {
        // Validate table number
        if (typeof table !== 'number' || table < 1 || table > 10) {
            console.error('Invalid table number:', table);
            return;
        }
        
        this.selectedTable = table;
        this.selectedMode = 'tables';
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.correctAnswers = 0;
        this.firstAttemptCorrect = 0;
        this.attemptedQuestions = new Set();
        this.wrongAttempts = {};
        
        // Generate challenges for the selected table (1-10)
        this.challenges = this.generateTableChallenges(table);
        
        // Update table badge
        document.getElementById('tableBadge').textContent = `${this.langManager.getTranslation('tableBadge')}: ${table}`;
        
        // Update step progress text safely without innerHTML
        const progressSpan = document.querySelector('.progress-info span');
        progressSpan.textContent = `${this.langManager.getTranslation('stepProgress')} `;
        const questionSpan = document.createElement('span');
        questionSpan.id = 'currentQuestion';
        questionSpan.textContent = '1';
        progressSpan.appendChild(questionSpan);
        progressSpan.appendChild(document.createTextNode('/10'));
        
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
                multiplier: i,
                operation: 'multiplication'
            });
        }
        
        return challenges;
    }

    generateMixedChallenges() {
        const challenges = [];
        const operations = ['addition', 'subtraction', 'multiplication', 'division'];
        
        // Generate 10 random challenges with numbers from 10 to 50
        for (let i = 0; i < 10; i++) {
            const operation = operations[Math.floor(Math.random() * operations.length)];
            let a, b, answer, question;
            
            switch(operation) {
                case 'addition':
                    a = Math.floor(Math.random() * 41) + 10; // 10-50
                    b = Math.floor(Math.random() * 41) + 10; // 10-50
                    answer = a + b;
                    question = `${a} + ${b} = ?`;
                    break;
                    
                case 'subtraction':
                    // Ensure result is positive
                    a = Math.floor(Math.random() * 41) + 10; // 10-50
                    b = Math.floor(Math.random() * (a - 10)) + 10; // 10 to (a-10), ensuring positive result
                    answer = a - b;
                    question = `${a} - ${b} = ?`;
                    break;
                    
                case 'multiplication':
                    a = Math.floor(Math.random() * 9) + 2; // 2-10
                    b = Math.floor(Math.random() * 9) + 2; // 2-10
                    answer = a * b;
                    question = `${a} × ${b} = ?`;
                    break;
                    
                case 'division':
                    // Ensure clean division
                    b = Math.floor(Math.random() * 9) + 2; // 2-10 (divisor)
                    const quotient = Math.floor(Math.random() * 9) + 2; // 2-10
                    a = b * quotient;
                    answer = quotient;
                    question = `${a} ÷ ${b} = ?`;
                    break;
            }
            
            challenges.push({
                question: question,
                answer: answer,
                operation: operation,
                operands: { a, b }
            });
        }
        
        return challenges;
    }

    generateHint(challenge) {
        const { operation, operands, answer } = challenge;
        
        if (!operands) return null;
        
        const { a, b } = operands;
        
        switch(operation) {
            case 'multiplication':
                // Decomposition strategy: e.g., 7×17 = 7×10 + 7×7
                if (b > 10) {
                    const tens = Math.floor(b / 10) * 10;
                    const ones = b % 10;
                    if (ones > 0) {
                        return this.langManager.getTranslation('hintMultiplication')
                            .replace('{a}', a)
                            .replace('{b}', b)
                            .replace('{tens}', tens)
                            .replace('{ones}', ones)
                            .replace('{part1}', a * tens)
                            .replace('{part2}', a * ones);
                    } else {
                        return this.langManager.getTranslation('hintMultiplicationSimple')
                            .replace('{a}', a)
                            .replace('{b}', b)
                            .replace('{result}', a * 10)
                            .replace('{count}', tens / 10);
                    }
                }
                return null;
                
            case 'division':
                return this.langManager.getTranslation('hintDivision')
                    .replace('{a}', a)
                    .replace('{b}', b)
                    .replace('{answer}', answer);
                
            case 'addition':
                // Break down into tens and ones
                const aTens = Math.floor(a / 10) * 10;
                const aOnes = a % 10;
                const bTens = Math.floor(b / 10) * 10;
                const bOnes = b % 10;
                return this.langManager.getTranslation('hintAddition')
                    .replace('{a}', a)
                    .replace('{b}', b)
                    .replace('{aTens}', aTens)
                    .replace('{aOnes}', aOnes)
                    .replace('{bTens}', bTens)
                    .replace('{bOnes}', bOnes);
                
            case 'subtraction':
                return this.langManager.getTranslation('hintSubtraction')
                    .replace('{a}', a)
                    .replace('{b}', b)
                    .replace('{answer}', answer);
                
            default:
                return null;
        }
    }

    createLabyrinthPath(table) {
        const pathContainer = document.getElementById('labyrinthPath');
        pathContainer.innerHTML = '';
        
        // Create maze with multiple paths - 5 options per question
        for (let i = 1; i <= 10; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'maze-row';
            rowDiv.id = `row-${i}`;
            
            const challenge = this.challenges[i - 1];
            const correctAnswer = challenge.answer;
            
            // Generate wrong answers (distractors)
            const options = this.generateMazeOptions(correctAnswer, table, challenge);
            
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
    
    generateMazeOptions(correctAnswer, table, challenge) {
        // Generate 4 wrong answers along with the correct answer (total of 5 options)
        const options = [correctAnswer];
        const wrongAnswers = new Set();
        
        // Safety counter to prevent infinite loops
        let attempts = 0;
        
        // Strategy for generating plausible wrong answers
        while (wrongAnswers.size < 4 && attempts < this.MAX_DISTRACTOR_GENERATION_ATTEMPTS) {
            attempts++;
            let wrongAnswer;
            
            if (challenge && challenge.operation) {
                // Use operation-specific strategies for mixed mode
                wrongAnswer = this.generateOperationSpecificDistractor(challenge, wrongAnswers.size);
            } else {
                // Original table-based strategies
                const strategy = Math.floor(Math.random() * 4);
                
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
            }
            
            // Ensure wrong answer is positive and different from correct answer
            if (wrongAnswer > 0 && wrongAnswer !== correctAnswer && !wrongAnswers.has(wrongAnswer)) {
                wrongAnswers.add(wrongAnswer);
            }
        }
        
        // If we couldn't generate enough wrong answers (edge case), use smart fallbacks
        let fallbackAttempts = 0;
        while (wrongAnswers.size < 4 && fallbackAttempts < this.MAX_FALLBACK_ATTEMPTS) {
            fallbackAttempts++;
            // Use different offsets to ensure variety
            const fallbackOffset = (wrongAnswers.size + 1) * (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
            const fallback = correctAnswer + fallbackOffset;
            if (fallback > 0 && fallback !== correctAnswer && !wrongAnswers.has(fallback)) {
                wrongAnswers.add(fallback);
            }
        }
        
        return [correctAnswer, ...Array.from(wrongAnswers)];
    }

    generateOperationSpecificDistractor(challenge, distractorIndex) {
        const { operation, operands, answer } = challenge;
        const { a, b } = operands;
        
        switch(operation) {
            case 'addition':
                const strategies = [
                    () => a + b + Math.floor(Math.random() * 10) + 1, // Slightly higher
                    () => a + b - Math.floor(Math.random() * 10) - 1, // Slightly lower
                    () => a + b + 10, // Off by 10
                    () => a - b // Common mistake: subtraction instead
                ];
                return strategies[distractorIndex % strategies.length]();
                
            case 'subtraction':
                const subStrategies = [
                    () => a - b + Math.floor(Math.random() * 10) + 1,
                    () => a - b - Math.floor(Math.random() * 10) - 1,
                    () => b - a, // Reversed
                    () => a + b // Common mistake: addition instead
                ];
                return Math.abs(subStrategies[distractorIndex % subStrategies.length]());
                
            case 'multiplication':
                const multStrategies = [
                    () => a * b + a, // Off by one factor
                    () => a * b - a,
                    () => a * b + b,
                    () => a + b // Common mistake: addition instead
                ];
                return multStrategies[distractorIndex % multStrategies.length]();
                
            case 'division':
                const divStrategies = [
                    () => answer + 1,
                    () => answer - 1,
                    () => b, // Common mistake: using divisor
                    () => a // Common mistake: using dividend
                ];
                return divStrategies[distractorIndex % divStrategies.length]();
                
            default:
                return answer + Math.floor(Math.random() * 10) - 5;
        }
    }
    
    /**
     * Fisher-Yates shuffle algorithm
     * Mutates the input array in place
     * @param {Array} array - The array to shuffle (will be modified)
     */
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
        
        // Clear hint
        const hintBox = document.getElementById('hintBox');
        if (hintBox) {
            hintBox.style.display = 'none';
            hintBox.textContent = '';
        }
        
        // Initialize wrong attempts counter for this question
        if (!this.wrongAttempts[this.currentQuestionIndex]) {
            this.wrongAttempts[this.currentQuestionIndex] = 0;
        }
        
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
        
        const encouragements = this.langManager.getTranslation('feedbackCorrect');
        
        if (isCorrect) {
            this.correctAnswers++;
            
            // Track first-attempt correctness
            if (!this.attemptedQuestions.has(this.currentQuestionIndex)) {
                this.firstAttemptCorrect++;
            }
            
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
            // Mark this question as attempted (for first-attempt tracking)
            this.attemptedQuestions.add(this.currentQuestionIndex);
            
            // Increment wrong attempts counter
            this.wrongAttempts[this.currentQuestionIndex]++;
            
            // Show error feedback
            clickedNode.classList.add('error', 'shake');
            this.showFeedback(this.langManager.getTranslation('feedbackWrong'), false);
            
            // Remove this incorrect option (progressive removal)
            setTimeout(() => {
                clickedNode.style.display = 'none';
                clickedNode.style.pointerEvents = 'none';
            }, 500);
            
            // Show hint after 2 wrong attempts
            if (this.wrongAttempts[this.currentQuestionIndex] === 2) {
                const hint = this.generateHint(challenge);
                if (hint) {
                    const hintBox = document.getElementById('hintBox');
                    if (hintBox) {
                        hintBox.textContent = '💡 ' + hint;
                        hintBox.style.display = 'block';
                    }
                }
            }
            
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
        const accuracy = Math.round((this.firstAttemptCorrect / this.challenges.length) * 100);
        
        // Display results
        document.getElementById('completedTable').textContent = this.selectedTable;
        document.getElementById('score').textContent = `${this.firstAttemptCorrect}/${this.challenges.length}`;
        
        // Calculate stars (1-3 based on accuracy)
        let stars = '';
        let celebrationKey = '';
        if (accuracy === 100) {
            stars = '⭐⭐⭐';
            celebrationKey = 'celebrationPerfect';
        } else if (accuracy >= 70) {
            stars = '⭐⭐';
            celebrationKey = 'celebrationGood';
        } else {
            stars = '⭐';
            celebrationKey = 'celebrationTry';
        }
        
        document.getElementById('celebrationText').textContent = this.langManager.getTranslation(celebrationKey);
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
