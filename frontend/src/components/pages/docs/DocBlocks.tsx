import React from "react";

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 text-xs bg-gray-50 border rounded-lg p-3 overflow-x-auto whitespace-pre">
      <code>{children}</code>
    </pre>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-gray-600">{subtitle}</p> : null}
    </div>
  );
}

