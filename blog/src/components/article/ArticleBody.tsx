import "./article-prose.css";

interface ArticleBodyProps {
  html: string;
}

export function ArticleBody({ html }: ArticleBodyProps) {
  return (
    <div
      className="article-body prose prose-lg dark:prose-invert max-w-none
        prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight
        prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl prose-img:shadow-md
        prose-pre:bg-gray-900 prose-pre:text-gray-100
        prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono
        dark:prose-code:bg-gray-800
        prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50/50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg
        dark:prose-blockquote:bg-primary-900/20"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
