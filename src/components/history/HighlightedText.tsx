import { defangUrl, sanitizeText } from '../../utils/sanitize';
import styles from './HighlightedText.module.css';

interface HighlightedTextProps {
  text: string;
  fragments: string[];
}

interface TextSegment {
  value: string;
  highlighted: boolean;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitTextByFragments(cleanText: string, fragments: string[]): TextSegment[] {
  const validFragments = Array.from(
    new Set(
      fragments
        .map((f) => f.trim())
        .filter((f) => f.length > 0 && cleanText.toLowerCase().includes(f.toLowerCase()))
    )
  ).sort((a, b) => b.length - a.length);

  if (validFragments.length === 0) {
    return [{ value: cleanText, highlighted: false }];
  }

  const pattern = new RegExp(`(${validFragments.map(escapeRegExp).join('|')})`, 'gi');
  const rawParts = cleanText.split(pattern);

  return rawParts
    .filter((part) => part.length > 0)
    .map((part) => {
      const isMatch = validFragments.some((f) => f.toLowerCase() === part.toLowerCase());
      return {
        value: part,
        highlighted: isMatch,
      };
    });
}

export function HighlightedText({ text, fragments }: HighlightedTextProps) {
  const { cleanText } = sanitizeText(text);
  const segments = splitTextByFragments(cleanText, fragments);

  return (
    <div className={styles.box}>
      {segments.map((segment, index) => {
        const safeValue = defangUrl(segment.value);
        if (segment.highlighted) {
          return (
            <mark key={index} className={styles.mark}>
              {safeValue}
            </mark>
          );
        }
        return <span key={index}>{safeValue}</span>;
      })}
    </div>
  );
}
