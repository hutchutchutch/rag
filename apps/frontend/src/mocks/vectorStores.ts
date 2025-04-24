export const vectorStores = [
  {
    id: "1",
    name: "Missing Dog Trial",
    chunks: 42,
    tokensPerChunk: 512,
    embeddingModel: "text-embedding-3-small",
    vectorDim: 1536,
    indexType: "pgvector / cosine",
    created: "2025-04-23 08:14",
    sizeMB: 1.6,
    knowledgeGraph: {
      entities: [
        { id: "s1", name: "Alex Carter", label: "Suspect", alias: "Ace" },
        { id: "d1", name: "Buddy", label: "Dog", breed: "Beagle", age: 4 },
        { id: "w1", name: "Sam Lee", label: "Witness", statementDate: "2025-04-20" },
        { id: "e1", id2: "CCTV-17", name: "CCTV-17", label: "Evidence", type: "Video", desc: "Camera shows Carter carrying dog" },
        { id: "m1", name: "Ransom", label: "Motive", category: "Ransom", details: "Text demanding $2 000" }
      ],
      relationships: [
        { id: "r1", source: "w1", target: "e1", type: "OBSERVED" },
        { id: "r2", source: "e1", target: "s1", type: "SHOWS_IN_POSSESSION" },
        { id: "r3", source: "e1", target: "d1", type: "OF_DOG" },
        { id: "r4", source: "e1", target: "m1", type: "SUPPORTS" },
        { id: "r5", source: "s1", target: "m1", type: "SEEKING_RANSOM" }
      ],
      newSchemaElements: [
        { type: "entity_label", value: "Suspect" },
        { type: "entity_label", value: "Dog" },
        { type: "entity_label", value: "Witness" },
        { type: "entity_label", value: "Evidence" },
        { type: "entity_label", value: "Motive" },
        { type: "relationship_type", value: "OBSERVED" },
        { type: "relationship_type", value: "SHOWS_IN_POSSESSION" },
        { type: "relationship_type", value: "OF_DOG" },
        { type: "relationship_type", value: "SUPPORTS" },
        { type: "relationship_type", value: "SEEKING_RANSOM" }
      ]
    },
    cypher: `// ❶  Nodes\nCREATE (s:Suspect  {name:\"Alex Carter\", alias:\"Ace\"});\nCREATE (d:Dog      {name:\"Buddy\", breed:\"Beagle\", age:4});\nCREATE (w:Witness  {name:\"Sam Lee\", statementDate:\"2025-04-20\"});\nCREATE (e:Evidence {id:\"CCTV-17\", type:\"Video\", desc:\"Camera shows Carter carrying dog\"});\nCREATE (m:Motive   {category:\"Ransom\", details:\"Text demanding $2 000\"});\n\n// ❷  Relationships\nMATCH (s:Suspect {name:\"Alex Carter\"}),\n      (d:Dog     {name:\"Buddy\"}),\n      (w:Witness {name:\"Sam Lee\"}),\n      (e:Evidence {id:\"CCTV-17\"}),\n      (m:Motive   {category:\"Ransom\"})\nCREATE (w)-[:OBSERVED]->(e)\nCREATE (e)-[:SHOWS_IN_POSSESSION]->(s)\nCREATE (e)-[:OF_DOG]->(d)\nCREATE (e)-[:SUPPORTS]->(m)\nCREATE (s)-[:SEEKING_RANSOM]->(m);`,
    explanation: `Below is a refreshed five-node knowledge-graph framed around a missing-dog investigation. It preserves the same object/relationship pattern as before so you can reuse the multi-hop reasoning examples.\n\n1 Objects (nodes)\n\nNode label\tWhat it represents\tExample instance\nSuspect (formerly Defendant)\tPerson believed to have taken the dog\t(:Suspect {name:\"Alex Carter\"})\nDog (Victim)\tThe missing animal\t(:Dog {name:\"Buddy\",breed:\"Beagle\"})\nWitness\tPerson who saw or heard something\t(:Witness {name:\"Sam Lee\"})\nEvidence\tAny digital/physical clue\t(:Evidence {id:\"CCTV-17\",type:\"Video\",desc:\"Alley camera\"})\nMotive\tReason the dog was taken\t(:Motive {category:\"Ransom\",details:\"$2 000 demand\"})\n2 Relationship types\n\nRelationship\tDirection\tSemantics\nOBSERVED\tWitness → Evidence\tWitness attests to evidence\nSHOWS_IN_POSSESSION\tEvidence → Suspect\tEvidence depicts suspect with dog\nOF_DOG\tEvidence → Dog\tEvidence concerns the missing dog\nSUPPORTS\tEvidence → Motive\tEvidence backs up motive theory\nSEEKING_RANSOM\tSuspect → Motive\tSuspect benefits from motive\n(Rename edges to suit your own ontology if desired.)\n\n3 Sample Cypher to build the graph\n...\n\n4 Multi-hop reasoning in action\nA. "Why is Alex Carter a suspect?"\nMATCH (s:Suspect {name:\"Alex Carter\"})<-[:SHOWS_IN_POSSESSION]-(e)\nRETURN s.name AS Suspect, e.id AS EvidenceID, e.desc AS Details;\nOne-hop: Evidence directly links suspect to dog.\n\nB. "Connect suspect to dog."\nMATCH (s:Suspect {name:\"Alex Carter\"})\n      <-[:SHOWS_IN_POSSESSION]-(e)-[:OF_DOG]->(d:Dog)\nRETURN s.name, e.id, d.name;\nTwo-hop chain: Suspect ← Evidence → Dog.\n\nC. "Show the witness-backed motive trail."\nMATCH (s:Suspect {name:\"Alex Carter\"})-[:SEEKING_RANSOM]->(m)<-[:SUPPORTS]-\n      (e)<-[:OBSERVED]-(w:Witness)\nRETURN w.name AS Witness,\n       e.id   AS EvidenceID,\n       m.details AS RansomDemand,\n       s.name AS Suspect;\nThree-hop reasoning:\n\nWitness Sam Lee saw CCTV-17\nCCTV-17 backs the ransom motive\nAlex Carter is linked to that motive\n\nThis path lets investigators articulate a clear, explainable line from eyewitness to motive to suspect—​exactly the kind of multi-hop insight knowledge graphs excel at.`
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