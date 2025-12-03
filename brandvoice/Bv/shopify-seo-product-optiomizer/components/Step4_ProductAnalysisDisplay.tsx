import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  brandProfile: string;
  productAnalysis: string;
  onConfirm: () => void;
  onGoBack: () => void;
}

const Step4_ProductAnalysisDisplay: React.FC<Props> = ({ brandProfile, productAnalysis, onConfirm, onGoBack }) => {
  return (
    <div className="p-8 md:p-12">
      <h2 className="text-3xl font-serif font-bold text-center text-text-primary mb-2">Review & Confirm</h2>
      <p className="text-center text-text-secondary mb-8">We've analyzed your product. Does this look right? If so, let's generate your new copy!</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <h3 className="text-xl font-serif font-semibold text-brand-primary text-center">Brand Voice Profile</h3>
            <div className="prose prose-invert max-w-none bg-background-dark/50 p-6 rounded-lg border border-border-color h-96 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {brandProfile}
                </ReactMarkdown>
            </div>
        </div>
         <div className="space-y-4">
            <h3 className="text-xl font-serif font-semibold text-brand-primary text-center">Product Analysis</h3>
            <div className="prose prose-invert max-w-none bg-background-dark/50 p-6 rounded-lg border border-border-color h-96 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {productAnalysis}
                </ReactMarkdown>
            </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onConfirm}
          className="w-full sm:w-auto bg-brand-primary text-background-dark font-bold py-3 px-8 rounded-lg hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light focus:ring-brand-primary transition-colors"
        >
          Confirm & Generate Copy
        </button>
        <button
          onClick={onGoBack}
          className="w-full sm:w-auto text-text-secondary border border-border-color font-medium py-3 px-6 rounded-lg hover:bg-background-dark/50 hover:border-gray-500 hover:text-text-primary transition-all duration-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Step4_ProductAnalysisDisplay;