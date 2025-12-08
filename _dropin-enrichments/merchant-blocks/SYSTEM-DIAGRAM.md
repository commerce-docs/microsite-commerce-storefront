# Automated Update Detection System - Visual Guide

## System Flow Diagram

```mermaid
graph TD
    A[Run Generator] --> B{Check Boilerplate Commit}
    B -->|Different from Last| C[Detect Changes]
    B -->|Same as Last| D[✅ No Changes]
    
    C --> E{What Changed?}
    E -->|Source Code .js| F[⚠️ Config Changes]
    E -->|README.md| G[⚠️ Description Changes]
    E -->|Both| H[⚠️ Both Need Review]
    
    F --> I[Show Warning]
    G --> I
    H --> I
    D --> J[Continue Generation]
    I --> J
    
    J --> K[Generate All Docs]
    K --> L[Update Metadata]
    L --> M[✅ Complete]
    
    style F fill:#ff9
    style G fill:#ff9
    style H fill:#ff9
    style D fill:#9f9
    style M fill:#9f9
```

## Data Flow Diagram

```mermaid
graph LR
    A[Boilerplate Repo<br/>b2b-suite-release1] -->|git clone| B[.temp-repos/boilerplate]
    B -->|Extract Configs| C[Block .js Files]
    B -->|Extract Descriptions| D[README Files]
    
    C --> E[Source Code Parser]
    D --> F[README Parser]
    
    E -->|readBlockConfig calls| G[Configuration Data]
    F -->|Overview section| H[Description Data]
    
    I[descriptions.json<br/>Enrichment File] -->|Verified Descriptions| J[Merge Layer]
    
    G --> J
    H --> J
    
    J --> K[Generate MDX Files]
    K --> L[Merchant Docs]
    
    B -->|git rev-parse HEAD| M[Current Commit Hash]
    I -->|metadata| N[Last Verified Commit]
    
    M --> O{Compare Commits}
    N --> O
    
    O -->|Different| P[⚠️ Show Warnings]
    O -->|Same| Q[✅ Skip Warnings]
    
    P --> K
    Q --> K
    
    K -->|After Success| R[Update Metadata]
    R --> I
    
    style I fill:#9cf
    style M fill:#fcf
    style N fill:#fcf
    style P fill:#ff9
```

## File Relationship Diagram

```mermaid
graph TD
    A[descriptions.json] -->|Metadata| B[last_verified_commit]
    A -->|Block Data| C[Block Descriptions]
    
    D[Boilerplate Repo] -->|Current| E[8e45ef4df...]
    
    B -->|Compare| F{Same?}
    E -->|Compare| F
    
    F -->|No| G[Run Verification]
    F -->|Yes| H[Skip Verification]
    
    G --> I[@verify-block-configs-source-code.js]
    G --> J[@verify-merchant-block-descriptions.js]
    
    I -->|Finds| K[Config Mismatches]
    J -->|Finds| L[Description Changes]
    
    K --> M[Update descriptions.json]
    L --> M
    
    M --> N[@generate-merchant-block-docs.js]
    
    N --> O[Generate All .mdx Files]
    O --> P[Update Metadata]
    P --> A
    
    style A fill:#9cf
    style E fill:#fcf
    style G fill:#ff9
    style M fill:#f96
```

## Workflow Decision Tree

```mermaid
graph TD
    Start([Want to Generate Docs]) --> Check[Run check-for-updates]
    
    Check --> Q1{Changes<br/>Detected?}
    
    Q1 -->|No| Gen1[Run Generator]
    Q1 -->|Yes| Q2{What Type?}
    
    Q2 -->|Source Code| V1[Run verify-configs]
    Q2 -->|README| V2[Run verify-descriptions]
    Q2 -->|Both| V3[Run Both Verifiers]
    
    V1 --> R1{Issues<br/>Found?}
    V2 --> R2{Issues<br/>Found?}
    V3 --> R3{Issues<br/>Found?}
    
    R1 -->|Yes| U1[Update descriptions.json]
    R1 -->|No| Gen2[Run Generator]
    
    R2 -->|Yes| U2[Update descriptions.json]
    R2 -->|No| Gen2
    
    R3 -->|Yes| U3[Update descriptions.json]
    R3 -->|No| Gen2
    
    U1 --> Gen2
    U2 --> Gen2
    U3 --> Gen2
    
    Gen1 --> Done([✅ Complete])
    Gen2 --> Done
    
    style Q1 fill:#ff9
    style Q2 fill:#ff9
    style U1 fill:#f96
    style U2 fill:#f96
    style U3 fill:#f96
    style Done fill:#9f9
```

