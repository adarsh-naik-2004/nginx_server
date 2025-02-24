# Reverse Proxy Server

A reverse proxy server with load balancing, rate limiting, and health checking capabilities. Built with Node.js and designed for cloud-native deployments.

## Architecture
```mermaid
graph TD
    A[Client Request] --> B[Master Node]
    B -->|Distribute Requests| C[Worker Pool]
    C -->|Proxy Traffic| D[(Backend Services)]
    
    E[(Redis)] -->|Enforce Rate Limits| B
    F[Health Monitor] -->|Service Status| C

    style A fill:#f0f4ff,stroke:#4a6fff,color:#000000
    style B fill:#e8f4ff,stroke:#007bff,color:#000000
    style C fill:#e6f7ed,stroke:#28a745,color:#000000
    style D fill:#f8f9fa,stroke:#6c757d,color:#000000
    style E fill:#f8d7da,stroke:#dc3545,color:#000000
    style F fill:#d1ecf1,stroke:#17a2b8,color:#000000

    classDef infrastructure fill:#fff,stroke:#666,stroke-width:1px;
    class E,F infrastructure;
```

## Features

- **Load Balancing** (Round Robin, Random, Least Connections)
- **Rate Limiting** with Redis integration
- **Health Checking** of backend services
- **YAML-based Configuration**
- **Cluster Worker Model** for vertical scaling
- **Header Manipulation** capabilities
- **Path-based Routing** rules
- **Multiple Upstream** support

### Requirements
- Node.js 18+ & npm
- Redis 6+ (local or cloud instance)
- Unix-like environment (Windows requires WSL2)

## Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/reverse-proxy.git
cd reverse-proxy
```
2. Install dependencies:
```bash
npm install
```



## Configuration Options

| **Option**    | **Description** |
|--------------|----------------|
| **`listen`**  | Port for the reverse proxy to listen on |
| **`workers`** | Number of worker processes |
| **`forwards`** | List of backend services with their URLs |
| **`headers`**  | Custom headers to be added to forwarded requests |
| **`rules`** | Path-based routing rules defining how requests are forwarded |


## Usage Example
🔹 **Access through reverse proxy**  
```bash
http://localhost:8000/
```
🔹 **Access admin route**
```bash
http://localhost:8000/admin
```



