export default function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-2">
      <svg className="mt-1 h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.25a1 1 0 0 1-1.423.01L3.29 9.955a1 1 0 1 1 1.42-1.408l3.05 3.08 6.49-6.534a1 1 0 0 1 1.454.197z" clipRule="evenodd"/>
      </svg>
      <span>{children}</span>
    </li>
  );
}
