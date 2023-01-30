import React from 'react';
import ReactDOM from 'react-dom';
import './index.module.scss';
import * as serviceWorker from './serviceWorker';
import { App } from './App';
import { EveryOpe } from './App/every';
import {FillOpe} from './App/fill';
import {SortOpe} from './App/sort';
import {ReduceOpe} from './App/reduce';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { Application } from './App/gl';

type RouteType = {
  path:string,
  app:new (container: HTMLDivElement,options?:WebGLContextAttributes,extensions?:string[]) => Application,
  options?:WebGLContextAttributes,
  extensions?:string[]
}

// the extension 'EXT_color_buffer_float' suport RGBA32F format fot framebuffer
const routes:RouteType[] = [
  { path: '/', app: FillOpe },
  { path: '/fill', app: FillOpe},
  { path: '/every', app: EveryOpe,options:{preserveDrawingBuffer:false}},
  { path: '/reduce', app: ReduceOpe,extensions:['EXT_color_buffer_float'] },
  { path: '/sort', app: SortOpe,extensions:['EXT_color_buffer_float'] },
]

ReactDOM.render(
  <React.StrictMode>
   <HashRouter>
      <Switch>
        {routes.map((d, i) => 
          <Route 
            key={d.path + i} 
            exact 
            path={d.path} 
            render={() => <App GL_App={d.app} options={d.options} extensions={d.extensions}/>} 
        />)}
      </Switch>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.register();
