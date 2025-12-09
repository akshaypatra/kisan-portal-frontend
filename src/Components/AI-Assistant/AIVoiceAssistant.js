import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaPaperPlane, FaVolumeUp, FaTimes } from 'react-icons/fa';
import './AIVoiceAssistant.css';

const AIVoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [language, setLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const prompts = {
    en: [
      "How to grow oilseeds?",
      "Why growing oilseeds is important?",
      "Need help in increasing oilseed crop production?"
    ],
    hi: [
      "तिलहन कैसे उगाएं?",
      "तिलहन उगाना क्यों महत्वपूर्ण है?",
      "तिलहन फसल उत्पादन बढ़ाने में मदद चाहिए?"
    ]
  };

  // Animated prompt cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % prompts[language].length);
    }, 3000);
    return () => clearInterval(interval);
  }, [language]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API for voice input
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language]);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call backend API instead of OpenAI directly to avoid CORS
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/ai/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: text }]),
          language: language
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API Error:', response.status, errorData);
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Optional: Auto-speak response
      if (isSpeaking) {
        speakText(assistantMessage.content);
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);

      let errorMsg = language === 'hi'
        ? 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
        : 'Sorry, something went wrong. Please try again.';

      // Provide more specific error messages
      if (error.message.includes('401')) {
        errorMsg = language === 'hi'
          ? 'API कुंजी अमान्य है। कृपया सही OpenAI API कुंजी जांचें।'
          : 'Invalid API key. Please check your OpenAI API key.';
      } else if (error.message.includes('429')) {
        errorMsg = language === 'hi'
          ? 'बहुत सारे अनुरोध। कृपया बाद में पुनः प्रयास करें।'
          : 'Too many requests. Please try again later.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMsg = language === 'hi'
          ? 'नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।'
          : 'Network error. Please check your internet connection.';
      }

      const errorMessage = {
        role: 'assistant',
        content: errorMsg
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePromptClick = (prompt) => {
    setInputText(prompt);
    sendMessage(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="ai-assistant-fab"
          onClick={() => setIsOpen(true)}
          title="AI Farming Assistant"
        >
          <span className="ai-icon">🌾</span>
          <span className="ai-pulse"></span>
        </button>
      )}

      {/* Assistant Modal */}
      {isOpen && (
        <div className="ai-assistant-modal">
          <div className="ai-assistant-header">
            <div className="ai-header-content">
              <div className="ai-avatar">🌾</div>
              <div>
                <h3>Kisan AI Assistant</h3>
                <p>Your Oilseed Farming Expert</p>
              </div>
            </div>
            <div className="ai-header-actions">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-selector"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Animated Prompts */}
          {messages.length === 0 && (
            <div className="ai-prompts-container">
              <div className="animated-prompt-wrapper">
                {prompts[language].map((prompt, index) => (
                  <div
                    key={index}
                    className={`animated-prompt ${
                      index === currentPromptIndex ? 'active' : ''
                    }`}
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
              <div className="quick-prompts">
                {prompts[language].map((prompt, index) => (
                  <button
                    key={index}
                    className="quick-prompt-btn"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                  {msg.role === 'assistant' && (
                    <button
                      className="speak-btn"
                      onClick={() => speakText(msg.content)}
                      title="Listen to response"
                    >
                      <FaVolumeUp />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="ai-input-container">
            <button
              className={`voice-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? <FaStop /> : <FaMicrophone />}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={
                language === 'hi'
                  ? 'अपना सवाल पूछें...'
                  : 'Ask your question...'
              }
              className="ai-input"
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
              title="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIVoiceAssistant;
