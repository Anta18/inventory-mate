// src/utils/highlightMatch.ts

/**
 * Highlights the matched portions of the text based on the search query.
 *
 * @param text - The original text of the node.
 * @param query - The search query to match against.
 * @returns A React fragment with matched portions highlighted or the original text.
 */
export const highlightMatch = (
  text: string,
  query: string
): JSX.Element | string => {
  if (!query) return text;

  const escapedQuery = escapeRegExp(query);
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="bg-gray-400 text-black">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

/**
 * Escapes special characters in the search query to prevent regex injection.
 *
 * @param string - The search query string.
 * @returns The escaped string safe for regex usage.
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
