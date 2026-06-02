const UI = {
    container: document.getElementById('app-container'),
    backBtn: document.getElementById('back-btn'),
    appTitle: document.getElementById('app-title'),
    translateBtn: document.getElementById('floating-translate-btn'),
    currentSheet: null,
    isRTL: false,
    activeSection: null,

    init() {
        this.isRTL = false;
        document.body.classList.remove('rtl-mode');
    },

    hideAllOverlays() {
        document.getElementById('win-overlay').style.display = 'none';
    },

    toggleTranslation() {
        this.isRTL = !this.isRTL;
        if (this.isRTL) {
            document.body.classList.add('rtl-mode');
            this.translateBtn.innerText = "English ← Arabic";
        } else {
            document.body.classList.remove('rtl-mode');
            this.translateBtn.innerText = "English → Arabic";
        }

        if (this.activeSection === 'quiz') {
            if (typeof QuizController !== 'undefined' && QuizController.currentRoundQuestions.length > 0) {
                QuizController.loadQuestion();
            } else {
                this.openSection('quiz');
            }
        }
    },

    renderHome() {
        this.init();
        this.backBtn.classList.add('hidden');
        this.translateBtn.classList.add('hidden');
        this.backBtn.onclick = null;
        this.appTitle.innerText = "Pharmacognosy Sheets";
        
        let html = `<div class="screen"><div class="sheet-grid">`;
        
        DataStore.sheets.forEach(sheet => {
            const isCompleted = DataStore.userProgress.completedSheets.includes(sheet.id);
            const statusText = isCompleted ? "COMPLETED" : "NOT STARTED";
            const progressWidth = isCompleted ? "100%" : "0%";
            
            const lockedClass = sheet.isPlaceholder ? "locked" : "";
            const onClickAttr = sheet.isPlaceholder ? 
                `onclick="alert('Content to be added soon!')"` : 
                `onclick="App.openSheet(${sheet.id})"`;

            html += `
                <div class="sheet-card ${lockedClass}" ${onClickAttr}>
                    <div class="sheet-title">${sheet.title}</div>
                    <div style="font-size: 14px; color: var(--text-muted); font-weight: 700;">${statusText}</div>
                    <div class="main-progress-bg">
                        <div class="main-progress-fill" style="width: ${progressWidth};"></div>
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
        this.container.innerHTML = html;
    },

    renderSheet(sheet) {
        this.currentSheet = sheet;
        this.backBtn.classList.remove('hidden');
        this.translateBtn.classList.add('hidden'); 
        this.appTitle.innerText = sheet.title;
        this.backBtn.onclick = () => this.renderHome();

        let gridHtml = `<div class="screen" id="sheet-menu"><div class="section-grid">`;

        // إضافة قسم الكويز فقط
        if (sheet.quiz && sheet.quiz.length > 0) gridHtml += this.createSectionCard('quiz', 'Start Quiz', 'اختبار تفاعلي لشيت الأسئلة');

        gridHtml += `</div></div>`;
        gridHtml += `<div id="section-content"></div>`;

        this.container.innerHTML = gridHtml;
    },

    createSectionCard(id, title, desc) {
        return `
            <div class="section-card" onclick="UI.openSection('${id}')">
                <div class="section-title" style="font-family: 'Cairo', sans-serif;">${title}</div>
                <div class="section-desc" style="font-family: 'Cairo', sans-serif;">${desc}</div>
            </div>
        `;
    },

    openSection(sectionId) {
        this.activeSection = sectionId;
        document.getElementById('sheet-menu').style.display = 'none';
        const contentDiv = document.getElementById('section-content');
        contentDiv.style.display = 'block';

        this.backBtn.onclick = () => {
            this.init();
            contentDiv.style.display = 'none';
            document.getElementById('sheet-menu').style.display = 'block';
            this.translateBtn.classList.add('hidden');
            this.backBtn.onclick = () => this.renderHome(); 
        };

        const sheet = this.currentSheet;
        let contentHtml = ``;

        if (sectionId === 'quiz') {
            contentHtml = `
                <div class="screen" style="text-align:center; padding-top: 80px;">
                    <h2 style="margin-bottom: 30px; font-family: 'Cairo', sans-serif;">Ready to test your knowledge?</h2>
                    <button class="btn-main" style="width: 80%; box-shadow: 0 6px 0 var(--btn-green-dark);" onclick="QuizController.startQuiz(${sheet.id})">Start Quiz</button>
                </div>
            `;
            this.translateBtn.classList.add('hidden'); 
            this.backBtn.classList.add('hidden');
        }
        
        contentDiv.innerHTML = contentHtml;
    },

    renderQuizQuestion(qData, currentIndex, totalNum, roundNum) {
        this.activeSection = 'quiz'; 
        const contentDiv = document.getElementById('section-content');
        const progressPercent = ((currentIndex + 1) / totalNum) * 100;
        const isAnswered = qData.userAnswerIndex !== null;

        this.translateBtn.classList.remove('hidden');

        let qText = (this.isRTL && qData.questionAr) ? qData.questionAr : qData.question;
        let qOptions = (this.isRTL && qData.optionsAr && qData.optionsAr.length > 0) ? qData.optionsAr : qData.options;
        let qHint = (this.isRTL && qData.hintAr) ? qData.hintAr : qData.hint;
        
        // عرض صورة السؤال إن وُجدت
        let imgHtml = qData.image ? `<img src="${qData.image}" class="question-img" alt="Question Image">` : '';

        let html = `
            <div class="quiz-wrapper">
                <div class="quiz-header">
                    <span class="close-btn" onclick="UI.exitQuiz()">✕</span>
                    <div class="quiz-progress-bar-bg">
                        <div class="quiz-progress-bar-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                    <div style="font-weight: 800; font-size: 16px; direction: ltr;">${currentIndex + 1}/${totalNum}</div>
                </div>
                <div id="round-info">Round ${roundNum}</div>
                <div class="quiz-question-box">
                    ${qText.replace(/\n/g, '<br>')}
                    ${imgHtml}
                </div>
                <div class="options-container">
        `;

        qData.shuffledIndices.forEach(originalIdx => {
            let stateClass = "active-click";
            let clickAction = `onclick="QuizController.selectOption(this, ${originalIdx})"`;

            if (isAnswered) {
                clickAction = ""; 
                stateClass = "locked"; 
                if (originalIdx === qData.correct) stateClass += " correct";
                else if (originalIdx === qData.userAnswerIndex && qData.userAnswerIndex !== qData.correct) stateClass += " wrong";
            }
            html += `<div class="option-btn ${stateClass}" ${clickAction}>${qOptions[originalIdx].replace(/\n/g, '<br>')}</div>`;
        });
        html += `</div>`;
        
        if (isAnswered && qHint) {
            html += `
                <div class="orange-note-box">
                    <div class="orange-note-title">💡 ${this.isRTL ? "توضيح:" : "Explanation:"}</div>
                    <ul class="explanation-list"><li>${qHint.replace(/\n/g, '<br>')}</li></ul>
                </div>
            `;
        }

        const backDisabled = currentIndex === 0 ? "disabled" : "";
        const nextDisabled = !isAnswered ? "disabled" : "";
        const nextText = (currentIndex === totalNum - 1 && isAnswered) ? (this.isRTL ? "إنهاء" : "FINISH") : (this.isRTL ? "التالي" : "NEXT");

        html += `
                <div class="quiz-footer">
                    <button class="nav-btn next" ${nextDisabled} onclick="QuizController.nextQuestion()">${nextText}</button>
                    <button class="nav-btn prev" ${backDisabled} onclick="QuizController.prevQuestion()">${this.isRTL ? "الرجوع" : "BACK"}</button>
                </div>
            </div>
        `;
        contentDiv.innerHTML = html;
    },

    exitQuiz() {
        this.init();
        if (typeof QuizController !== 'undefined') QuizController.currentRoundQuestions = [];
        document.getElementById('section-content').style.display = 'none';
        document.getElementById('sheet-menu').style.display = 'block';
        this.translateBtn.classList.add('hidden');
        this.backBtn.classList.remove('hidden');
        this.backBtn.onclick = () => this.renderHome(); 
    },

    showWinOverlay() {
        this.translateBtn.classList.add('hidden');
        document.getElementById('win-overlay').style.display = 'flex';
        confetti({ particleCount: 300, spread: 100, origin: { y: 0.6 }, colors: ['#12D11E', '#2196F3', '#FFC107'] });
    }
};
