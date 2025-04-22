
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Brain, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Brain size={28} className="text-app-blue" />
          <span className="text-xl font-semibold text-app-blue">CognitiveLens</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-4">
          <Link to="/handwriting" className="flex items-center gap-2 text-gray-700 hover:text-app-blue transition-colors">
            <FileText size={18} />
            <span>Handwriting</span>
          </Link>
          <Link to="/cognitive" className="flex items-center gap-2 text-gray-700 hover:text-app-blue transition-colors">
            <Brain size={18} />
            <span>Cognitive</span>
          </Link>
          <Link to="/speech" className="flex items-center gap-2 text-gray-700 hover:text-app-blue transition-colors">
            <Headphones size={18} />
            <span>Speech</span>
          </Link>
        </div>
        
        <Button variant="outline" className="hidden md:block">
          Dashboard
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
