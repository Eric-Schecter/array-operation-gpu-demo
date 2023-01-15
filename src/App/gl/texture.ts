export class Texture {
  public id: WebGLTexture = 0;
  public location: WebGLUniformLocation = 0;
  constructor(private gl: WebGL2RenderingContext) { }
  private setup = (width: number, height: number, data: ArrayBufferView) => {
    // create + bind
    this.id = this.gl.createTexture() as WebGLTexture;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    // set parameters
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    // set data
    this.gl.texStorage2D(this.gl.TEXTURE_2D, 1, this.gl.RGBA8, width, height);
    this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    // mipmap
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
  }
  private setupImage = (image: HTMLImageElement) => {
    // create + bind
    this.id = this.gl.createTexture() as WebGLTexture;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
  }
  public load = (path: string) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = path;
        image.onload = ()=>{
          this.setupImage(image);
          resolve(true);
        }
    })
  }
}