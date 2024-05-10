import { useLoaderData, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FileCode, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { disk, createSession } from '@/lib/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import type { FsObjectResultType, FsObjectType } from '@/types';

export async function loader() {
  const { result } = await disk();
  return result;
}

export default function Home() {
  const { path: initialPath, entries: initialEntries } = useLoaderData() as FsObjectResultType;

  const [path, setPath] = useState(initialPath);
  const [entries, setEntries] = useState(initialEntries);
  const [selected, setSelected] = useState<FsObjectType | null>(null);

  const navigate = useNavigate();

  async function onClick(entry: FsObjectType) {
    if (selected && selected.path === entry.path) {
      // Deselecting a file
      setSelected(null);
      setPath(entry.parentPath);
    } else if (!entry.isDirectory) {
      // Selecting a file
      setSelected(entry);
      setPath(entry.path);
    } else {
      // Opening a directory
      setSelected(null);
      const { result } = await disk({ path: entry.path });
      setPath(result.path);
      setEntries(result.entries);
    }
  }

  return (
    <>
      <div className="my-6">
        <h1 className="text-2xl">Notebooks</h1>
      </div>
      <div className="space-y-4">
        <form
          method="post"
          className="flex items-center space-x-2"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const { result } = await createSession({ path });
            navigate(`/sessions/${result.id}`);
          }}
        >
          <Input value={path} disabled />
          <Button type="submit" disabled={selected === null}>
            Open
          </Button>
        </form>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {entries.map((entry) => (
            <FsEntryItem
              key={entry.path}
              entry={entry}
              onClick={onClick}
              selected={selected !== null && selected.path === entry.path}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function FsEntryItem({
  entry,
  onClick,
  selected,
}: {
  entry: FsObjectType;
  selected: boolean;
  onClick: Function;
}) {
  const Icon = entry.isDirectory ? Folder : FileCode;

  return (
    <li
      className={cn(
        'p-2 flex items-center text-sm cursor-pointer rounded',
        selected
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent hover:text-accent-foreground',
      )}
      onClick={() => onClick(entry)}
    >
      <Icon size={16} />
      <span className="ml-1.5 truncate">{entry.name}</span>
    </li>
  );
}
