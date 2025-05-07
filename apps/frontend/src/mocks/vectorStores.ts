export const vectorStores = [
  {
    id: "1",
    name: "Function Health Graph",
    chunks: 60,
    tokensPerChunk: 512,
    embeddingModel: "text-embedding-3-small",
    vectorDim: 1536,
    indexType: "neo4j / cosine",
    created: "2025-05-07 12:30",
    sizeMB: 2.4,
    knowledgeGraph: {
      entities: [
        // Users
        { id: "u001", type: "User", name: "Alice Smith", date_of_birth: "1985-06-15", gender: "Female", membership_start_date: "2024-01-01", membership_status: "active" },
        { id: "u002", type: "User", name: "Bob Johnson", date_of_birth: "1978-11-03", gender: "Male", membership_start_date: "2024-02-01", membership_status: "active" },
        { id: "u003", type: "User", name: "Carol Davis", date_of_birth: "1990-03-22", gender: "Female", membership_start_date: "2024-03-01", membership_status: "active" },
        // Physicians
        { id: "p001", type: "Physician", name: "Dr. Eva Lee", specialty: "Functional Medicine", affiliated_since: "2023-05-01" },
        { id: "p002", type: "Physician", name: "Dr. Amir Nassar", specialty: "Preventive Diagnostics", affiliated_since: "2024-01-12" },
        // Admin
        { id: "a001", type: "Admin", name: "Maya Chen", role: "Health Program Admin", permissions: ["read", "write", "manage-users"] },
        // Tests
        { id: "t001", type: "Test", name: "Vitamin D", category: "Nutrients", description: "Measures the level of vitamin D in blood", units: "ng/mL", reference_range: "20–50" },
        { id: "t002", type: "Test", name: "LDL Cholesterol", category: "Cardiovascular", description: "Low-density lipoprotein cholesterol level", units: "mg/dL", reference_range: "<100" },
        { id: "t003", type: "Test", name: "Hemoglobin A1c", category: "Metabolic", description: "Average blood sugar level over 3 months", units: "%", reference_range: "<5.7" },
        { id: "t004", type: "Test", name: "TSH", category: "Hormones", description: "Thyroid Stimulating Hormone", units: "mIU/L", reference_range: "0.4–4.0" },
        { id: "t005", type: "Test", name: "hs-CRP", category: "Inflammation", description: "High-sensitivity C-reactive protein", units: "mg/L", reference_range: "<3.0" },
        { id: "t006", type: "Test", name: "Lead", category: "Toxins", description: "Measures lead in blood", units: "µg/dL", reference_range: "<5" },
        // TestResults
        { id: "r001", type: "TestResult", value: 30, date: "2025-01-15", status: "In Range", user_id: "u001", test_id: "t001" },
        { id: "r002", type: "TestResult", value: 160, date: "2025-01-15", status: "Out of Range", user_id: "u001", test_id: "t002" },
        { id: "r003", type: "TestResult", value: 5.8, date: "2025-02-20", status: "In Range", user_id: "u002", test_id: "t003" },
        { id: "r004", type: "TestResult", value: 6.5, date: "2025-02-20", status: "Out of Range", user_id: "u002", test_id: "t004" },
        { id: "r005", type: "TestResult", value: 2.0, date: "2025-03-10", status: "In Range", user_id: "u003", test_id: "t005" },
        { id: "r006", type: "TestResult", value: 5, date: "2025-03-10", status: "Out of Range", user_id: "u003", test_id: "t006" }
      ],
      relationships: [
        { id: "rel1", source: "u001", target: "p001", type: "CLIENT_OF" },
        { id: "rel2", source: "u002", target: "p001", type: "CLIENT_OF" },
        { id: "rel3", source: "u003", target: "p002", type: "CLIENT_OF" },
        { id: "rel4", source: "a001", target: "u001", type: "MANAGES" },
        { id: "rel5", source: "a001", target: "u002", type: "MANAGES" },
        { id: "rel6", source: "a001", target: "p001", type: "MANAGES" },
        { id: "rel7", source: "r001", target: "t001", type: "OF_TEST" },
        { id: "rel8", source: "r002", target: "t002", type: "OF_TEST" },
        { id: "rel9", source: "r003", target: "t003", type: "OF_TEST" },
        { id: "rel10", source: "r004", target: "t004", type: "OF_TEST" },
        { id: "rel11", source: "r005", target: "t005", type: "OF_TEST" },
        { id: "rel12", source: "r006", target: "t006", type: "OF_TEST" },
        { id: "rel13", source: "u001", target: "r001", type: "HAS_RESULT" },
        { id: "rel14", source: "u001", target: "r002", type: "HAS_RESULT" },
        { id: "rel15", source: "u002", target: "r003", type: "HAS_RESULT" },
        { id: "rel16", source: "u002", target: "r004", type: "HAS_RESULT" },
        { id: "rel17", source: "u003", target: "r005", type: "HAS_RESULT" },
        { id: "rel18", source: "u003", target: "r006", type: "HAS_RESULT" }
      ],
      newSchemaElements: [
        { type: "entity_label", value: "User" },
        { type: "entity_label", value: "Physician" },
        { type: "entity_label", value: "Admin" },
        { type: "entity_label", value: "Test" },
        { type: "entity_label", value: "TestResult" },
        { type: "relationship_type", value: "CLIENT_OF" },
        { type: "relationship_type", value: "MANAGES" },
        { type: "relationship_type", value: "OF_TEST" },
        { type: "relationship_type", value: "HAS_RESULT" }
      ]
    },
    cypher: `// Nodes
CREATE (a:Admin {admin_id:"a001", name:"Maya Chen", role:"Health Program Admin", permissions:["read","write","manage-users"]});
CREATE (u1:User {user_id:"u001", name:"Alice Smith", date_of_birth:"1985-06-15", gender:"Female", membership_start_date:"2024-01-01", membership_status:"active"});
CREATE (u2:User {user_id:"u002", name:"Bob Johnson", date_of_birth:"1978-11-03", gender:"Male", membership_start_date:"2024-02-01", membership_status:"active"});
CREATE (u3:User {user_id:"u003", name:"Carol Davis", date_of_birth:"1990-03-22", gender:"Female", membership_start_date:"2024-03-01", membership_status:"active"});
CREATE (p1:Physician {physician_id:"p001", name:"Dr. Eva Lee", specialty:"Functional Medicine", affiliated_since:"2023-05-01"});
CREATE (p2:Physician {physician_id:"p002", name:"Dr. Amir Nassar", specialty:"Preventive Diagnostics", affiliated_since:"2024-01-12"});
CREATE (t1:Test {test_id:"t001", name:"Vitamin D", category:"Nutrients", description:"Measures the level of vitamin D in blood", units:"ng/mL", reference_range:"20–50"});
CREATE (t2:Test {test_id:"t002", name:"LDL Cholesterol", category:"Cardiovascular", description:"Low-density lipoprotein cholesterol level", units:"mg/dL", reference_range:"<100"});
CREATE (t3:Test {test_id:"t003", name:"Hemoglobin A1c", category:"Metabolic", description:"Average blood sugar level over 3 months", units:"%", reference_range:"<5.7"});
CREATE (t4:Test {test_id:"t004", name:"TSH", category:"Hormones", description:"Thyroid Stimulating Hormone", units:"mIU/L", reference_range:"0.4–4.0"});
CREATE (t5:Test {test_id:"t005", name:"hs-CRP", category:"Inflammation", description:"High-sensitivity C-reactive protein", units:"mg/L", reference_range:"<3.0"});
CREATE (t6:Test {test_id:"t006", name:"Lead", category:"Toxins", description:"Measures lead in blood", units:"µg/dL", reference_range:"<5"});
CREATE (r1:TestResult {result_id:"r001", value:30, date:"2025-01-15", status:"In Range"});
CREATE (r2:TestResult {result_id:"r002", value:160, date:"2025-01-15", status:"Out of Range"});
CREATE (r3:TestResult {result_id:"r003", value:5.8, date:"2025-02-20", status:"In Range"});
CREATE (r4:TestResult {result_id:"r004", value:6.5, date:"2025-02-20", status:"Out of Range"});
CREATE (r5:TestResult {result_id:"r005", value:2.0, date:"2025-03-10", status:"In Range"});
CREATE (r6:TestResult {result_id:"r006", value:5, date:"2025-03-10", status:"Out of Range"});

// Relationships
MATCH (a:Admin {admin_id:"a001"}),
      (u1:User {user_id:"u001"}),
      (u2:User {user_id:"u002"}),
      (u3:User {user_id:"u003"}),
      (p1:Physician {physician_id:"p001"}),
      (p2:Physician {physician_id:"p002"}),
      (t1:Test {test_id:"t001"}),
      (t2:Test {test_id:"t002"}),
      (t3:Test {test_id:"t003"}),
      (t4:Test {test_id:"t004"}),
      (t5:Test {test_id:"t005"}),
      (t6:Test {test_id:"t006"}),
      (r1:TestResult {result_id:"r001"}),
      (r2:TestResult {result_id:"r002"}),
      (r3:TestResult {result_id:"r003"}),
      (r4:TestResult {result_id:"r004"}),
      (r5:TestResult {result_id:"r005"}),
      (r6:TestResult {result_id:"r006"})
CREATE (u1)-[:CLIENT_OF]->(p1)
CREATE (u2)-[:CLIENT_OF]->(p1)
CREATE (u3)-[:CLIENT_OF]->(p2)
CREATE (a)-[:MANAGES]->(u1)
CREATE (a)-[:MANAGES]->(u2)
CREATE (a)-[:MANAGES]->(p1)
CREATE (r1)-[:OF_TEST]->(t1)
CREATE (r2)-[:OF_TEST]->(t2)
CREATE (r3)-[:OF_TEST]->(t3)
CREATE (r4)-[:OF_TEST]->(t4)
CREATE (r5)-[:OF_TEST]->(t5)
CREATE (r6)-[:OF_TEST]->(t6)
CREATE (u1)-[:HAS_RESULT]->(r1)
CREATE (u1)-[:HAS_RESULT]->(r2)
CREATE (u2)-[:HAS_RESULT]->(r3)
CREATE (u2)-[:HAS_RESULT]->(r4)
CREATE (u3)-[:HAS_RESULT]->(r5)
CREATE (u3)-[:HAS_RESULT]->(r6);`,
    explanation: `This Function Health knowledge graph models the relationships between Admin, Physician, Users (Clients), Tests, and TestResults.
- Users are linked to Physicians via CLIENT_OF, and to their TestResults via HAS_RESULT.
- Admin manages Users and Physicians.
- TestResults are linked to their corresponding Test via OF_TEST.
This structure enables multi-hop queries such as "Which clients managed by a given admin have out-of-range test results for a specific test?" or "Which physician's clients have the most in-range results for metabolic tests?".`
  },
  {
    id: "2",
    name: "My sister's journal entries",
    chunks: 120,
    tokensPerChunk: 1024,
    embeddingModel: "text-embedding-ada-002",
    vectorDim: 1536,
    indexType: "HNSW / cosine",
    created: "2024-12-01 15:30",
    sizeMB: 4.2,

    /* — Knowledge-graph mock-up — */
    knowledgeGraph: {
      entities: [
        { id: "a1", name: "Emily Carter", label: "Author", relation: "sister" },
        { id: "j1", name: "Entry-2024-11-22", label: "JournalEntry", sentiment: "Anxious" },
        { id: "f1", name: "Anxiety", label: "Feeling", intensity: 0.8 },
        { id: "d1", name: "2024-11-22", label: "Date" },
        { id: "m1", name: "Buddy", label: "Dog", context: "Missing" }
      ],
      relationships: [
        { id: "r1", source: "j1", target: "a1", type: "WRITTEN_BY" },
        { id: "r2", source: "j1", target: "d1", type: "HAS_DATE" },
        { id: "r3", source: "j1", target: "f1", type: "EXPRESSES" },
        { id: "r4", source: "j1", target: "m1", type: "MENTIONS_DOG" },
        { id: "r5", source: "f1", target: "m1", type: "FEELING_ABOUT" }
      ],
      newSchemaElements: [
        { type: "entity_label", value: "Author" },
        { type: "entity_label", value: "JournalEntry" },
        { type: "entity_label", value: "Feeling" },
        { type: "entity_label", value: "Date" },
        { type: "relationship_type", value: "WRITTEN_BY" },
        { type: "relationship_type", value: "HAS_DATE" },
        { type: "relationship_type", value: "EXPRESSES" },
        { type: "relationship_type", value: "MENTIONS_DOG" },
        { type: "relationship_type", value: "FEELING_ABOUT" }
      ]
    },

    /* — Cypher stub for graph seeding — */
    cypher: `// Nodes
CREATE (a:Author {name:"Emily Carter", relation:"sister"});
CREATE (j:JournalEntry {id:"Entry-2024-11-22", sentiment:"Anxious"});
CREATE (f:Feeling {name:"Anxiety", intensity:0.8});
CREATE (d:Date {value:"2024-11-22"});
CREATE (m:Dog {name:"Buddy", context:"Missing"});

// Relationships
MATCH (a:Author {name:"Emily Carter"}),
      (j:JournalEntry {id:"Entry-2024-11-22"}),
      (f:Feeling {name:"Anxiety"}),
      (d:Date {value:"2024-11-22"}),
      (m:Dog {name:"Buddy"})
CREATE (j)-[:WRITTEN_BY]->(a)
CREATE (j)-[:HAS_DATE]->(d)
CREATE (j)-[:EXPRESSES]->(f)
CREATE (j)-[:MENTIONS_DOG]->(m)
CREATE (f)-[:FEELING_ABOUT]->(m);`,

    /* — Human-readable explainer — */
    explanation: `Five nodes capture the core of a single diary entry: the \
Author (Emily), one JournalEntry node, the Feeling expressed, the entry \
Date, and the missing dog Buddy.  Relationships let us traverse \
multi-hop questions such as “Which dogs are linked to high-intensity anxiety \
entries by Emily?” (JournalEntry → Feeling → Dog).`
  },

  /* ──────────────── 3. Ethical AI Research Paper ───────────────── */
  {
    id: "3",
    name: "Ethical AI Research Paper",
    chunks: 300,
    tokensPerChunk: 768,
    embeddingModel: "text-embedding-3-large",
    vectorDim: 3072,
    indexType: "IVFFlat / dot",
    created: "2024-11-10 09:45",
    sizeMB: 12.8,

    knowledgeGraph: {
      entities: [
        { id: "p1", name: "Towards Responsible LLMs", label: "Paper", year: 2024 },
        { id: "au1", name: "Dr. Rhea Patel", label: "Author", affiliation: "MIT" },
        { id: "c1", name: "Transparency", label: "Concept", category: "Ethical Principle" },
        { id: "cs1", name: "Facial-Rec Study", label: "CaseStudy", domain: "Surveillance" },
        { id: "reg1", name: "EU AI Act", label: "Regulation", status: "Draft 2024" }
      ],
      relationships: [
        { id: "r1", source: "p1", target: "au1", type: "WRITTEN_BY" },
        { id: "r2", source: "p1", target: "c1", type: "DISCUSSES" },
        { id: "r3", source: "p1", target: "cs1", type: "ILLUSTRATES" },
        { id: "r4", source: "c1", target: "reg1", type: "INFORMED_BY" },
        { id: "r5", source: "cs1", target: "reg1", type: "REGULATED_BY" }
      ],
      newSchemaElements: [
        { type: "entity_label", value: "Paper" },
        { type: "entity_label", value: "Author" },
        { type: "entity_label", value: "Concept" },
        { type: "entity_label", value: "CaseStudy" },
        { type: "entity_label", value: "Regulation" },
        { type: "relationship_type", value: "WRITTEN_BY" },
        { type: "relationship_type", value: "DISCUSSES" },
        { type: "relationship_type", value: "ILLUSTRATES" },
        { type: "relationship_type", value: "INFORMED_BY" },
        { type: "relationship_type", value: "REGULATED_BY" }
      ]
    },

    cypher: `// Nodes
CREATE (p:Paper {title:"Towards Responsible LLMs", year:2024});
CREATE (a:Author {name:"Dr. Rhea Patel", affiliation:"MIT"});
CREATE (c:Concept {name:"Transparency", category:"Ethical Principle"});
CREATE (cs:CaseStudy {name:"Facial-Rec Study", domain:"Surveillance"});
CREATE (r:Regulation {name:"EU AI Act", status:"Draft 2024"});

// Relationships
MATCH (p:Paper {title:"Towards Responsible LLMs"}),
      (a:Author {name:"Dr. Rhea Patel"}),
      (c:Concept {name:"Transparency"}),
      (cs:CaseStudy {name:"Facial-Rec Study"}),
      (r:Regulation {name:"EU AI Act"})
CREATE (p)-[:WRITTEN_BY]->(a)
CREATE (p)-[:DISCUSSES]->(c)
CREATE (p)-[:ILLUSTRATES]->(cs)
CREATE (c)-[:INFORMED_BY]->(r)
CREATE (cs)-[:REGULATED_BY]->(r);`,

    explanation: `The research-paper graph ties a **Paper** to its \
**Author**, an abstract **Concept** (Transparency), a concrete **CaseStudy**, \
and an external **Regulation** (EU AI Act).  Multi-hop queries let analysts \
trace how a proposed law influences principles discussed in scholarly work \
or see which case studies are both covered by the paper and governed by the \
same regulation.`
  }
];