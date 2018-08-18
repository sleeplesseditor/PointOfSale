import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
import { makeRoutes } from './routes';
import registerServiceWorker from './registerServiceWorker';

render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    , document.getElementById('root')
);
registerServiceWorker();
