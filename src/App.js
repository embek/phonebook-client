import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorPage from './components/ErrorPage';
import PhonebookPage from './components/PhonebookPage';
import AddPage from './components/AddPage';
// import CustomContext from './components/CustomContext';
// import todosReducer from './reducers/todos';
// import { useReducer } from 'react';

const router = createBrowserRouter([
  {
    path: "/",
    element: <PhonebookPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/add",
    element: <AddPage />,
  },
]);

function App() {
  // const [todoState, todoDispatch] = useReducer(todosReducer, []);

  // const providerState = {
  //   todoState,
  //   todoDispatch
  // }

  return (
    <RouterProvider router={router} />
  );
}

export default App;