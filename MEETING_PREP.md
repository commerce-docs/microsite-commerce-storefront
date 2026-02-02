# Meeting Prep: Release Process Questions

## Questions You May Need to Answer

### 1. Release Branch Strategy (Emili's Question #1)

**Question:** When releases are planned, will the Guardians team create a release branch for each dropin so we can base our feature branches on it, or should we base them on a different branch (e.g., develop)?

**Status:** ⚠️ **UNANSWERED** - Taras said they will discuss with team and suggest an approach

**Context:** This affects how CDE teams structure their feature branches and when they can start work relative to release planning.

---

### 2. Merging into Develop Branch (Emili's Question #5)

**Question:** Can the CDE team merge into the develop branch? I understand the Guardians team is responsible for merging into the main/release branches. Is that correct?

**Status:** ⚠️ **UNANSWERED** - Taras said they will discuss it with the team in an additional meeting and will suggest the approach

**Context:** This determines the workflow and permissions for CDE teams during development vs. release phases.

---

### 3. Documentation Updates After Release (Oscar's Question)

**Question:** Who will be responsible for updating the documentation after a release? For example, USF-3615 will require an update to the documentation. What is the desired process?

**Status:** ⚠️ **TO BE DISCUSSED** - Taras said: "I have a meeting with @bdenham today to agree on it"

**Context:** This is the main topic of your meeting. You need to establish:

- Who owns documentation updates (CDE team, Guardians team, or shared responsibility)?
- What is the process/timeline for documentation updates?
- How are documentation updates tracked and verified?
- What happens if documentation updates are missed?

---

## Already Answered Questions (For Reference)

### ✅ Question #2: Dropin Version Updates

**Answer:** The Guardians will update the dropin versions. But changes to related blocks (Cypress tests coverage if applicable) should be provided by CDE team.

### ✅ Question #3: Alpha Releases

**Answer:** CDE team can create alpha releases if they know how to do it. If needed - Guardians will help, or will create Alpha releases. Alpha releases are for internal testing purposes or to share with customers for testing.

### ✅ Question #4: CDE Team Creating Alpha Releases

**Answer:** Yes, CDE team can create alpha releases (answered in #3).

---

## Meeting Agenda Suggestions

1. **Documentation Update Process** (Primary Topic)
   - Ownership and responsibility
   - Process and timeline
   - Tracking and verification
   - Examples (like USF-3615)

2. **Release Branch Strategy** (If Taras has updates)
   - When release branches are created
   - Which branch feature branches should be based on

3. **Develop Branch Permissions** (If Taras has updates)
   - Who can merge to develop
   - Workflow for CDE teams

---

## Related Context

- RFC: https://wiki.corp.adobe.com/display/EntComm/RFC+-+Storefront+collaboration+on+CDE+ecosystem
- Release Process Draft: https://wiki.corp.adobe.com/display/Guardians/%5BDraft%5D+Release+Process
- Example ticket requiring doc updates: USF-3615
