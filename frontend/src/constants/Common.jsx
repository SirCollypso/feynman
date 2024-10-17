export const editor_options = {
    autoIndent: 'full',
    contextmenu: true,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 24,
    hideCursorInOverviewRuler: true,
    matchBrackets: 'always',
    minimap: {
      enabled: false,
    },
    scrollbar: {
      horizontalSliderSize: 4,
      verticalSliderSize: 18,
    },
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    loading: true,
}; 

export const TOPIC_OPTIONS = [
    // {"value": "hashmap", "title": "Hash Map"},
    // {"value": "bfs", "title": "BFS"},
    // {"value": "quicksort", "title": "Quick Sort"},
    {"value": "binarysort", "title": "Binary Sort"},
]

export const LANG_OPTIONS = [
    {
      "value": {
        "python": "3.10.0",
      },
      "title": "Python",
    }
]

export const pythonCode = `def greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Phil")\n`