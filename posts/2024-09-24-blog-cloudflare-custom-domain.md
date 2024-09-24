---
title: Cloudflare domain & Vercel
description: 記錄一下在 Cloudflare 購買 domain 並且把 Blog 部署到 Vercel
---

這幾天在 Cloudflare 上買了一個 domain ，也就是各位目前看到的 yuxuanzheng.dev，想說把部落格搬來這裡，所以寫了一個新 site 然後部署到 Vercel，這篇文章就是單純記錄一下這個過程。

## 部署到 Vercel

這個沒什麼好講的，就只是連到 GitHub repo ，然後 Vercel 會自動部署這樣，輕鬆愜意。

## 加上 Cloudflare domain

這邊我一開始是先參考這個 [gist](https://gist.github.com/nivethan-me/a56f18b3ffbad04bf5f35085972ceb4d)，接著瀏覽器就出現了 `Too many redirect` 的錯誤。後來照著這個錯誤去查，才知道 Cloudflare SSL/TLS 要設定成 `Full`。

本來以為這樣就結束了，殊不知是惡夢的開始，我還是一直遇到一樣的問題，搞了我兩三個小時都解決不了，明明已經設定成 Full 了，但還是一直出現 `Too many redirect`。

## 解決方法

瀏覽器 devtool 打開，點 network，點 disable cache ，refresh ，結束。

沒錯，就是這麼簡單，但我一開始完全忘記有這可能，到處去查資料還找不到問題。踩到這個問題之後，我覺得我以後每次遇到問題都會先 disable cache 了 💩
