
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Headphones, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const Index = () => {
  return (
    <Layout>
      <div className="assessment-container animate-fade-in">
        <div className="text-center my-10">
          <h1 className="text-4xl font-bold mb-4 text-app-blue">CognitiveLens Assessment Platform</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive tool for analyzing handwriting, cognitive abilities, and speech patterns
            to identify learning differences and provide targeted support.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Handwriting Assessment Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-app-blue"></div>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-app-blue bg-opacity-10 mr-4">
                  <FileText className="text-app-blue" size={24} />
                </div>
                <h2 className="card-title">Handwriting Assessment</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Upload handwriting samples for analysis of spelling, letter formations, 
                and potential indicators of dyslexia.
              </p>
              <Link to="/handwriting">
                <Button className="w-full bg-app-blue hover:bg-app-blue-dark">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Cognitive Analysis Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-app-green"></div>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-app-green bg-opacity-10 mr-4">
                  <Brain className="text-app-green" size={24} />
                </div>
                <h2 className="card-title text-app-green-dark">Cognitive Analysis</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Evaluate memory, attention span, and problem-solving abilities 
                through interactive digital assessments.
              </p>
              <Link to="/cognitive">
                <Button className="w-full bg-app-green hover:bg-app-green-dark">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Speech Evaluation Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-app-blue"></div>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-app-blue bg-opacity-10 mr-4">
                  <Headphones className="text-app-blue" size={24} />
                </div>
                <h2 className="card-title">Speech & Reading</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Record speech samples for pronunciation, fluency, and reading 
                comprehension evaluation.
              </p>
              <Link to="/speech">
                <Button className="w-full bg-app-blue hover:bg-app-blue-dark">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Dashboard Preview */}
        <div className="mt-12 text-center">
          <Card className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <BarChart3 className="text-app-blue mr-2" size={28} />
              <h2 className="text-2xl font-semibold text-app-blue">Assessment Dashboard</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Track progress, view detailed analysis results, and generate comprehensive reports
              to help identify learning patterns and support needs.
            </p>
            <Button variant="outline" className="mx-auto">
              View Dashboard
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
