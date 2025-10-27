"use client"

export default function SearchHighlight({ text, searchQuery }) {
  if (!searchQuery || !text) return text

  const regex = new RegExp(`(${searchQuery})`, 'gi')
  const parts = text.split(regex)

  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="search-highlight">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  )
}