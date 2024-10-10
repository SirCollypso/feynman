export const CHAT_HISTORY  = [
    {"role": "agent", "message": "Hi, could you explain how a stack works?"},
    {"role": "user", "message": "A stack is a data structure that works on the principle of Last In, First Out (LIFO). This means the last item added is the first one to be removed. It’s like a stack of plates: you can only take the top plate off or add a new plate on top."},
    {"role": "agent", "message": "What’s the main difference between a stack and a queue?"},
    {"role": "user", "message": "The main difference is in how they handle data. A stack uses LIFO, where the last item added is removed first. A queue, on the other hand, uses First In, First Out (FIFO), meaning the first item added is the first to be removed, like a line of people waiting for a service."},
    {"role": "agent", "message": "Can you give an example where a queue is useful?"},
    {"role": "user", "message": "A common example is task scheduling. In operating systems, processes are often queued, with the first task to arrive being processed first, ensuring fairness and avoiding task starvation."}
]

export const TOPIC_OPTIONS = [
    {"value": "hashmap", "title": "Hash Map"},
    {"value": "bfs", "title": "BFS"},
    {"value": "quicksort", "title": "Quick Sort"},
]