
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MemoryTestProps {
  onResultsUpdate: (results: { accuracy: number; correct: number; total: number; dyslexiaIndicator: number }) => void;
}

const MemoryTest: React.FC<MemoryTestProps> = ({ onResultsUpdate }) => {
  const { toast } = useToast();
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [showSequence, setShowSequence] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  const startGame = () => {
    setGameCompleted(false);
    setUserSequence([]);
    setGameActive(true);
    generateSequence();
  };

  const generateSequence = () => {
    const newSequence = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      newSequence.push(colors[randomIndex]);
    }
    setSequence(newSequence);
    setShowSequence(true);
    
    setTimeout(() => {
      setShowSequence(false);
    }, 3000);
  };

  const handleColorClick = (color: string) => {
    if (!gameActive || showSequence) return;
    
    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);
    
    if (newUserSequence.length === sequence.length) {
      checkResult(newUserSequence);
    }
  };

  const checkResult = (userSeq: string[]) => {
    let correct = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (userSeq[i] === sequence[i]) {
        correct++;
      }
    }
    
    const accuracy = Math.floor((correct / sequence.length) * 100);
    setGameCompleted(true);
    
    toast({
      title: "Memory Test Completed",
      description: `You recalled ${correct} out of ${sequence.length} colors correctly (${accuracy}%).`,
    });

    const memoryDyslexiaIndicator = Math.max(0, 70 - accuracy);
    onResultsUpdate({
      accuracy,
      correct,
      total: sequence.length,
      dyslexiaIndicator: memoryDyslexiaIndicator
    });
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">Short-Term Memory Test</h3>
      <p className="text-sm text-gray-500 mb-4">
        A sequence of colors will be shown. Memorize the sequence and reproduce it by clicking the colors in the correct order.
      </p>
      
      {!gameActive ? (
        <Button onClick={startGame} className="w-full bg-app-blue hover:bg-app-blue-dark">
          Start Memory Test
        </Button>
      ) : showSequence ? (
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {sequence.map((color, index) => (
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
            <p className="text-sm mb-2">Your sequence ({userSequence.length}/{sequence.length}):</p>
            <div className="flex gap-2">
              {userSequence.map((color, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 rounded-md"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
              {Array(sequence.length - userSequence.length).fill(0).map((_, index) => (
                <div key={index} className="w-8 h-8 rounded-md bg-gray-200"></div>
              ))}
            </div>
          </div>
          
          {gameCompleted && (
            <Button 
              onClick={startGame} 
              className="w-full mt-4 bg-app-blue hover:bg-app-blue-dark"
            >
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoryTest;
