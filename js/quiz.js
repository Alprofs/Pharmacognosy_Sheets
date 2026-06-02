const QuizController = {
    currentRoundQuestions: [],
    currentIndex: 0,
    currentRound: 1,
    sheetId: null,

    startQuiz(sheetId) {
        this.sheetId = sheetId;
        const sheet = DataStore.getSheetById(sheetId);
        
        let fullBank = JSON.parse(JSON.stringify(sheet.quiz));
        fullBank = fullBank.sort(() => Math.random() - 0.5);

        this.prepareRound(fullBank);
        this.currentRound = 1;
        this.loadQuestion();
    },

    prepareRound(questionsArray) {
        this.currentRoundQuestions = questionsArray.map(q => {
            let indices = Array.from(Array(q.options.length).keys());
            q.shuffledIndices = indices.sort(() => Math.random() - 0.5);
            q.userAnswerIndex = null;
            return q;
        });
        this.currentIndex = 0;
    },

    loadQuestion() {
        const qData = this.currentRoundQuestions[this.currentIndex];
        UI.renderQuizQuestion(qData, this.currentIndex, this.currentRoundQuestions.length, this.currentRound);
    },

    selectOption(selectedBtn, originalIdx) {
        const qData = this.currentRoundQuestions[this.currentIndex];
        qData.userAnswerIndex = originalIdx;
        this.loadQuestion();
    },

    nextQuestion() {
        if (this.currentIndex < this.currentRoundQuestions.length - 1) {
            this.currentIndex++;
            this.loadQuestion();
        } else {
            this.evaluateRoundEnd();
        }
    },

    prevQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.loadQuestion();
        }
    },

    evaluateRoundEnd() {
        let failedQuestions = this.currentRoundQuestions.filter(q => q.userAnswerIndex !== q.correct);

        if (failedQuestions.length > 0) {
            this.currentRound++;
            let cleanFailed = failedQuestions.map(q => {
                return {
                    question: q.question,
                    questionAr: q.questionAr,
                    image: q.image, // تم إضافة حفظ الصورة في الإعادات
                    options: q.options,
                    optionsAr: q.optionsAr,
                    correct: q.correct,
                    hint: q.hint,
                    hintAr: q.hintAr
                };
            });

            this.prepareRound(cleanFailed);
            this.loadQuestion();
        } else {
            UI.showWinOverlay();
        }
    }
};
