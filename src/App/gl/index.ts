import { Clock } from './clock';
import { ProgramLoader } from './programLoader';
import { throwErrorIfInvalid } from './utils';

export abstract class Application {
  protected canvas!: HTMLCanvasElement;
  protected gl!: WebGL2RenderingContext;
  protected programLoader = new ProgramLoader();
  private timer = 0;
  protected clock = new Clock();
  constructor(protected container: HTMLElement,private options:WebGLContextAttributes = {},private extensions:string[] = []) {
    this.initWindow();
    this.initWebGL();
    this.clock.reset();
  }
  public run = () => {
    this.timer = requestAnimationFrame(this.mainLoop);
  }
  private initWindow = () => {
    this.canvas = document.createElement('canvas');
    const { clientWidth, clientHeight } = this.container;
    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;
    this.container.appendChild(this.canvas);
  }
  private initWebGL = () => {
    this.gl = throwErrorIfInvalid(this.canvas.getContext('webgl2',this.options));
    this.extensions.forEach(extension => {
      const ext = this.gl.getExtension(extension);
      if (!ext) {
        console.log(`failed to get ${extension}`);
      }
    });
  }
  private mainLoop = () => {
    this.clock.update();
    this.update(this.clock.current);
    this.timer = requestAnimationFrame(this.mainLoop);
  }
  public cleanup = () => {
    cancelAnimationFrame(this.timer);
  }
  protected abstract update: (time: number) => void;
  public setup = () => { };
  protected buildTexture = (unit:number,width:number,height:number,data:ArrayBufferView|null,internalFormat:number,
    format:number,type:number,wrapS:number, wrapT:number, minFilter:number, magFilter:number) => {
    const texture = this.gl.createTexture() as WebGLTexture;
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, data);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S, wrapS);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T, wrapT);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER, minFilter);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER, magFilter);
    return texture;
  }
  protected buildFramebuffer = (attachment:WebGLTexture) => {
    const framebuffer = this.gl.createFramebuffer() as WebGLFramebuffer;
    if(!this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER)){
      console.log('create framebuffer failed');
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, attachment, 0);
    return framebuffer;
  }
}