import {combineReducers} from 'redux';
import {reducer as toastrReducer} from 'react-redux-toastr';

import menu from './menu/reducer';
export default combineReducers({
    toastr: toastrReducer,
    menu
});