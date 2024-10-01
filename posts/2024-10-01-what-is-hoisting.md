---
title: JavaScript 的 hoisting 是什麼
description: 簡單介紹一下 JavaScript 中的 hoisting
tags:
  - JavaScript
  - Interview
---

今天複習一下怎麼解釋 JavaScript 的 "hoisting" ，順便記錄一下，免得自己未來被問到又忘記怎麼解釋。

## Hoisting

JavaScript 在執行我們的程式碼之前，會先把變數掃過一遍，並且將變數和對應的 value 存進 memory ，根據不同的變數宣告方式，會有不同的 value 存進去。可以想像成我們宣告變數的那一行程式碼，會被移到最上面，不過只有 declaration， initialization 不會。

```js before.js
console.log(foo);
var foo = 1;
```

```js after.js
var foo;
console.log(foo);
foo = 1;
```

> JavaScript 的 compiler 並不會真的這樣做，這邊只是為了方便理解

前面有提到不同的宣告方式，會存不同的 value 進 memory ，可能是 `undefined`，也可能是 `ReferenceError`，接下來放幾個範例讓讀者猜猜 `console.log` 會有什麼結果。

```js var.js
console.log(foo);
var foo = 1;
console.log(foo);
```

```js let.js
console.log(foo);
let foo = 1;
console.log(foo);
```

```js const.js
console.log(foo);
const foo = 1;
console.log(foo);
```

```js function-expression.js
console.log(foo);
foo();
var foo = function () {
  console.log('foo');
};
```

```js function-declaration.js
console.log(foo);
foo();
function foo() {
  console.log('foo');
}
```

```js class.js
console.log(foo);
class Foo {
  constructor() {}
}
```

```js import.js
foo();
import foo from './foo';
```

如果不確定答案的話，可以試著直接執行這些程式碼看看。

> 這些範例程式碼不能直接跑在 REPL 的環境（例如瀏覽器 console）

## Cheat sheet

| 宣告方式                  | 在宣告前就 access 的結果 |
| ------------------------- | ------------------------ |
| `var foo`                 | `undefined`              |
| `let foo`                 | `ReferenceError`         |
| `const foo`               | `ReferenceError`         |
| `class Foo`               | `ReferenceError`         |
| `var foo = function() {}` | `undefined`              |
| `function foo() {}`       | 可以直接 access          |
| `import foo`              | 可以直接 access          |

## 結語

其實在現在的 codebase 裡面，已經很難找到用 `var` 來定義變數了，因為在 init 之前就去 access `var` 定義的變數並不會像 `const`, `let` 一樣報錯，而是會得到 `undefined` ，這樣還滿難 debug 的。

雖然我覺得寫 JS 的人不太可能不知道這個，但因為面試偶而還是會考這個，所以拿出來複習一下。畢竟也不是什麼很難的觀念，有個大概的印象就好。
