#version 300 es

precision mediump float;

uniform sampler2D u_buffer;

in vec2 v_uv;

out vec4 fColor;

void main(){
  vec3 data = texture(u_buffer,v_uv).xyz;
  fColor=vec4(data,1.);
}
