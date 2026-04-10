import { useEffect, useMemo, useRef, useState } from 'react';

function QuickDropdown({
  name,
  value,
  options,
  onChange,
  placeholder = 'Select',
  noResultsText = 'No options available',
  triggerClassName = '',
  wrapperClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const normalizedOptions = useMemo(
    () =>
      (options || []).map((option) => ({
        value: String(option.value),
        label: String(option.label)
      })),
    [options]
  );

  const selectedOption = useMemo(
    () => normalizedOptions.find((option) => option.value === String(value || '')),
    [normalizedOptions, value]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (nextValue) => {
    setIsOpen(false);
    onChange({ target: { name, value: nextValue } });
  };

  return (
    <div ref={rootRef} className={`relative ${wrapperClassName}`.trim()}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`field-control h-10 w-full select-trigger-readonly cursor-pointer text-left ${triggerClassName}`.trim()}
      >
        {selectedOption?.label || placeholder}
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-[color:var(--surface-border)] bg-[color:var(--surface)] shadow-lg transition-colors duration-300">
          <div className="max-h-48 overflow-y-auto rounded-lg">
            {normalizedOptions.length > 0 ? (
              normalizedOptions.map((option) => {
                const isSelected = option.value === String(value || '');
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`block w-full cursor-pointer px-4 py-2 text-left text-sm transition ${
                      isSelected
                        ? 'bg-[color:var(--surface-hover)] text-[color:var(--text-strong)]'
                        : 'text-[color:var(--text-soft)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-strong)]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-10 text-center text-sm text-[color:var(--text-muted)]">{noResultsText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickDropdown;
