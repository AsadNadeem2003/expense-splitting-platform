# Data Models - Expense Splitting Platform

Documentation of the database schema and data models.
## Database Schema (ERD)

erDiagram
    USER {
        Int id PK
        String name
        String email UK
        String phone
        String passwordHash
        DateTime createdAt
    }
    GROUP {
        Int id PK
        String name
        Int ownerId FK
        DateTime createdAt
    }
    GROUP_MEMBER {
        Int id PK
        Int groupId FK
        Int userId FK
        DateTime joinedAt
    }
    EXPENSE {
        Int id PK
        Int groupId FK
        Int payerId FK
        Int amount "Stored as Integer in Paisa"
        String description
        DateTime date
        String category
    }
    EXPENSE_PARTICIPANT {
        Int id PK
        Int expenseId FK
        Int userId FK
        Int amountOwed "Stored as Integer in Paisa"
    }
    SETTLEMENT {
        Int id PK
        Int groupId FK
        Int payerId FK
        Int payeeId FK
        Int amount "Stored as Integer in Paisa"
        String status
        DateTime createdAt
    }

    USER ||--o{ GROUP : "owns"
    USER ||--o{ GROUP_MEMBER : "is member of"
    GROUP ||--o{ GROUP_MEMBER : "has"
    GROUP ||--o{ EXPENSE : "contains"
    USER ||--o{ EXPENSE : "pays"
    EXPENSE ||--o{ EXPENSE_PARTICIPANT : "divides into"
    USER ||--o{ EXPENSE_PARTICIPANT : "owes"
    GROUP ||--o{ SETTLEMENT : "resolves in"
    USER ||--o{ SETTLEMENT : "pays settlement"
    USER ||--o{ SETTLEMENT : "receives settlement"