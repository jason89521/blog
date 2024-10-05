---
title: 學習 Docker
description: 記錄一下學習到的 Docker 相關知識
tags:
  - Docker
  - DevOps
---

之前工作的時候偶爾會碰到 Docker 和 K8s ，但其實都不是自己設定的，只會下一些簡單的指令，背後在做什麼也一知半解，最近想要把它搞懂，所以記錄一下學到的知識。

## 什麼是 Docker

根據官方的解釋，Docker 就是能讓我們快速開發、迭代 applications 的平台。它將 applications 從我們的開發環境中抽離出來，讓我們不再因為開發環境不同，導致要花更多的時間在部署上面。

舉例來說，有時候可能會遇到某個 application 在 A 的電腦上可以跑，但在 B 的電腦上卻不行。Docker 可以將 application 和對應的環境打包成 container ，如此一來 A 和 B 就可以在相同的環境下執行一樣的 application。

### Container

Container 其實跟 VM 滿像的，差別在於，VM 是直接模擬一個完整的 OS，並且跑在模擬的硬體上，所以啟動一個 VM 或要複製一個 VM 要耗費的成本滿大的。

而 container 是直接跑在 Host 的 OS 上，所以不用像 VM 一樣模擬整個 OS 和硬體，也因此比較輕量。

> Docker 其實會起一個 Linux 來跑 container 。

### Docker Image

我們可以把 Docker image 想像成 application 的 template，包含了檔案、作業系統、相依套件還有執行檔等等，接著我們依照這個 template 去建立一個 container。

### Volume

Containers 預設是 stateless 的，也就是說，當 container 被停止之後，所有的狀態都會被清空，當我們重新啟動 container 時，並不會有上一次運行時所記錄的東西。舉例來說，當我在第一次啟動 container 時，application 寫了一份 `test.txt` 檔案，當我重啟 container，這個檔案不會存在。

然而，有些 container 可能會需要把這些更動存下來，例如 database，我們不會希望 database 的 container 被停止後，所有的資料就不見了，對吧？

因此，Docker 提供了兩種儲存方式：

- Volumes：由 Docker 管理的檔案系統
- Bind mounts：綁定到 Host machine 上的檔案或資料夾

通常在 production 環境下會使用 Volumes，在開發環境上使用 bind mounts 會比較方便。

> 不同的 container 是可以指向相同的 volume 或是 bind mount 的，如果 container 寫到相同的檔案的話可能會出問題。

### Network

Docker 會建立一個虛擬的網路環境，並且將每個運行中的 container 綁定一個獨立的 IP address，所以 container 之間是可以互相溝通的。然而 Docker 的 IP addresses 是隨機的，每一次啟動 container 可能都會被綁到不同的 IP address 上，一個比較簡單的解決方法是建立一個虛擬的 Docker 網路，然後把需要溝通的 container 都加進這個網路之中，如此一來我們就可以透過 container 的名字來進行溝通。

container 的 port 預設是不會 expose 到 host 上的，但我們也可以 expose container 的 port，讓 host 可以 access 到 container 正在執行的應用。

假設現在我們有兩個 container：

- Next.js，跑在 port 3000 上
- mysql，跑在 port 3306 上

Next.js 會需要使用到 mysql，所以將這兩個 container 綁在同一個網路下，但在 production 環境上，我們希望只有 Next.js app 可以被外部 access，所以我們可以選擇只 expose 3000 port，這樣一來外部就只能 access Next.js 的 container，而 mysql database 的 container 不會。

### Docker Compose

通常一個應用可能會需要啟動多個 containers，如果我們用 `docker` command 一個一個啟動的話其實滿麻煩的，所以我們可以透過 Docker Compose 來指定有哪些 containers 要啟動，通常 Docker Compose 的設定檔會叫做 `docker-compose.yaml`。

#### Orchestration

Docker Compose 只能做到很基本的 containers 管理，如果要更強大的功能，我們會需要使用到其他的 tools，例如

- Docker Swarm
- Kubernetes

## 常用指令

### `docker run`

執行 container

#### `-p`

export container 的 port ，讓主機也能 access 到 container 的 port。

```bash
docker run -p 8080:80 docker/welcome-to-docker # 讓主機的 8080 port 連到 container 的 80 port
```

#### `-it`

執行 container 後，保留在 foreground，如果沒有 specify 這個 flag 的話，執行 `docker run` 之後，container 會在背景執行。

```bash
docker run -it docker/welcome-to-docker
```

#### `-e`

定義環境變數

```bash
docker run -e MY_PASSWORD=mysecret docker/welcome-to-docker
```

#### `--rm`

當 container 停止時，刪除 container。

```bash
docker run --rm docker/welcome-to-docker
```

### `docker container ls` or `docker ps`

列出所有正在執行的 containers。`-a` 可以列出沒有在執行的 container。

### `docker container restart|stop ...CONTAINERS`

重啟或停止對應的 containers，可以重啟多個。

### `docker container rm CONTAINER`

刪掉 container。

### `docker container prune`

刪除所有已經停止執行的 containers。

### `docker network create --driver bridge mysqlnet`

建立一個 docker network，`driver` 可以設定成 `bridge` 或是 `overlay`。如果要讓 container 連到這個網路，需要 `--net`:

```bash
docker run --rm --name mysql --net mysqlnet mysql
```

## 結語

剩下的東西邊實作邊補，其實前陣子就有去稍微看過一下 Docker 的東西，但是久沒用又忘記了，感覺需要常常練習才會記得。
