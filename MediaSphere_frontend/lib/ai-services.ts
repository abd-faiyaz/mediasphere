// AI Services API Client
export interface SummaryRequest {
  mediaId?: string;
  clubId?: string;
  threadId?: string;
  summaryType?: 'BRIEF' | 'DETAILED';
  maxWords?: number;
  includeTopics?: boolean;
}

export interface SummaryResponse {
  success: boolean;
  message?: string;
  summary: string;
  wordCount: number;
  keyTopics?: string[];
  sourceType: 'MEDIA' | 'CLUB' | 'THREAD';
  sourceTitle: string;
  generatedAt: string;
  fromCache: boolean;
}

export interface MediaOption {
  id: string;
  title: string;
}

export interface ClubOption {
  id: string;
  name: string;
}

export interface ThreadOption {
  id: string;
  title: string;
}

export interface QuizRequest {
  mediaId?: string;
  clubId?: string;
  threadId?: string;
  numberOfQuestions?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  questionType?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED';
  includeExplanations?: boolean;
  timeLimit?: number;
}

export interface QuizQuestion {
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface QuizResponse {
  success: boolean;
  message?: string;
  quizTitle: string;
  sourceType: 'MEDIA' | 'CLUB' | 'THREAD';
  sourceTitle: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  estimatedTime: number;
  difficulty: string;
  instructions: string;
  generatedAt: string;
  fromCache: boolean;
}

export interface QuizSubmissionRequest {
  quizId: string;
  answers: Record<number, string>;
  startTime: number;
  endTime: number;
}

export interface QuestionResult {
  questionIndex: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  points: number;
}

export interface QuizSubmissionResponse {
  success: boolean;
  message?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  results: QuestionResult[];
  completionTime: number;
}

class AIService {
  private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add JWT token when authentication is implemented
        // 'Authorization': `Bearer ${getToken()}`
      },
      ...options
    };

    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async generateSummary(request: SummaryRequest): Promise<SummaryResponse> {
    return this.makeRequest<SummaryResponse>('/api/ai/summary/generate', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getAllMedia(): Promise<MediaOption[]> {
    return this.makeRequest<MediaOption[]>('/api/ai/data/media');
  }

  async getClubsByMedia(mediaId: string): Promise<ClubOption[]> {
    return this.makeRequest<ClubOption[]>(`/api/ai/data/clubs?mediaId=${mediaId}`);
  }

  async getThreadsByClub(clubId: string): Promise<ThreadOption[]> {
    return this.makeRequest<ThreadOption[]>(`/api/ai/data/threads?clubId=${clubId}`);
  }

  async generateQuiz(request: QuizRequest): Promise<QuizResponse> {
    return this.makeRequest<QuizResponse>('/api/ai/quiz/generate', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async submitQuiz(request: QuizSubmissionRequest): Promise<QuizSubmissionResponse> {
    return this.makeRequest<QuizSubmissionResponse>('/api/ai/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async testConnection(): Promise<string> {
    return this.makeRequest<string>('/api/ai/summary/test');
  }
}

export const aiService = new AIService();
