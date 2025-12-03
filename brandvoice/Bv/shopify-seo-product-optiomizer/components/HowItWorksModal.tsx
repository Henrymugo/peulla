import React from 'react';
import { XIcon } from './icons/Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Analyze Your Brand",
    description: "Enter your Shopify store URL. Our AI analyzes your content to understand your unique tone, style, and archetype."
  },
  {
    title: "Review Brand Profile",
    description: "We generate a Brand Voice Profile. Review it to ensure it accurately represents your brand before moving forward."
  },
  {
    title: "Analyze Product",
    description: "Provide a specific product URL. We extract key features, specs, and benefits to inform the copywriting."
  },
  {
    title: "Generate Optimized Copy",
    description: "Receive SEO-ready meta tags, keywords, and a persuasive product description written in your brand's voice."
  },
  {
    title: "Update Product Description",
    description: (
      <>
        Log in to Shopify, go to <strong className="text-text-primary">Products</strong>, select your item, and paste the generated text into the <strong className="text-text-primary">Description</strong> box.
      </>
    )
  },
  {
    title: "Update Search Engine Listing",
    description: (
      <>
        Scroll down to <strong className="text-text-primary">Search engine listing</strong>, click <strong className="text-text-primary">Edit</strong>, and paste your new Meta Title and Description. Click <strong className="text-text-primary">Save</strong>!
      </>
    )
  }
];

const HowItWorksModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-background-light border border-border-color rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border-color bg-background-dark/50 shrink-0">
          <h2 className="text-2xl font-serif font-bold text-text-primary">How It Works</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Close modal">
            <XIcon />
          </button>
        </div>
        
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
            <div className="grid gap-6 md:grid-cols-2">
                {steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold font-serif border border-brand-primary/50">
                            {index + 1}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary mb-1">{step.title}</h3>
                            <div className="text-sm text-text-secondary leading-relaxed">{step.description}</div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-4 text-sm text-text-secondary">
                <p><span className="text-brand-primary font-bold">Pro Tip:</span> Use the AI Assistant chat bubble at the bottom right for specific advice on SEO strategy or if you get stuck!</p>
            </div>
        </div>

        <div className="p-6 border-t border-border-color bg-background-dark/30 flex justify-end shrink-0">
             <button
                onClick={onClose}
                className="bg-brand-primary text-background-dark font-bold py-2 px-6 rounded-lg hover:bg-brand-primary-hover transition-colors"
            >
                Got it
            </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;