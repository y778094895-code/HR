# User Management Module - Implementation TODO

## Phase 1: Core User Management
- [ ] 1.1 Update user.service.ts - Add updateUserStatus method
- [ ] 1.2 Update user.store.ts - Add toggleUserStatus, updateUser actions
- [ ] 1.3 Create UserEditDialog component
- [ ] 1.4 Update UserTable to support status toggle

## Phase 2: Tabs Implementation
- [ ] 2.1 Create ActiveUsersTab component with real data
- [ ] 2.2 Create InactiveUsersTab (limited-data state)
- [ ] 2.3 Create PendingInvitesTab (limited-data state)

## Phase 3: Roles & Permissions
- [ ] 3.1 Create PredefinedRolesTab (limited-data from user roles)
- [ ] 3.2 Create CustomRolesTab (limited-data state)
- [ ] 3.3 Create DepartmentLevelTab (limited-data)
- [ ] 3.4 Create FieldLevelTab (limited-data)

## Phase 4: Audit
- [ ] 4.1 Create LoginHistoryTab (limited-data state)
- [ ] 4.2 Create PermissionChangesTab (limited-data state)

## Phase 5: Page Integration
- [ ] 5.1 Update UserManagementPage to use real components
- [ ] 5.2 Remove "Coming Soon" placeholders

## Phase 6: Validation
- [ ] 6.1 Run npm run typecheck
- [ ] 6.2 Run npm run build

## Phase 7: Documentation
- [ ] 7.1 Create user-management-srd-delivery.md

