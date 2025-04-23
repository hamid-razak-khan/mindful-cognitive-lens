
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

  const showNextTargetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetDisappearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (showNextTargetTimeoutRef.current) clearTimeout(showNextTargetTimeoutRef.current);
      if (targetDisappearTimeoutRef.current) clearTimeout(targetDisappearTimeoutRef.current);
    };
  }, []);

  const startTest = () => {
    setTestActive(true);
    setTargetsShown(0);
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    setResults(null);
    setTarget(null);

    if (showNextTargetTimeoutRef.current) clearTimeout(showNextTargetTimeoutRef.current);
    if (targetDisappearTimeoutRef.current) clearTimeout(targetDisappearTimeoutRef.current);

    setTimeout(() => {
      showNextTarget();
    }, 1000);
  };

  const showNextTarget = () => {
    if (!testActive) return;

    if (targetsShown >= 10) {
      completeTest();
      return;
    }

    const delay = Math.random() * 2000 + 1000;
    setTarget(null);

    if (showNextTargetTimeoutRef.current) clearTimeout(showNextTargetTimeoutRef.current);

    showNextTargetTimeoutRef.current = setTimeout(() => {
      if (!testActive) return;

      const x = Math.floor(Math.random() * 80) + 10;
      const y = Math.floor(Math.random() * 80) + 10;

      setTarget({ x, y });
      setLastTargetTime(Date.now());
      setTargetsShown(prev => prev + 1);

      if (targetDisappearTimeoutRef.current) clearTimeout(targetDisappearTimeoutRef.current);

      targetDisappearTimeoutRef.current = setTimeout(() => {
        if (target !== null) {
          setMisses(prev => prev + 1);
          setTarget(null);

          if (targetsShown < 10) {
            showNextTarget();
          } else {
            completeTest();
          }
        }
      }, 1500);
    }, delay);
  };

  const handleTargetClick = () => {
    if (lastTargetTime === null) return;

    if (targetDisappearTimeoutRef.current) {
      clearTimeout(targetDisappearTimeoutRef.current);
      targetDisappearTimeoutRef.current = null;
    }

    const reactionTime = Date.now() - lastTargetTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setHits(prev => prev + 1);
    setTarget(null);

    if (hits + misses < 9) {
      showNextTarget();
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    if (showNextTargetTimeoutRef.current) {
      clearTimeout(showNextTargetTimeoutRef.current);
      showNextTargetTimeoutRef.current = null;
    }
    if (targetDisappearTimeoutRef.current) {
      clearTimeout(targetDisappearTimeoutRef.current);
      targetDisappearTimeoutRef.current = null;
    }

    setTestActive(false);
    setTarget(null);

    const avgReactionTime = reactionTimes.length > 0 
      ? Math.floor(reactionTimes.reduce((acc, time) => acc + time, 0) / reactionTimes.length) 
      : 0;

    const results = {
      totalTargets: targetsShown,
      hits: hits,
      misses: misses,
      averageReactionTime: avgReactionTime
    };

    setResults(results);

    toast({
      title: "Attention Test Completed",
      description: `You responded to ${results.hits} out of ${results.totalTargets} targets with an average reaction time of ${results.averageReactionTime}ms.`,
    });

    const hitRate = (results.hits / results.totalTargets) * 100;
    const reactionIndicator = results.averageReactionTime > 500 ? 30 : results.averageReactionTime > 350 ? 20 : 10;
    const attentionDyslexiaIndicator = Math.max(0, 100 - hitRate) * 0.3 + reactionIndicator;

    onResultsUpdate({
      hitRate,
      hits: results.hits,
      totalTargets: results.totalTargets,
      misses: results.misses,
      averageReactionTime: results.averageReactionTime,
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
        <div className="p-6 border rounded-md relative h-64">
          {target && (
            <button
              className="absolute w-12 h-12 rounded-full bg-app-green animate-pulse flex items-center justify-center cursor-pointer"
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
            Targets: {targetsShown}/10 | Hits: {hits}
          </div>
          <Progress 
            className="absolute bottom-0 left-0 right-0" 
            value={targetsShown * 10} 
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
