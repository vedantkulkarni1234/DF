/* AXIOM — representative investigation data for the interactive prototype. */
window.DATA = {
  investigations: [
    { id:'INV-2041', title:'Operation Silent Ledger', subject:'Shell entity network · cross-border payment fraud', status:'executing', progress:68, confidence:82, agents:6, evidence:148, sources:64, updated:'2 min ago', priority:'High', lead:'V. Kulkarni', tags:['Fraud','Blockchain','OSINT'] },
    { id:'INV-2038', title:'Domain Impersonation Cluster', subject:'Credential harvesting against municipal portals', status:'review', progress:100, confidence:91, agents:4, evidence:86, sources:31, updated:'18 min ago', priority:'Critical', lead:'S. Mehta', tags:['Phishing','Web'] },
    { id:'INV-2035', title:'Vendor Due Diligence — Helios', subject:'Sanctions exposure and beneficial ownership', status:'review', progress:100, confidence:76, agents:5, evidence:52, sources:27, updated:'Yesterday', priority:'Medium', lead:'A. Rao', tags:['KYC','Sanctions'] },
    { id:'INV-2029', title:'Anonymous Threat Attribution', subject:'Cross-platform threat actor correlation', status:'completed', progress:100, confidence:64, agents:7, evidence:211, sources:93, updated:'3 days ago', priority:'High', lead:'V. Kulkarni', tags:['Threat Intel'] },
    { id:'INV-2024', title:'Insurance Claim Anomaly', subject:'Document forensics & conflicting metadata', status:'completed', progress:100, confidence:88, agents:3, evidence:39, sources:12, updated:'6 days ago', priority:'Low', lead:'M. Desai', tags:['Documents','Forensics'] }
  ],
  agents: [
    { id:'osint', name:'OSINT Intelligence Agent', role:'Open-source collection & entity enrichment', icon:'globe', tone:'accent', status:'active', tasks:12, success:98.4, calls:'1,284', tools:['Web Search','Domain Lookup','WHOIS','Public Records'], perms:['Public web read','Domain RDAP','Archive access'], desc:'Systematically discovers and enriches public information about people, organizations and domains. Every collected item carries source provenance and a reliability rating.' },
    { id:'forensics', name:'Digital Forensics Agent', role:'Artifact, metadata & file integrity analysis', icon:'fingerprint', tone:'green', status:'active', tasks:8, success:99.1, calls:'642', tools:['Hashing','EXIF Reader','PDF Parser','Timeline Reconstructor'], perms:['Vault read','Hash verification'], desc:'Inspects digital artifacts, extracts metadata, verifies hashes and reconstructs event sequences without altering original evidence.' },
    { id:'scam', name:'Scam Investigation Agent', role:'Fraud pattern & social-engineering detection', icon:'crosshair', tone:'amber', status:'active', tasks:6, success:96.8, calls:'418', tools:['Pattern Matcher','URL Scanner','Message Analyzer'], perms:['Public web read','URL scanning'], desc:'Recognizes confidence-trick structures, mule-account patterns and coercive narratives across chat, email and web artifacts.' },
    { id:'fraud', name:'Fraud Analysis Agent', role:'Transaction graph & anomaly detection', icon:'coin', tone:'violet', status:'active', tasks:5, success:97.2, calls:'356', tools:['Transaction Graph','Anomaly Models','Risk Scoring'], perms:['Authorized ledger read'], desc:'Models transactional behavior, surfaces structuring patterns and quantifies financial risk across linked accounts.' },
    { id:'web', name:'Public Web Research Agent', role:'Deep web crawling & page relationship mapping', icon:'book', tone:'accent', status:'idle', tasks:21, success:95.6, calls:'2,019', tools:['Crawler','Screenshot Capture','Archive Search'], perms:['Public web read'], desc:'Traverses public pages, mirrors referenced content and maps site-to-site relationships with time-stamped observations.' },
    { id:'chain', name:'Blockchain Analysis Agent', role:'On-chain tracing & address clustering', icon:'chain', tone:'amber', status:'active', tasks:4, success:98.0, calls:'291', tools:['Chain Explorer','Address Clustering','Risk Feed'], perms:['Public chain data'], desc:'Traces public ledger flows, clusters likely-controlled addresses and annotates interactions with known-risk entities.' },
    { id:'document', name:'Document Intelligence Agent', role:'OCR, language understanding & provenance', icon:'doc', tone:'green', status:'active', tasks:9, success:97.9, calls:'733', tools:['OCR','NLP Extractor','PDF Parser','Language ID'], perms:['Vault read','OCR service'], desc:'Extracts structured claims from documents, compares versions and flags inconsistent authorship or editing signals.' },
    { id:'image', name:'Image Analysis Agent', role:'Visual forensics & reverse-image discovery', icon:'image', tone:'violet', status:'idle', tasks:7, success:94.3, calls:'188', tools:['EXIF Reader','Reverse Image','Perceptual Hash','OCR'], perms:['Vault read','Public image search'], desc:'Examines visual artifacts for manipulation indicators, geolocation clues and prior publication history.' },
    { id:'threat', name:'Threat Intelligence Agent', role:'Indicator enrichment & actor profiling', icon:'target', tone:'amber', status:'idle', tasks:3, success:96.1, calls:'142', tools:['IOC Enrichment','Threat Feed','TTP Mapper'], perms:['Threat feed read'], desc:'Correlates indicators with curated threat intelligence and maps observed behavior to established tactics and techniques.' },
    { id:'correlation', name:'Evidence Correlation Agent', role:'Cross-source entity resolution & link analysis', icon:'network', tone:'accent', status:'active', tasks:14, success:98.7, calls:'1,108', tools:['Entity Resolution','Graph Engine','Contradiction Detector'], perms:['Case graph write'], desc:'Resolves entities across sources and proposes relationships. Proposed links remain visually distinct until verified by an analyst.' },
    { id:'verification', name:'Verification Agent', role:'Claim adjudication & source reliability', icon:'shieldCheck', tone:'green', status:'idle', tasks:11, success:99.3, calls:'864', tools:['Source Rating','Cross-Check','Claim Ledger'], perms:['Claim ledger write'], desc:'Independently tests claims against multiple sources and classifies findings as verified, unverified, contradicted or hypothesis.' },
    { id:'report', name:'Report Generation Agent', role:'Structured narrative & citation assembly', icon:'report', tone:'violet', status:'idle', tasks:5, success:98.9, calls:'96', tools:['Report Builder','Citation Mapper','Exporters'], perms:['Report write'], desc:'Assembles evidence-backed narratives with method notes, confidence language, unresolved questions and full source traceability.' }
  ],
  plugins: [
    { name:'Domain Compass', by:'Northstar Labs', cat:'OSINT', icon:'globe', color:'#4f46e5', rating:'4.9', users:'12.4k', status:'installed', version:'3.2.1', desc:'Bulk domain registration history, DNS transitions and infrastructure pivots in one pass.', perms:['Public RDAP','DNS queries'] },
    { name:'ChainTrace Pro', by:'Arc Analytics', cat:'Blockchain', icon:'chain', color:'#b45309', rating:'4.8', users:'8.1k', status:'available', version:'2.8.0', desc:'Multi-chain address tracing with clustering heuristics and exported flow diagrams.', perms:['Public chain APIs'] },
    { name:'DocForensic', by:'Verity Systems', cat:'Forensics', icon:'fingerprint', color:'#0f766e', rating:'4.9', users:'6.7k', status:'installed', version:'1.9.4', desc:'Metadata consistency checks, OCR, font forensics and document lineage comparison.', perms:['Local file processing'] },
    { name:'WebArchive Lens', by:'Common Crawl Studio', cat:'OSINT', icon:'archive', color:'#7c3aed', rating:'4.6', users:'19.2k', status:'available', version:'4.1.0', desc:'Query historical snapshots and reconstruct how public pages changed over time.', perms:['Public archive APIs'] },
    { name:'Signal Map', by:'Saltline', cat:'Threat Intel', icon:'activity', color:'#be123c', rating:'4.7', users:'3.8k', status:'available', version:'1.4.2', desc:'Correlates handles, infrastructure and messaging signals across public surfaces.', perms:['Public web read'] },
    { name:'LedgerLens', by:'Northstar Labs', cat:'Fraud', icon:'coin', color:'#1d4ed8', rating:'4.8', users:'9.6k', status:'installed', version:'2.0.6', desc:'Transaction anomaly detection with explainable risk signals and graph exports.', perms:['Authorized data import'] }
  ],
  skills: [
    { name:'beneficial-ownership-trace', desc:'Resolve ultimate beneficial owners from public corporate registries and filing records.', cat:'OSINT', status:'enabled', version:'1.6', runs:'342', deps:['Domain Compass','Public Records MCP'], compat:'OSINT · Correlation' },
    { name:'metadata-consistency-audit', desc:'Compare EXIF, PDF and document metadata to identify inconsistency or provenance mismatch.', cat:'Forensics', status:'enabled', version:'2.1', runs:'218', deps:['DocForensic'], compat:'Forensics · Document' },
    { name:'wallet-flow-narrative', desc:'Translate on-chain tracing results into an analyst-readable flow narrative with caveats.', cat:'Blockchain', status:'enabled', version:'0.9', runs:'87', deps:['ChainTrace Pro'], compat:'Blockchain · Report' },
    { name:'claims-adjudication', desc:'Test each claim against independent sources and assign a defensible confidence band.', cat:'Verification', status:'enabled', version:'3.0', runs:'512', deps:['Verification Agent'], compat:'Verification · Report' },
    { name:'impersonation-site-detection', desc:'Identify cloned portals through visual similarity, registration timing and link structure.', cat:'Fraud', status:'disabled', version:'1.2', runs:'64', deps:['Image Analysis','WebArchive Lens'], compat:'Web · Image' }
  ],
  servers: [
    { name:'public-records-mcp', type:'Remote · Streamable HTTP', url:'https://mcp.northstar.io/records', status:'connected', tools:18, resources:6, uptime:'99.97%', latency:'142 ms', auth:'OAuth 2.1', icon:'database', color:'#4f46e5' },
    { name:'chain-index-mcp', type:'Local · stdio', url:'/usr/local/bin/chain-index', status:'connected', tools:11, resources:3, uptime:'99.82%', latency:'86 ms', auth:'API key', icon:'chain', color:'#b45309' },
    { name:'case-vault-mcp', type:'Remote · Streamable HTTP', url:'https://vault.northstar.internal/mcp', status:'connected', tools:9, resources:24, uptime:'100%', latency:'61 ms', auth:'mTLS', icon:'vault', color:'#0f766e' },
    { name:'threat-feed-mcp', type:'Remote · SSE', url:'https://feeds.arcsec.io/mcp', status:'degraded', tools:7, resources:2, uptime:'94.40%', latency:'1.2 s', auth:'Bearer token', icon:'target', color:'#be123c' }
  ],
  tools: [
    { name:'Web Search', cat:'Collection', icon:'globe', status:'operational', uses:'12,408', rate:'60 req/min', auth:'Built-in', agents:'8 agents' },
    { name:'WHOIS / RDAP', cat:'Collection', icon:'network', status:'operational', uses:'4,912', rate:'120 req/hr', auth:'Built-in', agents:'5 agents' },
    { name:'PDF & Document Parser', cat:'Analysis', icon:'doc', status:'operational', uses:'2,167', rate:'Local', auth:'Local', agents:'6 agents' },
    { name:'Hash Verification', cat:'Forensics', icon:'fingerprint', status:'operational', uses:'1,840', rate:'Local', auth:'Local', agents:'4 agents' },
    { name:'Chain Explorer', cat:'Blockchain', icon:'chain', status:'rate-limited', uses:'986', rate:'30 req/min', auth:'API key', agents:'2 agents' },
    { name:'Screenshot Capture', cat:'Collection', icon:'image', status:'operational', uses:'742', rate:'20 req/min', auth:'Built-in', agents:'3 agents' },
    { name:'Threat Feed', cat:'Enrichment', icon:'target', status:'degraded', uses:'518', rate:'100 req/hr', auth:'Bearer token', agents:'2 agents' },
    { name:'Report Exporter', cat:'Output', icon:'download', status:'operational', uses:'311', rate:'Local', auth:'Local', agents:'2 agents' }
  ],
  evidence: [
    { id:'EV-0812', name:'wire_transfer_record.pdf', type:'Document', size:'2.4 MB', hash:'a3f1…9c22', status:'verified', source:'case-vault-mcp', collected:'Nov 22, 14:02', chain:7, confidence:96 },
    { id:'EV-0811', name:'shell_entity_registry.png', type:'Image', size:'810 KB', hash:'7bd0…41ae', status:'verified', source:'public-records-mcp', collected:'Nov 22, 13:47', chain:4, confidence:92 },
    { id:'EV-0810', name:'chan reflecting ledger export.csv', type:'Dataset', size:'128 KB', hash:'e992…ff10', status:'unverified', source:'chain-index-mcp', collected:'Nov 22, 12:31', chain:3, confidence:68 },
    { id:'EV-0809', name:'mirror_site_capture_04.png', type:'Image', size:'1.1 MB', hash:'4c18…bb70', status:'verified', source:'Screenshot Capture', collected:'Nov 21, 18:15', chain:5, confidence:89 },
    { id:'EV-0808', name:'director_overlap_claim.md', type:'Note', size:'14 KB', hash:'c701…0d3f', status:'hypothesis', source:'Correlation Agent', collected:'Nov 21, 17:52', chain:2, confidence:41 },
    { id:'EV-0807', name:'message_thread_export.txt', type:'Document', size:'64 KB', hash:'91aa…7e6b', status:'contradicted', source:'Analyst upload', collected:'Nov 21, 11:08', chain:6, confidence:23 }
  ],
  findings: [
    { title:'Four shell entities share a registered agent and postal address', conf:92, status:'verified', source:'Public corporate registry · 3 independent records', time:'14:02', detail:'Registry filings across two jurisdictions consistently list the same registered agent and suite number. Address normalization was applied before comparison.' },
    { title:'On-chain value movement bridges to an exchange deposit address', conf:78, status:'verified', source:'chain-index-mcp · 2 confirmations', time:'13:41', detail:'A 41.2 ETH flow was traced across three hops to a deposit address associated with a known exchange. Timing is consistent with the invoice window.' },
    { title:'Beneficial owner may be linked to a previously dissolved entity', conf:46, status:'hypothesis', source:'Correlation Agent · proposed link', time:'13:06', detail:'Name and date-of-birth overlap is suggestive but not conclusive. Independent identity resolution is required before this can be relied upon.' },
    { title:'Claimed payment date conflicts with ledger timestamp', conf:31, status:'contradicted', source:'Document Intelligence + Hash Verification', time:'12:52', detail:'The signed invoice asserts a payment date three days earlier than the earliest observed ledger entry. Document metadata shows a later modification.' }
  ],
  timeline: [
    { time:'08:41', label:'Investigation initiated', detail:'Prompt received · plan generated', tone:'accent' },
    { time:'09:02', label:'Collection phase started', detail:'5 agents delegated · 11 tools authorized', tone:'accent' },
    { time:'10:18', label:'First source set verified', detail:'23 sources · 4 artifacts hashed', tone:'success' },
    { time:'11:35', label:'Human approval checkpoint', detail:'External API call authorized by V. Kulkarni', tone:'warning' },
    { time:'12:52', label:'Contradiction detected', detail:'Invoice date vs. ledger timestamp', tone:'danger' },
    { time:'13:06', label:'Proposed link added to graph', detail:'Unverified · awaiting corroboration', tone:'violet' },
    { time:'14:02', label:'Findings consolidated', detail:'4 key findings · report draft updated', tone:'success' }
  ],
  graphNodes: [
    { id:'shell1', label:'Northbridge Holdings', type:'Organization', x:290, y:170, conf:92, status:'verified' },
    { id:'shell2', label:'Meridian Trade LLP', type:'Organization', x:150, y:280, conf:89, status:'verified' },
    { id:'shell3', label:'Aster Consulting', type:'Organization', x:440, y:296, conf:76, status:'verified' },
    { id:'person1', label:'R. Venkatesh', type:'Person', x:250, y:400, conf:46, status:'hypothesis' },
    { id:'wallet1', label:'0x71C…9aF2', type:'Wallet', x:570, y:170, conf:88, status:'verified' },
    { id:'exchange', label:'Exchange Deposit', type:'Wallet', x:720, y:262, conf:78, status:'verified' },
    { id:'domain1', label:'northbridge-pay.com', type:'Domain', x:438, y:72, conf:71, status:'unverified' },
    { id:'invoice', label:'Invoice INV-7781', type:'Document', x:100, y:120, conf:96, status:'verified' },
    { id:'phone', label:'+91 98••• ••210', type:'Identifier', x:130, y:430, conf:41, status:'hypothesis' }
  ],
  graphEdges: [
    ['invoice','shell1','verified','Issued by'],
    ['shell1','shell2','verified','Shared director'],
    ['shell1','shell3','verified','Same registered agent'],
    ['shell2','person1','hypothesis','Possible beneficial owner'],
    ['shell3','wallet1','verified','Payment recipient'],
    ['wallet1','exchange','verified','Traced 2 hops'],
    ['shell1','domain1','unverified','Registrant overlap'],
    ['person1','phone','hypothesis','Possible association']
  ]
};
