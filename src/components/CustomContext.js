import { createContext, useReducer } from 'react';
import { rootReducer, initialState } from '../reducers/rootReducer';

export const CustomContext = createContext();

export function CustomContextProvider({ children }) {
    const [state, dispatch] = useReducer(rootReducer, {
        ...initialState,
        query: JSON.parse(sessionStorage.getItem('query')) || initialState.query
    });

    return (
        <CustomContext.Provider value={{ state, dispatch }}>
            {children}
        </CustomContext.Provider>
    );
}