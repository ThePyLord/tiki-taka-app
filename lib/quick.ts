const arr: number[][] = Array(3).fill(0).map(() => Array(3).fill(0));
console.log(arr)
arr.map((vals) => vals.map((val, idx, arr) => arr[idx] = null));
console.log(arr)