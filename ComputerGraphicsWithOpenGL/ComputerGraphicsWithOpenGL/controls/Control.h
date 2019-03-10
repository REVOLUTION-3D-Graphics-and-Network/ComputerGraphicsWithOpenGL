//
//  Control.h
//  ComputerGraphicsWithOpenGL
//
//  Created by GEORGE QUENTIN on 22/02/2019.
//  Copyright © 2019 GEORGE QUENTIN. All rights reserved.
//

#ifndef Control_h
#define Control_h

#pragma once

#include "Common.h"
#include "ControlType.h"
#include "FreeTypeFont.h"
#include "VertexBufferObject.h"

// abstract class
class CControl {

public:
    CControl(GLint positionX, GLint positionY, GLint width, GLint height);
    virtual ~CControl();
    
    virtual void Create() = 0;
    virtual void Render(CFreeTypeFont *font, CShaderProgram *hudProgram, const std::string &material) = 0;
    virtual GLboolean Update(const MouseState &state);
    virtual std::string GetControlType() = 0;
    
    void SetPosition(GLint x, GLint y);
    void SetSize(GLint width, GLint height);
    
    GLint GetWidth() const;
    GLint GetHeight() const;
    GLboolean GetIsInside() const;
    
    virtual void Release();
    
public:
    static std::list<CControl *> m_controls;
    
protected:
    GLboolean           m_isInside;
    
    GLint               m_posX, m_posY;
    GLint               m_width, m_height;
    GLuint              m_vao, m_numTriangles;
    CVertexBufferObject m_vbo;
    
};

CControl * AddControl(CControl *control);
#endif /* Control_h */