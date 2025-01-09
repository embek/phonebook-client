import { createContext, useContext } from 'react';

const CustomContext = createContext();
export default CustomContext;

export function useCustomContext() {
    return useContext(CustomContext);
}