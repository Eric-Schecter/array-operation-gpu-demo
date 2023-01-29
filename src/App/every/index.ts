import { Application } from "../gl";
import { vec3, mat4 } from 'gl-matrix'
import { PlaneGeometry } from '../gl/planeGeometry';
import planeVS from './shader/plane.vs';
import planeFS from './shader/plane.fs';
import screenVS from './shader/screen.vs';
import everyFS from './shader/every.fs';
import { Camera } from "../gl/camera";

export class EveryOpe extends Application {
  private vao!: WebGLVertexArrayObject;
  private camera: Camera;
  private planeProgram: WebGLProgram;
  private everyOpeProgram: WebGLProgram;
  private BUFFER_UNIT = 0;
  private RESOLUTION = 512 * 4;
  private planeGeometry: PlaneGeometry;

  constructor(container: HTMLDivElement,options?:WebGLContextAttributes,extensions?:string[]) {
    super(container,options,extensions);

    const { clientWidth, clientHeight } = this.canvas;
    const fov = 60 / 180 * Math.PI;
    const aspect = clientWidth / clientHeight;
    const near = 0.1;
    const far = 1000;
    this.camera = new Camera();
    this.camera.pos = vec3.fromValues(0, 0, -2);
    this.camera.setProjection(fov, aspect, near, far);
    this.camera.setView(vec3.fromValues(0, 0, 0));
    this.camera.setViewport(0, 0, clientWidth, clientHeight);

    this.planeGeometry = new PlaneGeometry(2, 2, 100, 100);
    this.planeProgram = this.programLoader.load(this.gl, planeVS, planeFS);

    this.everyOpeProgram = this.programLoader.load(this.gl, screenVS, everyFS);

    this.gl.useProgram(this.planeProgram);

    const projectionMatrixLoc = this.gl.getUniformLocation(this.planeProgram, 'u_projectionMatrix');
    this.gl.uniformMatrix4fv(projectionMatrixLoc, false, this.camera.projection);

    const viewMatrixLoc = this.gl.getUniformLocation(this.planeProgram, 'u_viewMatrix');
    this.gl.uniformMatrix4fv(viewMatrixLoc, false, this.camera.view);

    const bufferLoc = this.gl.getUniformLocation(this.planeProgram, 'u_buffer');
    this.gl.uniform1i(bufferLoc, this.BUFFER_UNIT);

    this.gl.useProgram(this.everyOpeProgram);
    const u_bufferLoc = this.gl.getUniformLocation(this.everyOpeProgram, 'u_buffer');
    this.gl.uniform1i(u_bufferLoc, 0);

    const u_resolutionLoc = this.gl.getUniformLocation(this.everyOpeProgram, 'u_resolution');
    this.gl.uniform2fv(u_resolutionLoc, [this.RESOLUTION, this.RESOLUTION]);

    this.gl.useProgram(null);

    // init
    this.vao = this.gl.createVertexArray() as WebGLVertexArrayObject;
    const vbo = this.gl.createBuffer();
    const ibo = this.gl.createBuffer();
    // bind
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    // pass data to buffer
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.planeGeometry.vertices), this.gl.STATIC_DRAW);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.planeGeometry.indices), this.gl.STATIC_DRAW);
    // bind buffer to variable in gpu
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 20, 0);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 20, 12);
    // enable varialbe
    this.gl.enableVertexAttribArray(0);
    this.gl.enableVertexAttribArray(1);
    // reset
    this.gl.bindVertexArray(null);
  }
  public setup = async () => {
    // https://registry.khronos.org/OpenGL/specs/es/3.0/es_spec_3.0.pdf#page=143&zoom=100,168,666 renderable texture format 
    // 'EXT_color_buffer_float' extension need to be enabled if used for render target
    const data = new Float32Array(this.RESOLUTION * this.RESOLUTION * 4);
    // for test logic
    // data[Math.floor(Math.random() * data.length)] = 1;
    // for test performance better visualization
    for (let i = 0; i < this.RESOLUTION; i++) {
      for (let j = 0; j < this.RESOLUTION; j++) {
        for (let k = 0; k < 4; k++) {
          data[i * this.RESOLUTION * 4 + j * 4 + k] = Math.random()<0.5 ? 0 : 1;
        }
      }
    }
    const dataTexture = this.buildTexture(this.BUFFER_UNIT, this.RESOLUTION, this.RESOLUTION, data, this.gl.RGBA32F, this.gl.RGBA,
      this.gl.FLOAT, this.gl.CLAMP_TO_EDGE, this.gl.CLAMP_TO_EDGE, this.gl.LINEAR, this.gl.LINEAR);
    const bufferTexture = this.buildTexture(this.BUFFER_UNIT, this.RESOLUTION, this.RESOLUTION, null, this.gl.RGBA32F, this.gl.RGBA,
      this.gl.FLOAT, this.gl.CLAMP_TO_EDGE, this.gl.CLAMP_TO_EDGE, this.gl.LINEAR, this.gl.LINEAR);
    const modelMatrixLoc = this.gl.getUniformLocation(this.planeProgram, 'u_modelMatrix');
    const modelMatrix = mat4.create();
    const step = 1.1;
    let res = true;
    // comparation of render random color

    this.clock.reset();
    // check data in CPU side
    for (let i = 0; i < this.RESOLUTION; i++) {
      for (let j = 0; j < this.RESOLUTION; j++) {
        for (let k = 0; k < 4; k++) {
          if (data[i * this.RESOLUTION * 4 + j * 4 + k] !== 0) {
            res = false;
            break;
          }
        }
      }
    }
    this.clock.update();
    console.log(`result:${res}`);
    console.log(`cpu cost:${this.clock.current * 1000}ms`);
    // visualization
    this.gl.activeTexture(this.gl.TEXTURE0 + this.BUFFER_UNIT);
    this.gl.bindTexture(this.gl.TEXTURE_2D, dataTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, this.RESOLUTION, this.RESOLUTION, 0, this.gl.RGBA, this.gl.FLOAT, data);
    this.gl.activeTexture(0);
    this.gl.useProgram(this.planeProgram);
    mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(-step, 0, 0));
    this.gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
    this.visualization();

    // fill data in GPU side
    this.clock.reset();
    const fillOpeFramebuffer = this.buildFramebuffer(bufferTexture);
    this.gl.bindVertexArray(this.vao);
    this.gl.useProgram(this.everyOpeProgram);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fillOpeFramebuffer);

    this.gl.activeTexture(this.gl.TEXTURE0 + this.BUFFER_UNIT);
    this.gl.bindTexture(this.gl.TEXTURE_2D, dataTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, this.RESOLUTION, this.RESOLUTION, 0, this.gl.RGBA, this.gl.FLOAT, data);
    this.gl.activeTexture(0);

    let query = this.gl.createQuery() as WebGLQuery;
    this.gl.beginQuery(this.gl.ANY_SAMPLES_PASSED,query);
    this.gl.drawElements(this.gl.TRIANGLES, this.planeGeometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
    this.gl.endQuery(this.gl.ANY_SAMPLES_PASSED);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.bindVertexArray(null);
    this.clock.update();
    console.log(`result:${res}`);
    console.log(`gpu cost:${this.clock.current * 1000}ms`);
  
    // https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/query_occlusion.html
    // A query's result is never available in the same frame
    // the query was issued.  Try in the next frame.
    const tick = () => {
      if (!this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE)) {
          requestAnimationFrame(tick);
          return;
      }
      res = this.gl.getQueryParameter(query,this.gl.QUERY_RESULT) === 0; // no pixel pass, which means every pixel is 0
      this.gl.deleteQuery(query);
      // visualization
      this.gl.useProgram(this.planeProgram);
      mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(step * 2, 0, 0));
      this.gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
      this.visualization();
    }
    tick();
  }
  private visualization = () => {
    const { clientWidth, clientHeight } = this.canvas;
    this.gl.viewport(0, 0, clientWidth, clientHeight);

    this.gl.bindVertexArray(this.vao);
    this.gl.useProgram(this.planeProgram);
    this.gl.drawElements(this.gl.TRIANGLES, this.planeGeometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
    this.gl.bindVertexArray(null);
    this.gl.useProgram(null);
  }
  protected update = (time: number) => {

  }
}