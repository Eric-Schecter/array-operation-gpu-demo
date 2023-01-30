import { Application } from "../gl";
import screenVS from './shader/screen.vs';
import sumFS from './shader/sum.fs';

// a basic demo to show GPU and CPU random number generation
export class ReduceOpe extends Application {
  private vao!: WebGLVertexArrayObject;
  private sumProgram: WebGLProgram;
  private RESOLUTION = 512;
  private vertices = [
    -1, -1, 
    1, -1, 
    -1, 1, 
    1, 1, 
  ];
  private indices = [
    0, 1, 2, 2, 1, 3
  ];

  constructor(container: HTMLDivElement,options?:WebGLContextAttributes,extensions?:string[]) {
    super(container,options,extensions);

    this.sumProgram = this.programLoader.load(this.gl, screenVS, sumFS);

    // init
    this.vao = this.gl.createVertexArray() as WebGLVertexArrayObject;
    const vbo = this.gl.createBuffer();
    const ibo = this.gl.createBuffer();
    // bind
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    // pass data to buffer
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);
    // bind buffer to variable in gpu
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 8, 0);
    // enable varialbe
    this.gl.enableVertexAttribArray(0);
    // reset
    this.gl.bindVertexArray(null);
  }
  public setup = async () => {
    const rawdata = new Array(this.RESOLUTION * this.RESOLUTION * 4).fill(0).map(() => Math.random() * 100 );

    // cpu version
    this.clock.reset();
    const res = rawdata.reduce((pre,curr)=>pre+curr,0);
    this.clock.update();
    console.log(`result:${res}`);
    console.log(`cpu cost:${this.clock.current * 1000}ms`);

    // gpu version

    const PING_UNIT = 0;
    const PONG_UNIT = 1;
    // ping pong update
    this.gl.useProgram(this.sumProgram);
    this.gl.bindVertexArray(this.vao);

    const bufferLoc = this.gl.getUniformLocation(this.sumProgram, 'u_buffer');
    const u_resolutionLoc = this.gl.getUniformLocation(this.sumProgram, 'u_resolution');

    let size = this.RESOLUTION;
    let pingBufferTexture = this.buildTexture(PING_UNIT, size, size, new Float32Array(rawdata), this.gl.RGBA32F, this.gl.RGBA,
      this.gl.FLOAT, this.gl.CLAMP_TO_EDGE, this.gl.CLAMP_TO_EDGE, this.gl.NEAREST, this.gl.NEAREST);
    let pongBufferTexture:WebGLTexture;
    const textures = [];
    while(size>1){
      size/=2;
      textures.push(this.buildTexture(PING_UNIT, size, size, null, this.gl.RGBA32F, this.gl.RGBA,
        this.gl.FLOAT, this.gl.CLAMP_TO_EDGE, this.gl.CLAMP_TO_EDGE, this.gl.NEAREST, this.gl.NEAREST));
    }

    this.clock.reset();

    let index = 0;
    size = this.RESOLUTION;
    while (size > 1) {
      pongBufferTexture = pingBufferTexture;

      this.rebindTexture(PONG_UNIT,pongBufferTexture);
      size/=2;
      this.gl.viewport(0,0,size,size); // reset viewport when resolution change
      pingBufferTexture = textures[index++];

      this.buildFramebuffer(pingBufferTexture);
      
      this.gl.uniform1i(bufferLoc, PONG_UNIT);
      this.gl.uniform2fv(u_resolutionLoc, [size, size]);
      this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }

    this.clock.update();
    const arrBuffer = new Float32Array(size * size * Float32Array.BYTES_PER_ELEMENT);
    this.gl.readPixels(0,0,size,size,this.gl.RGBA,this.gl.FLOAT,arrBuffer);
    const resGPU = Array.from(arrBuffer)[0];
    console.log(`result:${resGPU}`);
    console.log(`gpu cost:${this.clock.current * 1000}ms`);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
    this.gl.bindVertexArray(null);
    this.gl.useProgram(null);
  }
  private rebindTexture = (unit:number,texture:WebGLTexture) =>{
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.activeTexture(0);
  }
  protected update = (time: number) => {
    
  }
}