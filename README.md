# 🧠 Print AI Assessment

AI Agent capable of finding information about books using advanced web scraping techniques and retrieving real-time trending headlines or news using Selenium from sources like Hacker News. It features a minimalistic and comfortable user interface for interacting with the agent.

## ✨ Features

* **Book Search:** Find information about books using various criteria.
* **Real-time News/Trends:** Get the latest headlines from sources like Hacker News.
* **Minimalistic Chat Interface:** Easy-to-use interface for interacting with the AI agent.

## 💻 Technologic Stack

This project utilizes a modern technology stack to deliver a robust and efficient AI agent:

* **Data:** Redis - Used as a high-performance in-memory data structure store, used here for caching or storing retrieved information.
* **Backend:** FastAPI - A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
  * Selenium: Used for automating web browsers to perform web scraping tasks.
  * Requests: A simple, yet elegant HTTP library for Python.
  * N8N: Workflow automation tool used for handling webhooks and potentially orchestrating data flow.
* **Frontend:** React w/ Vite + Axios - A fast and efficient frontend development setup using React with Vite as a build tool and Axios for making HTTP requests.
* **DevOps:** Docker - Used for containerizing the application and its dependencies, ensuring consistent environments and simplifying deployment.

## 🚀 Setup instructions

To get the project up and running, follow these steps:

### Environment vars

* General:

```env
REDIS_HOST = redis
REDIS_PORT = 6379

N8N_BASIC_AUTH_ACTIVE = true
N8N_BASIC_AUTH_USER = admin
N8N_BASIC_AUTH_PASSWORD = admin
N8N_HOST = n8n
N8N_HOST_EXTERNAL = localhost
N8N_PORT_EXTERNAL = 5678
N8N_PORT = 5678
N8N_SECURE_COOKIE = false

REMOTE_DRIVER_URL=http://selenium:4444/wd/hub
```

* Backend:

```env
REDIS_HOST = 127.0.0.1
REDIS_PORT = 6379
```

* Frontend

```env
VITE_N8N_WEBHOOK_URL=http://route-to-n8n-webhook
```

### Start the project

Once the environment variables are set, you can start the project using Docker Compose:

**Command**:

```bash
docker-compose up -d
```

The `-d` flag runs the services in detached mode.

## 📂 Project Structure

```plaintext
.
├── backend/
├── frontend/
├── workflows/
├── docker-compose.yml
└── README.md
```

* `backend/`: Contains the code for the FastAPI backend application.
* `frontend/`: Contains the code for the React frontend application.
* `workflows/`: Contains configuration or data related to the N8N workflows.
* `docker-compose.yml`: Defines the services, networks, and volumes for the Dockerized application.
* `README.md`: This file.

## 💬 Example queries

### Example 1

**Question**: "Find me a mystery book under £10"

**Answer**: "I have looked through the available mystery books, and unfortunately, I could only find one that is priced under £10:
Tastes Like Fear (DI Marnie Rome #3)
Mystery
10.69"

### Example 2

**Question**: "Find me a book about science under £15"

**Answer**: "I found some science books for you, and these are under £15:
The Grand Design
Science
13.76

The Elegant Universe: Superstrings, Hidden Dimensions, and the Quest for the Ultimate Theory
Science
13.03

The Origin of Species
Science
10.01

I hope you like them! 🤩"

### Example 3

**Question**: "Show me trending tech headlines"

**Answer**: "Here are the trending headlines from Hacker News. 📰
Synology Lost the Plot with Hard Drive Locking Move
Score: 454
Read Article

Attacking My Landlord's Boiler
Score: 141
Read Article

Evertop: E-ink IBM XT clone with 100+ hours of battery life
Score: 410
Read Article

Verus: Verified Rust for low-level systems code
Score: 68
Read Article

Welcome to our website for the 1963 BBC MCR21 OB Van
Score: 58
Read Article

Data Compression Nerds Hate This One Trick [video]
Score: 23
Read Article

Blog hosted on a Nintendo Wii
Score: 497
Read Article

The 'freaky and unpleasant' world when video games leak into the physical realm
Score: 24
Read Article

Fujitsu and RIKEN develop world-leading 256-qubit sup quantum computer
Score: 32
Read Article

Show HN: Dia, an open-weights TTS model for generating realistic dialogue
Score: 501
Read Article

Prolog Adventure Game
Score: 115
Read Article

101 BASIC Computer Games
Score: 94
Read Article

Launch HN: Magic Patterns (YC W23) – AI Design and Prototyping for Product Teams
Score: 152
Read Article

We Diagnosed and Fixed the 2023 Voyager 1 Anomaly from 15B Miles Away [video]
Score: 31
Read Article

Cheating the Reaper in Go
Score: 127
Read Article

CaMeL: Defeating Prompt Injections by Design
Score: 48
Read Article

Astronomers confirm the existence of a lone black hole
Score: 189
Read Article

A new form of verification on Bluesky
Score: 330
Read Article

LLM-powered tools amplify developer capabilities rather than replacing them
Score: 284
Read Article

Pipelining might be my favorite programming language feature
Score: 320
Read Article

An Update on Pahole
Score: 29
Read Article

'World War Zoos' Review: Of Bombs and Beasts
Score: 25
Read Article

Phase I/II trial of iPS-cell-derived dopaminergic cells for Parkinson's disease
Score: 15
Read Article

Visiting Us
Score: 116
Read Article

A M.2 HDMI capture card
Score: 131
Read Article

There are a total of 100 headlines."

## 🗃️ Redis schema

**Key pattern**: `book:<id>` or `book:<category>`

**Description**: Stores detailed information about a book, uniquely identified by its ID.

**Value Type**: JSON

**Value Structure**:

* `id`: Integer (Unique book identifier)
* `title`: String (Title of the book)
* `category`: String (Category of the book)
* `price`: Float (Price of the book)
* `image_url`: String (Image url of the book)
  
## 🧪 Unit Tests

```bash
poetry run pytest
```

🚢 Deployment
The project is designed to be easily deployable using Docker Compose. The `docker-compose up -d` command is suitable for development and testing. For production deployment, consider using container orchestration platforms like Kubernetes or Docker Swarm, and ensure proper configuration of environment variables, persistent storage for Redis, and secure access to services.

🙌 Acknowledgments

* [@cmgver](https://gitlab.com/cmgver)
* [@luiver](https://gitlab.com/luilver)
* [@NileyGF](https://gitlab.com/NileyGF)
* [@brianmatute011](https://gitlab.com/brianmatute011)
