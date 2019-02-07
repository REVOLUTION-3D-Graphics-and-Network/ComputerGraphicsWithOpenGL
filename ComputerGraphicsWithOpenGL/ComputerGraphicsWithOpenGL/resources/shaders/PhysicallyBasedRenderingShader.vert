#version 400 core

// Structure for matrices
uniform struct Matrices
{
    mat4 projMatrix;
    mat4 modelMatrix;
    mat4 viewMatrix;
    mat3 normalMatrix;

} matrices;

// Layout of vertex attributes in VBO
layout (location = 0) in vec3 inPosition;
layout (location = 1) in vec2 inCoord;
layout (location = 2) in vec3 inNormal;
layout (location = 3) in vec3 inTangent;
layout (location = 4) in vec3 inBiTangent;

out VS_OUT
{
    vec2 vTexCoord;    // Texture coordinate
    vec3 vLocalPosition;
    vec3 vLocalNormal;
    vec3 vWorldPosition;
    vec3 vWorldNormal;
    vec4 vEyePosition;
} vs_out;

// This is the entry point into the vertex shader
void main()
{	
    
    vec4 position = vec4(inPosition, 1.0f);
    vec4 normal = vec4(inNormal, 1.0f);
    
    // Pass through the texture coordinate
    vs_out.vTexCoord = inCoord;
    
    // Get the vertex normal and vertex position in eye coordinates
    //mat3 normalMatrix = mat3(transpose(inverse(matrices.modelMatrix)));
    vs_out.vWorldNormal = matrices.normalMatrix * inNormal;
    vs_out.vLocalNormal = inNormal;
    
    vs_out.vEyePosition = matrices.projMatrix * matrices.viewMatrix * position;
    vs_out.vWorldPosition = vec3(matrices.modelMatrix * position);
    vs_out.vLocalPosition = inPosition;
    
    // https://gamedev.stackexchange.com/questions/66642/tangent-on-generated-sphere
    // https://www.geeks3d.com/20130122/normal-mapping-without-precomputed-tangent-space-vectors/
    /*
    vec3 tangent;
    vec3 biTangent;
    vec3 c1 = cross(inNormal, vec3(0.0f, 0.0f, 1.0f));
    vec3 c2 = cross(inNormal, vec3(0.0f, 1.0f, 0.0f));
    if (length(c1) > length(c2))
        tangent = c1;
    else
        tangent = c2;
    tangent = normalize(tangent);
    biTangent = normalize(cross(inNormal, tangent));
    vs_out.vLocalNormal = biTangent;
     */
    
    // Transform the vertex spatial position using
    gl_Position = matrices.projMatrix * matrices.viewMatrix * matrices.modelMatrix * position;
} 
