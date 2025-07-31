"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Loader2, AlertCircle, CheckCircle, Clock, Trophy, Target } from "lucide-react";
import { motion } from "framer-motion";
import { aiService, QuizRequest, QuizResponse, QuizQuestion, MediaOption, ClubOption, ThreadOption, QuizSubmissionRequest } from "@/lib/ai-services";
import { useAIService } from "@/hooks/useAIService";

export function QuizTab() {
  const [selectedMedia, setSelectedMedia] = useState<string>('');
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<string>('');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'MIXED'>('MEDIUM');
  const [questionType, setQuestionType] = useState<'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED'>('MULTIPLE_CHOICE');
  
  const [mediaList, setMediaList] = useState<MediaOption[]>([]);
  const [clubList, setClubList] = useState<ClubOption[]>([]);
  const [threadList, setThreadList] = useState<ThreadOption[]>([]);
  
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  
  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<QuizResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  
  const { 
    data: quizResult, 
    loading: generatingQuiz, 
    error: quizError, 
    execute: executeQuiz 
  } = useAIService<QuizResponse>();

  // Fetch media list on component mount
  useEffect(() => {
    fetchMediaList();
  }, []);

  // Fetch clubs when media is selected
  useEffect(() => {
    if (selectedMedia) {
      fetchClubsByMedia(selectedMedia);
      setSelectedClub('');
      setSelectedThread('');
    }
  }, [selectedMedia]);

  // Fetch threads when club is selected
  useEffect(() => {
    if (selectedClub) {
      fetchThreadsByClub(selectedClub);
      setSelectedThread('');
    }
  }, [selectedClub]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentQuiz && quizStartTime > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - quizStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentQuiz, quizStartTime, showResults]);

  const fetchMediaList = async () => {
    setLoadingMedia(true);
    try {
      const media = await aiService.getAllMedia();
      setMediaList(media);
    } catch (error) {
      console.error('Failed to fetch media list:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const fetchClubsByMedia = async (mediaId: string) => {
    setLoadingClubs(true);
    try {
      const clubs = await aiService.getClubsByMedia(mediaId);
      setClubList(clubs);
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    } finally {
      setLoadingClubs(false);
    }
  };

  const fetchThreadsByClub = async (clubId: string) => {
    setLoadingThreads(true);
    try {
      const threads = await aiService.getThreadsByClub(clubId);
      setThreadList(threads);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoadingThreads(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedMedia) {
      return;
    }

    const request: QuizRequest = {
      mediaId: selectedMedia,
      clubId: selectedClub || undefined,
      threadId: selectedThread || undefined,
      numberOfQuestions,
      difficulty,
      questionType,
      includeExplanations: true,
      timeLimit: 0
    };

    const result = await executeQuiz(() => aiService.generateQuiz(request));
    if (result) {
      setCurrentQuiz(result);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizStartTime(Date.now());
      setTimeElapsed(0);
      setShowResults(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    
    const submission: QuizSubmissionRequest = {
      quizId: 'temp-quiz-id', // TODO: Use actual quiz ID
      answers: userAnswers,
      startTime: quizStartTime,
      endTime: Date.now()
    };

    try {
      const result = await aiService.submitQuiz(submission);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const calculateScore = () => {
    if (!currentQuiz) return { score: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    return {
      score: correct,
      total: currentQuiz.questions.length,
      percentage: Math.round((correct / currentQuiz.questions.length) * 100)
    };
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const canGenerate = selectedMedia && !generatingQuiz;
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuiz && currentQuestionIndex === currentQuiz.questions.length - 1;
  const allQuestionsAnswered = currentQuiz?.questions.every((_, index) => userAnswers[index]);

  if (currentQuiz && !showResults) {
    // Quiz Taking Mode
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Quiz Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{currentQuiz.quizTitle}</CardTitle>
                <CardDescription>{currentQuiz.instructions}</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Current Question */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                <Badge variant="outline">{currentQuestion.type.replace('_', ' ')}</Badge>
                <span className="text-sm text-gray-600">{currentQuestion.points} point(s)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{currentQuestion.question}</p>
              
              {/* Answer Input Based on Question Type */}
              {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                <RadioGroup
                  value={userAnswers[currentQuestionIndex] || ''}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, value)}
                >
                  {currentQuestion.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${optionIndex}`} />
                      <Label htmlFor={`option-${optionIndex}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {currentQuestion.type === 'TRUE_FALSE' && (
                <RadioGroup
                  value={userAnswers[currentQuestionIndex] || ''}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="True" id="true" />
                    <Label htmlFor="true" className="cursor-pointer">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="False" id="false" />
                    <Label htmlFor="false" className="cursor-pointer">False</Label>
                  </div>
                </RadioGroup>
              )}
              
              {currentQuestion.type === 'SHORT_ANSWER' && (
                <Textarea
                  placeholder="Enter your answer..."
                  value={userAnswers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                  className="min-h-[100px]"
                />
              )}
              
              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={!allQuestionsAnswered}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={!userAnswers[currentQuestionIndex]}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm text-gray-600">
                {Object.keys(userAnswers).length} / {currentQuiz.questions.length} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.keys(userAnswers).length / currentQuiz.questions.length) * 100}%`
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (showResults) {
    // Results Display Mode
    const { score, total, percentage } = calculateScore();
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Results Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-600 p-3 rounded-full">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                <CardDescription>You finished the quiz in {formatTime(timeElapsed)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuiz?.questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Your answer:</span> {userAnswer || 'No answer'}</p>
                        <p><span className="font-medium">Correct answer:</span> {question.correctAnswer}</p>
                        {question.explanation && (
                          <p className="text-gray-600 mt-2">{question.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => {
            setCurrentQuiz(null);
            setShowResults(false);
            setUserAnswers({});
            setCurrentQuestionIndex(0);
          }}>
            Take Another Quiz
          </Button>
        </div>
      </motion.div>
    );
  }

  // Quiz Setup Mode
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Quiz Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Quiz Configuration</CardTitle>
              <CardDescription>
                Set up your quiz parameters and source content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Media Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Media <span className="text-red-500">*</span>
              </label>
              <Select value={selectedMedia} onValueChange={setSelectedMedia}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingMedia ? "Loading..." : "Choose media..."} />
                </SelectTrigger>
                <SelectContent>
                  {mediaList.map((media) => (
                    <SelectItem key={media.id} value={media.id}>
                      {media.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Club Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Club (Optional)
              </label>
              <Select 
                value={selectedClub} 
                onValueChange={setSelectedClub} 
                disabled={!selectedMedia || loadingClubs}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedMedia ? "Select media first" : 
                    loadingClubs ? "Loading..." : 
                    "Choose club..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {clubList.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Thread Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Thread (Optional)
              </label>
              <Select 
                value={selectedThread} 
                onValueChange={setSelectedThread} 
                disabled={!selectedClub || loadingThreads}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedClub ? "Select club first" :
                    loadingThreads ? "Loading..." :
                    "Choose thread..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {threadList.length === 0 && selectedClub && !loadingThreads ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No threads available in this club yet
                    </div>
                  ) : (
                    threadList.map((thread) => (
                      <SelectItem key={thread.id} value={thread.id}>
                        {thread.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quiz Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <Select value={numberOfQuestions.toString()} onValueChange={(value) => setNumberOfQuestions(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <Select value={difficulty} onValueChange={(value: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                  <SelectItem value="MIXED">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Question Type</label>
              <Select value={questionType} onValueChange={(value: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED') => setQuestionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                  <SelectItem value="MIXED">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col gap-3 pt-4">
            {selectedClub && threadList.length === 0 && !loadingThreads && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The selected club has no discussion threads yet. 
                  The quiz will be generated based on the club's description and media information.
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleGenerateQuiz} 
              disabled={!canGenerate}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 w-fit"
            >
              {generatingQuiz ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <HelpCircle className="h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {quizError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error generating quiz</span>
              </div>
              <p className="text-red-600 mt-2">{quizError}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
