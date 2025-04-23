
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Target } from 'lucide-react';

interface AttentionTestProps {
  onResultsUpdate: (results: { 
    hitRate: number;
    hits: number;
    totalTargets: number;
    misses: number;
    averageReactionTime: number;
    dyslexiaIndicator: number;
  }) => void;
}

const AttentionTest: React.FC<AttentionTestProps> = ({ onResultsUpdate }) => {
  const { toast } = useToast();
  const [testActive, setTestActive] = useState(false);
  const [target, setTarget] = useState<{x: number, y: number} | null>(null);
  const [targetsShown, setTargetsShown] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastTargetTime, setLastTargetTime] = useState<number | null>(null);
  const [results, setResults] = useState<{
    totalTargets: number;
    hits: number;
    misses: number;
    averageReactionTime: number;
  } | null>(null);
  
  // Maximum number of targets to show
  const MAX_TARGETS = 6;

  const showNextTargetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetDisappearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const testContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up timeouts when component unmounts
    return () => {
      if (showNextTargetTimeoutRef.current) clearTimeout(showNextTargetTimeoutRef.current);
      if (targetDisappearTimeoutRef.current) clearTimeout(targetDisappearTimeoutRef.current);
    };
  }, []);

  const startTest = () => {
    console.log("Starting attention test");
    setTestActive(true);
    setTargetsShown(0);
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    setResults(null);
    setTarget(null);

    // Clear any existing timeouts
    if (showNextTargetTimeoutRef.current) clearTimeout(showNextTargetTimeoutRef.current);
    if (targetDisappearTimeoutRef.current) clearTimeout(targetDisappearTimeoutRef.current);

    // Start showing targets after a short delay
    setTimeout(() => {
      showNextTarget();
    }, 1000);
  };

  const showNextTarget = () => {
    console.log("Attempting to show next target", { testActive, targetsShown, MAX_TARGETS });
    
    if (!testActive) return;

    // Check if we've shown the maximum number of targets
    if (targetsShown >= MAX_TARGETS) {
      console.log("Max targets reached, completing test");
      completeTest();
      return;
    }

    // Clear the current target
    setTarget(null);

    // Clear any existing timeout
    if (showNextTargetTimeoutRef.current) clearTimeout(showNextTargetTimeoutRef.current);

    // Random delay between 1-3 seconds before showing the next target
    const delay = Math.random() * 1000 + 1000;
    console.log(`Setting next target to appear in ${delay}ms`);
    
    showNextTargetTimeoutRef.current = setTimeout(() => {
      if (!testActive) return;

      console.log("Showing new target now");
      
      // Generate random position
      const x = Math.floor(Math.random() * 80) + 10;  // 10-90% of container width
      const y = Math.floor(Math.random() * 80) + 10;  // 10-90% of container height
      
      console.log("New target position:", { x, y });
      
      // Set the new target position
      setTarget({ x, y });
      setLastTargetTime(Date.now());
      setTargetsShown(prev => prev + 1);

      // Clear any existing timeout for target disappearance
      if (targetDisappearTimeoutRef.current) clearTimeout(targetDisappearTimeoutRef.current);

      // If target is not clicked within 2 seconds, count as miss and show next
      targetDisappearTimeoutRef.current = setTimeout(() => {
        console.log("Target timed out - counting as miss");
        setMisses(prev => prev + 1);
        setTarget(null);

        if (targetsShown < MAX_TARGETS) {
          showNextTarget();
        } else {
          completeTest();
        }
      }, 2000);
    }, delay);
  };

  const handleTargetClick = () => {
    console.log("Target clicked");
    
    if (lastTargetTime === null) return;

    // Clear the target disappearance timeout
    if (targetDisappearTimeoutRef.current) {
      clearTimeout(targetDisappearTimeoutRef.current);
      targetDisappearTimeoutRef.current = null;
    }

    // Calculate reaction time
    const reactionTime = Date.now() - lastTargetTime;
    console.log(`Reaction time: ${reactionTime}ms`);
    
    setReactionTimes(prev => [...prev, reactionTime]);
    setHits(prev => prev + 1);
    setTarget(null);

    // Show next target if not reached maximum
    if (targetsShown < MAX_TARGETS) {
      showNextTarget();
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    console.log("Completing test");
    
    // Clear all timeouts
    if (showNextTargetTimeoutRef.current) {
      clearTimeout(showNextTargetTimeoutRef.current);
      showNextTargetTimeoutRef.current = null;
    }
    if (targetDisappearTimeoutRef.current) {
      clearTimeout(targetDisappearTimeoutRef.current);
      targetDisappearTimeoutRef.current = null;
    }

    // End the test
    setTestActive(false);
    setTarget(null);

    // Calculate average reaction time
    const avgReactionTime = reactionTimes.length > 0 
      ? Math.floor(reactionTimes.reduce((acc, time) => acc + time, 0) / reactionTimes.length) 
      : 0;

    // Set results
    const testResults = {
      totalTargets: targetsShown,
      hits: hits,
      misses: misses,
      averageReactionTime: avgReactionTime
    };

    console.log("Test results:", testResults);
    setResults(testResults);

    // Show toast notification
    toast({
      title: "Attention Test Completed",
      description: `You responded to ${testResults.hits} out of ${testResults.totalTargets} targets with an average reaction time of ${testResults.averageReactionTime}ms.`,
    });

    // Calculate dyslexia indicator score
    const hitRate = (testResults.hits / testResults.totalTargets) * 100;
    const reactionIndicator = testResults.averageReactionTime > 500 ? 30 : testResults.averageReactionTime > 350 ? 20 : 10;
    const attentionDyslexiaIndicator = Math.max(0, 100 - hitRate) * 0.3 + reactionIndicator;

    // Send results to parent component
    onResultsUpdate({
      hitRate,
      hits: testResults.hits,
      totalTargets: testResults.totalTargets,
      misses: testResults.misses,
      averageReactionTime: testResults.averageReactionTime,
      dyslexiaIndicator: attentionDyslexiaIndicator
    });
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">Attention Span Assessment</h3>
      <p className="text-sm text-gray-500 mb-4">
        Click on targets as they appear on the screen. This test evaluates your reaction time and focus.
      </p>

      {!testActive && !results ? (
        <Button onClick={startTest} className="w-full bg-app-green hover:bg-app-green-dark">
          Start Attention Test
        </Button>
      ) : testActive ? (
        <div 
          ref={testContainerRef}
          className="p-6 border rounded-md relative h-64 bg-gray-50"
        >
          {target && (
            <button
              className="absolute w-12 h-12 rounded-full bg-app-green animate-pulse flex items-center justify-center cursor-pointer z-10"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={handleTargetClick}
            >
              <Target className="text-white" size={24} />
            </button>
          )}
          <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
            Targets: {targetsShown}/{MAX_TARGETS} | Hits: {hits}
          </div>
          <Progress 
            className="absolute bottom-0 left-0 right-0" 
            value={(targetsShown / MAX_TARGETS) * 100} 
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <p className="text-sm text-gray-500">Hit Rate</p>
              <p className="text-xl font-medium">{results?.hits}/{results?.totalTargets}</p>
              <Progress 
                className="mt-2" 
                value={(results?.hits || 0) / (results?.totalTargets || 1) * 100} 
              />
            </div>
            <div className="p-4 border rounded-md">
              <p className="text-sm text-gray-500">Average Reaction</p>
              <p className="text-xl font-medium">{results?.averageReactionTime}ms</p>
            </div>
          </div>
          
          <Button 
            onClick={startTest} 
            className="w-full mt-4 bg-app-green hover:bg-app-green-dark"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttentionTest;
