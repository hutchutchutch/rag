# RAGGuide API (v0.1)

| Verb | Path | Purpose |
|------|------|---------|
| **POST** | `/auth/login` | Obtain JWT |
| **POST** | `/api/v1/documents` | Upload & process a file |
| **GET**  | `/api/v1/documents` | List uploaded docs |
| **POST** | `/api/v1/chat` | Ask a question (`mode`: `rag` \| `graphrag`) |

Import **RAGGuide.postman_collection.json** into Postman, pick the *local* or
*prod* environment, run **Auth → Login**, then fire any request.

> CI contract tests run with  
> `newman run docs/postman/RAGGuide.postman_collection.json -e docs/postman/local.postman_environment.json`
