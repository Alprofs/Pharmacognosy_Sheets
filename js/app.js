const App = {
    init() {
        this.loadProgress();
        UI.init();
        UI.renderHome();
    },

    loadProgress() {
        const savedData = localStorage.getItem('pharmaAppProgress');
        if (savedData) {
            DataStore.userProgress = JSON.parse(savedData);
        } else {
            DataStore.userProgress = {
                completedSheets: []
            };
        }
    },

    saveProgress() {
        localStorage.setItem('pharmaAppProgress', JSON.stringify(DataStore.userProgress));
    },

    openSheet(id) {
        const sheet = DataStore.getSheetById(id);
        if (sheet && !sheet.isPlaceholder) {
            UI.renderSheet(sheet);
        }
    },

    completeSheet() {
        UI.hideAllOverlays();
        
        const currentSheetId = QuizController.sheetId;
        if (!DataStore.userProgress.completedSheets.includes(currentSheetId)) {
            DataStore.userProgress.completedSheets.push(currentSheetId);
            this.saveProgress();
        }

        document.getElementById('section-content').style.display = 'none';
        if(document.getElementById('sheet-menu')) {
            document.getElementById('sheet-menu').style.display = 'none';
        }
        UI.renderHome();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
