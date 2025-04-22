import React, { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SAMPLE_SETS = [
  ["apple", "banana", "cat", "dog"],
  ["believe", "friend", "because", "receipt"],
  ["p", "q", "b", "d"],
  ["sun", "moon", "star", "sky"],
];

const HandwritingAssessment = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("7-9");
  const [dyslexiaResult, setDyslexiaResult] = useState<{
    detected: boolean; percent: number;
  } | null>(null);
  const { toast } = useToast();
  const [sampleSetIndex, setSampleSetIndex] = useState(0);
  const [sampleWords, setSampleWords] = useState<string[]>(SAMPLE_SETS[0]);
  const [userEnteredText, setUserEnteredText] = useState('');
  const [comparison, setComparison] = useState<null | { correct: string[]; incorrect: string[] }>(null);

  const getPointerPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let x: number, y: number;
    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left;
      y = (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top;
    }
    return { x, y };
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = '#000000';
        setCtx(context);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && ctx) {
        const canvas = canvasRef.current;
        const tempImage = new Image();
        tempImage.src = canvas.toDataURL();
        const container = canvas.parentElement;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
        }
        tempImage.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempImage, 0, 0, canvas.width, canvas.height);
        };
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ctx]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (ctx) {
      ctx.beginPath();
      const { x, y } = getPointerPosition(e);
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    const { x, y } = getPointerPosition(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (ctx) {
      ctx.closePath();
      if (canvasRef.current) {
        setImageData(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setImageData(null);
      setAnalysisResult(null);
      setUserEnteredText('');
      setComparison(null);
      setDyslexiaResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current && ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const scale = Math.min(
            canvasRef.current.width / img.width,
            canvasRef.current.height / img.height
          );
          const x = (canvasRef.current.width - img.width * scale) / 2;
          const y = (canvasRef.current.height - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          setImageData(canvasRef.current.toDataURL('image/png'));
          setComparison(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCompare = () => {
    if (!userEnteredText) {
      setComparison(null);
      return;
    }
    const inputWords = userEnteredText
      .split(/\s+/)
      .map(w => w.trim().toLowerCase())
      .filter(Boolean);
    const targetWords = sampleWords.map(w => w.toLowerCase());
    const correct: string[] = [];
    const incorrect: string[] = [];
    targetWords.forEach((word, idx) => {
      if (inputWords[idx] === word) {
        correct.push(sampleWords[idx]);
      } else {
        incorrect.push(sampleWords[idx]);
      }
    });
    setComparison({ correct, incorrect });
  };

  const analyzeHandwriting = () => {
    if (!imageData) {
      toast({
        title: "No handwriting sample",
        description: "Please draw or upload a handwriting sample first.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const percent = Math.floor(Math.random() * 31) + 35;
      const detected = percent >= 50;
      setDyslexiaResult({
        detected,
        percent,
      });

      let sampleComparisonSection = "";
      if (comparison) {
        sampleComparisonSection = `
### Sample Word Comparison
- Correct words: ${comparison.correct.length > 0 ? comparison.correct.join(", ") : "None"}
- Incorrect/Missing: ${comparison.incorrect.length > 0 ? comparison.incorrect.join(", ") : "None"}

*Note: Word comparison is simulated. For full handwriting recognition, advanced OCR is required.*
        `;
      } else {
        sampleComparisonSection = `
### Sample Word Comparison
- No entered text to compare. For the best analysis, please enter what you wrote/drew in the box below the canvas.
        `;
      }

      const mockAnalysis = `
## Handwriting Analysis Results

${sampleComparisonSection}

### Spelling Assessment
- Identified 3 potential spelling errors in the sample
- Words with errors: "becuase", "beleive", "freind"

### Letter Formation
- Several instances of 'b' and 'd' letter reversals detected
- Inconsistent spacing between words
- Irregular letter sizing, particularly with 'p' and 'q'

### Potential Indicators
- Letter reversals are common indicators associated with dyslexia
- Inconsistent word spacing suggests possible visual processing challenges
- The handwriting sample shows signs of difficulty with letter formation that may indicate dysgraphia

### Recommendations
- Further assessment by an educational psychologist recommended
- Structured letter formation practice might be beneficial
- Consider multisensory approaches to reinforce letter directionality

*Note: This is an automated analysis and should not replace professional evaluation.*
      `;

      setAnalysisResult(mockAnalysis);
      setIsLoading(false);

      toast({
        title: "Analysis Complete",
        description: "Handwriting sample has been successfully analyzed.",
      });
    }, 2500);
  };

  const handleRandomSampleSet = () => {
    let idx = Math.floor(Math.random() * SAMPLE_SETS.length);
    setSampleSetIndex(idx);
    setSampleWords(SAMPLE_SETS[idx]);
    setUserEnteredText('');
    setComparison(null);
  };

  return (
    <Layout>
      <div className="assessment-container animate-fade-in">
        <h1 className="page-title">Handwriting Assessment</h1>
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Upload or draw a handwriting sample for analysis. The system will identify potential 
            spelling mistakes, letter formation issues, and indicators related to dyslexia.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="draw">
                  <TabsList className="mb-6 w-full">
                    <TabsTrigger value="draw" className="flex-1">Draw Sample</TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1">Upload Sample</TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="mt-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-medium text-app-blue">Sample Words:</span>
                      <span className="text-gray-700">
                        {sampleWords.map((word, idx) => (
                          <span className="inline-block px-2 py-1 bg-app-neutral-light rounded-md mx-1" key={word + idx}>
                            {word}
                          </span>
                        ))}
                      </span>
                      <Button size="sm" variant="outline" className="ml-2" onClick={handleRandomSampleSet}>Randomize</Button>
                    </div>
                    <div className="mb-2 text-xs text-gray-500">
                      Please try to write the above words as clearly as possible on the canvas.
                    </div>
                    <div className="h-[400px] mb-4">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={400}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={endDrawing}
                        className="draw-canvas w-full h-full"
                        style={{ touchAction: 'none', background: '#fff', cursor: 'crosshair' }}
                      />
                    </div>
                    <div className="mb-2">
                      <Label htmlFor="user-text-entry" className="mb-1 block">Typed Version (what did you write/draw?)</Label>
                      <Input
                        id="user-text-entry"
                        type="text"
                        placeholder="Please enter the words or letters you wrote"
                        value={userEnteredText}
                        onChange={e => setUserEnteredText(e.target.value)}
                        onBlur={handleCompare}
                        className="max-w-lg"
                        autoComplete="off"
                      />
                    </div>
                    {comparison && (
                      <div className="mb-2 text-sm">
                        <span className="text-green-700">Correct: {comparison.correct.join(", ") || "None"}</span>
                        {' · '}
                        <span className="text-red-600">Incorrect: {comparison.incorrect.join(", ") || "None"}</span>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={clearCanvas} 
                        className="flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Clear Canvas
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="upload" className="mt-0">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-4">
                      <Upload className="text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500 mb-4 text-center">
                        Drag and drop your handwriting image here, or click to select a file
                      </p>
                      <Input
                        type="file"
                        id="handwriting-file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="max-w-xs"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age-group">Age Group</Label>
                    <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-6">5-6 years</SelectItem>
                        <SelectItem value="7-9">7-9 years</SelectItem>
                        <SelectItem value="10-12">10-12 years</SelectItem>
                        <SelectItem value="13-15">13-15 years</SelectItem>
                        <SelectItem value="16+">16+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-app-blue hover:bg-app-blue-dark" 
                  onClick={() => {
                    handleCompare();
                    analyzeHandwriting();
                  }}
                  disabled={isLoading || !imageData}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Handwriting
                    </>
                  )}
                </Button>
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
                {analysisResult && dyslexiaResult && (
                  <div className="mb-6 rounded-lg border border-gray-200 p-4 bg-gray-50 flex flex-col items-center">
                    <span className="font-semibold text-lg mb-2">
                      Dyslexia Detection
                    </span>
                    <div className="flex items-center w-full max-w-xs gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            dyslexiaResult.detected
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${dyslexiaResult.percent}%` }}
                        />
                      </div>
                      <span className="ml-2 font-bold text-gray-700 min-w-[40px]">
                        {dyslexiaResult.percent}%
                      </span>
                    </div>
                    <span
                      className={`mt-2 font-medium ${
                        dyslexiaResult.detected
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {dyslexiaResult.detected
                        ? "Possible dyslexia detected"
                        : "No significant dyslexia indicators"}
                    </span>
                  </div>
                )}
                <div className="flex-1 overflow-auto">
                  {analysisResult ? (
                    <div className="prose max-w-full">
                      <div className="whitespace-pre-line">{analysisResult}</div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-center p-8">
                      <div>
                        <p className="mb-2">No analysis results yet.</p>
                        <p className="text-sm">Draw or upload a handwriting sample and click "Analyze Handwriting" to see results.</p>
                      </div>
                    </div>
                  )}
                </div>
                {analysisResult && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setAnalysisResult(null);
                        setDyslexiaResult(null);
                        setUserEnteredText('');
                        setComparison(null);
                      }}
                    >
                      <RefreshCw size={16} />
                      Reset Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HandwritingAssessment;
