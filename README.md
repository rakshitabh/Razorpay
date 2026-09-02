# Multi-Agent AI Security Operations Center (SOC)
### Real-Time Threat Detection & Automated Incident Response

An intelligent, multi-agent Security Operations Center (SOC) designed to automate server, application, and network gateway log analysis. The system combines high-performance rule parsing with Gemini AI reasoning to detect brute force, port scans, credential stuffing, and unauthorized directory path traversals, presenting actionable containment options on a corporate dark-themed React dashboard.

---

## Architectural Layout

```text
                        ┌──────────────────┐
                        │  React Frontend  │
                        └────────┬─────────┘
                                 │ HTTP API
                        ┌────────▼─────────┐
                        │  Express Server  │
                        └────────┬─────────┘
                                 │ Pipeline Coordinator
                        ┌────────▼─────────┐
                        │  Agent Manager   │
                        └────────┬─────────┘
                                 │
     ┌───────────────────┬───────┴───────────┬───────────────────┐
     ▼                   ▼                   ▼                   ▼
┌──────────────┐   ┌────────────┐     ┌──────────────┐    ┌──────────────┐
│ Parser Agent │   │  Threat    │     │Investigator  │    │  Responder   │
│(Rule Engine) │   │(Rule Engine)     │ (Gemini AI)  │    │ (Gemini AI)  │
└──────┬───────┘   └─────┬──────┘     └──────┬───────┘    └──────┬───────┘
       │                 │                   │                   │
       └─────────────────┼───────────────────┼───────────────────┘
                         ▼
              ┌─────────────────────┐       ┌────────────────────┐
              │ MongoDB Atlas Cloud │ ◄──── │ Report Agent (AI)  │
              └─────────────────────┘       └────────────────────┘
```

1. **Parser Agent (Rule Engine):** Extracts IP addresses, timestamps, event profiles, and attributes from raw web, SSH, or firewall logs using regex.
2. **Threat Detection Agent (Rule Engine):** Automatically tags credential stuffing, port scans, or brute force attempts using rate-limiting filters and rules.
3. **Investigation Agent (Gemini AI):** Resolves root cause triggers, performs blast-radius analysis, and computes a transparent risk score.
4. **Response Agent (Gemini AI):** Formulates targeted mitigation containment playbooks.
5. **Report Agent (Gemini AI):** Compiles all evidence, roots, and playbooks into a professional markdown incident report.

---

## Technical Features

- **Double Auth & Email OTP:** Full signup strength validation, matching checks, duplicate address screening, and email OTP dispatch (Nodemailer transporter or Console Fallback).
- **Session Protection (JWT):** Route protection middleware checking expiration tokens.
- **Role-Based Access Control (RBAC):** Admin (User management panels), Analyst (Run containment playbooks, upload logs), and Viewers (Read-only dashboard widgets).
- **SVG Attack Mapping:** An animated grid showing network attacks.
- **Agent Timing Console:** Scrolling feed showing status logs, confidence rating, and latency in milliseconds.
- **Document Exporter:** Live markdown rendering, print-to-PDF formatting, and JSON file downloads.
- **Scrolling Bug Resolved:** Terminated page jumps by updating container scroll offset inline instead of calling full-screen element viewport adjustments.

---

## Database Schemas & Collections

The MongoDB Database design is mapped to Mongoose models with indexes:
1. **`users`:** Accounts containing hashed passwords, roles, isVerified, OTP codes, and expiry dates.
2. **`logs`:** Parsed logs indexed by timestamp, source IP, and event types for fast querying.
3. **`threats`:** Detected alerts. Keeps records of severity, risk scores, targets, and evidence.
4. **`reports`:** Markdown security documents compiled by the Report Agent.
5. **`agentexecutions`:** Execution latency metrics, timing, and raw agent outputs.

---

## Installation & Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL (or local MongoDB)
- Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/soc_db
   JWT_SECRET=super_secret_soc_jwt_key_12345
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
   *(Note: If SMTP parameters are left blank, verification OTP passcodes will log directly to the terminal console during registrations and recovery requests).*
4. Run the Express server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Vite React server:
   ```bash
   npm run dev -- --force
   ```
4. Access the portal at **`http://localhost:3000`** (or `3001` if port 3000 is occupied). Register an account, verify with the OTP code printed in the backend terminal console, and login to simulate threat analysis!
