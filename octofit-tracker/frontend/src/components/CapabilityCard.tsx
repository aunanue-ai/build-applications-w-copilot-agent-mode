import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  resourceKey: string;
  emptyMessage: string;
  renderItems: (items: T[]) => ReactNode;
};

export function CapabilityCard<T>({ title, description, path, resourceKey, emptyMessage, renderItems }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getJson<Record<string, T[]>>(path)
      .then((response) => {
        const result = response[resourceKey];
        if (!Array.isArray(result)) throw new Error(`Missing ${resourceKey} response data`);
        if (!cancelled) setItems(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, [path, resourceKey]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {items === null && !error && <p role="status">Loading {title.toLowerCase()}...</p>}
    {error && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
    {items?.length === 0 && <p>{emptyMessage}</p>}
    {items && items.length > 0 && renderItems(items)}
  </div></section>;
}
