//
//  Game+IMaterials.cpp
//  ComputerGraphicsWithOpenGL
//
//  Created by GEORGE QUENTIN on 03/02/2019.
//  Copyright © 2019 GEORGE QUENTIN. All rights reserved.
//

#include "Game.h"

void Game::SetMaterialUniform(CShaderProgram *pShaderProgram, const std::string &uniformName,
                              const glm::vec4 &color, const GLfloat &shininess,
                              const GLboolean &useAO) {
    pShaderProgram->UseProgram();
    pShaderProgram->SetUniform(uniformName+".ambientMap", 0);           // ambient map (albedo map)
    pShaderProgram->SetUniform(uniformName+".diffuseMap", 1);           // diffuse map (metallic map)
    pShaderProgram->SetUniform(uniformName+".specularMap", 2);          // specular map (roughness map)
    pShaderProgram->SetUniform(uniformName+".normalMap", 3);            // normal map
    pShaderProgram->SetUniform(uniformName+".heightMap", 4);            // height map
    pShaderProgram->SetUniform(uniformName+".emissionMap", 5);          // emission map
    pShaderProgram->SetUniform(uniformName+".displacementMap", 6);      // displacement map
    pShaderProgram->SetUniform(uniformName+".aoMap", 7);                // ambient oclusion map
    pShaderProgram->SetUniform(uniformName+".glossinessMap", 8);        // glossiness/shininess map
    pShaderProgram->SetUniform(uniformName+".opacityMap", 9);           // opacity map
    pShaderProgram->SetUniform(uniformName+".reflectionMap", 10);       // reflection map
    pShaderProgram->SetUniform(uniformName+".depthMap", 11);            // depth map
    pShaderProgram->SetUniform(uniformName+".noiseMap", 12);            // noise map
    pShaderProgram->SetUniform(uniformName+".maskMap", 13);             // mask map
    pShaderProgram->SetUniform(uniformName+".lensMap", 14);             // lens map
    pShaderProgram->SetUniform(uniformName+".cubeMap", 15);             // sky box or environment mapping cube map
    pShaderProgram->SetUniform(uniformName+".color", color);
    pShaderProgram->SetUniform(uniformName+".shininess", shininess);
    pShaderProgram->SetUniform(uniformName+".bUseAO", useAO);
}

void Game::SetPBRMaterialUniform(CShaderProgram *pShaderProgram, const std::string &uniformName,
                                 const glm::vec3 &albedo, const GLfloat &metallic, const GLfloat &roughness) {
    pShaderProgram->UseProgram();
    pShaderProgram->SetUniform(uniformName+".albedo", albedo);
    pShaderProgram->SetUniform(uniformName+".metallic", metallic);
    pShaderProgram->SetUniform(uniformName+".roughness", roughness);
    pShaderProgram->SetUniform(uniformName+".fresnel", 0.6f);
    pShaderProgram->SetUniform(uniformName+".ao", 1.0f);
    
}
