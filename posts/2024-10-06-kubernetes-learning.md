---
title: 初學 Kubernetes
description: 因為之前工作上常常用到 K8s，自己在用的時候其實不太懂，所以學一下相關知識
tags:
  - K8s
  - DevOps
---

之前工作上還滿常用到 K8s 的，但我其實只會用 `kubectl get pods` 或是 `kubectl describe pod` 這兩個指令，想說好像有點太廢，所以來學一下 K8s 相關知識。

## Pod

K8s 的最小單位，一個 Pod 裡面可以有多個 containers。當我們需要 scaling up 時，是直接建立新的 pod，而不是建立新的 container。

### 建立方法

可以寫 `.yaml` 檔來建立新的 pod

```yaml pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
    tier: frontend
spec:
  containers:
    - name: nginx
      image: nginx
```

接著執行 `kubectl apply -f pod.yaml` 就會建立對應的 pod 了。

也可以使用 `kubectl run nginx --image nginx` 直接建立 pod，如果用這個方法建立 pod 之後，又想要得到 pod 的設定檔的話，可以執行 `kubectl get pod nginx -o yaml > pod.yaml` ，這樣就會把對應的設定檔寫到 `pod.yaml` 裡。

### 更新方法

如果有設定檔的話，只需要更改設定檔，並且重新 apply 就可以更新 pod 了。如果想要直接更新 pod 的話，也可以執行 `kubectl edit pod nginx`，這個指令會直接打開文字編輯器讓我們可以直接編輯 pod。

### Commands & Arguments

在使用 docker 執行 image 時，我們是可以覆蓋掉 entrypoint 和 cmd 的，如果我們想要讓 pod 覆蓋它們的話可以這樣寫：

```yaml
spec:
  containers:
    - name: ubuntu-sleeper
      image: ubuntu-sleeper
      command: ['sleep2.0'] # 覆蓋 entrypoint
      args: ['10'] # 覆蓋 command
```

### Environment Variables

```yaml
spec:
  containers:
    - name: web-app
      image: web-app
      env:
        - name: APP_COLOR
          value: green
```

我們也可以使用 ConfigMap 來把環境變數的設定存起來，而不用直接寫在 pod 的定義檔裡面

```yaml config-map.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_COLOR: blue
  APP_MODE: prod
```

接著執行 `kubectl create -f config-map.yaml` 建立 ConfigMap 後，修改 pod 的定義檔。

```yaml pod.yaml
spec:
  containers:
    - name: web-app
      image: web-app
      envFrom:
        - configMapRef:
            name: app-config
```

### Secrets

Secret 和 ConfigMap 滿類似的，但通常一些比較敏感的資料都會用 secret 來存。另外 K8s 針對 secret 也會有一套安全機制來保護這些資訊被任意 access。

```yaml
apiVersion: 1
kind: Secret
metadata:
  name: app-secret
data:
  DB_PASSWORD: bXlwYXNzd29yZDEyMzQ=
```

```yaml
spec:
  containers:
    - name: webapp
      image: webapp
      envFrom:
        - secretRef:
            name: app-secret
```

和 ConfigMap 直接存明碼不一樣，secret 會存 base64 encode 過後的結果。有需要的話，也可以設定 K8s，讓 secret 真的被加密過。

### Readiness Probe

通常當 container 順利建立之後，K8s 會預設這個 pod 已經可以 access 了，但在有些情況下，container 建立並不代表我們的應有已經 ready 了，這時候可以設定 `readinessProbe` 來告訴 K8s 這個 pod 到底 ready 了沒。

```yaml
containers:
  - name: webapp
    image: webapp
    ports:
      - containerPort: 8080
    readinessProbe:
      httpGet:
        path: /api/ready
        port: 8080
```

### Liveness Probe

Readiness probe 只能在 pod 建立初期告訴 K8s 這個 pod 是不是可以開始被 access 了，如果 app 在執行的過程中掛了，K8s 並不會知道，所以會繼續 serve 壞掉的 app，這會讓使用者 access 到壞掉的 app。

為了要讓 K8s 知道這個 pod 是不是健康的，我們可以加上 liveness probe。

```yaml
containers:
  - name: webapp
    image: webapp
    ports:
      - containerPort: 8080
    livenessProbe:
      httpGet:
        path: /api/healthy
        port: 8080
```

### Logging

輸入 `kubectl logs -f my-pod` 可以查看 pod 的 log，但如果一個 pod 有多個 container 的話，我們就需要指定要看哪個 container 的 log，不然這個指令會 fail，輸入 `kubectl logs -f my-pod first-container` 來指定要查看哪個 container 的 log。

