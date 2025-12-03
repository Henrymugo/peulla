import React, { useState } from 'react';

interface Props {
  onSubmit: (url: string) => void;
}

const normalizeAndValidateUrl = (urlString: string): { valid: boolean; url?: string; error?: string } => {
  let trimmedUrl = urlString.trim();
  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty.' };
  }

  if (!/^https?:\/\//i.test(trimmedUrl)) {
    trimmedUrl = `https://${trimmedUrl}`;
  }

  try {
    const url = new URL(trimmedUrl);
     if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { valid: false, error: 'Please enter a valid URL starting with http:// or https://.' };
    }
    if (!url.hostname || !url.hostname.includes('.') || url.hostname.startsWith('.') || url.hostname.endsWith('.')) {
         return { valid: false, error: 'The URL appears to be incomplete or invalid.' };
    }
    return { valid: true, url: url.toString() };
  } catch (e) {
    return { valid: false, error: 'The URL format is invalid. Please check for typos.' };
  }
};

const Step3ProductUrlInput: React.FC<Props> = ({ onSubmit }) => {
  const [url, setUrl] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = normalizeAndValidateUrl(url);
    if (!validationResult.valid) {
      setValidationError(validationResult.error || 'Please enter a valid product URL.');
      return;
    }
    onSubmit(validationResult.url!);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  }

  return (
    <div className="p-8 md:p-12">
      <h2 className="text-3xl font-serif font-bold text-center text-text-primary mb-2">Optimize a Product</h2>
      <p className="text-center text-text-secondary mb-8">Now, enter the URL of a specific product you want to optimize.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full">
            <input
              type="text"
              value={url}
              onChange={handleChange}
              placeholder="your-store.com/products/your-product"
              className={`w-full bg-background-dark border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:ring-0 focus:outline-none transition-all duration-300 ${
              validationError ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-brand-primary'
            }`}
              required
              aria-invalid={!!validationError}
              aria-describedby="url-error"
            />
            {validationError && <p id="url-error" className="text-red-400 text-sm mt-2">{validationError}</p>}
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-brand-primary text-background-dark font-bold py-3 px-6 rounded-lg hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light focus:ring-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!url.trim()}
        >
          Generate Copy
        </button>
      </form>
    </div>
  );
};

export default Step3ProductUrlInput;