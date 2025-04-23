
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Brain } from 'lucide-react';

interface AnalysisResultsProps {
  analysisResults: string | null;
  dyslexiaScore: number | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  analysisResults, 
  dyslexiaScore 
}) => {
  return (
    <div className="h-full flex flex-col">
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
    </div>
  );
};

export default AnalysisResults;