## ReplicaSets

ReplicaSets 確保了正在執行中的 pods 是不是有符合我們預期的數量。假如我們預期應該要有兩個 nginx 的 pods 執行，但其中一個 pod 被不小心停掉了， ReplicaSets 就會自動幫我們重啟一個新的 pod ，讓 pods 的數量保持在兩個。

### 建立方法

```yaml replica-set.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: myapp-replicaset
  labels:
    app: myapp
    type: front-end
spec:
  template:
    metadata:
      name: myapp-pod
      labels:
        app: myapp
        type: front-end
    spec:
      containers:
        - name: nginx-container
          image: nginx
  replicas: 3
  selector:
    matchLabels:
      type: front-end
```

執行 `kubectl create -f replica-set.yaml`。

### 更新方法

`kubectl edit myapp-replicaset` 或是更改 yaml 檔之後執行 `kubectl replace -f replica-set.yaml`。

## Jobs

當我們需要 pod 來執行某些 task，並且這些 pod 在執行完任務後不需要重啟，這時候可以建立 Job。和 Replica set 不同 Job 不會讓 pod 維持在 running 的狀態，只會確保指定數量的 pod 完成。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: math-add-job
spec:
  completions: 3
  parallelism: 3
  template:
    spec:
      containers:
        - name: math-add
          image: ubuntu
          command: ['expr', '3', '+', '2']
      restartPolicy: Never
```

### CronJobs

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: pi
spec:
  schedule: '* * * * *'
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: hello
              image: busybox:1.28
              imagePullPolicy: IfNotPresent
              command:
                - /bin/sh
                - -c
                - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure
```

## Deployment

想像一下我們有一個 web app 的服務需要升級，為了讓使用者在升級的過程中也能 access 到 web app，我們不太可能直接把所有 pod 砍掉，然後重新部署，這樣會導致我們的 web app 會有一段時間是完全沒辦法 access 的。因此，我們需要 rolling update。

前面有提到 pod 是最小單位，而 replica set 則是去管理 pod，我們可以把 deployment 想成是更高層級的架構，來管理 replica set 和 pod。

### 建立方法

```yaml deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
  labels:
    app: myapp
    type: front-end
spec:
  template:
    metadata:
      name: myapp-pod
      labels:
        app: myapp
        type: front-end
    spec:
      containers:
        - name: nginx-container
          image: nginx
  replicas: 3
  selector:
    matchLabels:
      type: front-end
```

執行 `kubectl create -f deployment.yaml`，不想寫一個 yaml 檔的話也可以直接執行 `kubectl create deployment myapp-frontend --image nginx --replicas=3`。

### Rolling Update Or Recreate

當我們有新版本的 app 要上線時，可以選擇要怎麼部署這個新版本。Rolling update 會把 pod 一個一個更新，所以在更新的過程中，使用者還是可以 access 到我們的服務，因為 pod 不會一次全部砍掉；而 Recreate 則是把所有 pod 一次砍掉，然後部署新的 pod，在新的 pod 準備好之前，使用者是無法 access 到我們的服務的。

#### Blue Green Strategy

Blue Green Strategy 的做法是，將新版本部署好，並且都測試好之後再將服務導向新版本的 app。K8s 並沒有這項 strategy，但我們可以先將新版本的 app deploy 好，確認沒問題之後再修改 service，一樣能達到相同效果。

#### Canary Strategy

Canary Strategy 是把少部分的流量導向新的 app 上，當確認新版本的 app 沒問題後，再將流量全部導向新版本的 app。同樣的，K8s 並沒有這項 strategy，但我們能讓 service 指向相同的 label，然後在新版本的 deployment 中，將 replica 社少一點，這樣就能達成一樣的效果。

## Service

### NodePort

當我們建立 pod 之後，並不代表 pod 建立的應用可以被外部 access，我們要透過 `NodePort` service 來讓我們的 pod 的服務可以被外部 access。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: NodePort
  ports:
    - targetPort: 80 # pod 的 application 的 port
      port: 80 # cluster 內可以 access application 的 port
      nodePort: 30008 # 對外開放的 port
  selector:
    app: myapp-pod
    type: front-end
```

### ClusterIP

現在我們有一個 full-stack 的專案，這個專案有不同類型的 pod，frontend, backend 和 database，為了讓這些 pods 能夠互相溝通，我們需要建立一個 `ClusterIP` service。

為什麼我們不能直接指定要連到哪個 pod 呢？因為 pod 建立時的 IP address 可能每次都不一樣，所以我們才會需要 `ClusterIP` service 來幫我們管理要怎麼連到這些 pod。

```yaml
apiVersion: v1
kind: Service
metadata: back-end
spec:
  type: ClusterIP
  ports:
    - targetPort: 80
      port: 80
  selector:
    app: myapp
    type: back-end
