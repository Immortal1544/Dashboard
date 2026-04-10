function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-[color:var(--surface-hover)] ${className}`.trim()} />;
}

export default SkeletonBlock;
