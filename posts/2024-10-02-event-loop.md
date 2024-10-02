---
title: JS Event Loop
description: JavaScript 的 event loop 是什麼，複習一下
tags:
  - JavaScript
  - Interview
---

JavaScript 的 event loop 似乎也是面試常常會問到的問題，雖然在開發過程中大概都知道在幹嘛了，但是要能夠轉換成語言說出來還是需要整理一下。

## Event loop 在做什麼

我們可以將 event loop 先分成四個 parts： `Call stack`, `Web APIs/Node.js APIs`, `Task queue`, `Microtasks queue`。

`Call stack` 是 JS 執行程式碼的地方，當一個 function 被 called 時，JS 會把這個 function 丟到 call stack 上，如果 function 裡面又有 function 的話，以此類推。如同名稱一樣，call stack 是 last-in-first-out。

`Web APIs/Node.js APIs` 是一些非同步的 operations，例如 `setTimeout`, HTTP requests, file I/O 等等。這些 API 不是 JS engine 的一部分，會被執行在另外的 threads 上。

`Task queue` 會把 `Web APIs`(`setTimeout()`等等) 或是 event handler 的 callback 塞進去。

`Microtasks queue` 跟 `Task queue` 很像，不過優先度更高，promise, `queueMicrotask` 和 `MutationObserver` 的 callback 會被丟到這裡來。

### 執行順序

JS 會先把 call stack 清空，接著去看 Microtask queue 裡面有沒有 task 要執行，有的話就丟到 call stack 依序執行直到 queue 被清空，再來才是檢查 task queue 有沒有 task 要執行。

如果 task queue 有 task 要執行， event loop 會把第一個 task 丟到 call stack 上執行，當 call stack 清空之後，會先去 Microtask queue 檢查有沒有新的 task ，如果有會先清空 Microtask queue ，當 Microtask queue 清空之後，才會再去檢查 task queue。

## 結語

Event loop 要單純用文字來解釋的話還真的沒辦法解釋得很清楚，我推薦對 event loop 有疑惑的讀者可以讀一下[這篇文章](https://www.lydiahallie.com/blog/event-loop)，裡面解釋的超級詳細，而且有搭配影片來視覺化 event loop 到底在幹嘛，看完應該就會了解 event loop 在幹嘛了。
