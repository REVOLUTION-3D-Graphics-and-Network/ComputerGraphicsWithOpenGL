//
//  Button.h
//  ComputerGraphicsWithOpenGL
//
//  Created by GEORGE QUENTIN on 22/02/2019.
//  Copyright © 2019 GEORGE QUENTIN. All rights reserved.
//

#ifndef Button_h
#define Button_h

#include "Control.h"

class CButton: public CControl {
  
public:
    CButton(std::string label, GLuint labelSize, GLint positionX, GLint positionY, GLint width, GLint height);
    
    virtual void Create();
    GLboolean Update(const MouseState &state) override;
    virtual void Render(CFreeTypeFont *font, CShaderProgram *hudProgram, const std::string &material);
    virtual std::string GetControlType();
    void Release() override;
protected:
    GLboolean           m_down;
    std::string         m_label;
    GLuint              m_labelSize;
};

#endif /* Button_h */
