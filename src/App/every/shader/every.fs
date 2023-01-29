#version 300 es

precision mediump float;

uniform sampler2D u_buffer;
uniform vec2 u_resolution;

out vec4 fColor;

void main(){
  vec2 uv = gl_FragCoord.xy/u_resolution.xy;
  vec4 data=texture(u_buffer,uv);
  if(data.x==0. || data.y==0. || data.z==0.|| data.w==0.){
    discard;
  }
  fColor=vec4(data);
}
