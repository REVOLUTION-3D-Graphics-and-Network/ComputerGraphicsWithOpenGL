#version 400 core
// https://3dcoat.com/pbr/
// https://marmoset.co/posts/basic-theory-of-physically-based-rendering/
// https://marmoset.co/posts/physically-based-rendering-and-you-can-too/
// https://www.allegorithmic.com/system/files/software/download/build/PBR_Guide_Vol.1.pdf
// https://learnopengl.com/PBR/Theory
// http://renderwonk.com/publications/s2010-shading-course/
// https://blog.selfshadow.com/publications/s2017-shading-course/
// https://blog.selfshadow.com/publications/s2013-shading-course/hoffman/s2013_pbs_physics_math_notes.pdf
// https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
// http://www.codinglabs.net/article_physically_based_rendering.aspx
// http://www.codinglabs.net/article_physically_based_rendering_cook_torrance.aspx
// https://academy.allegorithmic.com/courses/the-pbr-guide-part-1
// https://academy.allegorithmic.com/courses/the-pbr-guide-part-2
// https://seblagarde.wordpress.com/2011/08/17/feeding-a-physical-based-lighting-mode/
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// http://wiki.polycount.com/wiki/PBR
// https://3dtextures.me/tag/pbr/
// https://freepbr.com/


/*
 here are different types of substances in real world. They can be classified in three main group: Insulators, semi-conductors and conductors.
 In game we are only interesting by two of them: Insulators (Dielectric materials) and conductors (Metallic materials).
 Artists should understand to which category a material belong to. This will have influence on diffuse and specular value to assign to this material.
 
 
 Dielectric materials are the most common materials. Their optical properties rarely vary much over the visible spectrum:
 water, glass, skin, wood, hair, leather, plastic, stone, concrete, ruby, diamond…
 Metals. Their optical properties vary over the visible spectrum: iron, aluminium, copper, gold, cobalt,  nickel, silver…
 
 
 DIFFUSE COLOR
 
 The advantage of using a physically based shading model is that we can choose diffuse color value based on real world value.
 We used two kind of references for our game :
 
 1. Taking picture of real world with the method explained by Henry Labounta in its GDC 2011 talk “Art Direction Tools for Photo Real Games”.
 - Wait an overcast day to reduce directional lighting information.
 - Shot a raw photography (mean don’t use gamma space mode but linear mode) containing an X-rite passport Macbeth chart.
 - Import and calibrate photo using exposure and blacks with the help of the reference Macbeth chart value.
 - The resulting sRGB picture will be used as reference for artists.
 
 2. Taking physical albedo value.
 Disclaimer : All the numerical values provided are in linear space. And lighting processing inside the shader must be in linear space.
 
 Charcoal       0.04
 Fresh asphalt  0.04
 Worn asphalt   0.12
 Bare soil      0.17
 Green grass    0.25
 Desert sand    0.40
 New concrete   0.55
 Ocean Ice      0.5–0.7
 Fresh snow     0.80–0.90
 
 
 
 
 SPECULAR COLOR
 
 Dielectric transparent material (water, glass, plastic, gemstones…) indices of refraction are largely available on the web.
 But lot of usual materials like concrete, fabric, rock, wood… are not. And it is far more difficult to measure index of refraction of such materials.
 
 Good rules for specular color range of dielectric materials are:
 - No value under 0.02
 - Common gemstones 0.05 - 0.17
 - Common liquids 0.02 - 0.04
 - When not finding reference for a dielectric material, setting a value of 0.04 (around plastic)
 
 Except gemstones, any dielectric material we will use should be in the range 0.02 - 0.05.
 Here are some sample values:
 
 Quartz    0.045593921
 ice       0.017908907
 Water     0.020373188
 Alcohol   0.01995505
 Glass     0.04
 Milk      0.022181983
 Ruby      0.077271957
 Crystal   0.111111111
 Diamond   0.171968833
 Skin      0.028
 
the linear RGB specular color values can be the following:
 
                R            G           B
 Silver      0.971519    0.959915    0.915324
 Aluminium   0.913183    0.921494    0.924524
 Gold        1           0.765557    0.336057
 Copper      0.955008    0.637427    0.538163
 Chromium    0.549585    0.556114    0.554256
 Nickel      0.659777    0.608679    0.525649
 Titanium    0.541931    0.496791    0.449419
 Cobalt      0.662124    0.654864    0.633732
 Platinum    0.672411    0.637331    0.585456
 
 
 */

#define NUMBER_OF_POINT_LIGHTS 10
#define PI 3.14159265359

