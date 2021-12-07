// This implementation is courtesy of: https://dev.to/glebirovich/typescript-data-structures-stack-and-queue-hld
interface IStack<T> {
	push(item: T): void;
	pop(): T;
	peek(): T;
	isEmpty(): boolean;
	size(): number;
}

export class Stack<T> implements IStack<T> {
	private storage: T[] = []
	constructor(private capacity: number = Infinity) {	}

	push(item: T): void {
		if(this.size() === this.capacity)
			throw new Error("Stack has reached max capacity, you may not add any more items.")
		this.storage.push(item)
	}

	pop(): T {
		return this.storage.pop()
	}

	peek(): T {
		return this.storage[this.size() - 1]
	}

	isEmpty(): boolean {
		return this.storage.length > 0 ? false : true
	}

	size(): number {
		return this.storage.length
	}

	clear(): void {
		this.storage = []
	}
}