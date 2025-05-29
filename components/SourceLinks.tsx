
import React from 'react';
import { GroundingSource } from '../types';

interface SourceLinksProps {
  sources: GroundingSource[];
}

const SourceLinks: React.FC<SourceLinksProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 pt-2 border-t border-slate-300">
      <h4 className="text-xs font-semibold text-slate-600 mb-1">Sources:</h4>
      <ul className="list-disc list-inside space-y-1">
        {sources.map((source, index) => (
          <li key={`${source.uri}-${index}`} className="text-xs">
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline truncate"
              title={source.title}
            >
              {source.title || source.uri}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourceLinks;