uniform struct Camera
{
    vec3 position;
    vec3 front;
    bool isMoving;
} camera;

// Structure holding PBR material information:  its albedo, metallic, roughness, etc...
uniform struct Material
{
    sampler2D albedoMap;            // 15.  albedo map
    sampler2D metalnessMap;         // 16.  metalness map
    sampler2D roughnessMap;         // 17.  roughness map
    sampler2D normalMap;            // 3.   normal map
    sampler2D aoMap;                // 7.   ambient oclusion map
    // for more info look at https://marmoset.co/posts/physically-based-rendering-and-you-can-too/
    vec3  albedo;           // Albedo is the base color input, commonly known as a diffuse map.
    // all values below are between 0 and 1
    float metallic;         // Define how reflective a surface is when viewing head on, while Fresnel defines how reflective a surface is at grazing angles.
    float roughness;        // Microsurface defines how rough or smooth the surface of a material is. between 0 and 1
    float fresnel;          // Fresnel is the percentage of light that a surface reflects at grazing angles.
    float ao;               // Ambient occlusion(AO) represents large scale occluded light and is generally baked from a 3d model.
    float shininess;
    bool bUseAO;
} material;

// Structure holding light information:  its position, colors, direction etc...
struct BaseLight
{
    vec3 color;
    float intensity;
    float ambient;
    float diffuse;
    float specular;
    float exposure;
    float gamma;
};

// Structure holding hrd light information
struct HRDLight
{
    float exposure;
    float gamma;
    bool bHDR;
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
    float range; // This returns a radius between roughly 1.0 and 5.0 based on the light's maximum intensity.
};

struct SpotLight
{
    PointLight pointLight;
    vec3 direction;
    float cutOff;
    float outerCutOff;
};

uniform HRDLight R_hrdlight;
uniform DirectionalLight R_directionallight;
uniform PointLight R_pointlight[NUMBER_OF_POINT_LIGHTS];
uniform SpotLight R_spotlight;
uniform bool bUseTexture, bUseBlinn, bUseSmoothSpot;
uniform bool bUseDirectionalLight, bUsePointLight, bUseSpotlight;

in VS_OUT
{
    vec2 vTexCoord;    // Texture coordinate
    vec3 vLocalPosition;
    vec3 vLocalNormal;
    vec3 vWorldPosition;
    vec3 vWorldNormal;
    vec3 vWorldTangent;
    vec4 vEyePosition;
} fs_in;

// ----------------------------------------------------------------------------
// Easy trick to get tangent-normals to world-space to keep PBR code simplified.
// Don't worry if you don't get what's going on; you generally want to do normal
// mapping the usual way for performance anyways; I do plan make a note of this
// technique somewhere later in the normal mapping tutorial.
vec3 getNormalFromMap(vec3 normal, vec3 worldPos)
{
    vec3 tangentNormal = texture(material.normalMap, fs_in.vTexCoord).xyz * 2.0f - 1.0f;
    
    vec3 Q1  = dFdx(worldPos);
    vec3 Q2  = dFdy(worldPos);
    vec2 st1 = dFdx(fs_in.vTexCoord);
    vec2 st2 = dFdy(fs_in.vTexCoord);
    
    vec3 N   = normalize(normal);
    vec3 T  = normalize(Q1 * st2.t - Q2 * st1.t);
    vec3 B  = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);
    
    return normalize(TBN * tangentNormal);
}

// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// Normal distribution function
float DistributionGGX(vec3 N, vec3 V, vec3 H, vec3 R, float roughness)
{
    float a      = roughness * roughness;
    float a2     = a * a;
    float NdotH  = bUseBlinn
    ? max(dot(N, H), 0.0f)
    : max(dot(V, R), 0.0f);
    float NdotH2 = NdotH * NdotH;
    
    float num   = a2;
    float denom = (NdotH2 * (a2 - 1.0f) + 1.0f);
    denom = PI * denom * denom;
    
    return num / denom;
}

// Geometry function
float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0f);
    float k = (r * r) / 8.0f;
    
    float num   = NdotV;
    float denom = NdotV * (1.0f - k) + k;
    
    return num / denom;
}
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0f);
    float NdotL = max(dot(N, L), 0.0f);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
}

// Fresnel equation
// F0 is known from surface reflection at zero incidence or how much the surface reflects if looking directly at the surface.
vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0f - F0) * pow(1.0f - cosTheta, 5.0f);
}

