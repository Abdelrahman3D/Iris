export default `#version 300 es
precision mediump float;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

// our texture
uniform sampler2D u_image;

void main() {
  outColor = texture(u_image, v_texCoord);
}
`;
