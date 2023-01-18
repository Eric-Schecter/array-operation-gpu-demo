#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform sampler2D u_buffer;
uniform float u_odd;

out vec4 fColor;

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution;
    vec4 self=texture(u_buffer,uv);
    float index=floor(uv.x*u_resolution.x)+floor(uv.y*u_resolution.y)*u_resolution.x;
    bool selfIsOdd=bool(mod(index,2.));
    
    // choose min or max value based on index number and iteration number
    // case 1: current pixel index is odd and iteration number is odd -> 1 -> compare with right key -> choose min value
    // case 2: current pixel index is odd and iteration number is even -> -1 -> compare with left key -> choose max value
    // case 3: current pixel index is even and iteration number is even -> 1 -> compare with right key -> choose min value
    // case 4: current pixel index is even and iteration number is odd -> -1 -> compare with left key -> choose max value
    // for performance, use conditional operator instead of if else block
    float compare=selfIsOdd?u_odd:-u_odd;
    
    // special case for first and last element
    // when in the odd pass, elements compare between pairs(not in pairs), the first and last element remain itself
    if((u_odd>0.)&&(index==0.||index==(u_resolution.x*u_resolution.y-1.))){
        compare=0.;// not change, self and parner is the same
    }
    
    float partnerIndex=index + compare;
    vec2 partnerUV=vec2(vec2(floor(mod(partnerIndex,u_resolution.x)),mod(floor(partnerIndex/u_resolution.x),u_resolution.y))+vec2(0.5))/u_resolution;
    vec4 partner=texture(u_buffer,partnerUV); 
    fColor=(self.x*compare<partner.x*compare)?self:partner;
}