// ----------------------------------------------------------------------------
//Lights
vec3 CalcLight(BaseLight base, vec3 direction, vec3 normal, vec3 vertexPosition)
{
    
    vec3 albedo     = bUseTexture ? pow(texture(material.albedoMap, fs_in.vTexCoord).rgb, vec3(2.2f)) : material.albedo;       // albedo map
    float metallic  = bUseTexture ? texture(material.metalnessMap, fs_in.vTexCoord).r : material.metallic;                          // metallic map
    float roughness = bUseTexture ? texture(material.roughnessMap, fs_in.vTexCoord).r : material.roughness;                         // roughness map
    float ao        = bUseTexture ? texture(material.aoMap, fs_in.vTexCoord).r : material.ao;                               // ambient oclusion map
    
    
    /// The F0 varies per material and is tinted on metals as we find in large material databases.
    // for non-metallic surfaces F0 is always 0.04, while we do vary F0 based on the metalness of a surface
    // by linearly interpolating between the original F0 and the albedo value given the metallic property.
    vec3 F0         = vec3(0.04f); // glass
    F0              = mix(F0, albedo, metallic);
    
    // ambient lighting (note that the IBL tutorial will replace this ambient lighting with environment lighting).
    vec3 ambient = vec3(base.ambient) * albedo * ao; // ambient light
    
    float diffuseFactor = max(dot(normal, direction), 0.0f); // diffuse light
    vec3 diffuse = vec3(base.diffuse) * diffuseFactor;
    
    vec3 view =  camera.position + camera.front;
    vec3 directionToEye = normalize(view - vertexPosition); // viewDirection
    vec3 reflectDirection = reflect(-direction, normal);    // specular reflection
    vec3 halfDirection = normalize(direction + directionToEye); // halfway vector
    
    // calculating the NDF and the G term in the reflectance loop, and also the fresnel value
    float NDF       = DistributionGGX(normal, directionToEye, halfDirection, reflectDirection, roughness);
    float G         = GeometrySmith(normal, directionToEye, direction, roughness);
    vec3 F          = fresnelSchlick(max(dot(halfDirection, directionToEye), 0.0f), F0); // fresnel value
    
    //  calculate the Cook-Torrance BRDF
    vec3 cookTorrance    = NDF * G * F;
    float specularFactor = material.shininess * max(dot(normal, directionToEye), 0.0f) * max(dot(normal, direction), 0.0f);
    //vec3 specular     =  numerator / max(denominator, 0.001f); // specular light
    
    // calculate each light's contribution to the reflectance equation.
    // kS is equal to Fresnel
    vec3 kS = F;// the Fresnel value directly corresponds to kS we can use F to denote the specular contribution of any light that hits the surface.
    // for energy conservation, the diffuse and specular light can't
    // be above 1.0 (unless the surface emits light); to preserve this
    // relationship the diffuse component (kD) should equal 1.0 - kS.
    vec3 kD = vec3(1.0f) - kS;
    // multiply kD by the inverse metalness such that only non-metals
    // have diffuse lighting, or a linear blend if partly metal (pure metals have no diffuse light).
    kD *= 1.0f - metallic; // calculate the ratio of refraction kD:
    
    vec3 specular     = base.specular * (kD * albedo / PI + (cookTorrance / max(specularFactor, 0.001f))); // specular light
    
    // calculate each light's outgoing reflectance value
    // The resulting Lo value, or the outgoing radiance, is effectively the result of the reflectance equation's integral ∫ over Ω.
    return (ambient + diffuse + specular) * base.intensity * base.color;
}

vec3 CalcDirectionalLight(DirectionalLight directionalLight, vec3 normal, vec3 vertexPosition)
{
    return CalcLight(directionalLight.base, normalize(-directionalLight.direction), normal, vertexPosition);
}

vec3 CalcPointLight(PointLight pointLight, vec3 normal, vec3 vertexPosition)
{
    vec3 lightDirection = normalize(pointLight.position - vertexPosition);
    float distanceToPoint = length(pointLight.position - vertexPosition);
    
    if(distanceToPoint > pointLight.range) {
        return vec3(0.0f, 0.0f, 0.0f);
    }
    
    vec3 color = CalcLight(pointLight.base, lightDirection, normal, vertexPosition);
    
    // attenuation
    
    float attenuation = 1.0f / (pointLight.attenuation.constant + pointLight.attenuation.linear * distanceToPoint +
                                pointLight.attenuation.exponent * (distanceToPoint * distanceToPoint));
    return color * attenuation;
    
    
    //float attenuation = (pointLight.attenuation.constant +
    //                     pointLight.attenuation.linear * distanceToPoint +
    //                     pointLight.attenuation.exponent * (distanceToPoint * distanceToPoint) + 0.0001f);
    //return color / attenuation;
}


