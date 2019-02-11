#version 400 core

// https://learnopengl.com/#!Advanced-Lighting/Parallax-Mapping

#define NUMBER_OF_POINT_LIGHTS 6

precision highp float;

uniform struct Camera
{
    vec3 position;
    vec3 front;
} camera;

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
    samplerCube cubeMap;            // 11.  sky box or environment mapping cube map
    vec3 color;
    float shininess;
} material;

// Structure holding light information:  its position, colors, direction etc...
struct BaseLight
{
    vec3 color;
    float intensity;
    float ambient;
    float diffuse;
    float specular;
};

struct Attenuation
{
    float constant;
    float linear;
    float exponent;
};

struct DirectionalLight
{
    BaseLight base;
    vec3 direction;
};

struct PointLight
{
    BaseLight base;
    Attenuation attenuation;
    vec3 position;
    float range;
};

struct SpotLight
{
    PointLight pointLight;
    vec3 direction;
    float cutOff;
    float outerCutOff;
};

uniform DirectionalLight R_directionallight;
uniform PointLight R_pointlight[NUMBER_OF_POINT_LIGHTS];
uniform SpotLight R_spotlight;
uniform bool bUseTexture, bUseBlinn, bUseSmoothSpot;
uniform bool bUseDirectionalLight, bUsePointLight, bUseSpotlight;
uniform float heightScale;

in VS_OUT
{
    vec2 vTexCoord;    // Texture coordinate
    vec3 vLocalPosition;
    vec3 vLocalNormal;
    vec3 vWorldPosition;
    vec3 vWorldNormal;
    vec3 vWorldTangent;
    vec3 vWorldBiTangent;
    vec4 vEyePosition;
} fs_in;

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir, float scale)
{ 
    // number of depth layers
    const float minLayers = 8;
    const float maxLayers = 32;
    float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0f, 0.0f, 1.0f), viewDir)));  
    // calculate the size of each layer
    float layerDepth = 1.0f / numLayers;
    // depth of current layer
    float currentLayerDepth = 0.0f;
    // the amount to shift the texture coordinates per layer (from vector P)
    vec2 P = viewDir.xy / viewDir.z * scale; 
    vec2 deltaTexCoords = P / numLayers;
    
    // get initial values
    vec2  currentTexCoords     = texCoords;
    float currentDepthMapValue = texture(material.displacementMap, currentTexCoords).r;
    
    while(currentLayerDepth < currentDepthMapValue)
    {
        // shift texture coordinates along direction of P
        currentTexCoords -= deltaTexCoords;
        // get depthmap value at current texture coordinates
        currentDepthMapValue = texture(material.displacementMap, currentTexCoords).r;
        // get depth of next layer
        currentLayerDepth += layerDepth;  
    }
    
    // get texture coordinates before collision (reverse operations)
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;
    
    // get depth after and before collision for linear interpolation
    float afterDepth  = currentDepthMapValue - currentLayerDepth;
    float beforeDepth = texture(material.displacementMap, prevTexCoords).r - currentLayerDepth + layerDepth;
    
    // interpolation of texture coordinates
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0f - weight);

    return finalTexCoords;
}

vec4 CalcLight(BaseLight base, vec3 direction, mat3 TBN, vec3 vertexPosition)
{
    vec3 viewPosition =  camera.position + camera.front;
    vec3 tangentViewPos         = TBN * viewPosition;
    vec3 tangentFragPos         = TBN * vertexPosition;
    
    vec3 directionToEye = normalize(tangentViewPos - tangentFragPos); // viewDirection
    vec2 texCoords = fs_in.vTexCoord;
    
    texCoords = ParallaxMapping(fs_in.vTexCoord,  directionToEye, heightScale);
    if(texCoords.x > 1.0f || texCoords.y > 1.0f || texCoords.x < 0.0f || texCoords.y < 0.0f) {
        discard;
    }
    
     // obtain normal from normal map in range [0,1]
     //vec3 ambientMap = texture(material.ambientMap, fs_in.vTexCoord).rgb;
     vec3 normalMap = texture(material.normalMap, fs_in.vTexCoord).rgb;
     vec3 diffuseMap = texture(material.diffuseMap, fs_in.vTexCoord).rgb;
     //vec3 specularMap = texture(material.specularMap, fs_in.vTexCoord).rgb;
    
     // transform normal vector to range [-1,1]
     normalMap = normalize(normalMap * 2.0f - 1.0f);  // this normal is in tangent space
    
    // ambient
     vec3 ambient = base.ambient * diffuseMap;
    
     // diffuse
     //vec3 lightDirection = normalize(tangentLightPos - tangentFragPos);
     float diffuseFactor = max(dot(direction, normalMap), 0.0f);
     vec3 diffuse = base.diffuse * diffuseFactor * diffuseMap;
    
     // specular
     vec3 reflectDirection = reflect(-direction, normalMap);    // specular reflection
     vec3 halfDirection = normalize(direction + directionToEye); // halfway vector
     float specularFactor = bUseBlinn
     ? pow(max(dot(normalMap, halfDirection), 0.0f), material.shininess)
     : pow(max(dot(directionToEye, reflectDirection), 0.0f), material.shininess);
     vec3 specular = vec3(base.specular) * specularFactor;
     
     return (bUseTexture ? vec4(ambient + diffuse + specular, 1.0f) : vec4(material.color, 1.0f)) * base.intensity * vec4(base.color, 1.0f);
}

