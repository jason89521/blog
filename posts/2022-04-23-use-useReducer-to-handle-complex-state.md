---
title: 使用 useReducer 來處理複雜的 state
description: 為什麼要用 useReducer 處理複雜的 state 以及要如何簡化使用 useReducer 所需要的流程。
tags:
  - React
---

最近在 Medium 上看到一篇文章說，在處理比較複雜的 state 時，應該使用 `useReducer` 將 state 變化的邏輯從 component 中抽離出來。想想覺得滿有道理的，以不久前做的 [todo-app](https://github.com/jason89521/react-todo) 為例子，如果我想要更新其中一個 todo 的話，用 `useState` 我需要在 component 這樣寫：

```javascript
const checked = e.currentTarget.checked;
const nextTodos = todos.map(todo => {
  if (todo.id === id) return { ...todo, isCompleted: checked };

  return todo;
});
setTodos(nextTodos);
```

但如果是用 `useReducer` 的話，我只需要這樣寫：

```javascript
const checked = e.currentTarget.checked;
dispatch({ type: 'check', payload: { checked, id } });
```

因為更新 state 的邏輯從 component 中抽離出來，所以在 component 內只需要把 action 傳進 `dispatch` 就好，是不是簡潔許多？

## 如何使用 `useReducer`

在使用 `useReducer` 之前，我們要先知道什麼是 reducer, action 和 dispatch。首先，reducer 是一個會根據舊的 state 和 action 來回傳新的 state 的 function。 而 action 通常會是一個 object，除了讓 reducer 辨別需要執行什麼邏輯以外，必要的資料也會包含在裡面。 dispatch 則是告訴 reducer 要去執行哪一個 action。所以，當我們想要更新 state 時，實際上做的事情就是 **dispatch 一個 action 給 reducer**。

接下來讓我們用一個簡單的 counter 範例來看看要怎麼使用 `useReducer`:

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

就如同上面所說的， `reducer` 會根據 `action` 的 `type` 來決定要執行什麼邏輯，而+, - 兩個 button 則分別 dispatch 不同的 action 給 reducer。

### 使用 `dispatch` 優化效能

因為 React 保證了 `dispatch` 在 re-render 之後也不會更改，所以我們可以用 `dispatch` 來取代 context 或是 props 的 callback，如此一來也可以避免掉不必要的 re-render。

## 減少重複的程式碼

從上面的例子可以發現，如果我們每次要 dispatch 一個 action 給 reducer 時都這樣寫:

```javascript
dispatch({ type: 'increment' });
```

那麼，當我們的 App 需要處理的邏輯變多時，就要寫好幾個重複的 action。如果要解決這個問題，我們可以寫一個 **action creator**。簡單來說， action creator 就是一個會回傳 action 的 function。以上面的 increment 作為例子的話，它的 action creator 會長這樣：

```javascript
const increment = () => ({ type: 'increment' });
```

有了 action creator 之後，我們就可以直接寫成這樣：

```javascript
dispatch(increment());
```

如此一來我們就不必每次都自己手動寫 action，也進而降低了 bug 產生的機率。

不過，如果每次使用 `useReducer` 都要自己寫出所有的 action creators 也挺麻煩的，所以我自己寫了一個 package 來省下這些工作。實際的使用方法如下：

```typescript
import type { PayloadAction } from 'quickly-use-reducer';
import { createSlice } from 'quickly-use-reducer';

const slice = createSlice([] as Todo[], {
  setTodos: (state, action: PayloadAction<Todo[]>) => action.payload,
  addTodo: (state, action: PayloadAction<Todo>) => [...state, action.payload],
  checkTodo: (state, action: PayloadAction<{ id: string; checked: boolean }>) => {
    const { id, checked } = action.payload;
    return state.map(todo => {
      if (todo.id === id) return { ...todo, isCompleted: checked };

      return todo;
    });
  },
  deleteTodo: (state, action: PayloadAction<string>) =>
    state.filter(todo => todo.id !== action.payload),
});

const {
  initialState,
  actionCreators: { setTodos, addTodo, checkTodo, deleteTodo },
  reducer,
} = slice;
```

使用 `createSlice` 就可以自動產生出對應的 action creator，除此之外也會自動產生出一個 `reducer` 去處理所有的 action。更詳細的說明可以到[這裡](https://github.com/jason89521/quickly-use-reducer)看看。

## 結語

一開始使用 `useReducer` 時確實會覺得有點麻煩，因為寫 reducer 時要用 switch 寫好幾個 case，除此之外還要手動新增 action creators。如果是用 javascript 寫的話還好，但是如果是用 typescript 寫的話就要定義一堆 type，不只寫起來麻煩，整份 code 的畫面看起來也很亂。不過這些問題都可以用 [quickly-use-reducer](https://www.npmjs.com/package/quickly-use-reducer) 解決，所以其實也沒有那麼麻煩。

總結來說，使用 `useReducer` 還是利大於弊。除了將更新 state 的邏輯集中管理以外，使用 `dispatch` 來取代 callback 還可以避免掉 re-render。但這僅限於處理複雜的 state，如果 state 的更新邏輯很簡單的話，建議還是直接使用 `useState` 就好。
