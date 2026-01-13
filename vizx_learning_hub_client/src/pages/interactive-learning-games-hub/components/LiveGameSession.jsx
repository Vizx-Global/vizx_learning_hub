import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const LiveGameSession = ({ 
  game, 
  onGameComplete, 
  onGameExit,
  userRole = 'employee' 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(game?.timeLimit || 300);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock game data
  const gameQuestions = [
    {
      id: 1,
      type: 'multiple-choice',
      question: "What is the primary purpose of Azure Cognitive Services?",
      options: [
        "To provide pre-built AI models and APIs for common AI tasks",
        "To manage virtual machines in the cloud",
        "To store and analyze big data",
        "To create custom neural networks from scratch"
      ],
      correctAnswer: 0,
      explanation: "Azure Cognitive Services provides pre-built AI models and APIs that developers can easily integrate into their applications without needing deep AI expertise."
    },
    {
      id: 2,
      type: 'drag-drop',
      question: "Match the Azure AI service with its primary function:",
      items: [
        { id: 'computer-vision', text: 'Computer Vision' },
        { id: 'text-analytics', text: 'Text Analytics' },
        { id: 'speech', text: 'Speech Services' },
        { id: 'translator', text: 'Translator' }
      ],
      targets: [
        { id: 'image-analysis', text: 'Analyze images and extract information' },
        { id: 'sentiment', text: 'Extract insights from text data' },
        { id: 'voice', text: 'Convert speech to text and text to speech' },
        { id: 'language', text: 'Translate text between languages' }
      ],
      correctMatches: {
        'computer-vision': 'image-analysis',
        'text-analytics': 'sentiment',
        'speech': 'voice',
        'translator': 'language'
      }
    },
    {
      id: 3,
      type: 'scenario',
      question: "You\'re building a customer service chatbot. Which Azure AI services would you combine?",
      scenario: `A retail company wants to create an intelligent chatbot that can:\n• Understand customer queries in multiple languages\n• Analyze customer sentiment\n• Provide voice responses\n• Recognize products in uploaded images`,
      options: [
        "Language Understanding + Text Analytics + Speech Services + Computer Vision",
        "Only Bot Framework",
        "Custom Vision + Form Recognizer",
        "Azure Machine Learning + Power BI"
      ],
      correctAnswer: 0,
      explanation: "This scenario requires multiple AI services: Language Understanding for intent recognition, Text Analytics for sentiment analysis, Speech Services for voice interaction, and Computer Vision for image recognition."
    }
  ];

  useEffect(() => {
    if (timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleGameComplete();
    }
  }, [timeRemaining, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < gameQuestions?.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleGameComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    gameQuestions?.forEach((question, index) => {
      const userAnswer = selectedAnswers?.[question?.id];
      if (question?.type === 'multiple-choice' && userAnswer === question?.correctAnswer) {
        correctAnswers++;
      }
      // Add logic for other question types
    });
    return Math.round((correctAnswers / gameQuestions?.length) * 100);
  };

  const handleGameComplete = () => {
    setIsSubmitting(true);
    const finalScore = calculateScore();
    setScore(finalScore);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setShowResults(true);
      onGameComplete({
        gameId: game?.id,
        score: finalScore,
        timeSpent: (game?.timeLimit || 300) - timeRemaining,
        answers: selectedAnswers
      });
    }, 1500);
  };

  const currentQ = gameQuestions?.[currentQuestion];

  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Trophy" size={40} className="text-success" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Game Complete!</h2>
            <p className="text-muted-foreground">Great job on completing {game?.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{score}%</p>
              <p className="text-sm text-muted-foreground">Final Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{formatTime((game?.timeLimit || 300) - timeRemaining)}</p>
              <p className="text-sm text-muted-foreground">Time Taken</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">+{score * 10}</p>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="default"
              fullWidth
              iconName="RotateCcw"
              iconPosition="left"
              onClick={() => window.location?.reload()}
            >
              Play Again
            </Button>
            <Button
              variant="outline"
              fullWidth
              iconName="ArrowLeft"
              iconPosition="left"
              onClick={onGameExit}
            >
              Back to Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Calculating Results...</h2>
          <p className="text-muted-foreground">Please wait while we process your answers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Game Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                iconName="ArrowLeft"
                onClick={onGameExit}
              />
              <div>
                <h1 className="text-xl font-semibold text-foreground">{game?.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {gameQuestions?.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={20} className="text-warning" />
                <span className={`font-mono text-lg font-semibold ${timeRemaining < 60 ? 'text-error' : 'text-foreground'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <Icon name="Target" size={20} className="text-primary" />
                <span className="font-semibold text-foreground">
                  {Math.round(((currentQuestion + 1) / gameQuestions?.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / gameQuestions?.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Game Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border border-border rounded-xl p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-semibold">
                  {currentQuestion + 1}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {currentQ?.question}
                </h2>
                
                {currentQ?.scenario && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Icon name="FileText" size={16} />
                      Scenario
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {currentQ?.scenario}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="mb-8">
            {currentQ?.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQ?.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`
                      flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all
                      ${selectedAnswers?.[currentQ?.id] === index 
                        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-accent/50'
                      }
                    `}
                  >
                    <Checkbox
                      checked={selectedAnswers?.[currentQ?.id] === index}
                      onChange={() => handleAnswerSelect(currentQ?.id, index)}
                    />
                    <span className="text-foreground">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQ?.type === 'drag-drop' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-foreground mb-4">Items to Match</h3>
                  <div className="space-y-2">
                    {currentQ?.items?.map((item) => (
                      <div
                        key={item?.id}
                        className="bg-primary/10 border border-primary/20 rounded-lg p-3 cursor-move"
                        draggable
                      >
                        {item?.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-4">Drop Targets</h3>
                  <div className="space-y-2">
                    {currentQ?.targets?.map((target) => (
                      <div
                        key={target?.id}
                        className="bg-muted border-2 border-dashed border-border rounded-lg p-3 min-h-[60px] flex items-center"
                      >
                        {target?.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              iconName="ChevronLeft"
              iconPosition="left"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {gameQuestions?.map((_, index) => (
                <button
                  key={index}
                  className={`
                    w-3 h-3 rounded-full transition-colors
                    ${index === currentQuestion 
                      ? 'bg-primary' 
                      : selectedAnswers?.[gameQuestions?.[index]?.id] !== undefined
                      ? 'bg-success' :'bg-muted'
                    }
                  `}
                  onClick={() => setCurrentQuestion(index)}
                />
              ))}
            </div>

            <Button
              variant="default"
              iconName={currentQuestion === gameQuestions?.length - 1 ? "Check" : "ChevronRight"}
              iconPosition="right"
              onClick={currentQuestion === gameQuestions?.length - 1 ? handleGameComplete : handleNextQuestion}
              disabled={selectedAnswers?.[currentQ?.id] === undefined}
            >
              {currentQuestion === gameQuestions?.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveGameSession;