#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;

out vec4 fragColor;

// Background Gradient
vec4 _TopColor=vec4(.24,.27,.41,1);
vec4 _BottomColor=vec4(.07,.11,.21,1);

// Star colors
vec4 _Star1Color=vec4(1,.94,.72,.7);
vec4 _Star2Color=vec4(.18,.03,.41,.7);
vec4 _Star3Color=vec4(.63,.50,.81,.7);

// Star grid
float _Grid=80.;
float _Size=.15;

// Parallax Speed
vec2 _Speed=vec2(-10,10);

/**
Utilities
**/

// Generates a random 2D vector from another 2D vector
// seed must be a large number
// output range: ([0..1[,[0..1[)
        vec2 randVector(in vec2 vec, in float seed)
        {
          return vec2(fract(sin(vec.x*999.9+vec.y)*seed),fract(sin(vec.y*999.9+vec.x)*seed));
        }
        
        /**
        Star shader
        **/
        
        // Draw star grid
        void drawStars(inout vec4 fragColor,in vec4 color,in vec2 uv,in float grid,in float size,in vec2 speed,in float seed)
        {
          uv+=iTime*speed;
          
          // Split UV into local grid
          vec2 local=mod(uv,grid)/grid;
          
          // Random vector for each grid cell
          vec2 randv=randVector(floor(uv/grid),seed)-.5;
          float len=length(randv);
          
          // If center + random vector lies inside cell
          // Draw circle
          if(len<.5){
            // Draw circle on local grid
            float radius=1.-distance(local,vec2(.5,.5)+randv)/(size*(.5-len));
            if(radius>0.)fragColor+=color*radius;
          }
        }
        
        void main(){
          vec2 uv=gl_FragCoord.xy/iResolution.xy;
          vec3 col=.5+.5*cos(iTime+uv.xyx+vec3(0,2,4));
          fragColor=vec4(col,1.);
          
          // Background
          fragColor=mix(_TopColor,_BottomColor,gl_FragCoord.x/iResolution.y);
          
          // Stars
          drawStars(fragColor,_Star1Color,gl_FragCoord.xy,_Grid,_Size,_Speed,123456.789);
          drawStars(fragColor,_Star2Color,gl_FragCoord.xy,_Grid*2./3.,_Size,_Speed/1.2,345678.912);
          drawStars(fragColor,_Star3Color,gl_FragCoord.xy,_Grid/2.,_Size*3./4.,_Speed/1.6,567891.234);
        }