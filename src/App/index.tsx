import React, { useRef, useEffect } from 'react';
import { Application } from './gl';
import styles from './index.module.scss';

type Props = {
  GL_App: new (container: HTMLDivElement) => Application
}

export const App = ({ GL_App }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) { return }
    const container = ref.current;
    const app = new GL_App(container);
    const start = async () => {
      let pre = performance.now();
      await app.setup();
      console.log(performance.now()-pre);
      try {
        app.run();
      } catch (error) {
        console.log(error);
      }
    }
    start();
    return () => app.cleanup();
  }, [ref, GL_App])

  return <div
    ref={ref}
    className={styles.main}
  />
}