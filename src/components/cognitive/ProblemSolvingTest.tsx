
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ProblemSolvingTestProps {
  onResultsUpdate: (results: {
    successRate: number;
    correctPatterns: number;
    totalPatterns: number;
    averageTime: number;
    errorRate: number;
    dyslexiaIndicator: number;
  }) => void;
}

const ProblemSolvingTest: React.FC<ProblemSolvingTestProps> = ({ onResultsUpdate }) => {
  const { toast } = useToast();
  const [active, setActive] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<number[][]>([]);
  const [currentSolution, setCurrentSolution] = useState<number | null>(null);
  const [userSolution, setUserSolution] = useState<number | null>(null);
  const [patternsCompleted, setPatternsCompleted] = useState(0);
  const [correctPatterns, setCorrectPatterns] = useState(0);
  const [patternStartTime, setPatternStartTime] = useState<number | null>(null);
  const [totalPatternTime, setTotalPatternTime] = useState(0);
  const [problemOptions, setProblemOptions] = useState<number[]>([]);
  const [results, setResults] = useState<{
    correctPatterns: number;
    totalPatterns: number;
    averageTime: number;
    errorRate: number;
  } | null>(null);

  const startTest = () => {
    setActive(true);
    setCurrentPattern([]);
    setCurrentSolution(null);
    setUserSolution(null);
    setPatternsCompleted(0);
    setCorrectPatterns(0);
    setTotalPatternTime(0);
    setResults(null);

    const options = generatePattern();
    setProblemOptions(options);
  };

  const generatePattern = () => {
    const pattern: number[][] = [];
    const baseValue = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < 3; i++) {
      const row: number[] = [];
      for (let j = 0; j < 3; j++) {
        if (i === 2 && j === 2) {
          row.push(-1);
        } else {
          row.push(baseValue + i + j);
        }
      }
      pattern.push(row);
    }
    
    const solution = baseValue + 4;
    setCurrentPattern(pattern);
    setCurrentSolution(solution);
    setPatternStartTime(Date.now());
    
    const options = [
      solution,
      solution + Math.floor(Math.random() * 3) + 1,
      solution - Math.floor(Math.random() * 3) - 1,
      solution + Math.floor(Math.random() * 5) + 3
    ];
    
    return options.sort(() => Math.random() - 0.5);
  };

  const handlePatternSelection = (selected: number) => {
    if (!patternStartTime) return;
    
    const timeTaken = (Date.now() - patternStartTime) / 1000;
    setTotalPatternTime(prev => prev + timeTaken);
    
    const isCorrect = selected === currentSolution;
    if (isCorrect) {
      setCorrectPatterns(prev => prev + 1);
    }
    
    setUserSolution(selected);
    setPatternsCompleted(prev => prev + 1);
    
    if (patternsCompleted < 4) {
      setTimeout(() => {
        setUserSolution(null);
        const options = generatePattern();
        setProblemOptions(options);
      }, 1000);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    setActive(false);
    
    const totalPatterns = patternsCompleted + 1;
    const errorRate = (totalPatterns - correctPatterns) / totalPatterns;
    const avgTime = totalPatternTime / totalPatterns;
    
    const results = {
      correctPatterns: correctPatterns,
      totalPatterns: totalPatterns,
      averageTime: parseFloat(avgTime.toFixed(1)),
      errorRate: parseFloat(errorRate.toFixed(2))
    };
    
    setResults(results);
    
    toast({
      title: "Problem Solving Test Completed",
      description: `You solved ${results.correctPatterns} out of ${results.totalPatterns} patterns with an average time of ${results.averageTime} seconds per pattern.`,
    });
    
    const successRate = (results.correctPatterns / results.totalPatterns) * 100;
    const timeIndicator = results.averageTime > 20 ? 30 : results.averageTime > 15 ? 20 : 10;
    const problemSolvingDyslexiaIndicator = Math.max(0, 100 - successRate) * 0.4 + timeIndicator;
    
    onResultsUpdate({
      successRate,
      correctPatterns: results.correctPatterns,
      totalPatterns: results.totalPatterns,
      averageTime: results.averageTime,
      errorRate: results.errorRate,
      dyslexiaIndicator: problemSolvingDyslexiaIndicator
    });
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">Problem Solving Assessment</h3>
      <p className="text-sm text-gray-500 mb-4">
        Complete pattern recognition puzzles. Select the number that logically completes each pattern.
      </p>
      
      {!active && !results ? (
        <Button onClick={startTest} className="w-full bg-app-blue hover:bg-app-blue-dark">
          Start Problem Solving Test
        </Button>
      ) : active ? (
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
                {results?.correctPatterns}/{results?.totalPatterns}
              </p>
              <Progress 
                className="mt-2" 
                value={(results?.correctPatterns || 0) / (results?.totalPatterns || 1) * 100} 
              />
            </div>
            <div className="p-4 border rounded-md">
              <p className="text-sm text-gray-500">Average Time</p>
              <p className="text-xl font-medium">{results?.averageTime}s</p>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-xl font-medium">{(results?.errorRate || 0) * 100}%</p>
            <Progress className="mt-2" value={(1 - (results?.errorRate || 0)) * 100} />
          </div>
          
          <Button 
            onClick={startTest} 
            className="w-full mt-4 bg-app-blue hover:bg-app-blue-dark"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProblemSolvingTest;
