import {createStore, applyMiddleware} from "redux";
import thunkMiddleware from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import reducers from "./ducks/reducers";

const middleware = [thunkMiddleware];

export default function configureStore(initialState = {}) {
    return createStore(
        reducers,
        initialState,
        composeWithDevTools(applyMiddleware(...middleware))
    );
}
