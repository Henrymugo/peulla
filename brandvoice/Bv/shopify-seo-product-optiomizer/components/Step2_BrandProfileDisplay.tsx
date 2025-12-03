import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  profile: string;
  onAccept: () => void;
  onRestart: () => void;
}

const Step2BrandProfileDisplay: React.FC<Props> = ({ profile, onAccept, onRestart }) => {
  return (
    <div className="p-8 md:p-12">
      <h2 className="text-3xl font-serif font-bold text-center text-text-primary mb-2">Your Brand Voice Profile</h2>
      <p className="text-center text-text-secondary mb-8">Here's what our AI understands about your brand's unique voice.</p>
      
      <div className="prose prose-invert prose-lg max-w-none bg-background-dark/50 p-6 rounded-lg border border-border-color">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {profile}
        </ReactMarkdown>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onAccept}
          className="w-full sm:w-auto bg-brand-primary text-background-dark font-bold py-3 px-8 rounded-lg hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light focus:ring-brand-primary transition-colors"
        >
          Looks Good, Next Step
        </button>
        <button
          onClick={onRestart}
          className="w-full sm:w-auto text-text-secondary border border-border-color font-medium py-3 px-6 rounded-lg hover:bg-background-dark/50 hover:border-gray-500 hover:text-text-primary transition-all duration-300"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default Step2BrandProfileDisplay;