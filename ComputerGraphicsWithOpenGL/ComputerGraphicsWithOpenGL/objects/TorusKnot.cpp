//
//  TorusKnot.cpp
//  New_OpenGL_CourseWork_Template
//
//  Created by GEORGE QUENTIN on 22/09/2017.
//  Copyright © 2017 LEXI LABS. All rights reserved.
//
// http://www.geeks3d.com/20140516/pq-torus-knot/
// http://vodacek.zvb.cz/archiv/stranka.php?id=259
// https://www.researchgate.net/publication/51910231_Electromagnetic_Torus_Knots

#include "TorusKnot.h"
#include "Vertex.h"

CTorusKnot::CTorusKnot()
{
    
};


CTorusKnot::~CTorusKnot()
{
    Release();
}

// Torus knot generation
// written by Jari Komppa aka Sol / Trauma
// Based on:
// http://www.blackpawn.com/texts/pqtorus/default.html

void CTorusKnot:: Create( const std::string &textureFile,
                      int aSteps,           // in: Number of steps in the torus knot
                      int aFacets,          // in: Number of facets
                      float aScale,         // in: Scale of the knot
                      float aThickness,     // in: Thickness of the knot
                      float aClumps,        // in: Number of clumps in the knot
                      float aClumpOffset,   // in: Offset of the clump (in 0..2pi)
                      float aClumpScale,    // in: Scale of a clump
                      float aUScale,        // in: U coordinate scale
                      float aVScale,        // in: V coordinate scale
                      float aP,             // in: P parameter of the knot
                      float aQ)             // in: Q parameter of the knot
{
    
    
    /*
    int aSteps = 1024;           // in: Number of steps in the torus knot
    int aFacets = 32;          // in: Number of facets
    float aScale = 4.0f;         // in: Scale of the knot
    float aThickness = 0.5f;     // in: Thickness of the knot
    float aClumps = 0.0f;        // in: Number of clumps in the knot
    float aClumpOffset = 0.0f;   // in: Offset of the clump (in 0..2pi)
    float aClumpScale = 0.0f;    // in: Scale of a clump
    float aUScale = 2.0f;        // in: U coordinate scale
    float aVScale = 32.0f;        // in: V coordinate scale
    float aP = 3;//3.0f;             // in: P parameter of the knot
    float aQ = 2;//-7.0f;             // in: Q parameter of the knot
    */
    
    /*
             P=1     Q=0
             P=3     Q=-7
             P=2     Q=1
             P=2     Q=3
             P=3     Q=-5
             P=2     Q=-8
             P=2     Q=-20
             P=7     Q=1
             P=7     Q=10
             P=9     Q=5
             P=13    Q=7
     
             P=3     Q=-2
             P=4     Q=3
             P=5     Q=2
             P=5     Q=3
             P=5     Q=4
     
             P=7     Q=-2
             P=7     Q=4
             P=8     Q=5
             P=8     Q=7
     */
    
    
    
    m_textureFile = textureFile;
    m_texture.Load(m_textureFile);
    
    m_texture.SetSamplerObjectParameter(GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    m_texture.SetSamplerObjectParameter(GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    m_texture.SetSamplerObjectParameter(GL_TEXTURE_WRAP_S, GL_REPEAT);
    m_texture.SetSamplerObjectParameter(GL_TEXTURE_WRAP_T, GL_REPEAT);
    
    
    glGenVertexArrays(1, &m_vao);
    glBindVertexArray(m_vao);
    
    m_vbo.Create();
    m_vbo.Bind();
    
    std::vector<glm::vec3> positions;
    std::vector<glm::vec2> texCoords;
    std::vector<glm::vec3> normals;
    std::vector<glm::vec3> tangents;
    std::vector<glm::vec3> bitangents;
    
    int i, j;
    aThickness *= aScale;
    long double pi2 = glm::two_pi<double>();
    
    GLfloat *vtx      = new GLfloat[((aSteps + 1) * (aFacets + 1) + 1) * 3];
    GLfloat *normal   = new GLfloat[((aSteps + 1) * (aFacets + 1) + 1) * 3];
    GLfloat *texcoord = new GLfloat[((aSteps + 1) * (aFacets + 1) + 1) * 2];
    GLuint  *torusIndices      = new GLuint[(aSteps + 1) * aFacets * 2];
    
    m_numIndices = (aSteps + 1) * aFacets * 2;
    m_numVertices = ((aSteps + 1) * (aFacets + 1) + 1);
    {
        for (j = 0; j < aFacets; j++)
        {
            for (i = 0; i < aSteps + 1; i++)
            {
                torusIndices[i * 2 + 0 + j * (aSteps + 1) * 2] = ((j + 1) + i * (aFacets + 1));
                torusIndices[i * 2 + 1 + j * (aSteps + 1) * 2] = (j + i * (aFacets + 1));
            }
        }
        
        
        for (i = 0; i < aSteps; i++)
        {
            long double centerpoint[3];
            long double Pp = aP * (double)i * pi2 / aSteps;
            long double Qp = aQ * (double)i * pi2 / aSteps;
            long double r = (.5f * (2 + (double)sin(Qp))) * aScale;
            
            centerpoint[0] = r * (double)cos(Pp);
            centerpoint[1] = r * (double)cos(Qp);
            centerpoint[2] = r * (double)sin(Pp);
            
            float nextpoint[3];
            Pp = aP * (i + 1) * pi2 / aSteps;
            Qp = aQ * (i + 1) * pi2 / aSteps;
            r = (.5f * (2 + (double)sin(Qp))) * aScale;
            nextpoint[0] = r * (double)cos(Pp);
            nextpoint[1] = r * (double)cos(Qp);
            nextpoint[2] = r * (double)sin(Pp);
            
            long double T[3];
            T[0] = nextpoint[0] - centerpoint[0];
            T[1] = nextpoint[1] - centerpoint[1];
            T[2] = nextpoint[2] - centerpoint[2];
            
            long double N[3];
            N[0] = nextpoint[0] + centerpoint[0];
            N[1] = nextpoint[1] + centerpoint[1];
            N[2] = nextpoint[2] + centerpoint[2];
            
            
            long double B[3];
            B[0] = T[1]*N[2] - T[2]*N[1];
            B[1] = T[2]*N[0] - T[0]*N[2];
            B[2] = T[0]*N[1] - T[1]*N[0];
            
            N[0] = B[1]*T[2] - B[2]*T[1];
            N[1] = B[2]*T[0] - B[0]*T[2];
            N[2] = B[0]*T[1] - B[1]*T[0];
            
            long double l;
            l = (double)sqrt(B[0] * B[0] + B[1] * B[1] + B[2] * B[2]);
            B[0] /= l;
            B[1] /= l;
            B[2] /= l;
            
            l = (double)sqrt(N[0] * N[0] + N[1] * N[1] + N[2] * N[2]);
            N[0] /= l;
            N[1] /= l;
            N[2] /= l;
            
            for (j = 0; j < aFacets; j++)
            {
                
                long double pointx = (double)sin(j * pi2 / aFacets) * aThickness * (((double)sin(aClumpOffset + aClumps * i * pi2 / aSteps) * aClumpScale) + 1);
                long double pointy = (double)cos(j * pi2 / aFacets) * aThickness * (((double)cos(aClumpOffset + aClumps * i * pi2 / aSteps) * aClumpScale) + 1);
                
                vtx[i * (aFacets + 1) * 3 + j * 3 + 0] = N[0] * pointx + B[0] * pointy + centerpoint[0];
                vtx[i * (aFacets + 1) * 3 + j * 3 + 1] = N[1] * pointx + B[1] * pointy + centerpoint[1];
                vtx[i * (aFacets + 1) * 3 + j * 3 + 2] = N[2] * pointx + B[2] * pointy + centerpoint[2];
                
                normal[i * (aFacets + 1) * 3 + j * 3 + 0] = vtx[i * (aFacets + 1) * 3 + j * 3 + 0] - centerpoint[0];
                normal[i * (aFacets + 1) * 3 + j * 3 + 1] = vtx[i * (aFacets + 1) * 3 + j * 3 + 1] - centerpoint[1];
                normal[i * (aFacets + 1) * 3 + j * 3 + 2] = vtx[i * (aFacets + 1) * 3 + j * 3 + 2] - centerpoint[2];
                
                long double l;
                l = (double)sqrt(normal[i * (aFacets + 1) * 3 + j * 3 + 0] * normal[i * (aFacets + 1) * 3 + j * 3 + 0] +
                                normal[i * (aFacets + 1) * 3 + j * 3 + 1] * normal[i * (aFacets + 1) * 3 + j * 3 + 1] +
                                normal[i * (aFacets + 1) * 3 + j * 3 + 2] * normal[i * (aFacets + 1) * 3 + j * 3 + 2]);
                
                texcoord[i * (aFacets + 1) * 2 + j * 2 + 0] = ((double)j / aFacets) * aUScale;
                texcoord[i * (aFacets + 1) * 2 + j * 2 + 1] = ((double)i / aSteps) * aVScale;
          
                glm::vec3 v = glm::vec3(vtx[    i * (aFacets + 1) * 3 + j * 3 + 0],
                                        vtx[    i * (aFacets + 1) * 3 + j * 3 + 1],
                                        vtx[    i * (aFacets + 1) * 3 + j * 3 + 2]);
                glm::vec2 t = glm::vec2(texcoord[i * (aFacets + 1) * 2 + j * 2 + 0],
                                        texcoord[i * (aFacets + 1) * 2 + j * 2 + 1]);
                glm::vec3 n = glm::vec3(normal[  i * (aFacets + 1) * 3 + j * 3 + 0],
                                        normal[  i * (aFacets + 1) * 3 + j * 3 + 1],
                                        normal[  i * (aFacets + 1) * 3 + j * 3 + 2]);
                positions.push_back(v);
                texCoords.push_back(t);
                normals.push_back(n);
                
                normal[i * (aFacets + 1) * 3 + j * 3 + 0] /= l;
                normal[i * (aFacets + 1) * 3 + j * 3 + 1] /= l;
                normal[i * (aFacets + 1) * 3 + j * 3 + 2] /= l;
            }
            // create duplicate vertex for sideways wrapping
            // otherwise identical to first vertex in the 'ring' except for the U coordinate
            vtx[i * (aFacets + 1) * 3 + aFacets * 3 + 0] = vtx[i * (aFacets + 1) * 3 + 0];
            vtx[i * (aFacets + 1) * 3 + aFacets * 3 + 1] = vtx[i * (aFacets + 1) * 3 + 1];
            vtx[i * (aFacets + 1) * 3 + aFacets * 3 + 2] = vtx[i * (aFacets + 1) * 3 + 2];
            
            normal[i * (aFacets + 1) * 3 + aFacets * 3 + 0] = normal[i * (aFacets + 1) * 3 + 0];
            normal[i * (aFacets + 1) * 3 + aFacets * 3 + 1] = normal[i * (aFacets + 1) * 3 + 1];
            normal[i * (aFacets + 1) * 3 + aFacets * 3 + 2] = normal[i * (aFacets + 1) * 3 + 2];
            
            texcoord[i * (aFacets + 1) * 2 + aFacets * 2 + 0] = aUScale;
            texcoord[i * (aFacets + 1) * 2 + aFacets * 2 + 1] = texcoord[i * (aFacets + 1) * 2 + 1];
      
            glm::vec3 v = glm::vec3(vtx[    i * (aFacets + 1) * 3 + aFacets * 3 + 0],
                                    vtx[    i * (aFacets + 1) * 3 + aFacets * 3 + 1],
                                    vtx[    i * (aFacets + 1) * 3 + aFacets * 3 + 2]);
            glm::vec2 t = glm::vec2(texcoord[i * (aFacets + 1) * 2 + aFacets * 2 + 0],
                                    texcoord[i * (aFacets + 1) * 2 + aFacets * 2 + 1]);
            glm::vec3 n = glm::vec3(normal[  i * (aFacets + 1) * 3 + aFacets * 3 + 0],
                                    normal[  i * (aFacets + 1) * 3 + aFacets * 3 + 1],
                                    normal[  i * (aFacets + 1) * 3 + aFacets * 3 + 2]);
            
            positions.push_back(v);
            texCoords.push_back(t);
            normals.push_back(n);
            
        }
        
        // create duplicate ring of vertices for longways wrapping
        // otherwise identical to first 'ring' in the knot except for the V coordinate
        for (j = 0; j < aFacets; j++)
        {
            vtx[aSteps * (aFacets + 1) * 3 + j * 3 + 0] = vtx[j * 3 + 0];
            vtx[aSteps * (aFacets + 1) * 3 + j * 3 + 1] = vtx[j * 3 + 1];
            vtx[aSteps * (aFacets + 1) * 3 + j * 3 + 2] = vtx[j * 3 + 2];
            
            normal[aSteps * (aFacets + 1) * 3 + j * 3 + 0] = normal[j * 3 + 0];
            normal[aSteps * (aFacets + 1) * 3 + j * 3 + 1] = normal[j * 3 + 1];
            normal[aSteps * (aFacets + 1) * 3 + j * 3 + 2] = normal[j * 3 + 2];
            
            texcoord[aSteps * (aFacets + 1) * 2 + j * 2 + 0] = texcoord[j * 2 + 0];
            texcoord[aSteps * (aFacets + 1) * 2 + j * 2 + 1] = aVScale;
            
            positions.push_back( glm::vec3(vtx[    aSteps * (aFacets + 1) * 3 + j * 3 + 0], 
                                           vtx[    aSteps * (aFacets + 1) * 3 + j * 3 + 1],
                                           vtx[    aSteps * (aFacets + 1) * 3 + j * 3 + 2]));
                                         
            texCoords.push_back( glm::vec2(texcoord[aSteps * (aFacets + 1) * 2 + j * 2 + 0],
                                          texcoord[aSteps * (aFacets + 1) * 2 + j * 2 + 1])); 
            normals.push_back(glm::vec3(normal[  aSteps * (aFacets + 1) * 3 + j * 3 + 0],
                                        normal[  aSteps * (aFacets + 1) * 3 + j * 3 + 1],
                                        normal[  aSteps * (aFacets + 1) * 3 + j * 3 + 2]));
                                        
        }
        
        // finally, there's one vertex that needs to be duplicated due to both U and V coordinate.
        vtx[aSteps * (aFacets + 1) * 3 + aFacets * 3 + 0] = vtx[0];
        vtx[aSteps * (aFacets + 1) * 3 + aFacets * 3 + 1] = vtx[1];
        vtx[aSteps * (aFacets + 1) * 3 + aFacets * 3 + 2] = vtx[2];
        
        normal[aSteps * (aFacets + 1) * 3 + aFacets * 3 + 0] = normal[0];
        normal[aSteps * (aFacets + 1) * 3 + aFacets * 3 + 1] = normal[1];
        normal[aSteps * (aFacets + 1) * 3 + aFacets * 3 + 2] = normal[2];
        
        texcoord[aSteps * (aFacets + 1) * 2 + aFacets * 2 + 0] = aUScale;
        texcoord[aSteps * (aFacets + 1) * 2 + aFacets * 2 + 1] = aVScale;
        
        positions.push_back( glm::vec3(vtx[    aSteps * (aFacets + 1) * 3 + aFacets * 3 + 0], 
                                                      vtx[    aSteps * (aFacets + 1) * 3 + aFacets * 3 + 1], 
                                       vtx[    aSteps * (aFacets + 1) * 3 + aFacets * 3 + 2])); 
        texCoords.push_back( glm::vec2(texcoord[aSteps * (aFacets + 1) * 2 + aFacets * 2 + 0],
                                     texcoord[aSteps * (aFacets + 1) * 2 + aFacets * 2 + 1])); 
        normals.push_back(glm::vec3(normal[  aSteps * (aFacets + 1) * 3 + aFacets * 3 + 0],
                                     normal[  aSteps * (aFacets + 1) * 3 + aFacets * 3 + 1],
                                     normal[  aSteps * (aFacets + 1) * 3 + aFacets * 3 + 2]));
        
    }
    
    for(long unsigned int i = 0; i < m_numVertices; i++)
    {
        glm::vec3 v = positions[i]; // vertex
        glm::vec2 uv = texCoords[i]; // texture
        glm::vec3 n = normals[i];  // normal
        
        m_vbo.AddVertexData(&v, sizeof(glm::vec3));
        m_vbo.AddVertexData(&uv, sizeof(glm::vec2));
        m_vbo.AddVertexData(&n, sizeof(glm::vec3));
    }
    
    for(unsigned int i = 0; i < m_numIndices; i++)
    {
        unsigned int index = torusIndices[i];
        m_vbo.AddIndexData(&index, sizeof(unsigned int));
    }
    
    m_vbo.UploadDataToGPU(GL_STATIC_DRAW);
    
    // 2 vector3 plus 1 vector2
    GLsizei stride = 2*sizeof(glm::vec3)+sizeof(glm::vec2);
    
    // Vertex positions
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, 0);
    // Texture coordinates
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, stride, (void*)sizeof(glm::vec3));
    // Normal vectors
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(2, 3, GL_FLOAT, GL_FALSE, stride, (void*)(sizeof(glm::vec3)+sizeof(glm::vec2)));
    /*
    // Tangents
    glEnableVertexAttribArray(3);
    glVertexAttribPointer(3, 3, GL_FLOAT, GL_FALSE, stride, (void*)(sizeof(glm::vec3)+sizeof(glm::vec2)+sizeof(glm::vec3)));
    
    // Bitangents
    glEnableVertexAttribArray(4);
    glVertexAttribPointer(4, 3, GL_FLOAT, GL_FALSE, stride, (void*)(sizeof(glm::vec3)+sizeof(glm::vec2)+sizeof(glm::vec3)+sizeof(glm::vec3)));
*/
}

void CTorusKnot::Transform(const glm::vec3 & position, const glm::vec3 & rotation, const glm::vec3 & scale) {
    transform.SetIdentity();
    transform.Translate(position.x, position.y, position.z);
    transform.RotateX(rotation.x);
    transform.RotateY(rotation.y);
    transform.RotateZ(rotation.z);
    transform.Scale(scale);
}

void CTorusKnot::Render(const bool &useTexture)
{
    // bind the VAO (the triangle)
    glBindVertexArray(m_vao);
    m_texture.BindTexture2D();
    
    glDrawElements(GL_TRIANGLE_STRIP, m_numIndices, GL_UNSIGNED_INT, 0);
}

// Release memory on the GPU 
void CTorusKnot::Release()
{
    m_texture.Release();
    
    glDeleteVertexArrays(1, &m_vao);
    
    m_vbo.Release();
}