## Change Detection Logic

```mermaid
graph TD
    A[Generator Starts] --> B[Load descriptions.json]
    B --> C[Get metadata.last_verified_commit]
    
    D[Boilerplate Repo] --> E[git rev-parse HEAD]
    E --> F[Current Commit Hash]
    
    C --> G{Compare Hashes}
    F --> G
    
    G -->|Same| H[✅ No Changes]
    G -->|Different| I[git diff commitA..commitB]
    
    I --> J[Get Changed Files List]
    
    J --> K{Filter by Pattern}
    
    K -->|blocks/*.js| L[Source Code Changes]
    K -->|blocks/README.md| M[README Changes]
    K -->|Other| N[Other Changes]
    
    L --> O[Count: X files]
    M --> P[Count: Y files]
    N --> Q[Count: Z files]
    
    O --> R{X > 0?}
    P --> S{Y > 0?}
    Q --> T[Log Count]
    
    R -->|Yes| U[⚠️ Warn: Config Verification Needed]
    R -->|No| V[Skip Config Warning]
    
    S -->|Yes| W[⚠️ Warn: Description Verification Needed]
    S -->|No| X[Skip Description Warning]
    
    H --> Y[Continue to Generation]
    U --> Y
    V --> Y
    W --> Y
    X --> Y
    T --> Y
    
    Y --> Z[Generate All Docs]
    Z --> AA[Update metadata]
    AA --> AB[Save descriptions.json]
    
    style H fill:#9f9
    style U fill:#ff9
    style W fill:#ff9
    style AB fill:#9cf
```

## Metadata Update Flow

```mermaid
sequenceDiagram
    participant G as Generator
    participant B as Boilerplate
    participant E as Enrichment File
    participant M as Metadata
    
    G->>B: Get current commit hash
    B-->>G: 8e45ef4df...
    
    G->>E: Load metadata
    E-->>G: last_verified: abc123...
    
    G->>G: Compare commits
    
    alt Commits Different
        G->>B: git diff abc123..8e45ef4df
        B-->>G: Changed files list
        G->>G: Categorize changes
        G->>G: Show warnings
    else Commits Same
        G->>G: Skip warnings
    end
    
    G->>G: Generate all docs
    
    G->>M: Update metadata
    M->>M: Set last_verified_commit = 8e45ef4df
    M->>M: Set last_verified_date = today
    M->>M: Count total_blocks
    M->>M: Count verified_blocks
    
    M->>E: Write updated metadata
    E-->>G: ✅ Success
```

## Command Hierarchy

```mermaid
graph TD
    A[npm Commands] --> B[check-for-updates]
    A --> C[verify-merchant-configs]
    A --> D[verify-merchant-descriptions]
    A --> E[generate-merchant-docs]
    
    B --> F[@check-for-updates.js]
    C --> G[@verify-block-configs-source-code.js]
    D --> H[@verify-merchant-block-descriptions.js]
    E --> I[@generate-merchant-block-docs.js]
    
    F --> J[Read descriptions.json]
    G --> J
    H --> J
    I --> J
    
    F --> K[Read Boilerplate]
    G --> K
    H --> K
    I --> K
    
    F --> L[Generate Report]
    G --> M[Show Mismatches]
    H --> N[Show Changes]
    I --> O[Generate Docs]
    
    O --> P[Update Metadata]
    P --> J
    
    style B fill:#9cf
    style C fill:#9cf
    style D fill:#9cf
    style E fill:#f96
    style P fill:#9f9
```

## Three-Tier Priority System

```mermaid
graph TD
    A[Need Description] --> B{Priority 1:<br/>Enrichment Verified?}
    
    B -->|Yes| C[✅ Use Enrichment<br/>descriptions.json]
    B -->|No| D{Priority 2:<br/>README Available?}
    
    D -->|Yes| E[📖 Extract from README<br/>Overview section]
    D -->|No| F{Priority 3:<br/>Fallback}
    
    F --> G[⚠️ Generate generic:<br/>Configure the X block]
    
    C --> H[Generate Doc]
    E --> H
    G --> H
    
    H --> I[Output: .mdx file]
    
    style C fill:#9f9
    style E fill:#ff9
    style G fill:#f99
```

---

**These diagrams show the complete automated update detection system from multiple perspectives.**

