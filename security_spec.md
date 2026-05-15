# Security Specification: Summarizer AI

## Data Invariants
1. A **User** profile can only be created/updated by the user with the same `uid`. No user can read another user's profile if it contains private info (though standard setup is basic info).
2. A **Document** must belong to a specific `userId`. Only that user can read, update, or delete it.
3. A **Chat** must belong to a `userId` and refer to a valid `docId` that the user owns.
4. A **Message** must belong to a `chatId` that the user owns.
5. `createdAt` and `ownerId`/`userId` fields are immutable after creation.
6. Validation helpers must enforce strict types and sizes for all fields.

## The Dirty Dozen (Attack Payloads)
1. **Identity Spoofing**: Attempt to create a document with `userId: "malicious_user"` while authenticated as `victim_user`.
2. **Access Escalation**: Attempt to read `/documents/doc_abc` belonging to User A while authenticated as User B.
3. **Shadow Field Injection**: Attempt to update a document with an extra field `isPremium: true` to bypass paywalls.
4. **State Shortcutting**: Attempt to update a document status directly from `parsing` to `completed` without the backend doing its work (Client side shouldn't be able to skip steps).
5. **Resource Poisoning**: Send a 2MB string in the `filename` field.
6. **Orphaned Writes**: Create a chat for a `docId` that does not exist.
7. **Identity Integrity**: Update a message's `userId` (if it had one) to someone else's.
8. **PII Leak**: Attempt to list all users in the system.
9. **Timestamp Spoofing**: Set `createdAt` to a date in the past during creation.
10. **Immutable Violation**: Change the `docId` a chat refers to.
11. **Bulk Deletion**: Attempt to delete another user's entire document collection.
12. **Type Poisoning**: Send a number in the `text` field of a document.

# Test Runner Plan
I will generate `firestore.rules.test.ts` to verify these protections.
