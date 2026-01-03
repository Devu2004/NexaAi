# 🚀 Nexa AI - Full Stack RAG-Powered AI Assistant

**Nexa AI** is a cutting-edge AI application built using the **MERN** stack, integrated with **Retrieval-Augmented Generation (RAG)**. It features a unique long-term memory system using the **Pinecone Vector Database**, enabling the AI to retrieve and learn from past interactions to provide highly personalized and contextually aware responses.



---

## ✨ Key Features

- **🧠 Long-Term Memory (RAG):** Leverages Pinecone and high-dimensional embeddings to recall past user conversations.
- **⚡ Real-Time Interaction:** Zero-latency chat experience powered by Socket.io.
- **🔐 Secure Authentication:** Multi-layer security with JWT, HttpOnly cookies, and Axios interceptors for automated token handling.
- **🎨 Modular SCSS Styling:** A sophisticated UI architecture using professional SCSS (Variables, Mixins, and organized BEM-style components).
- **📂 Clean Architecture:** Strict separation of concerns across Controllers, Services, Models, and Sockets for high maintainability.
- **💬 Dual-Layer Context:** Combines real-time MongoDB chat history with deep Pinecone memory for superior accuracy.

---

## 🛠 Tech Stack

| Category         | Technology                                   |
| :--------------- | :------------------------------------------- |
| **Frontend** | React.js, Vite, SCSS (Sass), Framer Motion   |
| **Backend** | Node.js, Express.js, Socket.io               |
| **Database** | MongoDB (Mongoose), Pinecone (Vector DB)     |
| **AI Integration**| Hugging Face / OpenAI API                   |
| **Auth & Network**| JWT (JSON Web Tokens), Axios, Cookie-parser  |

---

## 📂 Project Structure

```text
Nexa-AI/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers (Auth, Chat, User)
│   │   ├── services/       # Core Logic (AI, Vector Search, Embedding, Mail)
│   │   ├── sockets/        # Socket.io server & Auth Middleware
│   │   ├── models/         # Mongoose Schemas (User, Message, Chat)
│   │   ├── routes/         # Express API Endpoints
│   │   ├── db/             # MongoDB connection setup
│   │   └── app.js          # Express app configuration
│   └── server.js           # Server listener entry point
├── frontend/
│   ├── src/
│   │   ├── components/     
│   │   │   ├── layout/     # Sidebar, ChatContainer, PageWrapper
│   │   │   └── ui/         # Button, Input, Message components
│   │   ├── pages/          # Home, Login, Register, Profile Settings
│   │   ├── services/       # API (Axios) & Socket client setup
│   │   ├── routes/         # AppRoutes (Protected & Public routing)
│   │   └── styles/         # Global SCSS, Variables, and Mixins
```
## ⚙️ Installation & Setup
### 1. Clone the Repository
```
git clone [https://github.com/your-username/nexa-ai.git](https://github.com/your-username/nexa-ai.git)
cd nexa-ai
```
### 2. Backend Configuration
####    Navigate to the backend folder and install dependencies:

```
cd backend
npm install
```
####    Create a .env file in the backend/ directory:
```
Code snippet

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PINECONE_API_KEY=your_pinecone_api_key
AI_API_KEY=your_llm_api_key
```
####    Start the server:
```
npm run dev
```
### 3. Frontend Configuration
####    Navigate to the frontend folder and install dependencies:

```
cd ../frontend
npm install
```

####    Start the development server:
```
npm run dev
```
##  🧠 The RAG Workflow
####    Nexa AI ensures every response is informed by past interactions through the following pipeline:

**Vectorization**: User input is converted into a vector embedding.

**Retrieval**: The system performs a similarity search in Pinecone to find relevant historical context.

**Augmentation**: Retrieved "memories" are combined with the current conversation history from MongoDB.

**Generation**: An augmented prompt is sent to the AI Model to generate a response that "remembers" the user.

##  🛡 Security & Best Practices
**Auth Interceptors**: The frontend automatically attaches Bearer tokens to API calls and redirects users to login if the session expires (401 handling).

**Socket Handshake Verification**: No socket connection is allowed without a valid JWT handshake.

**SCSS Theming**: Centralized _variables.scss allows for instant global UI changes.

**Environment Safety**: Sensitive keys are never exposed to the client-side.

## 🤝 Contributing
```
We welcome contributions to Nexa AI!

Fork the Project.

Create your Feature Branch (git checkout -b feature/NewFeature).

Commit your changes (git commit -m 'Add some NewFeature').

Push to the Branch (git push origin feature/NewFeature).

Open a Pull Request.
```