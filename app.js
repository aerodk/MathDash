// MathDash - Daily Math Challenge Game

class MathDash {
    constructor() {
        this.currentQuestionIndex = 0;
        this.challenges = [];
        this.answers = [];
        this.startTime = null;
        this.endTime = null;
        this.correctAnswers = 0;
        this.todayDate = this.getTodayDate();
        
        this.init();
    }

    init() {
        // Generate today's challenges (same for everyone)
        this.challenges = this.generateDailyChallenges(this.todayDate);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show challenge date
        document.getElementById('challengeDate').textContent = this.formatDate(this.todayDate);
        
        // Load and display today's stats if already completed
        this.displayTodayStats();
        
        // Register service worker for PWA
        this.registerServiceWorker();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('answerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResults());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyResults());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetToStart());
    }

    getTodayDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Seeded random number generator for consistent daily challenges
    seededRandom(seed) {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    generateDailyChallenges(dateStr) {
        // Convert date to seed
        const seed = dateStr.split('-').map(n => parseInt(n)).reduce((a, b) => a * 100 + b, 0);
        
        const challenges = [];
        const operations = ['+', '-', '×', '÷'];
        
        for (let i = 0; i < 10; i++) {
            const currentSeed = seed + i * 1000;
            let rand1 = this.seededRandom(currentSeed);
            let rand2 = this.seededRandom(currentSeed + 1);
            let rand3 = this.seededRandom(currentSeed + 2);
            
            const operation = operations[Math.floor(rand3 * operations.length)];
            let num1, num2, answer;
            
            switch (operation) {
                case '+':
                    num1 = Math.floor(rand1 * 50) + 1;
                    num2 = Math.floor(rand2 * 50) + 1;
                    answer = num1 + num2;
                    break;
                case '-':
                    num1 = Math.floor(rand1 * 50) + 20;
                    num2 = Math.floor(rand2 * (num1 - 10)) + 1;
                    answer = num1 - num2;
                    break;
                case '×':
                    num1 = Math.floor(rand1 * 12) + 2;
                    num2 = Math.floor(rand2 * 12) + 2;
                    answer = num1 * num2;
                    break;
                case '÷':
                    num2 = Math.floor(rand2 * 10) + 2;
                    answer = Math.floor(rand1 * 15) + 1;
                    num1 = num2 * answer;
                    break;
            }
            
            challenges.push({
                question: `${num1} ${operation} ${num2} = ?`,
                answer: answer
            });
        }
        
        return challenges;
    }

    startGame() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.correctAnswers = 0;
        this.startTime = Date.now();
        
        this.showScreen('gameScreen');
        this.displayQuestion();
        this.startTimer();
    }

    displayQuestion() {
        const challenge = this.challenges[this.currentQuestionIndex];
        document.getElementById('questionText').textContent = challenge.question;
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('answerInput').value = '';
        document.getElementById('answerInput').focus();
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
    }

    submitAnswer() {
        const userAnswer = parseInt(document.getElementById('answerInput').value);
        
        if (isNaN(userAnswer)) {
            return;
        }
        
        const challenge = this.challenges[this.currentQuestionIndex];
        const isCorrect = userAnswer === challenge.answer;
        
        this.answers.push({
            question: challenge.question,
            userAnswer: userAnswer,
            correctAnswer: challenge.answer,
            isCorrect: isCorrect
        });
        
        if (isCorrect) {
            this.correctAnswers++;
            this.showFeedback('Correct! ✓', true);
        } else {
            this.showFeedback(`Wrong! The answer is ${challenge.answer}`, false);
        }
        
        // Move to next question or finish
        setTimeout(() => {
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex < this.challenges.length) {
                this.displayQuestion();
            } else {
                this.endGame();
            }
        }, 1000);
    }

    showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timerDisplay').textContent = this.formatTime(elapsed);
        }, 100);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.endTime = Date.now();
        
        const totalTime = Math.floor((this.endTime - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.challenges.length) * 100);
        
        // Save today's result
        this.saveTodayResult({
            date: this.todayDate,
            time: totalTime,
            score: this.correctAnswers,
            total: this.challenges.length,
            accuracy: accuracy
        });
        
        // Display results
        document.getElementById('finalTime').textContent = this.formatTime(totalTime);
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.getElementById('score').textContent = `${this.correctAnswers}/${this.challenges.length}`;
        
        // Generate shareable text
        this.generateShareText(totalTime, accuracy);
        
        this.showScreen('resultsScreen');
    }

    generateShareText(totalTime, accuracy) {
        const emoji = accuracy === 100 ? '🎯' : accuracy >= 80 ? '🔥' : accuracy >= 60 ? '👍' : '💪';
        
        const shareText = `MathDash ${emoji}\n${this.formatDate(this.todayDate)}\n\n⏱️ Time: ${this.formatTime(totalTime)}\n✅ Score: ${this.correctAnswers}/${this.challenges.length}\n📊 Accuracy: ${accuracy}%`;
        
        document.getElementById('shareText').textContent = shareText;
    }

    shareResults() {
        const shareText = document.getElementById('shareText').textContent;
        
        if (navigator.share) {
            navigator.share({
                title: 'MathDash Results',
                text: shareText
            }).catch(() => {
                this.copyResults();
            });
        } else {
            this.copyResults();
        }
    }

    copyResults() {
        const shareText = document.getElementById('shareText').textContent;
        
        navigator.clipboard.writeText(shareText).then(() => {
            const btn = document.getElementById('copyBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied! ✓';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    saveTodayResult(result) {
        try {
            localStorage.setItem('mathdash_result_' + this.todayDate, JSON.stringify(result));
        } catch (e) {
            console.error('Failed to save result:', e);
        }
    }

    getTodayResult() {
        try {
            const result = localStorage.getItem('mathdash_result_' + this.todayDate);
            return result ? JSON.parse(result) : null;
        } catch (e) {
            console.error('Failed to load result:', e);
            return null;
        }
    }

    displayTodayStats() {
        const result = this.getTodayResult();
        const statsEl = document.getElementById('todayStats');
        
        if (result) {
            statsEl.textContent = `You've already completed today's challenge! Time: ${this.formatTime(result.time)}, Score: ${result.score}/${result.total}`;
        } else {
            statsEl.textContent = '';
        }
    }

    resetToStart() {
        this.showScreen('startScreen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MathDash();
});