vec4 CalcDirectionalLight(DirectionalLight directionalLight, mat3 TBN, vec3 vertexPosition)
{
    return CalcLight(directionalLight.base, normalize(-directionalLight.direction), TBN, vertexPosition);
}

vec4 CalcPointLight(PointLight pointLight, mat3 TBN, vec3 vertexPosition)
{
    vec3 tangentLightPos    = TBN * pointLight.position;
    vec3 tangentFragPos     = TBN * vertexPosition;
    vec3 lightDirection     = normalize(tangentLightPos - tangentFragPos);
    float distanceToPoint   = length(pointLight.position - vertexPosition);
    
    if(distanceToPoint > pointLight.range)
        return vec4(0.0f, 0.0f, 0.0f, 0.0f);
    
    vec4 color = CalcLight(pointLight.base, lightDirection, TBN, vertexPosition);
    
    // attenuation
    float attenuation = 1.0f / (pointLight.attenuation.constant + pointLight.attenuation.linear * distanceToPoint +
                                pointLight.attenuation.exponent * (distanceToPoint * distanceToPoint));
    return color * attenuation;
}

vec4 CalcSpotLight(SpotLight spotLight, mat3 TBN, vec3 vertexPosition)
{
    vec3 lightDirection = normalize(spotLight.pointLight.position - vertexPosition);
    float theta = max(dot(lightDirection, normalize(-spotLight.direction)), 0.0f);
    vec4 color = vec4( 0.0f, 0.0f, 0.0f, 0.0f);
    
    if(theta > spotLight.cutOff)
    {
        float epsilon = spotLight.cutOff - spotLight.outerCutOff;
        float intensity = bUseSmoothSpot
        ? (1.0f - (1.0f - theta) / (1.0f - spotLight.cutOff))
        : clamp((theta - spotLight.outerCutOff) / epsilon, 0.0f, 1.0f);
        color = CalcPointLight(spotLight.pointLight, TBN, vertexPosition) * intensity;
    }
    return color;
}

out vec4 vOutputColour;        // The output colour formely  gl_FragColor

void main()
{
    vec3 normal = normalize(fs_in.vWorldNormal);
    vec3 tangent = normalize(fs_in.vWorldTangent);
    vec3 bitangent = normalize(fs_in.vWorldBiTangent);
    vec3 worldPos = fs_in.vWorldPosition;
    mat3 TBN = transpose(mat3(tangent, bitangent, normal));
    vec4 result = vec4(0.0f, 0.0f, 0.0f, 0.0f);
    
    // Directional lighting
    if (bUseDirectionalLight){
        vec4 directionalLight = CalcDirectionalLight(R_directionallight, TBN, worldPos);
        result += directionalLight;
    }
    
    // Point lights
    if (bUsePointLight){
        for (int i = 0; i < NUMBER_OF_POINT_LIGHTS; i++){
            vec4 pointL = CalcPointLight(R_pointlight[i], TBN, worldPos);
            result += pointL;
        }
    }
    
    // Spot light
    if (bUseSpotlight){
        vec4 spotL = CalcSpotLight(R_spotlight, TBN, worldPos);
        result += spotL;
    }

    vOutputColour = result;
}