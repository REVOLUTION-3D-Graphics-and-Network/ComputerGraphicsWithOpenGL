//
//  Game+Inputs.cpp
//  New_OpenGL_CourseWork_Template
//
//  Created by GEORGE QUENTIN on 06/10/2017.
//  Copyright © 2017 LEXI LABS. All rights reserved.
//

#include "Game.h"


void Game::MouseControls(const int &button, const int &action){
    
    // https://stackoverflow.com/questions/37194845/using-glfw-to-capture-mouse-dragging-c
    // https://stackoverflow.com/questions/45130391/opengl-get-cursor-coordinate-on-mouse-click-in-c
    
    // Mouse Move
    if (m_mouseMouseMoveClickSwitch == true) {
        m_enableMouseMovement = false;
        //std::cout << "Mouse x: " << m_mouseX << " and mouse y: " << m_mouseY << std::endl;
    }
    // Mouse click
    if ( m_mouseMouseMoveClickSwitch == false){
        m_enableMouseMovement = true;
    }
    
    if (button == GLFW_MOUSE_BUTTON_LEFT) {
        
        if(GLFW_PRESS == action){
            m_mouseButtonDown = true;
            
        }else if(GLFW_RELEASE == action){
            // Mouse click
            if ( m_mouseMouseMoveClickSwitch == false && m_mouseButtonDown == true){
                m_isKeyPressRestriction = !m_isKeyPressRestriction;
                //glfwGetCursorPos(gameWindow.GetWindow(), &m_mouseX, &m_mouseY);
                //std::cout << "Mouse x: " << m_mouseX << " and mouse y: " << m_mouseY << std::endl;
            }
            
            m_mouseButtonDown = false;
        }
        
    }
    
    if(m_mouseButtonDown) {
        // do your drag here
    }
    
    glfwGetCursorPos(m_gameWindow.GetWindow(), &m_mouseX, &m_mouseY);
    m_gameWindow.SetCursorVisible(m_isMouseCursorVisible);
    
}

void Game::KeyBoardControls(int &keyPressed, int &keyReleased, int &keyAction){
    
    if (keyAction == GLFW_RELEASE){
        keyPressed = -1;
    }
    
    if (keyPressed == -1){
        m_keyPressTime = 0.0;
        m_lastKeyPressTime = -1;
        keyReleased = -1;
    }
    
    if (keyPressed != -1){
        
        m_keyPressTime += 0.06;
        
        //m_lastKeyPress == keyPressedCode ||
        if ((int)m_lastKeyPressTime  == (int)m_keyPressTime && m_isKeyPressRestriction == true)
        {
            return;
        }
        
        switch (keyPressed)
        {
               
            case GLFW_KEY_SPACE :   
               
                break;
            case GLFW_KEY_1 :   
                
                break;
            case GLFW_KEY_2:
               
                break;
            case GLFW_KEY_3:
                
                break;
            case GLFW_KEY_4:
                
                break;
            case GLFW_KEY_5:
                
                break;
            case GLFW_KEY_6:
                
                break;
            case GLFW_KEY_7:
                
                break;
            case GLFW_KEY_8: 
                
                break;
            case GLFW_KEY_9:
               
                break;
            case GLFW_KEY_0:
                
                break;
            case GLFW_KEY_COMMA:
                
                break;
            case GLFW_KEY_PERIOD:
                
                break;
            case GLFW_KEY_MINUS:
                
                break;
            case GLFW_KEY_EQUAL:
                
                break;
            case GLFW_KEY_GRAVE_ACCENT:
                
                break;
            case GLFW_KEY_Z:
                break;
            case GLFW_KEY_X:
                break;
            case GLFW_KEY_C:
                break;
            case GLFW_KEY_V:
                break;
            case GLFW_KEY_B:
                break;
            case GLFW_KEY_N:
                break;
            case GLFW_KEY_M:
                break;
            case GLFW_KEY_R:
                break;
            case GLFW_KEY_T:
                break;
            case GLFW_KEY_Y:
                break;
            case GLFW_KEY_U:
                break;
            case GLFW_KEY_O:
                break;
            case GLFW_KEY_P:
                break;
            case GLFW_KEY_I:
                break;
            case GLFW_KEY_K:
                break;
            case GLFW_KEY_J:
                break;
            case GLFW_KEY_L:
                break;
            case GLFW_KEY_G:
                break;
            case GLFW_KEY_H:
                break;
            case GLFW_KEY_Q:
                break;
            case GLFW_KEY_BACKSLASH:
                m_skyboxNumber = (m_skyboxNumber + 1) % 14;
                m_changeSkybox = true;
                break;
            case GLFW_KEY_SLASH:
                m_mouseMouseMoveClickSwitch = !m_mouseMouseMoveClickSwitch;
                break;
            case GLFW_KEY_APOSTROPHE:
                m_audioNumber = (m_audioNumber + 1) % 5;
                m_changeAudio = true;
                break;
            case GLFW_KEY_SEMICOLON:
                m_enableHud = !m_enableHud;
                break;
            default:
                break;
        }
        
        //std::cout << " keypresstime: " << (int)m_keyPressTime << ", lastkeypresstime: " << (int)m_lastKeyPressTime << std::endl;
        //std::cout << " keypress: " << keyPressedCode << ", lastkeypress: " << m_lastKeyPress << std::endl;
        
        m_lastKeyPressTime = m_keyPressTime;
        m_lastKeyPress = keyPressed;
    }
    
    
}
