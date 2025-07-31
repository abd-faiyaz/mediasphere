"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { aiService, SummaryRequest, SummaryResponse, MediaOption, ClubOption, ThreadOption } from "@/lib/ai-services";
import { useAIService } from "@/hooks/useAIService";

export function SummaryTab() {
  const [selectedMedia, setSelectedMedia] = useState<string>('');
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<string>('');
  const [summaryType, setSummaryType] = useState<'BRIEF' | 'DETAILED'>('DETAILED');
  
  const [mediaList, setMediaList] = useState<MediaOption[]>([]);
  const [clubList, setClubList] = useState<ClubOption[]>([]);
  const [threadList, setThreadList] = useState<ThreadOption[]>([]);
  
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  
  const { 
    data: summaryResult, 
    loading: generatingSummary, 
    error: summaryError, 
    execute: executeSummary 
  } = useAIService<SummaryResponse>();

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

  const handleGenerateSummary = async () => {
    if (!selectedMedia) {
      return;
    }

    const request: SummaryRequest = {
      mediaId: selectedMedia,
      clubId: selectedClub || undefined,
      threadId: selectedThread || undefined,
      summaryType,
      maxWords: summaryType === 'BRIEF' ? 100 : 200,
      includeTopics: true
    };

    await executeSummary(() => aiService.generateSummary(request));
  };

  const canGenerate = selectedMedia && !generatingSummary;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Selection Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Content Selection</CardTitle>
              <CardDescription>
                Choose the content you want to summarize
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Media Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Media *
              </label>
              <Select value={selectedMedia} onValueChange={setSelectedMedia} disabled={loadingMedia}>
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

          {/* Summary Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Summary Type
            </label>
            <Select value={summaryType} onValueChange={(value: 'BRIEF' | 'DETAILED') => setSummaryType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRIEF">Brief (~100 words)</SelectItem>
                <SelectItem value="DETAILED">Detailed (~200 words)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col gap-3 pt-4">
            {selectedClub && threadList.length === 0 && !loadingThreads && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The selected club has no discussion threads yet. 
                  You can still generate a summary based on the club's description and media information.
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleGenerateSummary} 
              disabled={!canGenerate}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-fit"
            >
              {generatingSummary ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {summaryError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error generating summary</span>
              </div>
              <p className="text-red-600 mt-2">{summaryError}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Results */}
      {summaryResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle>Summary Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary Text */}
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-gray-700 leading-relaxed">{summaryResult.summary}</p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t">
                  <span>Words: {summaryResult.wordCount}</span>
                  <span>Source: {summaryResult.sourceType}</span>
                  <span>Title: {summaryResult.sourceTitle}</span>
                  <span>Generated: {new Date(summaryResult.generatedAt).toLocaleString()}</span>
                  {summaryResult.fromCache && <Badge variant="secondary">Cached</Badge>}
                </div>

                {/* Key Topics */}
                {summaryResult.keyTopics && summaryResult.keyTopics.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {summaryResult.keyTopics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
