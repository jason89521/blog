---
title: 在 Next.js 內實作 Dark Mode
description: 在 Next.js app router 的架構下實作簡單的 Dark Mode
tags:
  - Next.js
---

這幾天用 Next.js 的 app router 建了這個 Blog，想說學東西的時候順便記錄一下，然後放上來。因為我自己覺得 light mode 看了眼睛很痛，所以不管用什麼 App 都會先看有沒有 dark mode 可以開。

這篇文章就是記錄一下我是怎麼在 Next.js app router 的架構下實作簡單的 Dark Mode。

## CSS variable

要實作 Dark Mode 最簡單的方法應該就是用 css variable 了吧，先在 `:root` 定義好 light mode 的 css variable ，接著看是要用 class(`.dark`) 或是 data attribute(`[data-theme="dark"]`) 的方式來重新定義 css variable 的值。

當使用者要切換 theme 的時候，只需要在 document element 上加上 class 或是 data attribute 就好。我在這個 Blog app 是選擇使用 data attribute 的方式。

## SSR

實作 dark mode 時，通常會記下使用者上次選擇的 theme ，然後在使用者下次進來 app 的時候，顯示對應的 theme，通常這個資料會用 localStorage 或 cookie 來存。

這邊要注意的是，用 localStorage 來存的話，使用者在第一次載入 app 的時候會有短暫的閃爍。舉例來說，當 App 預設的 theme 是 light，而 localStorage 存的是 dark 的話，在第一次載入 app 時，畫面會先是 light，接著我們拿到 localStorage 的資料時，把 data attribute 掛上去，這時候畫面才會轉為 dark mode。

這樣的使用者體驗其實不是很好，所以我們要解決這個問題。

### 在 `head` 插入 `script`

首先，我們應該要在 dom node 載入之前，先判斷要使用哪一個 theme。因此，我們需要在 `head` 裡面插入 `script`，確保在 dom 載入之前，我們可以正確地將 document element 掛上對應的 attribute。

```tsx layout.tsx
function getInitTheme(): Theme {
  const theme = localStorage.getItem('theme');
  if (!theme) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  return theme === 'dark' ? 'dark' : 'light';
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
const theme = (${getInitTheme.toString()})();
document.documentElement.dataset.theme = theme;
`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

加上這個 script 之後，我們就可以在 render 之前先更新 document element，避免出現閃爍的問題。但是，當你真的加上了這個 script 之後，你會發現，你獲得了 hydration warning ，這是因為 React 發現 `html` tag 出現了他沒有預期到的 `[data-theme="dark"]`，當你遇到這個問題時，你可以在 jsx 的 `html` tag 上加上 `suppressHydrationWarning={true}` 來告訴 React 可以忽略這個 hydration warning 。

> 加上這個 prop 會不會讓其他 hydration warning 被忽略？答案是不會的，只有被加上這個 prop 的 element 的 hydration warning 會被忽略而已。

### Toggle Button

最後，我們要加上 toggle button 來讓使用者可以切換 theme ，熟悉 React 的朋友應該很直覺的就會寫出以下的 code ：

```tsx
function ToggleButton() {
  const [theme, setTheme] = useTheme();
  const isDark = theme === 'dark';

  const handleClick = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return <button onClick={handleClick}>{isDark ? <Moon /> : <Sun />}</button>;
}
```

這樣會有一個問題，因為在 server 端我們不知道使用者偏好的 theme 是什麼，所以 SSR 渲染的會是 default 的 theme ，假設是 light ，所以 `button` 的 children 就會是 `<Sun />` ，然後 `useTheme()` 在 client 端執行的時候，因為可以拿到使用者偏好的 theme ，假設是 dark ，所以 `button` 的 children 就會是 `<Moon />`，這時候就會出現 client 和 server render 的畫面不一樣，導致 hydration error。

要避免這個問題的話，我們可以使用 css 來解決。

```css
[data-theme='dark'] [data-hide-on-theme='dark'],
[data-theme='light'] [data-hide-on-theme='light'] {
  display: none;
}
```

```tsx
<button onClick={handleClick}>
  <Moon data-hide-on-theme='light' />
  <Sun data-hide-on-theme='dark' />
</button>
```

這樣一來，不管使用者偏好的 theme 什麼，都不會出現 hydration error ，因為 `<Moon />` 和 `<Sun />` 不管在 client 端還是 server 端都會出現，不會因為 theme 不同而導致有一個會消失。
