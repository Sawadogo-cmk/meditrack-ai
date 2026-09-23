interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  lastPage,
  total,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = buildPageList(currentPage, lastPage);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-slate-500">
        Page {currentPage} sur {lastPage} ({total} résultats)
      </p>

      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
        >
          Précédent
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 py-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1 text-sm border rounded-lg ${
                p === currentPage
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-slate-300 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

function buildPageList(current: number, last: number): (number | '...')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const result: (number | '...')[] = [1];

  if (current > 3) result.push('...');

  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    result.push(i);
  }

  if (current < last - 2) result.push('...');

  result.push(last);

  return result;
}