```

## Ingress

假設現在我們有一個賣衣服的網站，我們透過 load balancer 來讓這個網站可以被外部使用者 access，這時候使用者可以透過 ip 來 access 到這個網站，但我們通常不會希望使用者是透過 ip 來使用我們的網站，所以我們會讓 DNS 把 server 指到對應的 ip。

如果在同一個 domain 下，除了賣衣服以外還有其他服務呢？而且我們希望這些服務都可以隸屬於同一個 cluster 底下。這時候我們又建立了一個新的 load balancer，然後建立一個 proxy server 來分配不同的 path 到不同的服務，最後設定 DNS 指向這個 proxy server。

每次我們要建立新服務，就要重新設定這些東西，這時候我們可以透過 Ingress 來解決這些煩惱。Ingress 幫助我們在 k8s 內解決上述的問題，然後透過 ingress controller expose 我們的服務。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    kubernetes.io/ingress.global-static-ip-name: my-app-ip
    networking.gke.io/managed-certificates: managed-cert
    kubernetes.io/ingress.class: 'gce'
spec:
  ingressClassName: 'gce'
  rules:
    - host: www.domain.com
      http:
        paths:
          - path: /path1
            pathType: Prefix
            backend:
              service:
                name: service-1
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: service-default
                port:
                  number: 80
```

## Namespace

如果我們想建立相同的 deployment 或 pod 等等，但又想要把它們分開來的話，例如開發環境和生產環境，可以使用 namespace。在同一個 namespace 底下的 pods 可以互相 access，如果沒有特別指定的話，是不能 access 到另外一個 namespace 的。

### 建立方法

```yaml namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev
```

執行 `kubectl create -f namespace.yaml`，或者直接執行 `kubectl create namespace dev` 也可以。

如果要查看某個 namespace 底下有幾個 pods，可以執行 `kubectl get pods --namespace=dev`，不過如果每次都要加上 flag 確實是蠻麻煩的，所以我們可以執行這個 command，`kubectl config set-context ${kubectl config current-context} --namespace=dev` ，切換到指定的 namespace，這樣以來就不用每次都指定 namespace 了。

## Taints & Toleration

如果需要某些 node 只能包含特定的 pod，就會需要設定 taint & toleration， taint 作用於 node 上，而 toleration 作用於 pod 上。可以把 taint 想像成把一個 node 變成一個有毒的環境，如果 pod 沒有帶上特定的 toleration 的話，是沒辦法進入這個 node 的。

### Taint - Node

```bash
kubectl taint nodes node-name key=value:taint-effect
```

### Toleration - Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
    - name: nginx-container
      image: nginx

  tolerations:
    - key: 'app'
      operator: 'Equal'
      value: 'blue'
      effect: 'NoSchedule'
```

## Node Selectors

Taints & Toleration 只能決定 pod 不能進去哪些 node，如果我們想要指定 pod 只能被放到某個 node 的話，可以使用 node selectors

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
    - name: myapp
      image: myapp

  nodeSelector:
    size: Large
```

`nodeSelector` 是對應到 node 的 label，要幫 node 上 label 的話，可以執行 `kubectl label nodes node1 size=large`

## Node Affinity

用 node selector 可以很簡單地指定 pod 要去哪個 node ，但如果我們有更複雜的情境，例如：size 可以是 large 或 medium, size 不可以是 small 等等，這時候我們可以使用 node affinity。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
    - name: myapp
      image: myapp
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: size
                operator: In
                values:
                  - Large
                  - Medium
```

`requiredDuringSchedulingIgnoredDuringExecution` 表示決定 pod 要放在哪裡時，node 一定要有對應的 label，但如果 pod 已經在某個 node 底下執行，這時候 node 的 label 被改變了，已經不符合 pod 定義檔裡面的要求，不會把這個 pod 砍掉。

## 結語

老實講這些東西只要過一陣子沒用的話，絕對馬上又忘記了，畢竟只是透過看看影片，讀讀文章來了解的東西，沒有真正動手做基本上不太可能記住。

我建議對 k8s 有興趣的人可以去辦一個 GCP 帳號，透過前三個月的 300 美 credits 來玩一下 GKE，真的部署一個 app，然後透過 ingress 把 path 指向不同的服務，這樣來來回回雖然不會精通 k8s，但一些常用的指令也差不多搞懂了。
