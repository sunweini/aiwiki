---
source_file: "backend/internal/handler/auth_test.go"
type: "code"
community: "service_auth_service_test_testauthservice_login_wrongpassword"
location: "L42"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/service_auth_service_test_testauthservice_login_wrongpassword
---

# setupHandler()

## Connections
- [[NewAuthHandler()]] - `calls` [INFERRED]
- [[NewAuthService()]] - `calls` [INFERRED]
- [[TestLoginInvalidJSON()]] - `calls` [EXTRACTED]
- [[TestLoginNonexistentUser()]] - `calls` [EXTRACTED]
- [[TestLoginSuccess()]] - `calls` [EXTRACTED]
- [[TestLoginWrongPassword()]] - `calls` [EXTRACTED]
- [[TestLogout()]] - `calls` [EXTRACTED]
- [[auth_test.go]] - `contains` [EXTRACTED]
- [[setMode()]] - `calls` [INFERRED]

#graphify/code #graphify/EXTRACTED #community/service_auth_service_test_testauthservice_login_wrongpassword