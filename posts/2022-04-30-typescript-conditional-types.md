!title typescript 的 conditional types
!description 記錄在開發 package 時所學到的 conditional types

# !excerpt

最近在開發一個簡化使用 `useReducer` 流程的 package，雖然實作起來不難，但是想要讓它能夠有很好的 type definition 卻不是一件簡單的事。

那麼，為什麼一定要有良好的 type definition 呢？就算沒有，這個 package 不是也能 work 嗎？確實，即便沒有 type definition，這個 package 也能夠正常使用。然而，我認為身為一個 package developer，除了提供 package 的功能以外，也應該要提供良好的開發者體驗。

# !content

## 什麼是 conditional types

熟悉 javascript 的讀者應該對於 conditional expression 不陌生：

```js
condition ? trueExpression : falseExpression;
```

簡單來說就是當 `condition` 成立時，我們會得到 `trueExpression` 的值，而當 `condition` 沒有成立時，我們會得到 `falseExpression` 的值。

typescript 的 conditional types 其實也是一樣的，我們來看看官方給的例子：

```ts
interface Animal {
  live(): void;
}
interface Dog extends Animal {
  woof(): void;
}
type Example1 = Dog extends Animal ? number : string;
type Example2 = RegExp extends Animal ? number : string;
```

在上面的例子中，因為 `Dog` 是 `Animal` 的 extension，所以 `Example1` 的 type 會是 `number`。而 `RegExp` 不是 `Animal` 的 extension，所以 `Example2` 的 type 會是 `string`。

conditional types 通常會搭配著 [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) 使用：

```ts
interface IdLabel {
  id: number /* some fields */;
}
interface NameLabel {
  name: string /* other fields */;
}
type NameOrId<T extends number | string> = T extends number ? IdLabel : NameLabel;

function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
  throw 'unimplemented';
}

const a = createLabel('typescript');
const b = createLabel(2.8);
const c = createLabel(Math.random() ? 'hello' : 42);
```

當傳入 `string` 進去 `createLabel` 時，`createLabel` 的回傳值的 type 會是 `NameOrId<string>`，也就是 `NameLabel`。以此類推，當傳入值的 type 為 `number` 時，就會得到 type 為 `IdLabel` 的回傳值。而當傳入值的 type 為 `number | string` 時，則會得到 type 為 `NameLabel | IdLabel` 的回傳值。

## 在 conditional types 中使用 `infer`

除了 conditional types 以外， typescript 還提供了一個好用的 keyword 叫做 `infer`。 `infer` 可以讓我們指出在 condition 中的哪個部分可以用在 `trueExpression` 中：

```ts
type ReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
```

在上面的例子中，如果 `ReturnType<F>` 的 `F` 是一個 function 的話，它所代表的 type 就是 `F` 的回傳值。

## 結語

其實原本是想要分享開發 [use-case-reducers](https://github.com/jason89521/use-case-reducers) 時，在 type definition 上面遇到的問題，順便解釋什麼是 conditional types。但後來發現這樣子文章好像會變得很長，而且 `use-case-reducers` 也還不算完全開發完，所以就先把 conditional types 拿出來講，之後應該還會再發一篇 `use-case-reducers` 的開發心得。
