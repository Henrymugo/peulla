
import React, { useMemo } from 'react';
import type { ProductCopy } from '../types';
import CopyButton from './CopyButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DownloadIcon, RefreshIcon } from './icons/Icons'; // Import the new icon

interface Props {
  copy: ProductCopy;
  onRestart: () => void;
  onOptimizeAnother: () => void;
  onRegenerate: () => void; // New prop for regenerate functionality
}

const ResultSection: React.FC<{ title: string; content: string; isMarkdown?: boolean }> = ({ title, content, isMarkdown = false }) => (
  <div className="bg-background-dark/50 p-6 rounded-lg border border-border-color">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold font-serif text-brand-primary">{title}</h3>
      <CopyButton textToCopy={content} />
    </div>
    {isMarkdown ? (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    ) : (
      <p className="text-text-secondary whitespace-pre-wrap font-mono text-sm">{content}</p>
    )}
  </div>
);

const Step4ResultsDisplay: React.FC<Props> = ({ copy, onRestart, onOptimizeAnother, onRegenerate }) => {
  const allCopyText = useMemo(() => {
    return `Meta Title (SEO-Optimized):
${copy.metaTitle}

Meta Description (SEO-Optimized):
${copy.metaDescription}

Suggested SEO Keywords:
${copy.seoKeywords}

Related Keywords (Semantic & Long-tail):
${copy.relatedKeywords}

Product Description (On-Brand & Persuasive):
${copy.productDescription}`;
  }, [copy]);

  const handleSaveToFile = () => {
    const fileName = `product_copy_${new Date().toISOString().slice(0, 10)}.txt`; // e.g., product_copy_2024-07-30.txt
    const blob = new Blob([allCopyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Release the object URL
  };

  return (
    <div className="p-8 md:p-12">
      <h2 className="text-3xl font-serif font-bold text-center text-text-primary mb-2">Your Optimized Copy is Ready!</h2>
      <p className="text-center text-text-secondary mb-4">Copy the generated content and paste it into your Shopify product page.</p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <CopyButton textToCopy={allCopyText} label="Copy All to Clipboard" />
        <button
          onClick={handleSaveToFile}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 bg-background-dark/70 text-text-primary border border-border-color hover:bg-background-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-dark focus:ring-border-color"
          aria-label="Save all to file"
        >
          <DownloadIcon />
          <span className="font-semibold">Save to File</span>
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 bg-background-dark/70 text-brand-primary border border-brand-primary hover:bg-background-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-dark focus:ring-brand-primary"
          aria-label="Regenerate copy"
        >
          <RefreshIcon />
          <span className="font-semibold">Regenerate Copy</span>
        </button>
      </div>

      <div className="space-y-6">
        <ResultSection title="Meta Title (SEO-Optimized)" content={copy.metaTitle} />
        <ResultSection title="Meta Description (SEO-Optimized)" content={copy.metaDescription} />
        <ResultSection title="Suggested SEO Keywords" content={copy.seoKeywords} />
        <ResultSection title="Related Keywords (Semantic & Long-tail)" content={copy.relatedKeywords} />
        <ResultSection title="Product Description (On-Brand & Persuasive)" content={copy.productDescription} isMarkdown={true} />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onOptimizeAnother}
          className="w-full sm:w-auto bg-brand-primary text-background-dark font-bold py-3 px-8 rounded-lg hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light focus:ring-brand-primary transition-colors"
        >
          Optimize Another Product
        </button>
         <button
          onClick={onRestart}
          className="w-full sm:w-auto text-text-secondary border border-border-color font-medium py-3 px-6 rounded-lg hover:bg-background-dark/50 hover:border-gray-500 hover:text-text-primary transition-all duration-300"
        >
          Analyze New Brand
        </button>
      </div>
    </div>
  );
};

export default Step4ResultsDisplay;