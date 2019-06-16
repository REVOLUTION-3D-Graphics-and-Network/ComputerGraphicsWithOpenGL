#version 400 core
#define PI 3.14159265359

// Structure holding material information:  its ambient, diffuse, specular, etc...
uniform struct Material
{
    sampler2D ambientMap;           // 0.   ambient map (albedo map)
    sampler2D diffuseMap;           // 1.   diffuse map (metallic map)
    sampler2D specularMap;          // 2.   specular map (roughness map)
    sampler2D normalMap;            // 3.   normal map
    sampler2D heightMap;            // 4.   height map
    sampler2D emissionMap;          // 5.   emission map
    sampler2D displacementMap;      // 6.   displacment map
    sampler2D aoMap;                // 7.   ambient oclusion map
    sampler2D glossinessMap;        // 8.   glossiness map
    sampler2D opacityMap;           // 9.   opacity map
    sampler2D reflectionMap;        // 10.  reflection map
    sampler2D depthMap;             // 11.  depth map
    sampler2D noiseMap;             // 12.  noise map
    sampler2D maskMap;              // 13.  mask map
    sampler2D lensMap;              // 14.  lens map
    samplerCube cubeMap;            // 15.  sky box or environment mapping cube map
    vec4 color;
    float shininess;
} material;

in VS_OUT
{
    vec2 vTexCoord;    // Texture coordinate
    vec3 vLocalPosition; // direction vector representing a 3D texture coordinate
} fs_in;

uniform struct HRDLight
{
    float exposure;
    float gamma;
    bool bHDR;
} R_hrdlight;

uniform bool bUseEnvCubemap;

layout (location = 0) out vec4 vOutputColour;   // The output colour formely  gl_FragColor

void main()
{
    if (bUseEnvCubemap) {
        
        // the sample direction equals the hemisphere's orientation
        vec3 normal = normalize(fs_in.vLocalPosition);
        vec3 irradiance = vec3(0.0);
        
        vec3 envColor = texture(material.cubeMap, fs_in.vLocalPosition).rgb;
        
        if(R_hrdlight.bHDR)
        {
            // tone mapping with exposure
            envColor = vec3(1.0f) - exp(-envColor * R_hrdlight.exposure);
            // also gamma correct while we're at it
            envColor = pow(envColor, vec3(1.0f / R_hrdlight.gamma));
        } else {
            envColor = envColor / (envColor + vec3(1.0f));
            envColor = pow(envColor, vec3(1.0f / R_hrdlight.gamma));
        }
        vOutputColour = vec4(envColor, 1.0f);
    } else {
        vOutputColour = texture(material.cubeMap, fs_in.vLocalPosition);
    }
    
}