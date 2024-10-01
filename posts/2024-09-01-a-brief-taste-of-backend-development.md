---
title: 淺嚐後端
description: 記錄學習後端的過程
tags:
  - Backend
  - Learning
---

之前有提到我前端的知識都是在 [The Odin Project](https://www.theodinproject.com/dashboard) 學的，其實這個網站除了前端的知識以外，也有後端的教學。趁著這次放暑假，我快速的把後端的部分看過一遍，然後做其中一個 [project](https://www.theodinproject.com/lessons/nodejs-messaging-app) 試試水溫。

## 課程簡述

### Database

教學選擇使用的 database 是 PostgreSQL。其實以前就大概知道 relational database 和 non-relational database，只是一直都沒有自己操作過，SQL 也只知道 `SELECT * FROM table;` ，基本上就是跟資料庫完全不熟。

除了 The Odin Project 以外，我還有跟朋友借了 Udemy 的帳號來看一下 PostgreSQL 的課程，現在的程度大概就是看得懂基本的 SQL ，然後會建 table 而已~~好像也沒學了什麼~~ 。

### Backend Framework

這邊是用 Express 作為後端的 framework，以前在工作的時候就有接觸到一點點，只不過工作上是使用 Koa，大概知道 middleware, controller 那些概念。題外話，感覺 87 % 的後端教學都是使用 Express。

### Auth

這邊就是教 passport.js 和一點點的 JWT

## 實作專案

其實 The Odin Project 每教完一部分都會有一個 project 練習，但我想要用一個 project 來做所有學到的東西，所以直接從後面的 [Full Stack Projects](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs#full-stack-projects) 開始做。這裡我挑的是做一個聊天室。

### Database 設計

因為不打算做太複雜，所以這個聊天室的功能就只有以下：

- 登入
- 查看有哪些使用者
- 開啟一個聊天室跟其中一個使用者聊天

以下是 prisma 的 schema

```prisma
model User {
  id         Int       @id @default(autoincrement())
  createdAt  DateTime  @default(now()) @db.Timestamptz()
  updatedAt  DateTime  @default(now()) @db.Timestamptz()
  username   String    @unique @db.VarChar(30)
  password   String
  bio        String    @default("") @db.VarChar(400)
  messages   Message[]
  chats      Chat[]
  chatAdmins Chat[]    @relation(name: "admin")

  @@map("users")
}

model Chat {
  id       String    @id @default(uuid())
  name     String    @db.VarChar(50)
  admin    User      @relation(name: "admin", fields: [adminId], references: [id])
  adminId  Int
  users    User[]
  messages Message[]

  @@map("chats")
}

model Message {
  id        String   @id @default(uuid())
  content   String   @db.VarChar(1000)
  createdAt DateTime @default(now()) @db.Timestamptz()
  updatedAt DateTime @default(now()) @db.Timestamptz()
  chat      Chat     @relation(fields: [chatId], references: [id])
  chatId    String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int

  @@map("messages")
}
```

聊天室如果只有兩個人的話， `Chat` 其實可以直接 reference 兩個 user 就好，但因為我原本想說要做群聊，所以就把 relation 做成 many-to-many。本來還想說要做管理員，所以有加 admin，然後 admin 可以更改聊天室的名字，~~只能說理想很豐滿，現實很骨感。~~

其實我感覺資料庫最有趣的地方應該會是這裡，設計一個好的資料庫，讓之後要加新功能的時候不用改太多。會有這種感覺是因為我開發到一半的時候發現資料庫好像設計得不好，然後就要把資料庫某些 table 砍了，或是發現缺了某些重要的 column 等等。

### Auth

課程是要求使用 JWT 做 auth，然後為了方便，把 JWT 存在前端的 localStorage 就好。我剛看到 JWT 的時候就想說要存在哪裡比較好，查了一下發現存在 localStorage 要注意 XSS 攻擊，存在 cookie 的話要注意 CSRF 攻擊，這兩個攻擊我以前其實不是很清楚，這次查下去才大概了解。

現在的做法好像是會有 access token, refresh token 和 csrf token，~~但我懶，所以直接存 localStorage。~~

### Socket

其實課程沒有要求要用 socket ，只是我想說不然就順便做一做。不過我這裡也只是做最基本的，而且我假設所有 user 都會連到同一台伺服器，如果伺服器有 auto scaling 的功能的話，這邊就直接爆了。

### Vue

這不在課程裡面，甚至 The Odin Project 教的前端 framework 根本不是 Vue ，而是 React。會提到 Vue 只是因為我下一份工作要寫 Vue ，想說趁這次學後端的東西，把 Vue 碰一下。

寫起來的心得是，我還是比較喜歡寫 React 的感覺，寫 Vue 感覺不像在寫 JS ，好怪。

## 總結

以前覺得做前端 feature 好無聊，感覺都大同小異，沒什麼有趣的地方。最近發現有這種想法其實滿蠢的，因為這代表我對 App 的理解就是只有那些 feature，自己不去看 code 裡面的其他東西。例如這次學 JWT 才知道 csrf 攻擊，這些防範在 code 裡面肯定會有，我卻因為根本不知道，所以沒去看。

~~結論就是多學，少哭夭。~~
