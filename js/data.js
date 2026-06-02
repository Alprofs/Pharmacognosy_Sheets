const DataStore = {
    userProgress: { completedSheets: [] },
    sheets: [],
    getSheetById(id) {
        return this.sheets.find(s => s.id === parseInt(id));
    }
};
