# TaskCRUDSkill

Domain skill for task lifecycle management.

## Capabilities
- Create tasks
- Update tasks
- Delete tasks
- Complete tasks
- Validate task schema

## Integrations
- Dapr State Store
- MCP CRUD tools

## Rules
- Must be idempotent
- Must validate before persist
- No event emission directly
