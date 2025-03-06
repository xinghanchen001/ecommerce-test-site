// Simple Avatar component
function Avatar({ className, children }) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${
        className || ''
      }`}
    >
      {children}
    </div>
  );
}

function AvatarImage({ src, alt }) {
  return (
    <img className="aspect-square h-full w-full" src={src} alt={alt || ''} />
  );
}

function AvatarFallback({ children }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-800">
      {children}
    </div>
  );
}
