
import React, { useState, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Headphones, Mic, MicOff, Play, Square, FileText, Upload, Loader2, RefreshCw } from 'lucide-react';

const SpeechAssessment = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  const sampleText = "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Peter Piper picked a peck of pickled peppers.";
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone to record your speech sample.",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Recording Stopped",
        description: `Speech sample recorded (${recordingTime}s).`,
      });
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an audio file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an audio file (WAV, MP3, etc.).",
        variant: "destructive",
      });
      return;
    }
    
    const audioUrl = URL.createObjectURL(file);
    setAudioURL(audioUrl);
    
    toast({
      title: "Audio Uploaded",
      description: "Your audio file has been successfully uploaded.",
    });
  };
  
  const analyzeSpeech = () => {
    if (!audioURL) {
      toast({
        title: "No Audio Sample",
        description: "Please record or upload an audio sample first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call for demo purposes
    setTimeout(() => {
      // Generate mock analysis
      const fluencyScore = Math.floor(Math.random() * 3) + 7; // 7-10
      const mockAnalysis = `
## Speech Evaluation Results

### Pronunciation Assessment
- Overall fluency score: ${fluencyScore}/10
- Identified pronunciation challenges with: "th" sounds, "r" sounds
- Speech rate: ${fluencyScore > 8 ? 'Appropriate' : 'Slightly irregular'}

### Fluency Analysis
- ${fluencyScore > 8 ? 'Minimal' : 'Several'} hesitations detected
- ${fluencyScore > 8 ? 'Natural' : 'Some unnatural'} pausing patterns
- ${fluencyScore > 8 ? 'Smooth' : 'Occasionally disrupted'} word transitions

### Potential Indicators
- ${fluencyScore < 8 ? 'Some pronunciation patterns suggest possible phonological processing challenges' : 'No significant phonological processing concerns observed'}
- ${fluencyScore < 8 ? 'Word retrieval hesitations may indicate naming speed differences' : 'Word retrieval appears typical'}
- Reading fluency is ${fluencyScore > 8 ? 'within typical range' : 'showing some characteristics associated with dyslexia'}

### Recommendations
- ${fluencyScore < 8 ? 'Practice with specific phoneme pairs that showed difficulty' : 'Continue reading aloud regularly to maintain fluency'}
- ${fluencyScore < 9 ? 'Consider structured phonological awareness exercises' : 'No specific phonological interventions needed'}
- ${fluencyScore < 8 ? 'Further assessment by a speech-language professional recommended' : 'No specialized assessment indicated at this time'}

*Note: This is an automated analysis and should not replace professional evaluation.*
      `;
      
      setAnalysisResult(mockAnalysis);
      setIsLoading(false);
      
      toast({
        title: "Analysis Complete",
        description: "Speech sample has been successfully analyzed.",
      });
    }, 3000);
  };
  
  const resetAssessment = () => {
    setAudioURL(null);
    setAnalysisResult(null);
    setRecordingTime(0);
    
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Layout>
      <div className="assessment-container animate-fade-in">
        <h1 className="page-title">Speech & Reading Assessment</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Record or upload speech samples to evaluate pronunciation, fluency, and reading 
            comprehension. The system will analyze speech patterns for potential indicators 
            related to dyslexia and other learning differences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="record">
                  <TabsList className="mb-6 w-full">
                    <TabsTrigger value="record" className="flex-1">Record Speech</TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1">Upload Audio</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="record" className="mt-0">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Speech Sample Recording</h3>
                      
                      <div className="p-4 bg-gray-50 border rounded-md mb-6">
                        <h4 className="text-sm font-medium mb-2">Please read the following text aloud:</h4>
                        <p className="text-base italic bg-white p-4 rounded border">{sampleText}</p>
                      </div>
                      
                      <div className="flex justify-center mb-6">
                        {isRecording ? (
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-4">
                              <Mic className="h-12 w-12 text-red-500 animate-pulse" />
                            </div>
                            <div className="text-lg font-medium">{formatTime(recordingTime)}</div>
                            <Button 
                              onClick={stopRecording} 
                              variant="destructive" 
                              className="mt-4 flex items-center gap-2"
                            >
                              <Square className="h-4 w-4" />
                              Stop Recording
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <button 
                              onClick={startRecording} 
                              className="w-24 h-24 rounded-full bg-app-blue bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center mb-4 transition-all"
                            >
                              <Mic className="h-12 w-12 text-app-blue" />
                            </button>
                            <p className="text-gray-500">Click to start recording</p>
                          </div>
                        )}
                      </div>
                      
                      {audioURL && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Review your recording:</p>
                          <audio src={audioURL} controls className="w-full"></audio>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="mt-0">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Upload Audio Sample</h3>
                      
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-6">
                        <Upload className="text-gray-400 mb-2" size={32} />
                        <p className="text-gray-500 mb-4 text-center">
                          Drag and drop your audio file here, or click to select a file
                        </p>
                        <input
                          type="file"
                          id="audio-file"
                          accept="audio/*"
                          onChange={handleFileUpload}
                          className="w-full max-w-xs"
                        />
                      </div>
                      
                      {audioURL && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Uploaded audio:</p>
                          <audio src={audioURL} controls className="w-full"></audio>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 flex flex-col gap-4">
                  <Button 
                    className="w-full bg-app-blue hover:bg-app-blue-dark" 
                    onClick={analyzeSpeech}
                    disabled={isLoading || !audioURL}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Headphones className="mr-2 h-4 w-4" />
                        Analyze Speech
                      </>
                    )}
                  </Button>
                  
                  {(audioURL || analysisResult) && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={resetAssessment}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset Assessment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <FileText className="text-app-blue mr-2" size={20} />
                  <h2 className="card-title">Analysis Results</h2>
                </div>
                
                <div className="flex-1 overflow-auto">
                  {analysisResult ? (
                    <div className="prose max-w-full">
                      <div className="whitespace-pre-line">{analysisResult}</div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-center p-8">
                      <div>
                        <p className="mb-2">No analysis results yet.</p>
                        <p className="text-sm">Record or upload a speech sample and click "Analyze Speech" to see results.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SpeechAssessment;
