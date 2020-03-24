declare module 'edit-json-file' {
  class Editor {
    get<T = unknown>(key: string): T | undefined;
    save(): void;
    set<T = unknown>(key: string, value: T): void;
    unset(key: string): void;
  }

  export default function editJsonFile(path: string): Editor;
}
