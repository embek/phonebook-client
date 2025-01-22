import { createContext, useReducer } from 'react';
import { contactsReducer, initialState } from '../reducers/contactsReducer';

export const CustomContext = createContext();

export function CustomContextProvider({ children }) {
    const [state, dispatch] = useReducer(contactsReducer, {
        ...initialState,
        query: JSON.parse(sessionStorage.getItem('query')) || initialState.query
    });

    return (
        <CustomContext.Provider value={{ state, dispatch }}>
            {children}
        </CustomContext.Provider>
    );
}