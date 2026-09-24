function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function stripPunct(word: string) {
  return word.toLowerCase().replace(/[.,!?;:]+$/g, "");
}

/** Drop immediate duplicate words and repeated 2–8 word phrases. */
export function collapseRepeatedPhrases(text: string) {
  const words = normalize(text).split(" ").filter(Boolean);
  const withoutDupWords: string[] = [];
  for (const word of words) {
    const previous = withoutDupWords[withoutDupWords.length - 1];
    if (previous && stripPunct(previous) === stripPunct(word) && stripPunct(word)) {
      continue;
    }
    withoutDupWords.push(word);
  }

  let result = withoutDupWords;
  for (let size = Math.min(8, Math.floor(result.length / 2)); size >= 2; size -= 1) {
    const merged: string[] = [];
    for (let index = 0; index < result.length; ) {
      const first = result.slice(index, index + size).map(stripPunct).join(" ");
      const second = result.slice(index + size, index + size * 2).map(stripPunct).join(" ");
      if (
        result.slice(index + size, index + size * 2).length === size &&
        first === second &&
        first.length > 0
      ) {
        merged.push(...result.slice(index, index + size));
        index += size * 2;
      } else {
        merged.push(result[index]);
        index += 1;
      }
    }
    result = merged;
  }

  return result.join(" ");
}

/**
 * Gemini Live sends a mix of cumulative snapshots and tiny deltas.
 * Merge them into one readable utterance instead of concatenating twice.
 */
export function mergeTranscript(previous: string, incoming: string) {
  const next = incoming.replace(/\s+/g, " ");
  if (!next.trim()) return previous;
  if (!previous.trim()) return collapseRepeatedPhrases(next);

  const prev = normalize(previous);
  const inc = normalize(next);

  if (inc === prev) return prev;
  if (inc.startsWith(prev)) return collapseRepeatedPhrases(inc);
  if (prev.startsWith(inc)) return prev;
  if (prev.endsWith(inc)) return prev;
  if (inc.endsWith(prev) && inc.length <= prev.length + 80) {
    return collapseRepeatedPhrases(inc);
  }

  const maxChars = Math.min(prev.length, inc.length);
  for (let size = maxChars; size >= 12; size -= 1) {
    if (prev.slice(-size) === inc.slice(0, size)) {
      return collapseRepeatedPhrases(`${prev}${inc.slice(size)}`);
    }
  }

  const prevWords = prev.split(" ");
  const incWords = inc.split(" ");
  const maxWords = Math.min(prevWords.length, incWords.length);
  for (let size = maxWords; size >= 2; size -= 1) {
    const tail = prevWords.slice(-size).map(stripPunct).join(" ");
    const head = incWords.slice(0, size).map(stripPunct).join(" ");
    if (tail === head) {
      return collapseRepeatedPhrases([...prevWords, ...incWords.slice(size)].join(" "));
    }
  }

  const spacer = /[A-Za-z0-9]$/.test(prev) && /^[A-Za-z0-9]/.test(inc) ? " " : prev.endsWith(" ") ? "" : " ";
  return collapseRepeatedPhrases(`${prev}${spacer}${inc}`);
}
