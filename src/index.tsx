import React from 'react';
import ReactDOM from 'react-dom';
import './index.module.scss';
import * as serviceWorker from './serviceWorker';
import { App } from './App';
import { Random } from './App/random';

ReactDOM.render(
  <React.StrictMode>
    <App GL_App={Random} />
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.register();
