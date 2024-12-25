import { combineReducers } from 'redux';
import contacts from './contacts';
import query from './query';
import modal from './modal';

export default combineReducers({
    contacts,
    query,
    modal
});