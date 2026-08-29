# Technical Architecture — Career Copilot & Grounded Conversational Intelligence (Phase 8)

## 1. System Architecture Pipeline

```
[ User Query in Chat UI ] ──> [ POST /api/copilot/conversations/:id/messages ]
                                           │
                                           ▼
                                [ 1. Intent Classifier ]
                                (Deterministic Keyword & Semantic Routing < 50ms)
                                           │
                                           ▼
                                [ 2. Scoped Context Builder ]
                                (Gathers ONLY minimal facts: Gap, Path, Next Action)
                                           │
                                           ▼
                                [ 3. Grounded Prompt Assembly ]
                                (Injects database state & security boundaries)
                                           │
                                           ▼
                                [ 4. LLM Provider / Structured Engine ]
                                (Generates structured JSON response)
                                           │
                                           ▼
                                [ 5. Action & Schema Validator ]
                                (Zod schema validation + internal target checks)
                                           │
                                           ▼
                                [ 6. Persistent Storage & Response ]
                                (Saves ConversationMessage and returns payload)
```

---

## 2. API Endpoints

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/copilot/conversations` | `POST` | Create new conversation thread | `x-user-id` |
| `/api/copilot/conversations` | `GET` | List conversations for learner | `x-user-id` |
| `/api/copilot/conversations/:id` | `GET` | Get conversation with messages | `x-user-id` |
| `/api/copilot/conversations/:id/messages` | `POST` | Send query & get grounded response | `x-user-id` |
| `/api/copilot/conversations/:id` | `DELETE` | Delete conversation thread | `x-user-id` |

---

## 3. Multi-Tenant Isolation & Security Defenses

1. **Strict Ownership Scoping**: Every database lookup checks `where: { id: conversationId, userId }`. Requests with unowned IDs return `404 Not Found`.
2. **Prompt Injection Immunity**: Rejects attempts to expose internal system prompts, configuration instructions, or infrastructure rules.
3. **Cross-Learner Data Protection**: Queries attempting to reveal other learners' information return a strict privacy policy refusal.