vec3 CalcSpotLight(SpotLight spotLight, vec3 normal, vec3 vertexPosition)
{
    vec3 lightDirection = normalize(spotLight.pointLight.position - vertexPosition);
    float theta = max(dot(lightDirection, normalize(-spotLight.direction)), 0.0f);
    vec3 color = vec3( 0.0f, 0.0f, 0.0f);
    
    if(theta > spotLight.cutOff)
    {
        float epsilon = spotLight.cutOff - spotLight.outerCutOff;
        float intensity = bUseSmoothSpot
        ? (1.0f - (1.0f - theta) / (1.0f - spotLight.cutOff))
        : clamp((theta - spotLight.outerCutOff) / epsilon, 0.0f, 1.0f);
        color = CalcPointLight(spotLight.pointLight, normal, vertexPosition) * intensity;
    }
    return color;
}

//When rendering into the current framebuffer, whenever a fragment shader uses the layout location specifier the respective colorbuffer of framebuffor colors array, which is used to render the fragments to that color buffer.
layout (location = 0) out vec4 vOutputColour;   // The output colour formely  gl_FragColor
layout (location = 1) out vec4 vBrightColor;
layout (location = 2) out vec3 vPosition;
layout (location = 3) out vec3 vNormal;
layout (location = 4) out vec4 vAlbedoSpec;

void main()
{
    vec3 normal     = bUseTexture ? getNormalFromMap(fs_in.vWorldNormal, fs_in.vWorldPosition) : normalize(fs_in.vWorldNormal);    // normal map
    vec3 worldPos   = fs_in.vWorldPosition;
    vec3 color = vec3(0.0f, 0.0f, 0.0f);
    
    if (bUseDirectionalLight){
        // Directional lighting
        vec3 directionalLight = CalcDirectionalLight(R_directionallight, normal, worldPos);
        color += directionalLight;
    }
    
    if (bUsePointLight){
        // Point lights
        for (int i = 0; i < NUMBER_OF_POINT_LIGHTS; i++){
            vec3 pointL = CalcPointLight(R_pointlight[i], normal, worldPos);
            color += pointL;
        }
    }
    if (bUseSpotlight){
        // Spot light
        vec3 spotL = CalcSpotLight(R_spotlight, normal, worldPos);
        color += spotL;
    }
    
     /*
     Here we tone map the HDR color using the Reinhard operator, preserving the high dynamic range of possibly highly
     varying irradiance after which we gamma correct the color.
     We don't have a separate framebuffer or post-processing stage so we can directly apply both the tone mapping step
     and gamma correction step directly at the end of the forward fragment shader.
     
     Taking both linear color space and high dynamic range into account is incredibly important in a PBR pipeline.
     Without these it's impossible to properly capture the high and low details of varying light intensities and
     your calculations end up incorrect and thus visually unpleasing.
     */
    
    if(R_hrdlight.bHDR)
    {
        // tone mapping with exposure
        color = vec3(1.0f) - exp(-color * R_hrdlight.exposure);
        // also gamma correct while we're at it
        color = pow(color, vec3(1.0f / R_hrdlight.gamma));
    } else {
        color = color / (color + vec3(1.0f));
        /// gamma correct
        //color = pow(color, vec3(1.0f/2.2f));
         color = pow(color, vec3(1.0f / R_hrdlight.gamma));
    }
    
    
    vOutputColour = vec4(color, 1.0f);
    
    // Retrieve bright parts
    float brightness = dot(vOutputColour.rgb, vec3(0.2126f, 0.7152f, 0.0722f));
    if(brightness > 1.0f) {
        vBrightColor = vec4(vOutputColour.rgb, 1.0f);
    } else {
        vBrightColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    }
    
    // store the fragment position vector in the first gbuffer texture
    vPosition = material.bUseAO ? fs_in.vEyePosition.xyz : fs_in.vWorldPosition;
    // also store the per-fragment normals into the gbuffer
    vNormal = normal;
    // and the diffuse per-fragment color
    vAlbedoSpec.rgb = material.bUseAO ? vec3(0.95f) : texture(material.albedoMap, fs_in.vTexCoord).rgb;
    // store specular intensity in gAlbedoSpec's alpha component
    vAlbedoSpec.a = material.bUseAO ? 1.0f : texture(material.aoMap, fs_in.vTexCoord).r;
    
}
