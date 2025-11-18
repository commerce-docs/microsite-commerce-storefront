# Company Management - Complete Verification

## Date
November 18, 2025

## Scope
- **27 Functions**: All API functions for company management
- **2 Events**: All events emitted by the drop-in

---

## ⚠️ CRITICAL ISSUES FOUND ⚠️

### Issue 1: DUPLICATE FUNCTION DOCUMENTATION

The `functions.mdx` file contains **DUPLICATE** entries for all functions:
- First set: Lines ~19-350
- Second set: Lines ~564-1214

**Evidence:**
```bash
$ grep "^## getCompanyUser$" functions.mdx
19:## getCompanyUser
884:## getCompanyUser

$ grep "^## updateCompany$" functions.mdx
187:## updateCompany
1052:## updateCompany
```

**Impact**: **CRITICAL** - File is 1369 lines but should be ~700 lines. All functions documented twice.

---

### Issue 2: INCORRECT RETURN TYPES

**Multiple functions document `Returns void` when they actually return data.**

| Function | Documented Return | Actual Return Type | Status |
|----------|-------------------|-------------------|--------|
| `getCompanyUser` | `void` | `Promise<CompanyUserModel \| null>` | ❌ WRONG |
| `getCompanyUsers` | ✅ `CompanyUsersResponse` | `Promise<CompanyUsersResponse>` | ✅ CORRECT |
| `getCompany` | `void` | `Promise<CompanyModel \| null>` | ❌ WRONG |
| `getCompanyStructure` | `void` | `Promise<CompanyStructureNode[]>` | ❌ WRONG |
| `getCustomerCompany` | `void` | `Promise<...>` | ❌ WRONG |
| `updateCompany` | ✅ `CompanyModel` | `Promise<CompanyModel>` | ✅ CORRECT |
| `updateCompanyStructure` | `void` | `Promise<boolean>` | ❌ WRONG |
| `updateCompanyTeam` | `void` | `Promise<boolean>` | ❌ WRONG |
| `updateCompanyUser` | `void` | `Promise<boolean>` | ❌ WRONG |
| `createCompanyUser` | `void` | `Promise<CreateCompanyUserResult \| null>` | ❌ WRONG |
| `deleteCompanyTeam` | `void` | `Promise<boolean>` | ❌ WRONG |
| `fetchUserPermissions` | `void` | `Promise<any>` | ❌ WRONG |

**Impact**: **CRITICAL** - At least 10+ functions have wrong return type documentation.

---

### Issue 3: SIGNATURE MISMATCHES

#### getCompanyUser

**Documentation** (lines 23-27):
```typescript
const getCompanyUser = async (
  id: string
): Promise<any>
```

**TypeScript Definition**:
```typescript
export declare function getCompanyUser(id: string): Promise<CompanyUserModel | null>;
```

❌ **Return type mismatch**: `Promise<any>` vs `Promise<CompanyUserModel | null>`

---

#### updateCompanyStructure

**Documentation** (lines 217-221):
```typescript
const updateCompanyStructure = async (
  input: UpdateCompanyStructureInput
): Promise<void>
```

**Documented Returns** (line 237):
> Returns `void`.

**TypeScript Definition**:
```typescript
export declare function updateCompanyStructure(input: UpdateCompanyStructureInput): Promise<boolean>;
```

❌ **Return type mismatch**: `void` vs `Promise<boolean>`

---

#### updateCompanyTeam

**Documentation** (lines 245-249):
```typescript
const updateCompanyTeam = async (
  input: UpdateCompanyTeamInput
): Promise<void>
```

**Documented Returns** (line 265):
> Returns `void`.

**TypeScript Definition**:
```typescript
export declare function updateCompanyTeam(input: UpdateCompanyTeamInput): Promise<boolean>;
```

❌ **Return type mismatch**: `void` vs `Promise<boolean>`

---

#### updateCompanyUser

**Documentation** (lines 273-277):
```typescript
const updateCompanyUser = async (
  input: UpdateCompanyUserInput
): Promise<void>
```

**Documented Returns** (line 293):
> Returns `void`.

**TypeScript Definition**:
```typescript
export declare function updateCompanyUser(input: UpdateCompanyUserInput): Promise<boolean>;
```

❌ **Return type mismatch**: `void` vs `Promise<boolean>`

---

#### createCompanyUser

**Documentation** (lines 680-684):
```typescript
const createCompanyUser = async (
  input: CreateCompanyUserInput
): Promise<void>
```

**Documented Returns** (line 700):
> Returns `void`.

**TypeScript Definition**:
```typescript
export declare function createCompanyUser(input: CreateCompanyUserInput): Promise<CreateCompanyUserResult | null>;
```

❌ **Return type mismatch**: `void` vs `Promise<CreateCompanyUserResult | null>`

