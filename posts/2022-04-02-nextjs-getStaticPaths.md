---
title: Next.js 的 getStaticPaths
description: 如何使用 Next.js 中的 getStaticPaths 去預先渲染 dynamic routes 畫面。
tags:
  - Next.js
  - Page Router
---

如果想要 Next.js 在 server 端就產出網頁內容，並且又想使用 dynamic routes 的話，除了使用 `getStaticProps` 之外，還必須搭配 `getStaticPaths`，如此一來 Next.js 才會預先在 server 端就把畫面渲染出來。

那麼，在什麼樣的情況下會需要使用 `getStaticPaths` 呢？部落格就是一個很好的例子，我們將文章寫好後，透過 `getStaticPaths` 產生出所有文章的 paths，接著在 `getStaticProps` 就可以根據 path 去 render 不同的頁面。[Next.js](https://nextjs.org/docs/basic-features/data-fetching/get-static-paths#when-should-i-use-getstaticpaths)也有列出一些應該使用 `getStaticPaths` 的情況，有興趣的讀者可以點擊連結去看看。

本篇文章不會介紹什麼是 Next.js，而會著重在如何使用 `getStaticPaths`，所以如果讀者不知道什麼是 Next.js 的話，推薦先去 Next.js 的 [Learn Course](https://nextjs.org/learn/basics/create-nextjs-app) 學習。

## 檔案結構

接下來會以部落格做為例子來講解，以下是專案的檔案結構：

- pages
  - [post].tsx
  - index.tsx
- posts
  - foo.md
  - bar.md
- 其餘資料夾及檔案

## [post].tsx

在[post].tsx 中除了要 export page component 之外，還需要 export `getStaticPaths` 以及 `getStaticProps`。

```tsx
type Props = {
  metadata: PostMetadata;
  content: string;
};

type Query = {
  post: string;
};

export const getStaticPaths: GetStaticPaths<Query> = async () => {
  // ...
};

export const getStaticProps: GetStaticProps<Props, Query> = async ({ params }) => {
  // ...
};

const Post: NextPage<Props> = ({ metadata, content }) => {
  // ...
};

export default Post;
```

### `getStaticPaths`

`getStaticPaths` 需要回傳一個 object，這個 object 需要包含 `paths` 和 `fallback`，其中 `paths` 是用來決定哪些 paths 會 pre-rendered，而 `fallback` 則是用來決定那些沒有 pre-rendered 的 path 要如何顯示。

```tsx
export const getStaticPaths: GetStaticPaths<Query> = async () => {
  return {
    paths: [{ params: { post: 'foo' } }, { params: { post: 'bar' } }],
    fallback: false,
  };
};
```

由於 dynamic routes 的檔案名稱叫做[post].tsx，在 `params` 中就一定要有 `post` 這個 property，否則 dynamic routes 就會失效。至於 `fallback` 總共有三種值可以傳入，`true`, `false` 和 `'blocking'`，這邊傳入 `false` 代表任何不是從 `getStaticPaths` 回傳的 paths 都會被導向 404 page，如果有讀者想更深入了解 `fallback` 的話，可以到[這裡](https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-false)看看。

### `getStaticProps`

接著我們就可以依據在 `getStaticPaths` 中獲得的 `params` 來回傳 page component 所需要的 Props。

```tsx
export const getStaticProps: GetStaticProps<Props, Query> = async ({ params }) => {
  if (!params) return { notFound: true };

  const post = params.post;
  const { metadata, content } = getPostData(post);
  return {
    props: {
      metadata,
      content,
    },
  };
};
```

上面的 `getPostData` 會回傳 `posts/foo.md` 或是 `posts/bar.md` 中的 metadata 以及內容，由於本篇文章的主題是介紹 `getStaticProps`，所以就不多做贅述。

### `Post`

最後就是 `Post` component 根據 `getStaticProps` 回傳的 props 來去渲染畫面。

```tsx
const Post: NextPage<Props> = ({ metadata, content }) => {
  const { title, description } = metadata;
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
      </Head>

      <Markdown>{content}</Markdown>
    </div>
  );
};
```

## 結語

由於這篇文章只是想用來記錄怎麼使用 `getStaticPaths`，所以省略了很多東西。例如在 `getStaticPaths` 中應該是不太會把所有 paths 都寫死，以部落格為例子的話，通常是讀取 posts 資料夾中所有的檔案，接著去掉副檔名後用檔案名稱來當作 path。

另外，其實這個網站就是用 Next.js 寫的，部落格的部分也有使用 `getStaticPaths`，雖然寫得可能沒有很好，但如果讀者有興趣的話可以到[這裡](https://github.com/jason89521/personal-website)看看。
