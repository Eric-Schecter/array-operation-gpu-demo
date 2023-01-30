#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform sampler2D u_buffer;

out vec4 fColor;

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution;
    vec2 texelSize = 1./(u_resolution*2.);
    
    // https://github.com/regl-project/regl/blob/gh-pages/example/reduction.js
    // todo: still don't know why here should use minus 
    vec4 self=texture(u_buffer,(uv-vec2(0.,0.)*texelSize));
    vec4 right=texture(u_buffer,(uv-vec2(1.,0.)*texelSize));
    vec4 bottom=texture(u_buffer,(uv-vec2(0.,1.)*texelSize));
    vec4 rightBottom=texture(u_buffer,(uv-vec2(1.,1.)*texelSize));
    fColor= vec4(dot(self + right + bottom + rightBottom,vec4(1.)),0.,0.,0.);
}
