import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemoryTest from '@/components/cognitive/MemoryTest';
import AttentionTest from '@/components/cognitive/AttentionTest';
import ProblemSolvingTest from '@/components/cognitive/ProblemSolvingTest';
import AnalysisResults from '@/components/cognitive/AnalysisResults';

const CognitiveAssessment = () => {
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [dyslexiaScore, setDyslexiaScore] = useState<number | null>(null);

  const generateAnalysisResults = (testType: string, data: any) => {
    let dyslexiaIndicator = data.dyslexiaIndicator;
    let analysisText = '';
    
    switch (testType) {
      case 'memory':
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
    let newDyslexiaScore;
    
    if (dyslexiaScore === null) {
      newDyslexiaScore = Math.min(Math.max(dyslexiaIndicator, 10), 90);
    } else {
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
                  
                  <TabsContent value="memory" className="mt-0">
                    <MemoryTest onResultsUpdate={(results) => generateAnalysisResults('memory', results)} />
                  </TabsContent>
                  
                  <TabsContent value="attention" className="mt-0">
                    <AttentionTest onResultsUpdate={(results) => generateAnalysisResults('attention', results)} />
                  </TabsContent>
                  
                  <TabsContent value="problem-solving" className="mt-0">
                    <ProblemSolvingTest onResultsUpdate={(results) => generateAnalysisResults('problem-solving', results)} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardContent className="p-6 h-full">
                <AnalysisResults 
                  analysisResults={analysisResults}
                  dyslexiaScore={dyslexiaScore}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CognitiveAssessment;
