#version 300 es

precision mediump float;

uniform vec2 u_resolution;

out vec4 fColor;

// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r;
}

void main(){
  vec2 seed = gl_FragCoord.xy/u_resolution.xy;
  fColor=vec4(vec3(random3(vec3(seed.xy,seed.x*seed.y))),1.);
}