---

#### deleteCompanyTeam

**Documentation** (lines 708-712):
```typescript
const deleteCompanyTeam = async (
  id: string
): Promise<void>
```

**Documented Returns** (line 728):
> Returns `void`.

**TypeScript Definition**:
```typescript
export declare function deleteCompanyTeam(id: string): Promise<boolean>;
```

❌ **Return type mismatch**: `void` vs `Promise<boolean>`

---

#### getCompany

**Documentation** (lines 780-782):
```typescript
const getCompany = async (): Promise<any>
```

**Documented Returns** (line 790):
> Returns `void`.

**TypeScript Definition**:
```typescript
export declare function getCompany(): Promise<CompanyModel | null>;
```

❌ **Double mismatch**: `Promise<any>` vs `Promise<CompanyModel | null>` AND returns says `void`

---

#### getCompanyStructure

**Documentation** (lines 842-844):
```typescript
const getCompanyStructure = async (): Promise<any>
```

**Documented Returns** (line 852):
> Returns `void`.

**TypeScript Definition**:
```typescript
export declare function getCompanyStructure(): Promise<CompanyStructureNode[]>;
```

❌ **Double mismatch**: `Promise<any>` vs `Promise<CompanyStructureNode[]>` AND returns says `void`

---

## EVENTS VERIFICATION

### Summary Table

| Event | Payload | Emission | Usage | Status |
|-------|---------|----------|-------|--------|
| `company/updated` | ⚠️ Not verified | ⚠️ Not found | ✅ Documented | ⚠️ UNVERIFIED |
| `companyStructure/updated` | ⚠️ Not verified | ⚠️ Not found | ✅ Documented | ⚠️ UNVERIFIED |

### Event 1: company/updated

**Documentation Claim** (`events.mdx` lines 38-42):
```typescript
{
  eventType: 'company/updated',
  data: CompanyModel // Updated company data
}
```

**Source Code Verification**: ⚠️ NOT FOUND in grep results

**Status**: ⚠️ UNVERIFIED - Event is documented but not found in source code grep. May be emitted conditionally or through a different pattern.

---

### Event 2: companyStructure/updated

**Documentation Claim** (`events.mdx` lines 138-142):
```typescript
{
  eventType: 'companyStructure/updated',
  data: CompanyStructureNode[]
}
```

**Source Code Verification**: ⚠️ NOT FOUND in grep results

**Status**: ⚠️ UNVERIFIED - Event is documented but not found in source code grep. May be emitted conditionally or through a different pattern.

---

## ROOT CAUSE ANALYSIS

### Problem: Generator Issue

The Company Management functions documentation appears to have been generated incorrectly:

1. **Duplication**: All 27 functions are documented twice in the same file
2. **Wrong Return Types**: Many functions incorrectly document `void` returns
3. **Type Mismatches**: Signatures show `Promise<any>` while TypeScript shows specific types
4. **Missing Content**: First function starts with `### Returns` (line 13) suggesting missing content above

### Likely Cause

The generator (`@generate-function-docs.js`) may have:
- Run twice and appended to the file instead of replacing
- Failed to extract correct return types from TypeScript definitions
- Used fallback `void` returns when type inference failed

---

## SUMMARY

### Functions: 0/27 ✅ (0% Accurate)

**Critical Issues:**
- ❌ **DUPLICATES**: All 27 functions documented twice
- ❌ **WRONG RETURNS**: 10+ functions have incorrect return type documentation
- ❌ **TYPE MISMATCHES**: Multiple functions show `any` instead of specific types
- ❌ **MISSING CONTENT**: File appears truncated or corrupted at start

### Events: 0/2 ✅ (0% Verified)

- ⚠️ `company/updated` - Not found in source code
- ⚠️ `companyStructure/updated` - Not found in source code

**Overall Confidence**: **0%** - Documentation is fundamentally broken

---

## RECOMMENDATIONS

### URGENT ACTION REQUIRED

1. **Regenerate functions.mdx completely**
   - Delete existing file
   - Run generator fresh
   - Verify no duplication

2. **Fix type inference in generator**
   - Ensure return types are extracted from TypeScript definitions
   - Remove fallback to `void` for non-void functions

3. **Verify event emissions**
   - Check container code for event emissions
   - Verify if events are actually emitted or planned features

4. **Do not use this documentation until fixed**
   - Current state: 0% accurate
   - Risk: Developers will implement wrong return types

---

## CONCLUSION

❌ **Company Management documentation is BROKEN and must be regenerated**

**Critical Issues:**
- All functions duplicated
- 10+ functions have wrong return types
- Type information is incomplete or incorrect
- Events not verified

**This documentation cannot be used in its current state.**

**Next Steps:**
1. Stop verification
2. Regenerate documentation
3. Re-verify after regeneration

