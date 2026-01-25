// Translations for MathDash
const translations = {
    en: {
        // Start Screen
        title: "🎮 MathDash",
        subtitle: "Multiplication Maze",
        welcomeText: "Welcome! Choose a times table to practice!",
        instructionText: "Navigate through the maze by solving multiplication problems! 🌟",
        startButton: "Choose Your Table!",
        
        // Table Selection Screen
        selectTitle: "Choose Your Times Table! 🎯",
        selectSubtitle: "Which multiplication table do you want to practice?",
        tableLabel: "Table",
        backButton: "Back",
        
        // Game Screen
        tableBadge: "Table",
        stepProgress: "Step",
        questionFormat: "{a} × {b} = ?",
        instructionGame: "Choose the correct answer from the options above! 👆",
        
        // Feedback messages
        feedbackCorrect: [
            'Awesome! 🌟', 'Great job! ✨', 'Perfect! 🎯', 
            'You got it! 🚀', 'Excellent! 🌈', 'Amazing! 💫',
            'Superb! 🎨', 'Brilliant! 🔥', 'Fantastic! 🎪', 'Wonderful! 🎁'
        ],
        feedbackWrong: "Not quite! ✖️ Try again!",
        
        // Results Screen
        resultsTitle: "Amazing Work! 🎉✨",
        celebrationPerfect: "Perfect! You mastered this table! 🏆",
        celebrationGood: "Great job! Keep practicing! 🌟",
        celebrationTry: "Good try! Practice makes perfect! 💪",
        completedText: "You completed the maze!",
        statTablePracticed: "Table Practiced",
        statCorrectAnswers: "Correct Answers",
        statStarsEarned: "Stars Earned",
        playAgainButton: "Practice Another Table! 🎮",
        sameTableButton: "Practice Same Table Again"
    },
    da: {
        // Start Screen
        title: "🎮 MathDash",
        subtitle: "Gangetabel Labyrint",
        welcomeText: "Velkommen! Vælg en gangetabel at øve!",
        instructionText: "Naviger gennem labyrinten ved at løse gangestykker! 🌟",
        startButton: "Vælg Din Tabel!",
        
        // Table Selection Screen
        selectTitle: "Vælg Din Gangetabel! 🎯",
        selectSubtitle: "Hvilken gangetabel vil du øve?",
        tableLabel: "Tabel",
        backButton: "Tilbage",
        
        // Game Screen
        tableBadge: "Tabel",
        stepProgress: "Trin",
        questionFormat: "{a} × {b} = ?",
        instructionGame: "Vælg det rigtige svar fra mulighederne ovenfor! 👆",
        
        // Feedback messages
        feedbackCorrect: [
            'Fantastisk! 🌟', 'Godt klaret! ✨', 'Perfekt! 🎯', 
            'Du fik det! 🚀', 'Fremragende! 🌈', 'Utroligt! 💫',
            'Forrygende! 🎨', 'Brilliant! 🔥', 'Fantastisk! 🎪', 'Vidunderligt! 🎁'
        ],
        feedbackWrong: "Ikke helt! ✖️ Prøv igen!",
        
        // Results Screen
        resultsTitle: "Fantastisk Arbejde! 🎉✨",
        celebrationPerfect: "Perfekt! Du har mestret denne tabel! 🏆",
        celebrationGood: "Godt klaret! Bliv ved med at øve! 🌟",
        celebrationTry: "Godt forsøg! Øvelse gør mester! 💪",
        completedText: "Du gennemførte labyrinten!",
        statTablePracticed: "Tabel Øvet",
        statCorrectAnswers: "Rigtige Svar",
        statStarsEarned: "Stjerner Optjent",
        playAgainButton: "Øv En Anden Tabel! 🎮",
        sameTableButton: "Øv Samme Tabel Igen"
    }
};

// Language Manager
class LanguageManager {
    constructor() {
        this.currentLanguage = this.loadLanguage();
        this.onLanguageChange = null;
    }

    loadLanguage() {
        // Try to load from localStorage, default to English
        const saved = localStorage.getItem('mathDashLanguage');
        return saved || 'en';
    }

    saveLanguage(lang) {
        localStorage.setItem('mathDashLanguage', lang);
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            this.saveLanguage(lang);
            this.updatePageLanguage();
            if (this.onLanguageChange) {
                this.onLanguageChange(lang);
            }
        }
    }

    getTranslation(key) {
        return translations[this.currentLanguage][key] || translations.en[key] || key;
    }

    updatePageLanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (element.tagName === 'INPUT') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update active language flag
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-lang="${this.currentLanguage}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}
