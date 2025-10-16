'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Sparkles, Stethoscope, FileText, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateRecommendation } from '@/ai/flows/generate-recommendation';
import { summarizeDiagnosis } from '@/ai/flows/summarize-diagnosis-info';

type AnalysisResult = {
  diagnosis: string;
  confidence: number;
  info: string;
  recommend: string;
};

export default function SkinSensePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [generatedRecommendation, setGeneratedRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleReset();
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed. Please try again.');
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      
      // Use AI flows to enhance the result
      try {
        const [summaryResult, recommendationResult] = await Promise.all([
          summarizeDiagnosis({
            diagnosis: result.diagnosis,
            confidence: result.confidence,
            info: result.info,
            recommend: result.recommend,
          }),
          generateRecommendation({
            diagnosis: result.diagnosis,
            confidence: result.confidence,
            info: result.info,
          })
        ]);
        setGeneratedSummary(summaryResult.summary);
        setGeneratedRecommendation(recommendationResult.recommendation);
      } catch (aiError) {
        console.error("AI flow error:", aiError);
        // Fallback to default info if AI flows fail
        setGeneratedSummary('AI summary is currently unavailable.');
        setGeneratedRecommendation(result.recommend);
        toast({
          variant: "destructive",
          title: "AI Enhancement Failed",
          description: "Could not generate AI-powered insights, showing default information.",
        })
      }

    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: err.message,
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    setGeneratedSummary(null);
    setGeneratedRecommendation(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const confidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-green-500';
    if (confidence > 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-foreground bg-primary rounded-lg py-2 px-4 inline-block shadow-lg">
              SkinSense AI
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Your personal AI assistant for preliminary skin health analysis.
            </p>
          </header>

          {error && (
             <Alert variant="destructive" className="mb-8 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!analysisResult && !isLoading && (
            <Card className="text-left shadow-lg animate-in fade-in-0 zoom-in-95 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Upload className="text-primary"/>
                    Upload Your Image
                </CardTitle>
                <CardDescription>Select a clear, well-lit photo of the skin area you want to analyze.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {imagePreview ? (
                  <div className="space-y-4 text-center">
                    <div className="relative w-full max-w-sm mx-auto aspect-square rounded-lg overflow-hidden border-2 border-dashed">
                      <Image src={imagePreview} alt="Selected skin area" layout="fill" objectFit="cover" />
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={handleAnalyzeClick} size="lg">
                        <Sparkles className="mr-2" />
                        Analyze Image
                      </Button>
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground mb-4"/>
                    <p className="text-muted-foreground">Click here or drag and drop an image</p>
                    <p className="text-sm text-muted-foreground/80">PNG, JPG, or WEBP</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {isLoading && <LoadingSkeleton />}

          {analysisResult && !isLoading && (
             <Card className="text-left w-full max-w-3xl mx-auto shadow-xl animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-primary"/>
                    {analysisResult.diagnosis}
                  </CardTitle>
                  <CardDescription>
                    AI-Powered Analysis Results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">Confidence Score</h3>
                        <span className={`font-bold text-lg ${confidenceColor(analysisResult.confidence).replace('bg-','text-')}`}>
                            {(analysisResult.confidence * 100).toFixed(0)}%
                        </span>
                    </div>
                    <Progress value={analysisResult.confidence * 100} indicatorClassName={confidenceColor(analysisResult.confidence)} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/>Summary</h3>
                    <p className="text-muted-foreground">{generatedSummary || analysisResult.info}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Stethoscope className="w-5 h-5 text-primary"/>Recommendation</h3>
                    <p className="text-muted-foreground">{generatedRecommendation || analysisResult.recommend}</p>
                  </div>

                  {analysisResult.confidence < 0.6 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Professional Consultation Recommended</AlertTitle>
                      <AlertDescription>
                        Due to the moderate confidence level, we strongly advise consulting a dermatologist for an accurate diagnosis.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex-col sm:flex-row gap-4">
                  <Button onClick={() => window.open('https://www.google.com/search?q=find+a+dermatologist+near+me', '_blank')} className="w-full sm:w-auto">
                    <Stethoscope className="mr-2"/>
                    Find a Dermatologist
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
                    <X className="mr-2"/>
                    Start New Analysis
                  </Button>
                </CardFooter>
              </Card>
          )}

        </div>
      </main>

      <footer className="text-center p-4 text-xs text-muted-foreground">
        <p>Disclaimer: SkinSense AI is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
      </footer>
    </div>
  );
}

const LoadingSkeleton = () => (
  <Card className="w-full max-w-3xl mx-auto shadow-lg">
    <CardHeader>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/6" />
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-48" />
    </CardFooter>
  </Card>
);
