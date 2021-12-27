const arr: number[][] = Array(3).fill(0).map(() => Array(3).fill(0));
// console.log(arr)
arr.map((vals) => vals.map((val, idx, arr) => arr[idx] = null));
// console.log(arr)

const arr2d = [
    [0, 1, 0],
    [0, 0, 1],
    [0, 1, 1]
]
// Shout out to these lines for helping me figure out a way to get the columns in the 2d array
const col = new Set(arr2d.map(val => val[0] === 0))
const theCols = arr2d.every(val => val[0] === 0)
const mapped = arr2d.map((val) => val[0])
console.log(mapped, theCols)
console.log(col)