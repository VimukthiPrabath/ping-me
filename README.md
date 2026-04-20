# 🚀 PingMe - Distributed Website Health Monitor

PingMe is a high-performance, real-time website health monitoring system built with a modern **Microservices Architecture**. It continuously monitors website availability, tracks latency, and sends instant alerts via Telegram if any service goes down.

![PingMe Banner](https://socialify.git.ci/VimukthiPrabath/ping-me/image?description=1&font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Dark)

## 🛠 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- **Real-time Dashboard:** Live status updates every 5 seconds without page refreshes.
- **Microservices Design:** Decoupled architecture with independent Worker, Database, and Frontend layers.
- **Instant Notifications:** Automatic Telegram alerts sent to your phone when a website is unreachable.
- **Dockerized Setup:** Spin up the entire monitoring stack with a single command.
- **Latency Tracking:** Real-time ping (latency) measurement for every monitored service.

## 🏗 System Architecture

The system utilizes a microservices approach to ensure scalability and reliability:

1. **Frontend (Next.js):** A sleek, dark-mode dashboard that fetches live data from Redis via an internal API.
2. **Worker (Python):** The monitoring engine that performs health checks every 2 minutes.
3. **Redis:** The central data hub that provides high-speed data exchange between the worker and the dashboard.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed.
- A Telegram Bot API Token (get it from [@BotFather](https://t.me/botfather)).

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/](https://github.com/)[YOUR_GITHUB_USERNAME]/ping-me.git
   cd ping-me
   ```
2. **Configure Environment Variables:**
    open ```worker/main.py``` and update your Telegram credentials
   ```python
   BOT_TOKEN = "your_bot_token_here"
   CHAT_ID = "your_chat_id_here"
   ```
3. **Luanch with Docker:**
    ```bash
   docker-compose up --build
    ```
4. **Access the Dashboard:**
   open your browser ```http://localhost:3000```.

📸 Dashboard Preview
<img width="1899" height="1017" alt="image" src="https://github.com/user-attachments/assets/e8938431-aa7f-4442-a166-34fe4593d312" />

Alert Preview
<img width="535" height="953" alt="image" src="https://github.com/user-attachments/assets/18d3ed25-fea4-45ad-94d9-f093f484f406" /> <img width="489" height="1076" alt="image" src="https://github.com/user-attachments/assets/da52cc72-2822-4b4e-a8c8-7ef16230ae29" />



