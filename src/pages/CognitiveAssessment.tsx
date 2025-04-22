
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Brain, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CognitiveAssessment = () => {
  const { toast } = useToast();
  const [memorySequence, setMemorySequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [showSequence, setShowSequence] = useState(false);
  const [memoryGameActive, setMemoryGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [attentionTestActive, setAttentionTestActive] = useState(false);
  const [attentionResults, setAttentionResults] = useState<{
    totalTargets: number;
    hits: number;
    misses: number;
    averageReactionTime: number;
  } | null>(null);
  const [problemSolvingActive, setProblemSolvingActive] = useState(false);
  const [problemSolvingResults, setProblemSolvingResults] = useState<{
    correctPatterns: number;
    totalPatterns: number;
    averageTime: number;
    errorRate: number;
  } | null>(null);
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  
  // Colors for memory game
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  
  // Memory Game Functions
  const startMemoryGame = () => {
    setGameCompleted(false);
    setUserSequence([]);
    setMemoryGameActive(true);
    generateSequence();
  };
  
  const generateSequence = () => {
    const newSequence = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      newSequence.push(colors[randomIndex]);
    }
    setMemorySequence(newSequence);
    setShowSequence(true);
    
    // Hide the sequence after 3 seconds
    setTimeout(() => {
      setShowSequence(false);
    }, 3000);
  };
  
  const handleColorClick = (color: string) => {
    if (!memoryGameActive || showSequence) return;
    
    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);
    
    // Check if user has completed the sequence
    if (newUserSequence.length === memorySequence.length) {
      checkMemoryResult(newUserSequence);
    }
  };
  
  const checkMemoryResult = (sequence: string[]) => {
    let correct = 0;
    
    // Count correct positions
    for (let i = 0; i < memorySequence.length; i++) {
      if (sequence[i] === memorySequence[i]) {
        correct++;
      }
    }
    
    const accuracy = Math.floor((correct / memorySequence.length) * 100);
    setGameCompleted(true);
    
    toast({
      title: "Memory Test Completed",
      description: `You recalled ${correct} out of ${memorySequence.length} colors correctly (${accuracy}%).`,
    });

    // Generate mock analysis results
    setAnalysisResults(`
## Cognitive Assessment Results

### Memory Assessment
- Score: ${correct}/${memorySequence.length} (${accuracy}% accuracy)
- User recalled ${correct} out of ${memorySequence.length} items in the correct sequence
- ${accuracy >= 80 ? 'Strong' : accuracy >= 60 ? 'Average' : 'Below average'} short-term memory performance

### Memory Patterns
- ${accuracy >= 80 ? 'Demonstrated excellent sequential memory recall' : 
    accuracy >= 60 ? 'Showed adequate memory capabilities with some difficulty in sequence recall' : 
    'Exhibited challenges with sequential memory tasks, which may indicate working memory difficulties'}
- Response pattern indicates ${accuracy >= 70 ? 'good' : 'potential challenges with'} visual-spatial memory processing

### Recommendations
- ${accuracy < 70 ? 'Consider additional memory training exercises' : 'Continue regular memory strengthening activities'}
- ${accuracy < 60 ? 'Further assessment recommended to identify specific memory processes affected' : 'No immediate concerns indicated'}
- Activities that support visual sequence memory would be beneficial

*Note: This automated analysis should be considered preliminary and not a substitute for comprehensive professional assessment.*
    `);
  };
  
  // Attention Test Functions
  const startAttentionTest = () => {
    setAttentionTestActive(true);
    
    // Simulate attention test with a timeout
    setTimeout(() => {
      const mockResults = {
        totalTargets: 20,
        hits: Math.floor(Math.random() * 10) + 10, // 10-20 hits
        misses: Math.floor(Math.random() * 5), // 0-5 misses
        averageReactionTime: Math.floor(Math.random() * 300) + 200, // 200-500ms
      };
      
      setAttentionResults(mockResults);
      setAttentionTestActive(false);
      
      toast({
        title: "Attention Test Completed",
        description: `You responded to ${mockResults.hits} out of ${mockResults.totalTargets} targets with an average reaction time of ${mockResults.averageReactionTime}ms.`,
      });

      // Update analysis results with attention data
      const hitRate = (mockResults.hits / mockResults.totalTargets) * 100;
      const attentionAnalysis = `
## Cognitive Assessment Results

### Attention Assessment
- Hit Rate: ${mockResults.hits}/${mockResults.totalTargets} (${hitRate.toFixed(1)}%)
- Misses: ${mockResults.misses}
- Average Reaction Time: ${mockResults.averageReactionTime}ms

### Attention Patterns
- ${hitRate > 85 ? 'Demonstrated excellent sustained attention' : 
   hitRate > 70 ? 'Showed adequate attention capabilities' : 
   'Exhibited challenges with sustained attention tasks'}
- Reaction time is ${mockResults.averageReactionTime < 300 ? 'faster than' : 'within'} the average range
- ${mockResults.misses < 3 ? 'Low' : 'Moderate'} error rate suggests ${mockResults.misses < 3 ? 'good' : 'developing'} attention control

### Recommendations
- ${hitRate < 80 ? 'Consider attention training exercises' : 'Continue regular attention strengthening activities'}
- ${mockResults.averageReactionTime > 350 ? 'Activities to improve processing speed may be beneficial' : 'Processing speed appears adequate'}
- Regular breaks during extended focus periods recommended

*Note: This automated analysis should be considered preliminary and not a substitute for comprehensive professional assessment.*
      `;

      setAnalysisResults(attentionAnalysis);
    }, 5000);
  };
  
  // Problem Solving Test Functions
  const startProblemSolvingTest = () => {
    setProblemSolvingActive(true);
    
    // Simulate problem solving test with a timeout
    setTimeout(() => {
      const mockResults = {
        correctPatterns: Math.floor(Math.random() * 3) + 5, // 5-8 correct
        totalPatterns: 8,
        averageTime: Math.floor(Math.random() * 15) + 10, // 10-25 seconds
        errorRate: (Math.random() * 0.3) + 0.1, // 10-40% errors
      };
      
      setProblemSolvingResults(mockResults);
      setProblemSolvingActive(false);
      
      toast({
        title: "Problem Solving Test Completed",
        description: `You solved ${mockResults.correctPatterns} out of ${mockResults.totalPatterns} patterns with an average time of ${mockResults.averageTime} seconds per pattern.`,
      });

      // Update analysis results with problem solving data
      const successRate = (mockResults.correctPatterns / mockResults.totalPatterns) * 100;
      const problemSolvingAnalysis = `
## Cognitive Assessment Results

### Problem Solving Assessment
- Success Rate: ${mockResults.correctPatterns}/${mockResults.totalPatterns} (${successRate.toFixed(1)}%)
- Average Time Per Problem: ${mockResults.averageTime} seconds
- Error Rate: ${(mockResults.errorRate * 100).toFixed(1)}%

### Problem Solving Patterns
- ${successRate > 80 ? 'Demonstrated strong logical reasoning abilities' : 
   successRate > 60 ? 'Showed adequate problem solving capabilities' : 
   'Exhibited challenges with complex problem solving tasks'}
- Solution time is ${mockResults.averageTime < 15 ? 'faster than' : 'within'} the average range
- ${mockResults.errorRate < 0.2 ? 'Low' : 'Moderate'} error rate suggests ${mockResults.errorRate < 0.2 ? 'methodical' : 'developing'} approach to problem solving

### Recommendations
- ${successRate < 70 ? 'Consider structured problem solving exercises' : 'Continue challenging problem solving activities'}
- ${mockResults.averageTime > 18 ? 'Focus on developing processing speed for complex problems' : 'Processing approach appears effective'}
- ${mockResults.errorRate > 0.25 ? 'Practice with step-by-step problem solving strategies recommended' : 'Current problem solving strategies appear effective'}

*Note: This automated analysis should be considered preliminary and not a substitute for comprehensive professional assessment.*
      `;

      setAnalysisResults(problemSolvingAnalysis);
    }, 8000);
  };
  
  return (
    <Layout>
      <div className="assessment-container animate-fade-in">
        <h1 className="page-title">Cognitive Assessment</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Evaluate cognitive abilities including memory, attention span, and problem-solving skills
            through interactive digital tasks.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="memory">
                  <TabsList className="mb-6 w-full">
                    <TabsTrigger value="memory" className="flex-1">Memory</TabsTrigger>
                    <TabsTrigger value="attention" className="flex-1">Attention</TabsTrigger>
                    <TabsTrigger value="problem-solving" className="flex-1">Problem Solving</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="memory" className="mt-0 space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">Short-Term Memory Test</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        A sequence of colors will be shown. Memorize the sequence and reproduce it by clicking the colors in the correct order.
                      </p>
                      
                      {!memoryGameActive ? (
                        <Button onClick={startMemoryGame} className="w-full bg-app-blue hover:bg-app-blue-dark">
                          Start Memory Test
                        </Button>
                      ) : showSequence ? (
                        <div className="space-y-4">
                          <div className="flex justify-center gap-2">
                            {memorySequence.map((color, index) => (
                              <div 
                                key={index}
                                className="w-16 h-16 rounded-md"
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                          <div className="text-center text-gray-500">
                            Memorize this sequence...
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-center text-gray-500 mb-4">
                            {gameCompleted 
                              ? "Test completed! See your results in the analysis panel." 
                              : "Now click the colors in the order they appeared."}
                          </p>
                          
                          <div className="grid grid-cols-3 gap-4">
                            {colors.map((color) => (
                              <button
                                key={color}
                                onClick={() => handleColorClick(color)}
                                className="w-full h-16 rounded-md transition-transform hover:scale-105 disabled:opacity-50"
                                style={{ backgroundColor: color }}
                                disabled={gameCompleted}
                              ></button>
                            ))}
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm mb-2">Your sequence ({userSequence.length}/{memorySequence.length}):</p>
                            <div className="flex gap-2">
                              {userSequence.map((color, index) => (
                                <div 
                                  key={index}
                                  className="w-8 h-8 rounded-md"
                                  style={{ backgroundColor: color }}
                                ></div>
                              ))}
                              {Array(memorySequence.length - userSequence.length).fill(0).map((_, index) => (
                                <div key={index} className="w-8 h-8 rounded-md bg-gray-200"></div>
                              ))}
                            </div>
                          </div>
                          
                          {gameCompleted && (
                            <Button 
                              onClick={startMemoryGame} 
                              className="w-full mt-4 bg-app-blue hover:bg-app-blue-dark"
                            >
                              Try Again
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="attention" className="mt-0 space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">Attention Span Assessment</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        This test evaluates your ability to maintain focus during a timed activity by measuring reaction time and missed elements.
                      </p>
                      
                      {!attentionTestActive && !attentionResults ? (
                        <Button onClick={startAttentionTest} className="w-full bg-app-green hover:bg-app-green-dark">
                          Start Attention Test
                        </Button>
                      ) : attentionTestActive ? (
                        <div className="p-6 border rounded-md">
                          <div className="text-center">
                            <Clock className="mx-auto animate-pulse text-app-green mb-4" size={48} />
                            <p className="text-lg font-medium">Attention Test in Progress...</p>
                            <p className="text-gray-500 mt-2">Respond to targets as they appear</p>
                            <Progress className="mt-4" value={50} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-md">
                              <p className="text-sm text-gray-500">Hit Rate</p>
                              <p className="text-xl font-medium">{attentionResults?.hits}/{attentionResults?.totalTargets}</p>
                              <Progress className="mt-2" value={(attentionResults?.hits || 0) / (attentionResults?.totalTargets || 1) * 100} />
                            </div>
                            <div className="p-4 border rounded-md">
                              <p className="text-sm text-gray-500">Average Reaction</p>
                              <p className="text-xl font-medium">{attentionResults?.averageReactionTime}ms</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <div className="flex items-center text-red-500">
                              <AlertTriangle size={16} className="mr-1" />
                              <span className="text-sm">Missed: {attentionResults?.misses}</span>
                            </div>
                            <div className="flex items-center text-green-500">
                              <CheckCircle2 size={16} className="mr-1" />
                              <span className="text-sm">Hit: {attentionResults?.hits}</span>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={startAttentionTest} 
                            className="w-full mt-4 bg-app-green hover:bg-app-green-dark"
                          >
                            Try Again
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="problem-solving" className="mt-0 space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">Problem Solving Assessment</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        This assessment evaluates logical reasoning, pattern recognition, and problem-solving strategies.
                      </p>
                      
                      {!problemSolvingActive && !problemSolvingResults ? (
                        <Button onClick={startProblemSolvingTest} className="w-full bg-app-blue hover:bg-app-blue-dark">
                          Start Problem Solving Test
                        </Button>
                      ) : problemSolvingActive ? (
                        <div className="p-6 border rounded-md">
                          <div className="text-center">
                            <Brain className="mx-auto animate-pulse text-app-blue mb-4" size={48} />
                            <p className="text-lg font-medium">Test in Progress...</p>
                            <p className="text-gray-500 mt-2">Solving pattern-matching puzzles</p>
                            <Progress className="mt-4" value={65} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-md">
                              <p className="text-sm text-gray-500">Success Rate</p>
                              <p className="text-xl font-medium">
                                {problemSolvingResults?.correctPatterns}/{problemSolvingResults?.totalPatterns}
                              </p>
                              <Progress 
                                className="mt-2" 
                                value={(problemSolvingResults?.correctPatterns || 0) / (problemSolvingResults?.totalPatterns || 1) * 100} 
                              />
                            </div>
                            <div className="p-4 border rounded-md">
                              <p className="text-sm text-gray-500">Average Time</p>
                              <p className="text-xl font-medium">{problemSolvingResults?.averageTime}s</p>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-md">
                            <p className="text-sm text-gray-500">Error Rate</p>
                            <p className="text-xl font-medium">{(problemSolvingResults?.errorRate || 0) * 100}%</p>
                            <Progress className="mt-2" value={(1 - (problemSolvingResults?.errorRate || 0)) * 100} />
                          </div>
                          
                          <Button 
                            onClick={startProblemSolvingTest} 
                            className="w-full mt-4 bg-app-blue hover:bg-app-blue-dark"
                          >
                            Try Again
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <Brain className="text-app-blue mr-2" size={20} />
                  <h2 className="card-title">Analysis Results</h2>
                </div>
                
                <div className="flex-1 overflow-auto">
                  {analysisResults ? (
                    <div className="prose max-w-full">
                      <div className="whitespace-pre-line">{analysisResults}</div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-center p-8">
                      <div>
                        <p className="mb-2">No analysis results yet.</p>
                        <p className="text-sm">Complete one of the cognitive tests to see your results here.</p>
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

export default CognitiveAssessment;
