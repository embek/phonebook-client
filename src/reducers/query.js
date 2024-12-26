const initialState = {
    search: '',
    sortBy: 'name',
    sortMode: 'ASC',
    limit: 10
};

export default function queryReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_QUERY':
            return { ...state, ...action.payload };
        case 'TOGGLE_SORT_MODE':
            return {
                ...state,
                sortMode: state.sortMode === 'ASC' ? 'DESC' : 'ASC'
            };
        default:
            return state;
    }
}
