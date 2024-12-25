import { combineReducers } from 'redux';
import contacts from './contacts';
import modal from './modal';

export default combineReducers({
    contacts, modal
});