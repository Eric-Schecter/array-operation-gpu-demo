import React, { useRef, useEffect } from 'react';
import { Application } from './gl';
import styles from './index.module.scss';

type Props = {
  GL_App: new (container: HTMLDivElement,options?:WebGLContextAttributes,extensions?:string[]) => Application;
  options?:WebGLContextAttributes,
  extensions?:string[]
}

export const App = ({ GL_App,options,extensions }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) { return }
    const container = ref.current;
    const app = new GL_App(container,options,extensions);
    const start = async () => {
      await app.setup();
      try {
        app.run();
      } catch (error) {
        console.log(error);
      }
    }
    start();
    return () => app.cleanup();
  }, [ref, GL_App,options,extensions])

  return <div
    ref={ref}
    className={styles.main}
  />
}