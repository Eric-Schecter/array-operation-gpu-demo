import { Application } from "../gl";
import screenVS from './shader/screen.vs';
import oddevenFS from './shader/oddeven.fs';

// a basic demo to show GPU and CPU random number generation
export class Sort extends Application {
  private vao!: WebGLVertexArrayObject;
  private oddevenProgram: WebGLProgram;
  private RESOLUTION = 256;
  private vertices = [
    -1, -1, 
    1, -1, 
    -1, 1, 
    1, 1, 
  ];
  private indices = [
    0, 1, 2, 2, 1, 3
  ];

  constructor(container: HTMLDivElement) {
    super(container);

    this.oddevenProgram = this.programLoader.load(this.gl, screenVS, oddevenFS);

    this.gl.getExtension('EXT_color_buffer_float'); // suport RGBA32F format fot framebuffer

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
    const rawdata1 = new Array(this.RESOLUTION * this.RESOLUTION).fill(0).map(d => Math.random() * 100);
    const rawdata2 = [...rawdata1];
    // const rawdata3 = [...rawdata1];
    // const rawdata4 = [...rawdata1];
    this.clock.reset();
    this.cpuSort(rawdata1);
    const resOddeven = this.oddevenSort(rawdata2);
    console.log(this.checkSameAarryDeep(rawdata1,resOddeven) ? 'oddeven sort works': 'oddeven sort not works');
    // this.quickSort(rawdata3);
    // console.log(this.checkSameAarryDeep(rawdata1,rawdata2) ? 'quick sort works': 'quick sort not works');
    // this.bitonicSort(rawdata4);
    // console.log(this.checkSameAarryDeep(rawdata1,rawdata2) ? 'bitonic sort works': 'bitonic sort not works');
  }
  private checkSameAarryDeep = (arr1:number[],arr2:number[]) =>{
    for(let i = 0;i<arr1.length;i++){
      if(Math.abs(arr1[i]-arr2[i])>0.001){
        return false;
      }
    }
    return true;
  }
  private cpuSort = (rawdata: number[]) => {
    this.clock.update();
    rawdata.sort((pre, curr) => pre - curr);
    this.clock.update();
    console.log(`cpu sort:${this.clock.current * 1000}ms`);
  }
  private oddevenSort = (rawdata: number[]) => {
    // prepare for data
    const PING_UNIT = 0;
    const PONG_UNIT = 1;

    const data = new Float32Array(this.RESOLUTION*this.RESOLUTION*4);
    for(let i =0;i<this.RESOLUTION;i++){
      for(let j = 0;j<this.RESOLUTION;j++){
        data[i*this.RESOLUTION*4+j*4] = rawdata[i*this.RESOLUTION+j];
      }
    } 
    const pingBufferTexture = this.buildTexture(PING_UNIT, this.RESOLUTION, this.RESOLUTION, data, this.gl.RGBA32F, this.gl.RGBA,
      this.gl.FLOAT, this.gl.CLAMP_TO_EDGE, this.gl.CLAMP_TO_EDGE, this.gl.NEAREST, this.gl.NEAREST);
    const pongBufferTexture = this.buildTexture(PONG_UNIT, this.RESOLUTION, this.RESOLUTION, null, this.gl.RGBA32F, this.gl.RGBA,
      this.gl.FLOAT, this.gl.CLAMP_TO_EDGE, this.gl.CLAMP_TO_EDGE, this.gl.NEAREST, this.gl.NEAREST);

    const pingOddevenFramebuffer = this.buildFramebuffer(pingBufferTexture);
    const pongOddevenFramebuffer = this.buildFramebuffer(pongBufferTexture);
    
    let framebuffer = pingOddevenFramebuffer;
    let steps = this.RESOLUTION * this.RESOLUTION;
    let isOdd = true;

    this.clock.update();
    // ping pong update
    this.gl.viewport(0,0,this.RESOLUTION,this.RESOLUTION);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.useProgram(this.oddevenProgram);
    this.gl.bindVertexArray(this.vao);

    const oddLoc = this.gl.getUniformLocation(this.oddevenProgram, 'u_odd');
    const bufferLoc = this.gl.getUniformLocation(this.oddevenProgram, 'u_buffer');
    const u_resolutionLoc = this.gl.getUniformLocation(this.oddevenProgram, 'u_resolution');

    while (steps > 0) {
      const isPing = framebuffer === pingOddevenFramebuffer;
      framebuffer = isPing ? pongOddevenFramebuffer : pingOddevenFramebuffer;
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
      this.gl.uniform1f(oddLoc, isOdd ? 1 : -1);
      this.gl.uniform1i(bufferLoc,  isPing ? PING_UNIT : PONG_UNIT);
      this.gl.uniform2fv(u_resolutionLoc, [this.RESOLUTION, this.RESOLUTION]);
      this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
      isOdd = !isOdd;
      steps--;
    }

    this.clock.update();
    const arrBuffer = new Float32Array(this.RESOLUTION*this.RESOLUTION*Float32Array.BYTES_PER_ELEMENT);
    this.gl.readPixels(0,0,this.RESOLUTION,this.RESOLUTION,this.gl.RGBA,this.gl.FLOAT,arrBuffer);
    const res = Array.from(arrBuffer).filter((d,i)=>i%4===0);
    console.log(`odd even sort:${this.clock.current * 1000}ms`);

    this.gl.bindVertexArray(null);
    this.gl.useProgram(null);

    return res;
  }
  private quickSort = (rawdata: number[]) => {
    this.clock.update();
    console.log(rawdata);
    console.log(`quick sort:${this.clock.current * 1000}ms`);
  }
  private bitonicSort = (rawdata: number[]) => {
    this.clock.update();
    console.log(rawdata);
    console.log(`bitonic sort:${this.clock.current * 1000}ms`);
  }
  protected update = (time: number) => {
    
  }
}