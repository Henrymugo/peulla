
import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './icons/Icons';

interface Props {
  textToCopy: string;
  label?: string; // Optional label for the button
}

const CopyButton: React.FC<Props> = ({ textToCopy, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 
        ${copied ? 'bg-teal-800 text-white' : 'bg-brand-primary text-background-dark hover:bg-brand-primary-hover'}`}
      aria-label={label || "Copy to clipboard"}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      {label && <span className="font-semibold">{copied ? 'Copied!' : label}</span>}
    </button>
  );
};

export default CopyButton;
