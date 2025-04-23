
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Brain, Clock, AlertTriangle, CheckCircle2, Target } from 'lucide-react';

const CognitiveAssessment = () => {
  const { toast } = useToast();
  // Memory game states
  const [memorySequence, setMemorySequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [showSequence, setShowSequence] = useState(false);
  const [memoryGameActive, setMemoryGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // Attention test states
  const [attentionTestActive, setAttentionTestActive] = useState(false);
  const [attentionTarget, setAttentionTarget] = useState<{x: number, y: number} | null>(null);
  const [attentionTargetsShown, setAttentionTargetsShown] = useState(0);
  const [attentionHits, setAttentionHits] = useState(0);
  const [attentionMisses, setAttentionMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastTargetTime, setLastTargetTime] = useState<number | null>(null);
  const [attentionResults, setAttentionResults] = useState<{
    totalTargets: number;
    hits: number;
    misses: number;
    averageReactionTime: number;
  } | null>(null);
  
  // Problem solving test states
  const [problemSolvingActive, setProblemSolvingActive] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<number[][]>([]);
  const [currentSolution, setCurrentSolution] = useState<number | null>(null);
  const [userSolution, setUserSolution] = useState<number | null>(null);
  const [patternsCompleted, setPatternsCompleted] = useState(0);
  const [correctPatterns, setCorrectPatterns] = useState(0);
  const [patternStartTime, setPatternStartTime] = useState<number | null>(null);
  const [totalPatternTime, setTotalPatternTime] = useState(0);
  const [problemOptions, setProblemOptions] = useState<number[]>([]);
  const [problemSolvingResults, setProblemSolvingResults] = useState<{
    correctPatterns: number;
    totalPatterns: number;
    averageTime: number;
    errorRate: number;
  } | null>(null);
  
  // Analysis results
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [dyslexiaScore, setDyslexiaScore] = useState<number | null>(null);
  
  // Colors for memory game
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  
  // Refs for attention test
  const showNextTargetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetDisappearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts when component unmounts or test stops
  useEffect(() => {
    return () => {
      if (showNextTargetTimeoutRef.current) {
        clearTimeout(showNextTargetTimeoutRef.current);
      }
      if (targetDisappearTimeoutRef.current) {
        clearTimeout(targetDisappearTimeoutRef.current);
      }
    };
  }, []);
  
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

    // Calculate dyslexia likelihood based on memory performance
    const memoryDyslexiaIndicator = Math.max(0, 70 - accuracy);
    
    // Generate analysis results
    generateAnalysisResults('memory', {
      accuracy,
      correct,
      total: memorySequence.length,
      dyslexiaIndicator: memoryDyslexiaIndicator
    });
  };
  
  // Attention Test Functions
  const startAttentionTest = () => {
    // Reset states
    setAttentionTestActive(true);
    setAttentionTargetsShown(0);
    setAttentionHits(0);
    setAttentionMisses(0);
    setReactionTimes([]);
    setAttentionResults(null);
    setAttentionTarget(null);
    
    // Clear any existing timeouts
    if (showNextTargetTimeoutRef.current) {
      clearTimeout(showNextTargetTimeoutRef.current);
    }
    if (targetDisappearTimeoutRef.current) {
      clearTimeout(targetDisappearTimeoutRef.current);
    }
    
    // Start showing targets after a short delay
    setTimeout(() => {
      showNextTarget();
    }, 1000);
    
    // Log for debugging
    console.log("Attention test started");
  };
  
  const showNextTarget = () => {
    if (!attentionTestActive) return;
    
    if (attentionTargetsShown >= 10) {
      completeAttentionTest();
      return;
    }
    
    // Random delay between targets (1-3 seconds)
    const delay = Math.random() * 2000 + 1000;
    
    // Clear any existing target
    setAttentionTarget(null);
    
    // Clear any existing timeouts
    if (showNextTargetTimeoutRef.current) {
      clearTimeout(showNextTargetTimeoutRef.current);
    }
    
    // Set timeout for showing next target
    showNextTargetTimeoutRef.current = setTimeout(() => {
      if (!attentionTestActive) return;
      
      // Generate random position
      const x = Math.floor(Math.random() * 80) + 10; // 10-90% of container width
      const y = Math.floor(Math.random() * 80) + 10; // 10-90% of container height
      
      // Show target and set timestamp
      setAttentionTarget({ x, y });
      setLastTargetTime(Date.now());
      setAttentionTargetsShown(prev => prev + 1);
      
      console.log(`Target shown at position (${x}%, ${y}%)`);
      
      // Target disappears after 1.5 seconds if not clicked
      if (targetDisappearTimeoutRef.current) {
        clearTimeout(targetDisappearTimeoutRef.current);
      }
      
      targetDisappearTimeoutRef.current = setTimeout(() => {
        if (attentionTarget !== null) {
          console.log("Target missed - timeout");
          setAttentionMisses(prev => prev + 1);
          setAttentionTarget(null);
          
          // Show next target after a miss
          if (attentionTargetsShown < 10) {
            showNextTarget();
          } else {
            completeAttentionTest();
          }
        }
      }, 1500);
    }, delay);
  };
  
  const handleTargetClick = () => {
    console.log("Target clicked!");
    
    if (lastTargetTime === null) return;
    
    // Clear the disappear timeout
    if (targetDisappearTimeoutRef.current) {
      clearTimeout(targetDisappearTimeoutRef.current);
      targetDisappearTimeoutRef.current = null;
    }
    
    const reactionTime = Date.now() - lastTargetTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setAttentionHits(prev => prev + 1);
    setAttentionTarget(null);
    
    console.log(`Hit recorded. Reaction time: ${reactionTime}ms`);
    
    // Show next target if not completed
    if (attentionHits + attentionMisses < 9) { // Less than 9 because we just incremented attentionHits
      showNextTarget();
    } else {
      completeAttentionTest();
    }
  };
  
  const completeAttentionTest = () => {
    console.log("Attention test completed");
    
    // Clear any existing timeouts
    if (showNextTargetTimeoutRef.current) {
      clearTimeout(showNextTargetTimeoutRef.current);
      showNextTargetTimeoutRef.current = null;
    }
    if (targetDisappearTimeoutRef.current) {
      clearTimeout(targetDisappearTimeoutRef.current);
      targetDisappearTimeoutRef.current = null;
    }
    
    setAttentionTestActive(false);
    setAttentionTarget(null);
    
    const avgReactionTime = reactionTimes.length > 0 
      ? Math.floor(reactionTimes.reduce((acc, time) => acc + time, 0) / reactionTimes.length) 
      : 0;
    
    const results = {
      totalTargets: attentionTargetsShown,
      hits: attentionHits,
      misses: attentionMisses,
      averageReactionTime: avgReactionTime
    };
    
    setAttentionResults(results);
    
    toast({
      title: "Attention Test Completed",
      description: `You responded to ${results.hits} out of ${results.totalTargets} targets with an average reaction time of ${results.averageReactionTime}ms.`,
    });
    
    // Calculate dyslexia likelihood based on attention performance
    const hitRate = (results.hits / results.totalTargets) * 100;
    const reactionIndicator = results.averageReactionTime > 500 ? 30 : results.averageReactionTime > 350 ? 20 : 10;
    const attentionDyslexiaIndicator = Math.max(0, 100 - hitRate) * 0.3 + reactionIndicator;
    
    // Generate analysis results
    generateAnalysisResults('attention', {
      hitRate,
      hits: results.hits,
      totalTargets: results.totalTargets,
      misses: results.misses,
      averageReactionTime: results.averageReactionTime,
      dyslexiaIndicator: attentionDyslexiaIndicator
    });
  };
  
  // Problem Solving Test Functions
  const startProblemSolvingTest = () => {
    // Reset states
    setProblemSolvingActive(true);
    setCurrentPattern([]);
    setCurrentSolution(null);
    setUserSolution(null);
    setPatternsCompleted(0);
    setCorrectPatterns(0);
    setTotalPatternTime(0);
    setProblemSolvingResults(null);
    
    // Generate first pattern
    const options = generatePattern();
    setProblemOptions(options);
  };
  
  const generatePattern = () => {
    // Generate a 3x3 pattern matrix with logical sequence
    const pattern: number[][] = [];
    const baseValue = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < 3; i++) {
      const row: number[] = [];
      for (let j = 0; j < 3; j++) {
        if (i === 2 && j === 2) {
          // Leave the bottom-right cell empty (will be the solution)
          row.push(-1);
        } else {
          row.push(baseValue + i + j);
        }
      }
      pattern.push(row);
    }
    
    // Calculate the logical solution (for bottom-right)
    const solution = baseValue + 4; // 2 + 2 = bottom-right position
    
    setCurrentPattern(pattern);
    setCurrentSolution(solution);
    setPatternStartTime(Date.now());
    
    // Generate options (including the correct one)
    const options = [
      solution,
      solution + Math.floor(Math.random() * 3) + 1,
      solution - Math.floor(Math.random() * 3) - 1,
      solution + Math.floor(Math.random() * 5) + 3
    ];
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  };
  
  const handlePatternSelection = (selected: number) => {
    if (!patternStartTime) return;
    
    // Calculate time taken
    const timeTaken = (Date.now() - patternStartTime) / 1000; // in seconds
    setTotalPatternTime(prev => prev + timeTaken);
    
    // Check if correct
    const isCorrect = selected === currentSolution;
    if (isCorrect) {
      setCorrectPatterns(prev => prev + 1);
    }
    
    setUserSolution(selected);
    setPatternsCompleted(prev => prev + 1);
    
    // Show next pattern or complete test
    if (patternsCompleted < 4) {
      setTimeout(() => {
        setUserSolution(null);
        const options = generatePattern();
        setProblemOptions(options);
      }, 1000);
    } else {
      completeProblemSolvingTest();
    }
  };
  
  const completeProblemSolvingTest = () => {
    setProblemSolvingActive(false);
    
    const totalPatterns = patternsCompleted + 1; // Include current pattern
    const errorRate = (totalPatterns - correctPatterns) / totalPatterns;
    const avgTime = totalPatternTime / totalPatterns;
    
    const results = {
      correctPatterns: correctPatterns,
      totalPatterns: totalPatterns,
      averageTime: parseFloat(avgTime.toFixed(1)),
      errorRate: parseFloat(errorRate.toFixed(2))
    };
    
    setProblemSolvingResults(results);
    
    toast({
      title: "Problem Solving Test Completed",
      description: `You solved ${results.correctPatterns} out of ${results.totalPatterns} patterns with an average time of ${results.averageTime} seconds per pattern.`,
    });
    
    // Calculate dyslexia likelihood based on problem solving performance
    const successRate = (results.correctPatterns / results.totalPatterns) * 100;
    const timeIndicator = results.averageTime > 20 ? 30 : results.averageTime > 15 ? 20 : 10;
    const problemSolvingDyslexiaIndicator = Math.max(0, 100 - successRate) * 0.4 + timeIndicator;
    
    // Generate analysis results
    generateAnalysisResults('problem-solving', {
      successRate,
      correctPatterns: results.correctPatterns,
      totalPatterns: results.totalPatterns,
      averageTime: results.averageTime,
      errorRate: results.errorRate,
      dyslexiaIndicator: problemSolvingDyslexiaIndicator
    });
  };
  
  // Generate comprehensive analysis with dyslexia indicators
  const generateAnalysisResults = (testType: string, data: any) => {
    let dyslexiaIndicator = 0;
    let analysisText = '';
    
    switch (testType) {
      case 'memory':
        dyslexiaIndicator = data.dyslexiaIndicator;
        analysisText = `
## Cognitive Assessment Results

### Memory Assessment
- Score: ${data.correct}/${data.total} (${data.accuracy}% accuracy)
- User recalled ${data.correct} out of ${data.total} items in the correct sequence
- ${data.accuracy >= 80 ? 'Strong' : data.accuracy >= 60 ? 'Average' : 'Below average'} short-term memory performance

### Memory Patterns
- ${data.accuracy >= 80 ? 'Demonstrated excellent sequential memory recall' : 
    data.accuracy >= 60 ? 'Showed adequate memory capabilities with some difficulty in sequence recall' : 
    'Exhibited challenges with sequential memory tasks, which may indicate working memory difficulties'}
- Response pattern indicates ${data.accuracy >= 70 ? 'good' : 'potential challenges with'} visual-spatial memory processing

### Dyslexia Indicators
- Memory performance suggests a ${dyslexiaIndicator > 30 ? 'moderate' : 'low'} correlation with dyslexia patterns
- Sequential memory challenges: ${dyslexiaIndicator > 25 ? 'Present' : 'Not significant'}

### Recommendations
- ${data.accuracy < 70 ? 'Consider additional memory training exercises' : 'Continue regular memory strengthening activities'}
- ${data.accuracy < 60 ? 'Further assessment recommended to identify specific memory processes affected' : 'No immediate concerns indicated'}
- Activities that support visual sequence memory would be beneficial

*Note: This automated analysis should be considered preliminary and not a substitute for comprehensive professional assessment.*
        `;
        break;
        
      case 'attention':
        dyslexiaIndicator = data.dyslexiaIndicator;
        analysisText = `
## Cognitive Assessment Results

### Attention Assessment
- Hit Rate: ${data.hits}/${data.totalTargets} (${data.hitRate.toFixed(1)}%)
- Misses: ${data.misses}
- Average Reaction Time: ${data.averageReactionTime}ms

### Attention Patterns
- ${data.hitRate > 85 ? 'Demonstrated excellent sustained attention' : 
   data.hitRate > 70 ? 'Showed adequate attention capabilities' : 
   'Exhibited challenges with sustained attention tasks'}
- Reaction time is ${data.averageReactionTime < 300 ? 'faster than' : 'within'} the average range
- ${data.misses < 3 ? 'Low' : 'Moderate'} error rate suggests ${data.misses < 3 ? 'good' : 'developing'} attention control

### Dyslexia Indicators
- Attention performance suggests a ${dyslexiaIndicator > 30 ? 'significant' : dyslexiaIndicator > 20 ? 'moderate' : 'low'} correlation with dyslexia patterns
- Sustained attention challenges: ${data.hitRate < 70 ? 'Present' : 'Not significant'}
- Processing speed concerns: ${data.averageReactionTime > 400 ? 'Present' : 'Not significant'}

### Recommendations
- ${data.hitRate < 80 ? 'Consider attention training exercises' : 'Continue regular attention strengthening activities'}
- ${data.averageReactionTime > 350 ? 'Activities to improve processing speed may be beneficial' : 'Processing speed appears adequate'}
- Regular breaks during extended focus periods recommended

*Note: This automated analysis should be considered preliminary and not a substitute for comprehensive professional assessment.*
      `;
        break;
        
      case 'problem-solving':
        dyslexiaIndicator = data.dyslexiaIndicator;
        analysisText = `
## Cognitive Assessment Results

### Problem Solving Assessment
- Success Rate: ${data.correctPatterns}/${data.totalPatterns} (${data.successRate.toFixed(1)}%)
- Average Time Per Problem: ${data.averageTime} seconds
- Error Rate: ${(data.errorRate * 100).toFixed(1)}%

### Problem Solving Patterns
- ${data.successRate > 80 ? 'Demonstrated strong logical reasoning abilities' : 
   data.successRate > 60 ? 'Showed adequate problem solving capabilities' : 
   'Exhibited challenges with complex problem solving tasks'}
- Solution time is ${data.averageTime < 15 ? 'faster than' : 'within'} the average range
- ${data.errorRate < 0.2 ? 'Low' : 'Moderate'} error rate suggests ${data.errorRate < 0.2 ? 'methodical' : 'developing'} approach to problem solving

### Dyslexia Indicators
- Problem-solving performance suggests a ${dyslexiaIndicator > 30 ? 'significant' : dyslexiaIndicator > 20 ? 'moderate' : 'low'} correlation with dyslexia patterns
- Pattern recognition challenges: ${data.successRate < 70 ? 'Present' : 'Not significant'}
- Processing time concerns: ${data.averageTime > 15 ? 'Present' : 'Not significant'}

### Recommendations
- ${data.successRate < 70 ? 'Consider structured problem solving exercises' : 'Continue challenging problem solving activities'}
- ${data.averageTime > 18 ? 'Focus on developing processing speed for complex problems' : 'Processing approach appears effective'}
- ${data.errorRate > 0.25 ? 'Practice with step-by-step problem solving strategies recommended' : 'Current problem solving strategies appear effective'}

*Note: This automated analysis should be considered preliminary and not a substitute for comprehensive professional assessment.*
      `;
        break;
    }
    
    // Calculate overall dyslexia percentage based on available indicators
    // Store the latest dyslexia indicator
    let newDyslexiaScore;
    
    if (dyslexiaScore === null) {
      // First test, just use this indicator
      newDyslexiaScore = Math.min(Math.max(dyslexiaIndicator, 10), 90);
    } else {
      // Combine with previous indicators
      newDyslexiaScore = Math.min(Math.max((dyslexiaScore + dyslexiaIndicator) / 2, 10), 90);
    }
    
    setDyslexiaScore(newDyslexiaScore);
    
    // Add dyslexia section to analysis
    const dyslexiaSection = `
### Dyslexia Assessment
- Overall Dyslexia Indicator: ${newDyslexiaScore.toFixed(1)}%
- Risk Level: ${newDyslexiaScore > 65 ? 'High' : newDyslexiaScore > 35 ? 'Moderate' : 'Low'} 
- ${newDyslexiaScore > 65 ? 'Strong indicators of dyslexia-related cognitive patterns detected.' : 
   newDyslexiaScore > 35 ? 'Some indicators of dyslexia-related cognitive patterns present.' : 
   'Few indicators of dyslexia-related cognitive patterns observed.'}
- ${newDyslexiaScore > 50 ? 'Professional evaluation recommended' : 'Continue monitoring cognitive development'}
    `;
    
    // Update analysis results with dyslexia information
    setAnalysisResults(analysisText + dyslexiaSection);
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
                        Click on targets as they appear on the screen. This test evaluates your reaction time and focus.
                      </p>
                      
                      {!attentionTestActive && !attentionResults ? (
                        <Button onClick={startAttentionTest} className="w-full bg-app-green hover:bg-app-green-dark">
                          Start Attention Test
                        </Button>
                      ) : attentionTestActive ? (
                        <div className="p-6 border rounded-md relative h-64">
                          {attentionTarget && (
                            <button
                              className="absolute w-12 h-12 rounded-full bg-app-green animate-pulse flex items-center justify-center cursor-pointer"
                              style={{
                                left: `${attentionTarget.x}%`,
                                top: `${attentionTarget.y}%`,
                                transform: 'translate(-50%, -50%)'
                              }}
                              onClick={handleTargetClick}
                            >
                              <Target className="text-white" size={24} />
                            </button>
                          )}
                          <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
                            Targets: {attentionTargetsShown}/10 | Hits: {attentionHits}
                          </div>
                          <Progress 
                            className="absolute bottom-0 left-0 right-0" 
                            value={attentionTargetsShown * 10} 
                          />
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
                        Complete pattern recognition puzzles. Select the number that logically completes each pattern.
                      </p>
                      
                      {!problemSolvingActive && !problemSolvingResults ? (
                        <Button onClick={startProblemSolvingTest} className="w-full bg-app-blue hover:bg-app-blue-dark">
                          Start Problem Solving Test
                        </Button>
                      ) : problemSolvingActive ? (
                        <div className="space-y-4 p-4 border rounded-md">
                          <div className="grid grid-cols-3 gap-2 mb-6">
                            {currentPattern.map((row, rowIndex) => (
                              <React.Fragment key={rowIndex}>
                                {row.map((value, colIndex) => (
                                  <div 
                                    key={`${rowIndex}-${colIndex}`} 
                                    className={`aspect-square flex items-center justify-center text-lg font-medium rounded ${value === -1 ? 'bg-gray-200 border border-dashed border-gray-400' : 'bg-gray-100'}`}
                                  >
                                    {value !== -1 ? value : '?'}
                                  </div>
                                ))}
                              </React.Fragment>
                            ))}
                          </div>
                          
                          <p className="text-center text-sm text-gray-500 mb-2">
                            Select the number that completes the pattern
                          </p>
                          
                          <div className="grid grid-cols-4 gap-2">
                            {problemOptions.map((value, index) => (
                              <button
                                key={index}
                                onClick={() => handlePatternSelection(value)}
                                className={`py-2 rounded bg-app-blue text-white hover:bg-app-blue-dark ${userSolution === value ? 'ring-2 ring-offset-2' : ''}`}
                                disabled={userSolution !== null}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                          
                          <div className="mt-4">
                            <Progress 
                              className="mb-2" 
                              value={(patternsCompleted / 5) * 100} 
                            />
                            <p className="text-center text-sm text-gray-500">
                              Pattern {patternsCompleted + 1} of 5
                            </p>
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
                      
                      {dyslexiaScore && (
                        <div className="mt-6 border-t pt-4">
                          <h3 className="text-lg font-medium mb-2">Dyslexia Indicator</h3>
                          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div 
                              className={`h-4 rounded-full ${
                                dyslexiaScore > 65 ? 'bg-red-500' : 
                                dyslexiaScore > 35 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${dyslexiaScore}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Low (10%)</span>
                            <span>Moderate (50%)</span>
                            <span>High (90%)</span>
                          </div>
                        </div>
                      )}
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
