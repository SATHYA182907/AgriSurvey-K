import { LanguageCode } from '@/types/language';

export interface Translations {
  nav: {
    home: string;
    howItWorks: string;
    features: string;
    verification: string;
    faq: string;
    signInSignUp: string;
    signIn: string;
    signUp: string;
    dashboard: string;
    tagline: string;
  };
  hero: {
    badge: string;
    titlePart1: string;
    titlePart2: string;
    subtitle: string;
    registerLand: string;
    portalLogin: string;
    parcelsSurveyed: string;
    accuracy: string;
    taluksCovered: string;
    digitalRegistration?: string;
    transparentReview?: string;
    evidenceBased?: string;
    explorePlatform?: string;
  };
  operations: {
    badge: string;
    subtitle: string;
    registeredFarmers: string;
    activeVerified: string;
    landApplications: string;
    submittedRevenue: string;
    verifiedProperties: string;
    finalReportIssued: string;
    pendingInspections: string;
    inQueue: string;
    district?: string;
  };
  howItWorks: {
    badge: string;
    title: string;
    subtitle: string;
    phaseWorkflow: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  featuresSection: {
    badge: string;
    title: string;
    subtitle: string;
    feat1Title: string;
    feat1Desc: string;
    feat2Title: string;
    feat2Desc: string;
    feat3Title: string;
    feat3Desc: string;
    feat4Title: string;
    feat4Desc: string;
    feat5Title: string;
    feat5Desc: string;
    feat6Title: string;
    feat6Desc: string;
  };
  roles: {
    badge: string;
    title: string;
    forFarmers: string;
    farmerP1: string;
    farmerP2: string;
    farmerP3: string;
    farmerP4: string;
    forTahsildars: string;
    tahsildarP1: string;
    tahsildarP2: string;
    tahsildarP3: string;
    tahsildarP4: string;
    forFieldWorkers: string;
    fieldWorkerP1: string;
    fieldWorkerP2: string;
    fieldWorkerP3: string;
    fieldWorkerP4: string;
    forAdmins: string;
    adminP1: string;
    adminP2: string;
    adminP3: string;
    adminP4: string;
  };
  faqSection: {
    badge: string;
    title: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
  };
  cta: {
    title: string;
    subtitle: string;
    registerBtn: string;
    officerBtn: string;
  };
  footer: {
    mission: string;
    evidenceBadge: string;
    platform: string;
    farmerReg: string;
    howItWorks: string;
    features: string;
    workflow: string;
    officerLogin: string;
    governance: string;
    privacy: string;
    terms: string;
    disclaimer: string;
    accessibility: string;
    audit: string;
    helpdesk: string;
    address: string;
    tollFree: string;
    rights: string;
    notice: string;
  };
  auth: {
    backToHome: string;
    gatewayTitle: string;
    signInTab: string;
    signUpTab: string;
    signInTitle: string;
    signInSubtitle: string;
    mobileOrUser: string;
    password: string;
    passwordPlaceholder: string;
    signInButton: string;
    newFarmer: string;
    registerPrompt: string;
    alreadyRegistered: string;
    loginPrompt: string;
    instantLogin: string;
    farmerRole: string;
    tahsildarRole: string;
    fieldWorkerRole: string;
    adminRole: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    prefLanguage: string;
    next: string;
    prev: string;
    submit: string;
    appSubmitted: string;
    approvalNotice: string;
    appRef: string;
    propRef: string;
    surveyNo: string;
    village: string;
  };
  dashboard: {
    overview: string;
    registerLand: string;
    myProperties: string;
    uploadImages: string;
    droneStatus: string;
    verificationReports: string;
    notifications: string;
    assignInspections: string;
    imageComparison: string;
    cropVerification: string;
    auditLogs: string;
    systemNotifications: string;
    signOut: string;
    registrationQueue?: string;
    assignedInspections?: string;
    uploadDrone?: string;
    completedSurveys?: string;
    userManagement?: string;
    geoRegions?: string;
    analyticsTrends?: string;
    systemSettings?: string;
    switchPersona?: string;
  };
  common: {
    selectLanguage: string;
    languages: string;
    allIndia: string;
  };
}

export const translations: Record<LanguageCode, Translations> = {
  // English (Default)
  en: {
    operations: {
      "badge": "Live Platform Operations",
      "subtitle": "Validated metrics retrieved directly from database records",
      "registeredFarmers": "Registered Farmers",
      "activeVerified": "Active verified accounts",
      "landApplications": "Land Applications",
      "submittedRevenue": "Submitted for revenue review",
      "verifiedProperties": "Verified Properties",
      "finalReportIssued": "Final evidence report issued",
      "pendingInspections": "Pending Inspections",
      "inQueue": "In Tahsildar / drone queue"
},
    howItWorks: {
      "badge": "End-To-End Architecture",
      "title": "How AgriSurvey Verifies Agricultural Land",
      "subtitle": "A transparent, 4-stage verification workflow connecting landholders with revenue administration.",
      "phaseWorkflow": "Phase {num} Workflow",
      "step1Title": "Farmer Registration",
      "step1Desc": "Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.",
      "step2Title": "Tahsildar Review",
      "step2Desc": "Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.",
      "step3Title": "Drone-Based Inspection",
      "step3Desc": "Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.",
      "step4Title": "Verification Report",
      "step4Desc": "Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output."
},
    featuresSection: {
      "badge": "Advanced Capabilities",
      "title": "Enterprise Technology Built for Revenue Administration",
      "subtitle": "From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.",
      "feat1Title": "Digital Landholder Onboarding",
      "feat1Desc": "Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.",
      "feat2Title": "Ground & Drone Evidence",
      "feat2Desc": "Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.",
      "feat3Title": "Image Comparison Workspace",
      "feat3Desc": "Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.",
      "feat4Title": "Crop Identification System",
      "feat4Desc": "Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.",
      "feat5Title": "Event-Driven SMS Notifications",
      "feat5Desc": "Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.",
      "feat6Title": "Administrative Analytics",
      "feat6Desc": "Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails."
},
    roles: {
      "badge": "Role-Specific Value",
      "title": "Tailored for Every Agricultural Stakeholder",
      "forFarmers": "For Farmers",
      "farmerP1": "Effortless digital submission of 7/12 extract details",
      "farmerP2": "Real-time SMS & in-app stage tracking",
      "farmerP3": "Direct upload of 5-6 land photographs",
      "farmerP4": "Certified PDF report download upon completion",
      "forTahsildars": "For Tahsildars",
      "tahsildarP1": "Geographic review queue for assigned taluk",
      "tahsildarP2": "Side-by-side ground vs drone comparison workspace",
      "tahsildarP3": "Crop declaration cross-matching with AI aid",
      "tahsildarP4": "Mandatory audit trails on decisions",
      "forFieldWorkers": "For Field Workers",
      "fieldWorkerP1": "Clear dispatch list of scheduled inspections",
      "fieldWorkerP2": "GPS mission logging & drone photo uploads",
      "fieldWorkerP3": "Field notes and anomaly documentation",
      "fieldWorkerP4": "Mobile-friendly field data collection",
      "forAdmins": "For Administrators",
      "adminP1": "Role provisioning & staff region allocations",
      "adminP2": "Recharts visualization across districts",
      "adminP3": "Verification turnaround monitoring",
      "adminP4": "Immutable security audit event logging"
},
    faqSection: {
      "badge": "Common Questions",
      "title": "Frequently Asked Questions",
      "q1": "How can a farmer register agricultural land on AgriSurvey?",
      "a1": "Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.",
      "q2": "Why are 5 to 6 farmer ground photographs required?",
      "a2": "Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.",
      "q3": "How does drone-based aerial inspection operate?",
      "a3": "An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.",
      "q4": "Does AgriSurvey verification certify legal land ownership?",
      "a4": "No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.",
      "q5": "How does the Tahsildar review and decide on applications?",
      "a5": "Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports."
},
    cta: {
      "title": "Ready to Begin Digital Agricultural Land Verification?",
      "subtitle": "Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed drone field verification.",
      "registerBtn": "Register Your Land Today",
      "officerBtn": "Revenue Officer Portal"
},
    footer: {
      "mission": "AgriSurvey is a centralized agricultural land administration and verification platform connecting farmers, revenue officers, and field surveyors through drone photogrammetry and intelligent crop monitoring.",
      "evidenceBadge": "Evidence-based land verification system",
      "platform": "Platform",
      "farmerReg": "Farmer Registration",
      "howItWorks": "How It Works",
      "features": "Platform Features",
      "workflow": "Drone Inspection Workflow",
      "officerLogin": "Staff & Officer Sign In",
      "governance": "Governance & Policies",
      "privacy": "Privacy Policy & Data Protection",
      "terms": "Terms of Service & Usage Rules",
      "disclaimer": "Statutory Title Disclaimer",
      "accessibility": "Accessibility Standards",
      "audit": "Audit & Security Assurance",
      "helpdesk": "Administrative Helpdesk",
      "address": "Central Revenue & Land Survey Bhavan, Pune Division, Maharashtra 411001",
      "tollFree": "Toll-Free Kisan Support: 1800-233-0242",
      "rights": "All rights reserved.",
      "notice": "Notice: AgriSurvey verification reports represent evidence-backed field photogrammetry records and do not substitute for judicial determination or certified deeds of title."
},
    nav: {
      home: 'Home',
      howItWorks: 'How It Works',
      features: 'Features',
      verification: 'Verification Process',
      faq: 'FAQ',
      signInSignUp: 'Sign In / Sign Up',
      signIn: 'Sign In',
      signUp: 'Register Land',
      dashboard: 'Dashboard',
      tagline: 'Land Verification Platform',
    },
    hero: {
      badge: 'Official Agricultural Land Verification',
      titlePart1: 'Next-Gen Drone & Ground',
      titlePart2: 'Land Verification',
      subtitle: 'Connecting farmers and revenue officers with cutting-edge drone surveying, high-resolution imagery comparison, and crop verification.',
      registerLand: 'Register Land Now',
      portalLogin: 'Portal Sign In',
      parcelsSurveyed: 'Parcels Surveyed',
      accuracy: 'Verification Accuracy',
      taluksCovered: 'Taluks Covered',
    },
    auth: {
      backToHome: 'Back to Home',
      gatewayTitle: 'Agricultural Land Administration & Verification Gateway',
      signInTab: 'Sign In',
      signUpTab: 'Register Land',
      signInTitle: 'Farmer & Official Portal Sign In',
      signInSubtitle: 'Enter your registered mobile or username, and the official password sent via SMS text message after Tahsildar approval.',
      mobileOrUser: 'Registered Mobile Number or Username',
      password: 'Password (received via SMS)',
      passwordPlaceholder: 'Enter SMS password (e.g. Agri@8484)',
      signInButton: 'Sign In to AgriSurvey',
      newFarmer: 'New farmer?',
      registerPrompt: 'Register your land to apply for portal access →',
      alreadyRegistered: 'Already have an approved account?',
      loginPrompt: 'Sign in with your SMS credentials →',
      instantLogin: 'Instant Persona Login (Evaluation Mode)',
      farmerRole: 'Farmer',
      tahsildarRole: 'Tahsildar',
      fieldWorkerRole: 'Field Worker',
      adminRole: 'Admin',
      step1: '1. Farmer & Contact',
      step2: '2. Identity & Address',
      step3: '3. Agricultural Property',
      step4: '4. Review & Submit',
      fullName: 'Farmer Full Name',
      mobileNumber: 'Mobile Number (for SMS Login)',
      email: 'Email Address (Optional)',
      prefLanguage: 'Preferred Language',
      next: 'Next Step',
      prev: 'Previous Step',
      submit: 'Submit Land Registration',
      appSubmitted: 'Registration Submitted Successfully!',
      approvalNotice: 'Your application has been sent to the Tahsildar. Upon review and approval, your portal password will be sent to your mobile phone via SMS.',
      appRef: 'Application Reference',
      propRef: 'Property Reference',
      surveyNo: 'Survey Number',
      village: 'Village / Taluk',
    },
    dashboard: {
      overview: 'Overview',
      registerLand: 'Register Land',
      myProperties: 'My Properties',
      uploadImages: 'Upload Land Images',
      droneStatus: 'Drone Inspection Status',
      verificationReports: 'Verification Reports',
      notifications: 'Notifications',
      assignInspections: 'Assign Inspections',
      imageComparison: 'Image Comparison',
      cropVerification: 'Crop Verification',
      auditLogs: 'Audit History',
      systemNotifications: 'System Notifications',
      signOut: 'Sign Out',
    },
    common: {
      selectLanguage: 'Select Language',
      languages: 'Languages',
      allIndia: 'Multi-State Support',
    },
  },

  // Marathi (मराठी) - Maharashtra State
  mr: {
    operations: {
      "badge": "थेट प्रणाली कामकाज",
      "subtitle": "डेटाबेस नोंदींवरून थेट प्राप्त केलेले प्रमाणित मेट्रिक्स",
      "registeredFarmers": "नोंदणीकृत शेतकरी",
      "activeVerified": "सक्रिय पडताळणी खाती",
      "landApplications": "जमीन नोंदणी अर्ज",
      "submittedRevenue": "महसूल तपासणीसाठी सादर",
      "verifiedProperties": "पडताळणी पूर्ण शेतजमीन",
      "finalReportIssued": "अंतिम पुरावा अहवाल जारी",
      "pendingInspections": "प्रलंबित पाहणी",
      "inQueue": "तहसीलदार / ड्रोन रांगेत"
},
    howItWorks: {
      "badge": "संपूर्ण कार्यपद्धती",
      "title": "ॲग्रीसर्व्हे कृषी जमिनीची पडताळणी कशी करते",
      "subtitle": "शेतकरी आणि महसूल प्रशासनाला जोडणारी पारदर्शक ४-टप्प्यांची पडताळणी प्रणाली.",
      "phaseWorkflow": "टप्पा {num} कार्यपद्धती",
      "step1Title": "शेतकरी नोंदणी",
      "step1Desc": "वैयक्तिक ओळख, गट/सर्व्हे क्रमांक, ७/१२ उतारा तपशील आणि जमिनीच्या सीमा डिजिटल अर्जाद्वारे सादर करा.",
      "step2Title": "तहसीलदार तपासणी",
      "step2Desc": "अधिकारप्राप्त महसूल अधिकारी कार्यक्षेत्रातील जमिनीच्या नोंदी तपासून अर्ज मंजूर करतात किंवा अधिक स्पष्टीकरण मागवतात.",
      "step3Title": "ड्रोनद्वारे पाहणी",
      "step3Desc": "मंजूर शेतकरी जमिनीचे फोटो अपलोड करतात; प्रमाणित फील्ड वर्कर उच्च-रिझोल्यूशन हवाई पुरावा नोंदवण्यासाठी आरटीके ड्रोन सर्वेक्षण करतात.",
      "step4Title": "पडताळणी अहवाल",
      "step4Desc": "तुलनात्मक प्रतिमा पडताळणी आणि पीक तपासणीनंतर डाउनलोड करण्यायोग्य प्रमाणित पीडीएफ अहवाल तयार होतो."
},
    featuresSection: {
      "badge": "प्रगत वैशिष्ट्ये",
      "title": "महसूल प्रशासनासाठी विकसित अत्याधुनिक तंत्रज्ञान",
      "subtitle": "शेतकरी नोंदणीपासून ते उच्च दर्जाच्या आरटीके ड्रोन फोटोग्रामेट्री आणि पीक विश्लेषण तंत्रज्ञानापर्यंत.",
      "feat1Title": "डिजिटल शेतकरी नोंदणी",
      "feat1Desc": "आधार-अनुरूप गोपनीयतेसह सुलभ बहु-टप्प्यांची शेतजमीन घोषणा आणि स्वयंचलित तालुका महसूल वाटप.",
      "feat2Title": "प्रत्यक्ष आणि ड्रोन पुरावे",
      "feat2Desc": "शेतकऱ्यांनी काढलेले ५-६ प्रत्यक्ष जमिनीचे फोटो आणि प्रमाणित ड्रोन ऑर्थोमोझॅक प्रतिमा सुरक्षित ठेवणे.",
      "feat3Title": "प्रतिमा तुलना कार्यक्षेत्र",
      "feat3Desc": "महसूल अधिकाऱ्यांसाठी झूम, पॅन आणि संरचित सीमा चिन्हांसह दुहेरी सिंक्रोनाइझ्ड प्रतिमा दर्शक.",
      "feat4Title": "पीक पडताळणी प्रणाली",
      "feat4Desc": "घोषित पिके, प्रत्यक्ष वाढ, हंगाम, सिंचन पद्धती आणि एआय संगणकीय दृष्टी विश्लेषणाचा ताळमेळ.",
      "feat5Title": "प्रसंगाधारित एसएमएस सूचना",
      "feat5Desc": "प्रत्येक महत्त्वाच्या टप्प्यावर पारदर्शक एसएमएस अपडेट्स आणि लॉगिन तपशील वितरण.",
      "feat6Title": "प्रशासकीय विश्लेषण",
      "feat6Desc": "वरिष्ठ अधिकाऱ्यांसाठी तालुका वाटप, कामाचा वेग आणि सुरक्षित ऑडिट नोंदींसह संपूर्ण परिचालन दृश्यमानता."
},
    roles: {
      "badge": "भूमिका-विशिष्ट फायदे",
      "title": "प्रत्येक कृषी घटकासाठी विशेष रचना",
      "forFarmers": "शेतकऱ्यांसाठी",
      "farmerP1": "७/१२ उताऱ्याची माहिती डिजिटल पद्धतीने सहज सादर करणे",
      "farmerP2": "थेट एसएमएस आणि ॲपमध्ये अर्जाचा पाठपुरावा",
      "farmerP3": "शेतजमिनीचे ५-६ फोटो थेट अपलोड करण्याची सुविधा",
      "farmerP4": "पडताळणी पूर्ण झाल्यावर अधिकृत प्रमाणित पीडीएफ अहवाल",
      "forTahsildars": "तहसीलदारांसाठी",
      "tahsildarP1": "नियुक्त तालुक्यासाठी भौगोलिक अर्ज तपासणी यादी",
      "tahsildarP2": "प्रत्यक्ष फोटो वि. ड्रोन फोटो समोरासमोर तुलना कार्यक्षेत्र",
      "tahsildarP3": "एआय साहाय्याने पीक नोंदींची अचूक पडताळणी",
      "tahsildarP4": "निर्णयांवर अनिवार्य डिजिटल ऑडिट नोंदी",
      "forFieldWorkers": "फील्ड वर्कर्ससाठी",
      "fieldWorkerP1": "नियोजित पाहणींची स्पष्ट दैनिक यादी",
      "fieldWorkerP2": "जीपीएस मिशन ट्रॅकिंग आणि ड्रोन फोटो अपलोड",
      "fieldWorkerP3": "क्षेत्रीय नोंदी आणि विसंगतींची त्वरित नोंद",
      "fieldWorkerP4": "मोबाईलवर सहज माहिती संकलन सुविधा",
      "forAdmins": "प्रशासकांसाठी",
      "adminP1": "अधिकारी भूमिका आणि कार्यक्षेत्र वाटप व्यवस्थापन",
      "adminP2": "जिल्हानिहाय आलेख व सांख्यिकी विश्लेषण",
      "adminP3": "अर्ज निर्गती वेळेचे थेट निरीक्षण",
      "adminP4": "अपरिवर्तनीय सुरक्षा आणि ऑडिट नोंदी"
},
    faqSection: {
      "badge": "सामान्य प्रश्न",
      "title": "नेहमी विचारले जाणारे प्रश्न",
      "q1": "शेतकरी ॲग्रीसर्व्हेवर शेतजमिनीची नोंदणी कशी करू शकतात?",
      "a1": "शेतकरी मोफत खाते तयार करू शकतात, संपर्क माहिती, ७/१२ उतारा क्रमांक, गट/सर्व्हे क्रमांक, क्षेत्रफळ प्रविष्ट करून ४ टप्प्यांत अर्ज सादर करू शकतात.",
      "q2": "शेतकऱ्यांनी ५ ते ६ प्रत्यक्ष जमिनीचे फोटो का अपलोड करावेत?",
      "a2": "तहसीलदारांनी प्राथमिक मंजुरी दिल्यानंतर, ड्रोन उड्डाणापूर्वी स्पष्ट पुरावा म्हणून बांध, प्रवेशद्वार, पिकांच्या ओळी व जलसिंचनाचे फोटो आवश्यक असतात.",
      "q3": "ड्रोन आधारित हवाई पाहणी कशी कार्य करते?",
      "a3": "अधिकृत फील्ड वर्कर जमिनीवर प्रत्यक्ष भेट देऊन आरटीके तंत्रज्ञानासह ४५ मीटर उंचीवरून उच्च-दर्जाची छायाचित्रे घेतात आणि अहवाल महसूल अधिकाऱ्याकडे पाठवतात.",
      "q4": "ॲग्रीसर्व्हे पडताळणी कायदेशीर मालकी हक्क प्रमाणित करते का?",
      "a4": "नाही. ॲग्रीसर्व्हे हे प्रत्यक्ष शेतजमीन आणि ड्रोन प्रतिमांची तांत्रिक पडताळणी करणारे व्यासपीठ आहे. हे न्यायालयीन निर्णय किंवा अधिकृत मालकी हक्कांची जागा घेत नाही.",
      "q5": "तहसीलदार अर्जांचे पुनरावलोकन आणि निर्णय कसे घेतात?",
      "a5": "तहसीलदार त्यांच्या कार्यक्षेत्रातील पोर्टलद्वारे अर्जांची तपासणी करतात. ते मंजुरी, कारणांसह नकार, स्पष्टीकरण मागणी, प्रतिमा तुलना व अंतिम पडताळणी अहवाल जारी करू शकतात."
},
    cta: {
      "title": "डिजिटल कृषी जमीन पडताळणी सुरू करण्यास तयार आहात?",
      "subtitle": "पारदर्शक आणि पुराव्यावर आधारित ड्रोन पडताळणीचा लाभ घेणाऱ्या हजारो शेतकऱ्यांमध्ये सामील व्हा.",
      "registerBtn": "आजच आपली जमीन नोंदवा",
      "officerBtn": "महसूल अधिकारी पोर्टल"
},
    footer: {
      "mission": "ॲग्रीसर्व्हे हे शेतकरी, महसूल अधिकारी आणि सर्वेक्षकांना ड्रोन फोटोग्रामेट्री आणि पीक विश्लेषणाद्वारे जोडणारे केंद्रीय कृषी जमीन पडताळणी व्यासपीठ आहे.",
      "evidenceBadge": "पुराव्यावर आधारित जमीन पडताळणी प्रणाली",
      "platform": "व्यासपीठ",
      "farmerReg": "शेतकरी नोंदणी",
      "howItWorks": "कसे कार्य करते",
      "features": "प्रणालीची वैशिष्ट्ये",
      "workflow": "ड्रोन पाहणी प्रक्रिया",
      "officerLogin": "कर्मचारी व अधिकारी प्रवेश",
      "governance": "प्रशासन आणि धोरणे",
      "privacy": "गोपनीयता धोरण व डेटा संरक्षण",
      "terms": "सेवा अटी व वापर नियम",
      "disclaimer": "वैधानिक मालकी अस्वीकरण",
      "accessibility": "सुलभता मानके",
      "audit": "ऑडिट आणि सुरक्षा हमी",
      "helpdesk": "प्रशासकीय मदत केंद्र",
      "address": "केंद्रीय महसूल व भूमी अभिलेख भवन, पुणे विभाग, महाराष्ट्र ४११००१",
      "tollFree": "टोल-फ्री किसान मदत: १८००-२३३-०२४२",
      "rights": "सर्व हक्क राखीव.",
      "notice": "सूचना: ॲग्रीसर्व्हे पडताळणी अहवाल हे पुराव्याधारित फोटोग्रामेट्री रेकॉर्ड आहेत आणि ते न्यायालयीन निर्णय किंवा अधिकृत दस्तऐवजांची जागा घेत नाहीत."
},
    nav: {
      home: 'मुख्यपृष्ठ',
      howItWorks: 'कसे कार्य करते',
      features: 'वैशिष्ट्ये',
      verification: 'पडताळणी',
      faq: 'सामान्य प्रश्न',
      signInSignUp: 'साइन इन / नोंदणी',
      signIn: 'साइन इन',
      signUp: 'जमीन नोंदणी',
      dashboard: 'डॅशबोर्ड',
      tagline: 'जमीन पडताळणी प्रणाली',
    },
    hero: {
      badge: 'अधिकृत कृषी जमीन पडताळणी प्रणाली',
      titlePart1: 'अत्याधुनिक ड्रोन आणि प्रत्यक्ष',
      titlePart2: 'जमीन पडताळणी',
      subtitle: 'शेतकरी आणि महसूल अधिकाऱ्यांना अत्याधुनिक ड्रोन सर्वेक्षण, उच्च-रिझोल्यूशन प्रतिमा तुलना आणि पीक पडताळणीसह जोडणे.',
      registerLand: 'आता जमीन नोंदणी करा',
      portalLogin: 'पोर्टल साइन इन',
      parcelsSurveyed: 'मोजणी केलेले क्षेत्र',
      accuracy: 'पडताळणी अचूकता',
      taluksCovered: 'समाविष्ट तालुके',
    },
    auth: {
      backToHome: 'मुख्यपृष्ठावर परत जा',
      gatewayTitle: 'महाराष्ट्र कृषी जमीन प्रशासन आणि पडताळणी प्रवेशद्वार',
      signInTab: 'साइन इन',
      signUpTab: 'जमीन नोंदणी',
      signInTitle: 'शेतकरी आणि अधिकारी पोर्टल प्रवेश',
      signInSubtitle: 'तहसीलदार मंजुरीनंतर एसएमएसद्वारे पाठवलेला अधिकृत पासवर्ड आणि नोंदणीकृत मोबाइल नंबर प्रविष्ट करा.',
      mobileOrUser: 'नोंदणीकृत मोबाइल क्रमांक किंवा वापरकर्ता नाव',
      password: 'पासवर्ड (एसएमएस द्वारे प्राप्त)',
      passwordPlaceholder: 'एसएमएस पासवर्ड टाका (उदा. Agri@8484)',
      signInButton: 'ॲग्रीसर्व्हेमध्ये साइन इन करा',
      newFarmer: 'नवीन शेतकरी आहात?',
      registerPrompt: 'पोर्टल प्रवेश मिळवण्यासाठी आपली जमीन नोंदवा →',
      alreadyRegistered: 'आधीच मंजूर खाते आहे का?',
      loginPrompt: 'तुमच्या एसएमएस तपशीलांसह साइन इन करा →',
      instantLogin: 'झटपट चाचणी लॉगिन (मूल्यांकन मोड)',
      farmerRole: 'शेतकरी',
      tahsildarRole: 'तहसीलदार',
      fieldWorkerRole: 'फील्ड वर्कर',
      adminRole: 'प्रशासक',
      step1: '१. शेतकरी आणि संपर्क माहिती',
      step2: '२. ओळख आणि पत्ता',
      step3: '३. कृषी जमिनीचा तपशील',
      step4: '४. पुनरावलोकन आणि सादर करा',
      fullName: 'शेतकऱ्याचे पूर्ण नाव',
      mobileNumber: 'मोबाइल क्रमांक (एसएमएस लॉगिनसाठी)',
      email: 'ईमेल पत्ता (पर्यायी)',
      prefLanguage: 'पसंतीची भाषा',
      next: 'पुढील टप्पा',
      prev: 'मागील टप्पा',
      submit: 'जमीन नोंदणी सादर करा',
      appSubmitted: 'नोंदणी यशस्वीरित्या सादर झाली!',
      approvalNotice: 'तुमचा अर्ज तहसीलदारांकडे पाठवला गेला आहे. पडताळणी आणि मंजुरीनंतर लॉगिन पासवर्ड एसएमएसद्वारे तुमच्या मोबाईलवर येईल.',
      appRef: 'अर्ज संदर्भ क्रमांक',
      propRef: 'जमीन संदर्भ क्रमांक',
      surveyNo: 'गट / सर्व्हे क्रमांक',
      village: 'गाव / तालुका',
    },
    dashboard: {
      overview: 'आढावा',
      registerLand: 'जमीन नोंदणी करा',
      myProperties: 'माझी शेतजमीन',
      uploadImages: 'जमिनीचे फोटो अपलोड करा',
      droneStatus: 'ड्रोन पाहणी स्थिती',
      verificationReports: 'पडताळणी अहवाल',
      notifications: 'सूचना',
      assignInspections: 'पाहणी वाटप करा',
      imageComparison: 'प्रतिमा तुलना',
      cropVerification: 'पीक पडताळणी',
      auditLogs: 'ऑडिट इतिहास',
      systemNotifications: 'प्रणाली सूचना',
      signOut: 'बाहेर पडा (Sign Out)',
    },
    common: {
      selectLanguage: 'भाषा निवडा',
      languages: 'भाषा',
      allIndia: 'सर्व राज्ये समर्थन',
    },
  },

  // Hindi (हिन्दी)
  hi: {
    operations: {
      "badge": "सक्रिय प्लेटफ़ॉर्म संचालन",
      "subtitle": "डेटाबेस रिकॉर्ड्स से सीधे सत्यापित मेट्रिक्स",
      "registeredFarmers": "पंजीकृत किसान",
      "activeVerified": "सक्रिय सत्यापित खाते",
      "landApplications": "भूमि आवेदन",
      "submittedRevenue": "राजस्व समीक्षा हेतु प्रस्तुत",
      "verifiedProperties": "सत्यापित संपत्तियां",
      "finalReportIssued": "अंतिम साक्ष्य रिपोर्ट जारी",
      "pendingInspections": "लंबित निरीक्षण",
      "inQueue": "तहसीलदार / ड्रोन कतार में"
},
    howItWorks: {
      "badge": "संपूर्ण वास्तुकला",
      "title": "एग्रीसर्वे कृषि भूमि का सत्यापन कैसे करता है",
      "subtitle": "भूमिधारकों को राजस्व प्रशासन से जोड़ने वाली पारदर्शी ४-चरणीय सत्यापन कार्यप्रणाली।",
      "phaseWorkflow": "चरण {num} कार्यप्रणाली",
      "step1Title": "किसान पंजीकरण",
      "step1Desc": "डिजिटल फॉर्म के माध्यम से व्यक्तिगत पहचान, खसरा/सर्वे नंबर, ७/१२ उद्धरण और भूमि सीमाएं जमा करें।",
      "step2Title": "तहसीलदार समीक्षा",
      "step2Desc": "अधिकृत राजस्व अधिकारी अपने अधिकार क्षेत्र के भूमि रिकॉर्ड की जांच कर आवेदनों को मंजूरी देते हैं।",
      "step3Title": "ड्रोन आधारित निरीक्षण",
      "step3Desc": "मंजूर किसान जमीन की तस्वीरें अपलोड करते हैं; प्रमाणित फील्ड कार्यकर्ता सटीक ड्रोन फोटोग्रामेट्री से साक्ष्य दर्ज करते हैं।",
      "step4Title": "सत्यापन रिपोर्ट",
      "step4Desc": "तुलनात्मक छवि मिलान और फसल सत्यापन के बाद डाउनलोड करने योग्य प्रमाणित पीडीएफ रिपोर्ट तैयार होती है।"
},
    featuresSection: {
      "badge": "उन्नत क्षमताएं",
      "title": "राजस्व प्रशासन हेतु निर्मित आधुनिक तकनीक",
      "subtitle": "किसान ऑनबोर्डिंग से लेकर उच्च-रिज़ॉल्यूशन आरटीके ड्रोन फोटोग्रामेट्री और फसल विश्लेषण तक।",
      "feat1Title": "डिजिटल किसान ऑनबोर्डिंग",
      "feat1Desc": "आधार-अनुरूप गोपनीयता के साथ सुगम बहु-चरणीय भूमि घोषणा और स्वचालित तहसील राजस्व आवंटन।",
      "feat2Title": "जमीनी एवं ड्रोन साक्ष्य",
      "feat2Desc": "किसानों द्वारा ली गई ५-६ तस्वीरों और प्रमाणित ड्रोन ऑर्थोमोसैक छवियों का सुरक्षित भंडारण।",
      "feat3Title": "छवि तुलना कार्यक्षेत्र",
      "feat3Desc": "राजस्व अधिकारियों के लिए ज़ूम, पैन और सीमा चिह्नों के साथ दोहरी सिंक्रनाइज़्ड छवि दर्शक।",
      "feat4Title": "फसल पहचान प्रणाली",
      "feat4Desc": "घोषित फसलों, वास्तविक स्थिति, मौसमी चक्र, सिंचाई साधनों और एआई दृष्टि विश्लेषण का सटीक मिलान।",
      "feat5Title": "घटना-आधारित एसएमएस सूचनाएं",
      "feat5Desc": "प्रत्येक महत्वपूर्ण पड़ाव पर स्वचालित एसएमएस अपडेट और सुरक्षित क्रेडेंशियल वितरण।",
      "feat6Title": "प्रशासनिक विश्लेषण",
      "feat6Desc": "वरिष्ठ अधिकारियों के लिए तहसील आवंटन, समय सीमा मेट्रिक्स और ऑडिट रिकॉर्ड की पूर्ण दृश्यता।"
},
    roles: {
      "badge": "भूमिका-विशिष्ट लाभ",
      "title": "प्रत्येक कृषि हितधारक के लिए उपयुक्त",
      "forFarmers": "किसानों के लिए",
      "farmerP1": "७/१२ उद्धरण का डिजिटल रूप से आसान सबमिशन",
      "farmerP2": "रियल-टाइम एसएमएस एवं ऐप में आवेदन ट्रैकिंग",
      "farmerP3": "भूमि की ५-६ तस्वीरों का सीधा अपलोड",
      "farmerP4": "सत्यापन पूर्ण होने पर प्रमाणित पीडीएफ रिपोर्ट डाउनलोड",
      "forTahsildars": "तहसीलदारों के लिए",
      "tahsildarP1": "आवंटित तहसील के लिए भौगोलिक आवेदन समीक्षा कतार",
      "tahsildarP2": "जमीनी फोटो बनाम ड्रोन फोटो तुलना कार्यक्षेत्र",
      "tahsildarP3": "एआई सहायता से फसल घोषणाओं का सत्यापन",
      "tahsildarP4": "सभी निर्णयों पर अनिवार्य डिजिटल ऑडिट ट्रेल्स",
      "forFieldWorkers": "फील्ड कार्यकर्ताओं के लिए",
      "fieldWorkerP1": "निर्धारित निरीक्षणों की स्पष्ट दैनिक सूची",
      "fieldWorkerP2": "जीपीएस मिशन ट्रैकिंग और ड्रोन तस्वीरें अपलोड",
      "fieldWorkerP3": "क्षेत्रीय टिप्पणियां और विसंगतियों का तुरंत प्रलेखन",
      "fieldWorkerP4": "मोबाइल पर सुलभ डेटा संग्रह सुविधा",
      "forAdmins": "प्रशासकों के लिए",
      "adminP1": "भूमिका प्रावधान एवं कर्मचारी क्षेत्र आवंटन",
      "adminP2": "जिलेवार ग्राफिकल एवं सांख्यिकीय विश्लेषण",
      "adminP3": "सत्यापन टर्नअराउंड समय की लाइव निगरानी",
      "adminP4": "अपरिवर्तनीय सुरक्षा और ऑडिट इवेंट लॉगिंग"
},
    faqSection: {
      "badge": "सामान्य प्रश्न",
      "title": "अक्सर पूछे जाने वाले प्रश्न",
      "q1": "किसान एग्रीसर्वे पर कृषि भूमि का पंजीकरण कैसे कर सकते हैं?",
      "a1": "किसान निःशुल्क खाता बनाकर, संपर्क विवरण, ७/१२ रिकॉर्ड नंबर, खसरा नंबर और रकबा दर्ज करके ४ चरणों में आवेदन कर सकते हैं।",
      "q2": "किसानों द्वारा ५ से ६ जमीनी तस्वीरें क्यों आवश्यक हैं?",
      "a2": "तहसीलदार द्वारा प्रारंभिक मंजूरी मिलने के बाद, ड्रोन उड़ान से पहले आधारभूत साक्ष्य के रूप में मेढ़, सीमाएं और फसल की तस्वीरें आवश्यक होती हैं।",
      "q3": "ड्रोन आधारित हवाई निरीक्षण कैसे कार्य करता है?",
      "a3": "अधिकृत फील्ड कार्यकर्ता जमीन का दौरा कर ४५ मीटर की ऊंचाई से उच्च-रिज़ॉल्यूशन आरटीके ड्रोन तस्वीरें लेते हैं और रिपोर्ट प्रस्तुत करते हैं।",
      "q4": "क्या एग्रीसर्वे सत्यापन कानूनी स्वामित्व प्रमाणित करता है?",
      "a4": "नहीं। एग्रीसर्वे एक साक्ष्य-आधारित तकनीकी सत्यापन मंच है जो जमीनी वास्तविकता और ड्रोन चित्रों का मिलान करता है। यह अदालती आदेशों का विकल्प नहीं है।",
      "q5": "तहसीलदार आवेदनों की समीक्षा और निर्णय कैसे लेते हैं?",
      "a5": "तहसीलदार अपने अधिकार क्षेत्र के पोर्टल में लॉग इन कर आवेदनों की जांच करते हैं, तुलना करते हैं, फसलों का सत्यापन करते हैं और अंतिम रिपोर्ट जारी करते हैं।"
},
    cta: {
      "title": "क्या आप डिजिटल कृषि भूमि सत्यापन शुरू करने के लिए तैयार हैं?",
      "subtitle": "पारदर्शी और साक्ष्य-आधारित ड्रोन सत्यापन का लाभ उठाने वाले हजारों किसानों से जुड़ें।",
      "registerBtn": "आज ही अपनी भूमि पंजीकृत करें",
      "officerBtn": "राजस्व अधिकारी पोर्टल"
},
    footer: {
      "mission": "एग्रीसर्वे एक केंद्रीकृत कृषि भूमि प्रशासन और सत्यापन मंच है जो किसानों, राजस्व अधिकारियों और फील्ड सर्वेक्षकों को ड्रोन और एआई तकनीक से जोड़ता है।",
      "evidenceBadge": "साक्ष्य-आधारित भूमि सत्यापन प्रणाली",
      "platform": "मंच",
      "farmerReg": "किसान पंजीकरण",
      "howItWorks": "यह कैसे काम करता है",
      "features": "विशेषताएं",
      "workflow": "ड्रोन निरीक्षण प्रक्रिया",
      "officerLogin": "अधिकारी एवं कर्मचारी लॉगिन",
      "governance": "शासन एवं नीतियां",
      "privacy": "गोपनीयता नीति एवं डेटा संरक्षण",
      "terms": "सेवा की शर्तें",
      "disclaimer": "वैधानिक स्वामित्व अस्वीकरण",
      "accessibility": "पहुंच मानक",
      "audit": "सुरक्षा एवं ऑडिट आश्वासन",
      "helpdesk": "प्रशासनिक सहायता केंद्र",
      "address": "केंद्रीय राजस्व एवं भूमि सर्वेक्षण भवन, पुणे संभाग, महाराष्ट्र ४११००१",
      "tollFree": "टोल-फ्री किसान हेल्पलाइन: १८००-२३३-०२४२",
      "rights": "सर्वाधिकार सुरक्षित।",
      "notice": "सूचना: एग्रीसर्वे सत्यापन रिपोर्ट तकनीकी साक्ष्य का प्रतिनिधित्व करती है और यह किसी न्यायालयीन निर्णय या कानूनी विलेख का विकल्प नहीं है।"
},
    nav: {
      home: 'होम',
      howItWorks: 'कार्यप्रणाली',
      features: 'विशेषताएं',
      verification: 'सत्यापन',
      faq: 'सामान्य प्रश्न',
      signInSignUp: 'साइन इन / रजिस्टर',
      signIn: 'साइन इन',
      signUp: 'भूमि पंजीकरण',
      dashboard: 'डैशबोर्ड',
      tagline: 'भूमि सत्यापन मंच',
    },
    hero: {
      badge: 'आधिकारिक कृषि भूमि सत्यापन पोर्टल',
      titlePart1: 'अगली पीढ़ी का ड्रोन एवं जमीनी',
      titlePart2: 'भूमि सत्यापन',
      subtitle: 'किसानों और राजस्व अधिकारियों को उन्नत ड्रोन सर्वेक्षण, उच्च-रिज़ॉल्यूशन छवि मिलान और फसल सत्यापन से जोड़ना।',
      registerLand: 'भूमि पंजीकृत करें',
      portalLogin: 'पोर्टल लॉगिन',
      parcelsSurveyed: 'सर्वेक्षित भूमि क्षेत्र',
      accuracy: 'सत्यापन सटीकता',
      taluksCovered: 'कवर किए गए तहसील',
    },
    auth: {
      backToHome: 'होम पर वापस जाएं',
      gatewayTitle: 'कृषि भूमि प्रशासन एवं सत्यापन प्रवेश द्वार',
      signInTab: 'साइन इन',
      signUpTab: 'भूमि पंजीकरण',
      signInTitle: 'किसान एवं अधिकारी पोर्टल साइन इन',
      signInSubtitle: 'तहसीलदार की मंजूरी के बाद एसएमएस द्वारा प्राप्त आधिकारिक पासवर्ड और पंजीकृत मोबाइल नंबर दर्ज करें।',
      mobileOrUser: 'पंजीकृत मोबाइल नंबर या यूज़रनेम',
      password: 'पासवर्ड (एसएमएस द्वारा प्राप्त)',
      passwordPlaceholder: 'एसएमएस पासवर्ड दर्ज करें (उदा. Agri@8484)',
      signInButton: 'एग्रीसर्वे में साइन इन करें',
      newFarmer: 'नए किसान हैं?',
      registerPrompt: 'पोर्टल पहुंच हेतु अपनी भूमि पंजीकृत करें →',
      alreadyRegistered: 'क्या पहले से स्वीकृत खाता है?',
      loginPrompt: 'अपने एसएमएस क्रेडेंशियल के साथ साइन इन करें →',
      instantLogin: 'त्वरित डेमो लॉगिन (मूल्यांकन मोड)',
      farmerRole: 'किसान',
      tahsildarRole: 'तहसीलदार',
      fieldWorkerRole: 'फील्ड वर्कर',
      adminRole: 'व्यवस्थापक',
      step1: '1. किसान एवं संपर्क विवरण',
      step2: '2. पहचान एवं पता',
      step3: '3. कृषि भूमि विवरण',
      step4: '4. समीक्षा एवं सबमिट करें',
      fullName: 'किसान का पूरा नाम',
      mobileNumber: 'मोबाइल नंबर (एसएमएस लॉगिन हेतु)',
      email: 'ईमेल पता (वैकल्पिक)',
      prefLanguage: 'पसंदीदा भाषा',
      next: 'अगला चरण',
      prev: 'पिछला चरण',
      submit: 'भूमि पंजीकरण सबमिट करें',
      appSubmitted: 'पंजीकरण सफलतापूर्वक सबमिट हुआ!',
      approvalNotice: 'आपका आवेदन तहसीलदार को भेजा गया है। अनुमोदन के उपरांत पोर्टल पासवर्ड आपके मोबाइल पर एसएमएस द्वारा भेजा जाएगा।',
      appRef: 'आवेदन संदर्भ संख्या',
      propRef: 'संपत्ति संदर्भ संख्या',
      surveyNo: 'खसरा / सर्वे नंबर',
      village: 'गाँव / तहसील',
    },
    dashboard: {
      overview: 'अवलोकन',
      registerLand: 'भूमि पंजीकृत करें',
      myProperties: 'मेरी संपत्तियां',
      uploadImages: 'भूमि तस्वीरें अपलोड करें',
      droneStatus: 'ड्रोन निरीक्षण स्थिति',
      verificationReports: 'सत्यापन रिपोर्ट',
      notifications: 'सूचनाएं',
      assignInspections: 'निरीक्षण आवंटित करें',
      imageComparison: 'छवि तुलना',
      cropVerification: 'फसल सत्यापन',
      auditLogs: 'ऑडिट इतिहास',
      systemNotifications: 'प्रणाली सूचनाएं',
      signOut: 'लॉग आउट (Sign Out)',
    },
    common: {
      selectLanguage: 'भाषा चुनें',
      languages: 'भाषाएं',
      allIndia: 'बहु-राज्य सहायता',
    },
  },

  // Tamil (தமிழ்) - Tamil Nadu
  ta: {
    operations: {
      "badge": "தளத்தின் நேரடி செயல்பாடுகள்",
      "subtitle": "தரவுத்தள பதிவுகளிலிருந்து நேரடியாக பெறப்பட்ட சரிபார்க்கப்பட்ட அளவீடுகள்",
      "registeredFarmers": "பதிவுசெய்த விவசாயிகள்",
      "activeVerified": "சரிபார்க்கப்பட்ட கணக்குகள்",
      "landApplications": "நில விண்ணப்பங்கள்",
      "submittedRevenue": "வருவாய் ஆய்வுக்கு சமர்ப்பிக்கப்பட்டது",
      "verifiedProperties": "சரிபார்க்கப்பட்ட நிலங்கள்",
      "finalReportIssued": "இறுதி அறிக்கை வழங்கப்பட்டது",
      "pendingInspections": "நிலுவையில் உள்ள ஆய்வுகள்",
      "inQueue": "வட்டாட்சியர் / ட்ரோன் வரிசையில்"
},
    howItWorks: {
      "badge": "முழுமையான கட்டமைப்பு",
      "title": "அக்ரிசர்வே விவசாய நிலத்தை எவ்வாறு சரிபார்க்கிறது",
      "subtitle": "விவசாயிகளை வருவாய் நிர்வாகத்துடன் இணைக்கும் வெளிப்படையான 4-படி சரிபார்ப்பு அமைப்பு.",
      "phaseWorkflow": "படி {num} பணிப்பாய்வு",
      "step1Title": "விவசாயி பதிவு",
      "step1Desc": "தனிப்பட்ட அடையாளம், சர்வே எண்கள், பட்டா/சிட்டா விவரங்கள் மற்றும் நில எல்லைகளை டிஜிட்டல் படிவம் மூலம் சமர்ப்பிக்கவும்.",
      "step2Title": "வட்டாட்சியர் ஆய்வு",
      "step2Desc": "அங்கீகரிக்கப்பட்ட வருவாய் அதிகாரிகள் நில ஆவணங்களை ஆய்வு செய்து விண்ணப்பங்களை ஒப்புதல் செய்கிறார்கள்.",
      "step3Title": "ட்ரோன் அடிப்படையிலான ஆய்வு",
      "step3Desc": "ஒப்புதல் பெற்ற விவசாயிகள் புகைப்படங்களை பதிவேற்றுகின்றனர்; சான்றளிக்கப்பட்ட களப்பணியாளர்கள் ட்ரோன் மூலம் வான்வழி ஆய்வை மேற்கொள்கின்றனர்.",
      "step4Title": "சரிபார்ப்பு அறிக்கை",
      "step4Desc": "ஒப்பீட்டு படங்கள் மற்றும் பயிர் சரிபார்ப்பு மூலம் பதிவிறக்கம் செய்யக்கூடிய சான்றளிக்கப்பட்ட PDF அறிக்கை தயாராகிறது."
},
    featuresSection: {
      "badge": "மேம்பட்ட திறன்கள்",
      "title": "வருவாய் நிர்வாகத்திற்கான நவீன தொழில்நுட்பம்",
      "subtitle": "விவசாயி பதிவு முதல் உயர்-துல்லிய ட்ரோன் ஆய்வு மற்றும் பயிர் இயந்திர கற்றல் வரை.",
      "feat1Title": "டிஜிட்டல் நில உரிமையாளர் சேர்க்கை",
      "feat1Desc": "ஆதார் விதிகளுக்கு உட்பட்ட தனியுரிமையுடன் எளிமையான பல-படி நிலப் பிரகடனம்.",
      "feat2Title": "நேரடி மற்றும் ட்ரோன் சான்றுகள்",
      "feat2Desc": "விவசாயிகள் எடுக்கும் 5-6 புகைப்படங்கள் மற்றும் சான்றளிக்கப்பட்ட ட்ரோன் படங்களின் பாதுகாப்பான சேமிப்பு.",
      "feat3Title": "பட ஒப்பீட்டு பணியிடம்",
      "feat3Desc": "வருவாய் அதிகாரிகளுக்கான ஜூம், பான் மற்றும் எல்லை அடையாளங்களுடன் கூடிய இரட்டை காட்சி திரை.",
      "feat4Title": "பயிர் சரிபார்ப்பு அமைப்பு",
      "feat4Desc": "அறிவிக்கப்பட்ட பயிர்கள், வளர்ச்சி, பருவம், பாசன முறைகள் மற்றும் AI காட்சி பகுப்பாய்வின் ஒப்பீடு.",
      "feat5Title": "நிகழ்வு சார்ந்த SMS அறிவிப்புகள்",
      "feat5Desc": "ஒவ்வொரு கட்டத்திலும் தானியங்கி SMS புதுப்பிப்புகள் மற்றும் உள்நுழைவு விவரங்கள்.",
      "feat6Title": "நிர்வாக பகுப்பாய்வு",
      "feat6Desc": "வட்டார ஒதுக்கீடு, பணி வேகம் மற்றும் தணிக்கை பதிவுகளுடன் கூடிய முழுமையான பார்வை."
},
    roles: {
      "badge": "பங்கு சார்ந்த நன்மைகள்",
      "title": "ஒவ்வொரு விவசாய பங்குதாரருக்கும் ஏற்ற வடிவமைப்பு",
      "forFarmers": "விவசாயிகளுக்கு",
      "farmerP1": "நில விவரங்களை டிஜிட்டல் முறையில் எளிதாக சமர்ப்பித்தல்",
      "farmerP2": "நிகழ்நேர SMS மற்றும் ஆப் மூலம் நிலையை அறிதல்",
      "farmerP3": "நிலத்தின் 5-6 புகைப்படங்களை நேரடியாக பதிவேற்றுதல்",
      "farmerP4": "சரிபார்ப்பு முடிந்ததும் சான்றளிக்கப்பட்ட PDF அறிக்கை பதிவிறக்கம்",
      "forTahsildars": "வட்டாட்சியர்களுக்கு",
      "tahsildarP1": "ஒதுக்கப்பட்ட வட்டத்திற்கான புவியியல் ஆய்வு வரிசை",
      "tahsildarP2": "நேரடி படம் vs ட்ரோன் படம் ஒப்பீட்டு தளம்",
      "tahsildarP3": "AI உதவியுடன் பயிர் அறிவிப்பு சரிபார்ப்பு",
      "tahsildarP4": "முடிவுகளில் கட்டாய டிஜிட்டல் தணிக்கை பதிவுகள்",
      "forFieldWorkers": "களப் பணியாளர்களுக்கு",
      "fieldWorkerP1": "திட்டமிடப்பட்ட ஆய்வுகளின் தெளிவான தினசரி பட்டியல்",
      "fieldWorkerP2": "ஜிபிஎஸ் கண்காணிப்பு மற்றும் ட்ரோன் பட பதிவேற்றம்",
      "fieldWorkerP3": "கள குறிப்புகள் மற்றும் முரண்பாடுகளின் ஆவணப்படுத்தல்",
      "fieldWorkerP4": "மொபைலில் எளிதான தரவு சேகரிப்பு",
      "forAdmins": "நிர்வாகிகளுக்கு",
      "adminP1": "பங்கு மேலாண்மை மற்றும் பணியாளர் பகுதி ஒதுக்கீடு",
      "adminP2": "மாவட்ட அளவிலான வரைபடங்கள் மற்றும் புள்ளிவிவரங்கள்",
      "adminP3": "சரிபார்ப்பு கால அளவின் நேரடி கண்காணிப்பு",
      "adminP4": "பாதுகாப்பான மாற்ற முடியாத தணிக்கை பதிவுகள்"
},
    faqSection: {
      "badge": "பொதுவான கேள்விகள்",
      "title": "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      "q1": "அக்ரிசர்வேயில் ஒரு விவசாயி விவசாய நிலத்தை எவ்வாறு பதிவு செய்யலாம்?",
      "a1": "விவசாயிகள் இலவச கணக்கை உருவாக்கி, தொடர்பு விவரங்கள், ஆவண எண்கள், சர்வே எண், பரப்பளவு ஆகியவற்றை உள்ளிட்டு 4 படிகளில் விண்ணப்பிக்கலாம்.",
      "q2": "5 முதல் 6 நிலப் புகைப்படங்கள் ஏன் தேவைப்படுகின்றன?",
      "a2": "வட்டாட்சியர் ஒப்புதலுக்குப் பிறகு, ட்ரோன் பறப்பதற்கு முன் தெளிவான அடிப்படை சான்றாக எல்லைகள் மற்றும் பயிர்களின் படங்கள் தேவைப்படுகின்றன.",
      "q3": "ட்ரோன் அடிப்படையிலான வான்வழி ஆய்வு எவ்வாறு இயங்குகிறது?",
      "a3": "அங்கீகரிக்கப்பட்ட களப் பணியாளர் நிலத்திற்குச் சென்று 45 மீ உயரத்தில் இருந்து ட்ரோன் மூலம் துல்லியமான படங்களை எடுத்து சமர்ப்பிக்கிறார்.",
      "q4": "அக்ரிசர்வே சரிபார்ப்பு சட்டப்பூர்வ நில உரிமையை உறுதிப்படுத்துகிறதா?",
      "a4": "இல்லை. அக்ரிசர்வே என்பது தொழில்நுட்ப சான்று சரிபார்ப்பு தளமாகும். இது நீதிமன்ற தீர்ப்புகளுக்கோ பத்திரப் பதிவுகளுக்கோ மாற்றாகாது.",
      "q5": "வட்டாட்சியர் எவ்வாறு விண்ணப்பங்களை ஆய்வு செய்து முடிவெடுக்கிறார்?",
      "a5": "வட்டாட்சியர்கள் தங்கள் எல்லைக்குட்பட்ட போர்ட்டலில் படங்களை ஒப்பிட்டு, பயிர்களை சரிபார்த்து, அறிக்கைகளை வெளியிடுகின்றனர்."
},
    cta: {
      "title": "டிஜிட்டல் நில சரிபார்ப்பைத் தொடங்க நீங்கள் தயாரா?",
      "subtitle": "வெளிப்படையான மற்றும் சான்றுகள் கொண்ட ட்ரோன் சரிபார்ப்பைப் பயன்படுத்தும் விவசாயிகளுடன் இணையுங்கள்.",
      "registerBtn": "இன்றே உங்கள் நிலத்தை பதிவு செய்யுங்கள்",
      "officerBtn": "வருவாய் அதிகாரி போர்ட்டல்"
},
    footer: {
      "mission": "அக்ரிசர்வே என்பது விவசாயிகள், வருவாய் அதிகாரிகள் மற்றும் கள ஆய்வாளர்களை இணைக்கும் மையப்படுத்தப்பட்ட விவசாய நில சரிபார்ப்பு தளமாகும்.",
      "evidenceBadge": "சான்று அடிப்படையிலான நில சரிபார்ப்பு அமைப்பு",
      "platform": "தளம்",
      "farmerReg": "விவசாயி பதிவு",
      "howItWorks": "எவ்வாறு செயல்படுகிறது",
      "features": "அம்சங்கள்",
      "workflow": "ட்ரோன் ஆய்வு செயல்முறை",
      "officerLogin": "அதிகாரிகள் உள்நுழைவு",
      "governance": "நிர்வாகம் & கொள்கைகள்",
      "privacy": "தனியுரிமைக் கொள்கை",
      "terms": "பயன்பாட்டு விதிமுறைகள்",
      "disclaimer": "சட்டப்பூர்வ உரிமை மறுப்பு",
      "accessibility": "அணுகல் தரநிலைகள்",
      "audit": "தணிக்கை & பாதுகாப்பு உறுதி",
      "helpdesk": "நிர்வாக உதவி மையம்",
      "address": "மத்திய வருவாய் மற்றும் நில அளவை பவன், புனே பிரிவு, மகாராஷ்டிரா 411001",
      "tollFree": "கட்டணமில்லா உழவர் உதவி: 1800-233-0242",
      "rights": "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
      "notice": "அறிவிப்பு: அக்ரிசர்வே சரிபார்ப்பு அறிக்கைகள் தொழில்நுட்ப சான்றுகளாகும், இவை நீதிமன்ற தீர்ப்புகளுக்கு மாற்றாகாது."
},
    nav: {
      home: 'முகப்பு',
      howItWorks: 'செயல்முறை',
      features: 'அம்சங்கள்',
      verification: 'சரிபார்ப்பு',
      faq: 'கேள்வி-பதில்',
      signInSignUp: 'உள்நுழை / பதிவு',
      signIn: 'உள்நுழைக',
      signUp: 'நில பதிவு',
      dashboard: 'டாஷ்போர்டு',
      tagline: 'நில சரிபார்ப்பு தளம்',
    },
    hero: {
      badge: 'அதிகாரப்பூர்வ விவசாய நில சரிபார்ப்பு',
      titlePart1: 'அதிநவீன ட்ரோன் & நேரடி',
      titlePart2: 'நில சரிபார்ப்பு அமைப்பு',
      subtitle: 'விவசாயிகளையும் வருவாய் அதிகாரிகளையும் அதிநவீன ட்ரோன் கணக்கெடுப்பு, துல்லிய பட ஒப்பீடு மற்றும் பயிர் சரிபார்ப்புடன் இணைக்கிறது.',
      registerLand: 'நிலத்தை பதிவு செய்க',
      portalLogin: 'போர்டல் உள்நுழைவு',
      parcelsSurveyed: 'கணக்கெடுக்கப்பட்ட நிலங்கள்',
      accuracy: 'சரிபார்ப்பு துல்லியம்',
      taluksCovered: 'உட்பட்ட வட்டங்கள்',
    },
    auth: {
      backToHome: 'முகப்புக்கு திரும்புக',
      gatewayTitle: 'விவசாய நில நிர்வாகம் & சரிபார்ப்பு நுழைவாயில்',
      signInTab: 'உள்நுழைக',
      signUpTab: 'நில பதிவு',
      signInTitle: 'விவசாயி மற்றும் அதிகாரிகள் உள்நுழைவு',
      signInSubtitle: 'வட்டாட்சியர் ஒப்புதலுக்குப் பிறகு SMS மூலம் பெறப்பட்ட கடவுச்சொல் மற்றும் பதிவுசெய்த மொபைல் எண்ணை உள்ளிடவும்.',
      mobileOrUser: 'பதிவுசெய்த மொபைல் எண் அல்லது பயனர் பெயர்',
      password: 'கடவுச்சொல் (SMS மூலம் பெறப்பட்டது)',
      passwordPlaceholder: 'SMS கடவுச்சொல்லை உள்ளிடவும் (எ.கா. Agri@8484)',
      signInButton: 'அக்ரிசர்வேயில் உள்நுழைக',
      newFarmer: 'புதிய விவசாயியா?',
      registerPrompt: 'அனுமதி பெற உங்கள் நிலத்தை பதிவு செய்க →',
      alreadyRegistered: 'ஏற்கனவே அனுமதிக்கப்பட்ட கணக்கு உள்ளதா?',
      loginPrompt: 'SMS விவரங்களுடன் உள்நுழைக →',
      instantLogin: 'உடனடி சோதனை உள்நுழைவு (மதிப்பீட்டு முறை)',
      farmerRole: 'விவசாயி',
      tahsildarRole: 'வட்டாட்சியர் (தாசில்தார்)',
      fieldWorkerRole: 'களப் பணியாளர்',
      adminRole: 'நிர்வாகி',
      step1: '1. விவசாயி & தொடர்பு விவரங்கள்',
      step2: '2. அடையாளம் & முகவரி',
      step3: '3. விவசாய நில விவரங்கள்',
      step4: '4. சரிபார்த்து சமர்ப்பிக்கவும்',
      fullName: 'விவசாயியின் முழுப் பெயர்',
      mobileNumber: 'மொபைல் எண் (SMS உள்நுழைவிற்கு)',
      email: 'மின்னஞ்சல் முகவரி (விருப்பத்தேர்வு)',
      prefLanguage: 'விருப்ப மொழி',
      next: 'அடுத்த படி',
      prev: 'முந்தைய படி',
      submit: 'நிலப் பதிவைச் சமர்ப்பிக்கவும்',
      appSubmitted: 'பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
      approvalNotice: 'உங்கள் விண்ணப்பம் வட்டாட்சியருக்கு அனுப்பப்பட்டுள்ளது. ஒப்புதலுக்குப் பின் உங்கள் மொபைலுக்கு SMS கடவுச்சொல் அனுப்பப்படும்.',
      appRef: 'விண்ணப்ப குறிப்பு எண்',
      propRef: 'நில குறிப்பு எண்',
      surveyNo: 'சர்வே எண்',
      village: 'கிராமம் / வட்டம்',
    },
    dashboard: {
      overview: 'மேலோட்டம்',
      registerLand: 'நில பதிவு செய்க',
      myProperties: 'என் நிலங்கள்',
      uploadImages: 'நில படங்களை பதிவேற்றவும்',
      droneStatus: 'ட்ரோன் ஆய்வு நிலை',
      verificationReports: 'சரிபார்ப்பு அறிக்கைகள்',
      notifications: 'அறிவிப்புகள்',
      assignInspections: 'ஆய்வுகளை ஒதுக்குக',
      imageComparison: 'பட ஒப்பீடு',
      cropVerification: 'பயிர் சரிபார்ப்பு',
      auditLogs: 'தணிக்கை வரலாறு',
      systemNotifications: 'கணினி அறிவிப்புகள்',
      signOut: 'வெளியேறுக (Sign Out)',
    },
    common: {
      selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      languages: 'மொழிகள்',
      allIndia: 'அனைத்து மாநில ஆதரவு',
    },
  },

  // Telugu (తెలుగు) - Andhra Pradesh / Telangana
  te: {
    operations: {
      "badge": "Live Platform Operations",
      "subtitle": "Validated metrics retrieved directly from database records",
      "registeredFarmers": "Registered Farmers",
      "activeVerified": "Active verified accounts",
      "landApplications": "Land Applications",
      "submittedRevenue": "Submitted for revenue review",
      "verifiedProperties": "Verified Properties",
      "finalReportIssued": "Final evidence report issued",
      "pendingInspections": "Pending Inspections",
      "inQueue": "In Tahsildar / drone queue"
},
    howItWorks: {
      "badge": "End-To-End Architecture",
      "title": "How AgriSurvey Verifies Agricultural Land",
      "subtitle": "A transparent, 4-stage verification workflow connecting landholders with revenue administration.",
      "phaseWorkflow": "Phase {num} Workflow",
      "step1Title": "Farmer Registration",
      "step1Desc": "Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.",
      "step2Title": "Tahsildar Review",
      "step2Desc": "Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.",
      "step3Title": "Drone-Based Inspection",
      "step3Desc": "Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.",
      "step4Title": "Verification Report",
      "step4Desc": "Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output."
},
    featuresSection: {
      "badge": "Advanced Capabilities",
      "title": "Enterprise Technology Built for Revenue Administration",
      "subtitle": "From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.",
      "feat1Title": "Digital Landholder Onboarding",
      "feat1Desc": "Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.",
      "feat2Title": "Ground & Drone Evidence",
      "feat2Desc": "Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.",
      "feat3Title": "Image Comparison Workspace",
      "feat3Desc": "Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.",
      "feat4Title": "Crop Identification System",
      "feat4Desc": "Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.",
      "feat5Title": "Event-Driven SMS Notifications",
      "feat5Desc": "Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.",
      "feat6Title": "Administrative Analytics",
      "feat6Desc": "Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails."
},
    roles: {
      "badge": "Role-Specific Value",
      "title": "Tailored for Every Agricultural Stakeholder",
      "forFarmers": "For Farmers",
      "farmerP1": "Effortless digital submission of 7/12 extract details",
      "farmerP2": "Real-time SMS & in-app stage tracking",
      "farmerP3": "Direct upload of 5-6 land photographs",
      "farmerP4": "Certified PDF report download upon completion",
      "forTahsildars": "For Tahsildars",
      "tahsildarP1": "Geographic review queue for assigned taluk",
      "tahsildarP2": "Side-by-side ground vs drone comparison workspace",
      "tahsildarP3": "Crop declaration cross-matching with AI aid",
      "tahsildarP4": "Mandatory audit trails on decisions",
      "forFieldWorkers": "For Field Workers",
      "fieldWorkerP1": "Clear dispatch list of scheduled inspections",
      "fieldWorkerP2": "GPS mission logging & drone photo uploads",
      "fieldWorkerP3": "Field notes and anomaly documentation",
      "fieldWorkerP4": "Mobile-friendly field data collection",
      "forAdmins": "For Administrators",
      "adminP1": "Role provisioning & staff region allocations",
      "adminP2": "Recharts visualization across districts",
      "adminP3": "Verification turnaround monitoring",
      "adminP4": "Immutable security audit event logging"
},
    faqSection: {
      "badge": "Common Questions",
      "title": "Frequently Asked Questions",
      "q1": "How can a farmer register agricultural land on AgriSurvey?",
      "a1": "Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.",
      "q2": "Why are 5 to 6 farmer ground photographs required?",
      "a2": "Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.",
      "q3": "How does drone-based aerial inspection operate?",
      "a3": "An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.",
      "q4": "Does AgriSurvey verification certify legal land ownership?",
      "a4": "No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.",
      "q5": "How does the Tahsildar review and decide on applications?",
      "a5": "Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports."
},
    cta: {
      "title": "Ready to Begin Digital Agricultural Land Verification?",
      "subtitle": "Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed drone field verification.",
      "registerBtn": "Register Your Land Today",
      "officerBtn": "Revenue Officer Portal"
},
    footer: {
      "mission": "AgriSurvey is a centralized agricultural land administration and verification platform connecting farmers, revenue officers, and field surveyors through drone photogrammetry and intelligent crop monitoring.",
      "evidenceBadge": "Evidence-based land verification system",
      "platform": "Platform",
      "farmerReg": "Farmer Registration",
      "howItWorks": "How It Works",
      "features": "Platform Features",
      "workflow": "Drone Inspection Workflow",
      "officerLogin": "Staff & Officer Sign In",
      "governance": "Governance & Policies",
      "privacy": "Privacy Policy & Data Protection",
      "terms": "Terms of Service & Usage Rules",
      "disclaimer": "Statutory Title Disclaimer",
      "accessibility": "Accessibility Standards",
      "audit": "Audit & Security Assurance",
      "helpdesk": "Administrative Helpdesk",
      "address": "Central Revenue & Land Survey Bhavan, Pune Division, Maharashtra 411001",
      "tollFree": "Toll-Free Kisan Support: 1800-233-0242",
      "rights": "All rights reserved.",
      "notice": "Notice: AgriSurvey verification reports represent evidence-backed field photogrammetry records and do not substitute for judicial determination or certified deeds of title."
},
    nav: {
      home: 'హోమ్',
      howItWorks: 'పనితీరు',
      features: 'ఫీచర్లు',
      verification: 'ధృవీకరణ',
      faq: 'ప్రశ్నోత్తరాలు',
      signInSignUp: 'సైన్ ఇన్ / నమోదు',
      signIn: 'సైన్ ఇన్',
      signUp: 'భూమి నమోదు',
      dashboard: 'డ్యాష్‌బోర్డ్',
      tagline: 'భూ ధృవీకరణ వేదిక',
    },
    hero: {
      badge: 'అధికారిక వ్యవసాయ భూమి ధృవీకరణ',
      titlePart1: 'ఆధునిక డ్రోన్ & ప్రత్యక్ష',
      titlePart2: 'భూమి ధృవీకరణ వ్యవస్థ',
      subtitle: 'రైతులను, రెవెన్యూ అధికారులను డ్రోన్ సర్వే, హై-రిజల్యూషన్ ఇమేజ్ పోలిక మరియు పంట ధృవీకరణతో అనుసంధానించడం.',
      registerLand: 'భూమిని నమోదు చేయండి',
      portalLogin: 'పోర్టల్ లాగిన్',
      parcelsSurveyed: 'సర్వే చేసిన భూములు',
      accuracy: 'ధృవీకరణ ఖచ్చితత్వం',
      taluksCovered: 'కవర్ చేసిన మండలాలు',
    },
    auth: {
      backToHome: 'హోమ్‌కు తిరిగి వెళ్లండి',
      gatewayTitle: 'వ్యవసాయ భూమి పరిపాలన & ధృవీకరణ పోర్టల్',
      signInTab: 'సైన్ ఇన్',
      signUpTab: 'భూమి నమోదు',
      signInTitle: 'రైతు & అధికారుల లాగిన్',
      signInSubtitle: 'తహశీల్దార్ ఆమోదం తర్వాత SMS ద్వారా వచ్చిన పాస్‌వర్డ్ మరియు మొబైల్ నంబర్‌ను నమోదు చేయండి.',
      mobileOrUser: 'నమోదిత మొబైల్ నంబర్ లేదా యూజర్‌నేమ్',
      password: 'పాస్‌వర్డ్ (SMS ద్వారా వచ్చింది)',
      passwordPlaceholder: 'SMS పాస్‌వర్డ్ ఎంటర్ చేయండి (ఉదా: Agri@8484)',
      signInButton: 'అగ్రిసర్వేలోకి సైన్ ఇన్ అవ్వండి',
      newFarmer: 'కొత్త రైతులా?',
      registerPrompt: 'పోర్టల్ ప్రవేశానికి మీ భూమిని నమోదు చేయండి →',
      alreadyRegistered: 'ఇప్పటికే ఆమోదించబడిన ఖాతా ఉందా?',
      loginPrompt: 'మీ SMS వివరాలతో సైన్ ఇన్ అవ్వండి →',
      instantLogin: 'తక్షణ డెమో లాగిన్ (మూల్యాంకన మోడ్)',
      farmerRole: 'రైతు',
      tahsildarRole: 'తహశీల్దార్',
      fieldWorkerRole: 'ఫీల్డ్ వర్కర్',
      adminRole: 'అడ్మిన్',
      step1: '1. రైతు & సంప్రదింపు వివరాలు',
      step2: '2. గుర్తింపు & చిరునామా',
      step3: '3. వ్యవసాయ భూమి వివరాలు',
      step4: '4. సమీక్ష & సమర్పణ',
      fullName: 'రైతు పూర్తి పేరు',
      mobileNumber: 'మొబైల్ నంబర్ (SMS లాగిన్ కోసం)',
      email: 'ఇమెయిల్ చిరునామా (ఐచ్ఛికం)',
      prefLanguage: 'ప్రాధాన్య భాష',
      next: 'తదుపరి దశ',
      prev: 'మునుపటి దశ',
      submit: 'భూమి నమోదును సమర్పించండి',
      appSubmitted: 'నమోదు విజయవంతంగా సమర్పించబడింది!',
      approvalNotice: 'మీ దరఖాస్తు తహశీల్దార్‌కు పంపబడింది. ఆమోదం తర్వాత మీ పాస్‌వర్డ్ SMS ద్వారా అందుతుంది.',
      appRef: 'దరఖాస్తు రిఫరెన్స్ నంబర్',
      propRef: 'ఆస్తి రిఫరెన్స్ నంబర్',
      surveyNo: 'సర్వే నంబర్',
      village: 'గ్రామం / మండలం',
    },
    dashboard: {
      overview: 'అవలోకనం',
      registerLand: 'భూమి నమోదు చేయండి',
      myProperties: 'నా భూములు',
      uploadImages: 'భూమి చిత్రాలను అప్‌లోడ్ చేయండి',
      droneStatus: 'డ్రోన్ తనిఖీ స్థితి',
      verificationReports: 'ధృవీకరణ నివేదికలు',
      notifications: 'నోటిఫికేషన్లు',
      assignInspections: 'తనిఖీలు కేటాయించండి',
      imageComparison: 'ఇమేజ్ పోలిక',
      cropVerification: 'పంట ధృవీకరణ',
      auditLogs: 'ఆడిట్ చరిత్ర',
      systemNotifications: 'సిస్టమ్ నోటిఫికేషన్లు',
      signOut: 'లాగ్ అవుట్ (Sign Out)',
    },
    common: {
      selectLanguage: 'భాషను ఎంచుకోండి',
      languages: 'భాషలు',
      allIndia: 'అన్ని రాష్ట్రాల మద్దతు',
    },
  },

  // Kannada (ಕನ್ನಡ) - Karnataka
  kn: {
    operations: {
      "badge": "Live Platform Operations",
      "subtitle": "Validated metrics retrieved directly from database records",
      "registeredFarmers": "Registered Farmers",
      "activeVerified": "Active verified accounts",
      "landApplications": "Land Applications",
      "submittedRevenue": "Submitted for revenue review",
      "verifiedProperties": "Verified Properties",
      "finalReportIssued": "Final evidence report issued",
      "pendingInspections": "Pending Inspections",
      "inQueue": "In Tahsildar / drone queue"
},
    howItWorks: {
      "badge": "End-To-End Architecture",
      "title": "How AgriSurvey Verifies Agricultural Land",
      "subtitle": "A transparent, 4-stage verification workflow connecting landholders with revenue administration.",
      "phaseWorkflow": "Phase {num} Workflow",
      "step1Title": "Farmer Registration",
      "step1Desc": "Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.",
      "step2Title": "Tahsildar Review",
      "step2Desc": "Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.",
      "step3Title": "Drone-Based Inspection",
      "step3Desc": "Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.",
      "step4Title": "Verification Report",
      "step4Desc": "Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output."
},
    featuresSection: {
      "badge": "Advanced Capabilities",
      "title": "Enterprise Technology Built for Revenue Administration",
      "subtitle": "From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.",
      "feat1Title": "Digital Landholder Onboarding",
      "feat1Desc": "Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.",
      "feat2Title": "Ground & Drone Evidence",
      "feat2Desc": "Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.",
      "feat3Title": "Image Comparison Workspace",
      "feat3Desc": "Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.",
      "feat4Title": "Crop Identification System",
      "feat4Desc": "Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.",
      "feat5Title": "Event-Driven SMS Notifications",
      "feat5Desc": "Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.",
      "feat6Title": "Administrative Analytics",
      "feat6Desc": "Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails."
},
    roles: {
      "badge": "Role-Specific Value",
      "title": "Tailored for Every Agricultural Stakeholder",
      "forFarmers": "For Farmers",
      "farmerP1": "Effortless digital submission of 7/12 extract details",
      "farmerP2": "Real-time SMS & in-app stage tracking",
      "farmerP3": "Direct upload of 5-6 land photographs",
      "farmerP4": "Certified PDF report download upon completion",
      "forTahsildars": "For Tahsildars",
      "tahsildarP1": "Geographic review queue for assigned taluk",
      "tahsildarP2": "Side-by-side ground vs drone comparison workspace",
      "tahsildarP3": "Crop declaration cross-matching with AI aid",
      "tahsildarP4": "Mandatory audit trails on decisions",
      "forFieldWorkers": "For Field Workers",
      "fieldWorkerP1": "Clear dispatch list of scheduled inspections",
      "fieldWorkerP2": "GPS mission logging & drone photo uploads",
      "fieldWorkerP3": "Field notes and anomaly documentation",
      "fieldWorkerP4": "Mobile-friendly field data collection",
      "forAdmins": "For Administrators",
      "adminP1": "Role provisioning & staff region allocations",
      "adminP2": "Recharts visualization across districts",
      "adminP3": "Verification turnaround monitoring",
      "adminP4": "Immutable security audit event logging"
},
    faqSection: {
      "badge": "Common Questions",
      "title": "Frequently Asked Questions",
      "q1": "How can a farmer register agricultural land on AgriSurvey?",
      "a1": "Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.",
      "q2": "Why are 5 to 6 farmer ground photographs required?",
      "a2": "Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.",
      "q3": "How does drone-based aerial inspection operate?",
      "a3": "An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.",
      "q4": "Does AgriSurvey verification certify legal land ownership?",
      "a4": "No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.",
      "q5": "How does the Tahsildar review and decide on applications?",
      "a5": "Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports."
},
    cta: {
      "title": "Ready to Begin Digital Agricultural Land Verification?",
      "subtitle": "Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed drone field verification.",
      "registerBtn": "Register Your Land Today",
      "officerBtn": "Revenue Officer Portal"
},
    footer: {
      "mission": "AgriSurvey is a centralized agricultural land administration and verification platform connecting farmers, revenue officers, and field surveyors through drone photogrammetry and intelligent crop monitoring.",
      "evidenceBadge": "Evidence-based land verification system",
      "platform": "Platform",
      "farmerReg": "Farmer Registration",
      "howItWorks": "How It Works",
      "features": "Platform Features",
      "workflow": "Drone Inspection Workflow",
      "officerLogin": "Staff & Officer Sign In",
      "governance": "Governance & Policies",
      "privacy": "Privacy Policy & Data Protection",
      "terms": "Terms of Service & Usage Rules",
      "disclaimer": "Statutory Title Disclaimer",
      "accessibility": "Accessibility Standards",
      "audit": "Audit & Security Assurance",
      "helpdesk": "Administrative Helpdesk",
      "address": "Central Revenue & Land Survey Bhavan, Pune Division, Maharashtra 411001",
      "tollFree": "Toll-Free Kisan Support: 1800-233-0242",
      "rights": "All rights reserved.",
      "notice": "Notice: AgriSurvey verification reports represent evidence-backed field photogrammetry records and do not substitute for judicial determination or certified deeds of title."
},
    nav: {
      home: 'ಮುಖಪುಟ',
      howItWorks: 'ಕಾರ್ಯವಿಧಾನ',
      features: 'ವೈಶಿಷ್ಟ್ಯಗಳು',
      verification: 'ಪರಿಶೀಲನೆ',
      faq: 'ಪ್ರಶ್ನೋತ್ತರ',
      signInSignUp: 'ಸೈನ್ ಇನ್ / ನೋಂದಣಿ',
      signIn: 'ಸೈನ್ ಇನ್',
      signUp: 'ಜಮೀನು ನೋಂದಣಿ',
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      tagline: 'ಜಮೀನು ಪರಿಶೀಲನಾ ವೇದಿಕೆ',
    },
    hero: {
      badge: 'ಅಧಿಕೃತ ಕೃಷಿ ಜಮೀನು ಪರಿಶೀಲನಾ ವ್ಯವಸ್ಥೆ',
      titlePart1: 'ಅತ್ಯಾಧುನಿಕ ಡ್ರೋನ್ ಮತ್ತು ಪ್ರತ್ಯಕ್ಷ',
      titlePart2: 'ಜಮೀನು ಪರಿಶೀಲನೆ',
      subtitle: 'ರೈತರು ಮತ್ತು ಕಂದಾಯ ಅಧಿಕಾರಿಗಳನ್ನು ಡ್ರೋನ್ ಸಮೀಕ್ಷೆ, ಹೈ-ರೆಸಲ್ಯೂಶನ್ ಇಮೇಜ್ ಹೋಲಿಕೆ ಮತ್ತು ಬೆಳೆ ಪರಿಶೀಲನೆಯೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವುದು.',
      registerLand: 'ಈಗಲೇ ಜಮೀನು ನೋಂದಾಯಿಸಿ',
      portalLogin: 'ಪೋರ್ಟಲ್ ಲಾಗಿನ್',
      parcelsSurveyed: 'ಸಮೀಕ್ಷೆ ನಡೆಸಿದ ಜಮೀನು',
      accuracy: 'ಪರಿಶೀಲನೆಯ ನಿಖರತೆ',
      taluksCovered: 'ಒಳಗೊಂಡಿರುವ ತಾಲೂಕುಗಳು',
    },
    auth: {
      backToHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      gatewayTitle: 'ಕೃಷಿ ಜಮೀನು ಆಡಳಿತ ಮತ್ತು ಪರಿಶೀಲನಾ ಪ್ರವೇಶದ್ವಾರ',
      signInTab: 'ಸೈನ್ ಇನ್',
      signUpTab: 'ಜಮೀನು ನೋಂದಣಿ',
      signInTitle: 'ರೈತ ಮತ್ತು ಅಧಿಕಾರಿಗಳ ಲಾಗಿನ್',
      signInSubtitle: 'ತಹಶೀಲ್ದಾರ್ ಅನುಮೋದನೆಯ ನಂತರ SMS ಮೂಲಕ ಕಳುಹಿಸಲಾದ ಅಧಿಕೃತ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ.',
      mobileOrUser: 'ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಬಳಕೆದಾರ ಹೆಸರು',
      password: 'ಪಾಸ್‌ವರ್ಡ್ (SMS ಮೂಲಕ ಬಂದದ್ದು)',
      passwordPlaceholder: 'SMS ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ (ಉದಾ: Agri@8484)',
      signInButton: 'ಅಗ್ರಿಸರ್ವೇಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
      newFarmer: 'ಹೊಸ ರೈತರೇ?',
      registerPrompt: 'ಪೋರ್ಟಲ್ ಪ್ರವೇಶಕ್ಕೆ ನಿಮ್ಮ ಜಮೀನು ನೋಂದಾಯಿಸಿ →',
      alreadyRegistered: 'ಈಗಾಗಲೇ ಅನುಮೋದಿತ ಖಾತೆ ಇದೆಯೇ?',
      loginPrompt: 'ನಿಮ್ಮ SMS ವಿವರಗಳೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿ →',
      instantLogin: 'ತ್ವರಿತ ಡೆಮೊ ಲಾಗಿನ್ (ಮೌಲ್ಯಮಾಪನ ಮೋಡ್)',
      farmerRole: 'ರೈತ',
      tahsildarRole: 'ತಹಶೀಲ್ದಾರ್',
      fieldWorkerRole: 'ಕ್ಷೇತ್ರ ಕಾರ್ಯಕರ್ತ',
      adminRole: 'ನಿರ್ವಾಹಕ',
      step1: '1. ರೈತ ಮತ್ತು ಸಂಪರ್ಕ ವಿವರ',
      step2: '2. ಗುರುತು ಮತ್ತು ವಿಳಾಸ',
      step3: '3. ಕೃಷಿ ಜಮೀನಿನ ವಿವರ',
      step4: '4. ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಲ್ಲಿಸಿ',
      fullName: 'ರೈತರ ಪೂರ್ಣ ಹೆಸರು',
      mobileNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (SMS ಲಾಗಿನ್‌ಗಾಗಿ)',
      email: 'ಇಮೇಲ್ ವಿಳಾಸ (ಐಚ್ಛಿಕ)',
      prefLanguage: 'ಆದ್ಯತೆಯ ಭಾಷೆ',
      next: 'ಮುಂದಿನ ಹಂತ',
      prev: 'ಹಿಂದಿನ ಹಂತ',
      submit: 'ಜಮೀನು ನೋಂದಣಿ ಸಲ್ಲಿಸಿ',
      appSubmitted: 'ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ!',
      approvalNotice: 'ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ತಹಶೀಲ್ದಾರರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ. ಪರಿಶೀಲನೆ ನಂತರ ನಿಮ್ಮ ಲಾಗಿನ್ ಪಾಸ್‌ವರ್ಡ್ SMS ಮೂಲಕ ಬರಲಿದೆ.',
      appRef: 'ಅರ್ಜಿ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ',
      propRef: 'ಆಸ್ತಿ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ',
      surveyNo: 'ಸರ್ವೆ ನಂಬರ್',
      village: 'ಗ್ರಾಮ / ತಾಲೂಕು',
    },
    dashboard: {
      overview: 'ಅವಲೋಕನ',
      registerLand: 'ಜಮೀನು ನೋಂದಾಯಿಸಿ',
      myProperties: 'ನನ್ನ ಜಮೀನುಗಳು',
      uploadImages: 'ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      droneStatus: 'ಡ್ರೋನ್ ತಪಾಸಣೆ ಸ್ಥಿತಿ',
      verificationReports: 'ಪರಿಶೀಲನಾ ವರದಿಗಳು',
      notifications: 'ಸೂಚನೆಗಳು',
      assignInspections: 'ತಪಾಸಣೆ ನಿಯೋಜಿಸಿ',
      imageComparison: 'ಚಿತ್ರ ಹೋಲಿಕೆ',
      cropVerification: 'ಬೆಳೆ ಪರಿಶೀಲನೆ',
      auditLogs: 'ಆಡಿಟ್ ಇತಿಹಾಸ',
      systemNotifications: 'ಸಿಸ್ಟಮ್ ಸೂಚನೆಗಳು',
      signOut: 'ಲಾಗ್ ಔಟ್ (Sign Out)',
    },
    common: {
      selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
      languages: 'ಭಾಷೆಗಳು',
      allIndia: 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳ ಬೆಂಬಲ',
    },
  },

  // Gujarati (ગુજરાતી) - Gujarat
  gu: {
    operations: {
      "badge": "Live Platform Operations",
      "subtitle": "Validated metrics retrieved directly from database records",
      "registeredFarmers": "Registered Farmers",
      "activeVerified": "Active verified accounts",
      "landApplications": "Land Applications",
      "submittedRevenue": "Submitted for revenue review",
      "verifiedProperties": "Verified Properties",
      "finalReportIssued": "Final evidence report issued",
      "pendingInspections": "Pending Inspections",
      "inQueue": "In Tahsildar / drone queue"
},
    howItWorks: {
      "badge": "End-To-End Architecture",
      "title": "How AgriSurvey Verifies Agricultural Land",
      "subtitle": "A transparent, 4-stage verification workflow connecting landholders with revenue administration.",
      "phaseWorkflow": "Phase {num} Workflow",
      "step1Title": "Farmer Registration",
      "step1Desc": "Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.",
      "step2Title": "Tahsildar Review",
      "step2Desc": "Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.",
      "step3Title": "Drone-Based Inspection",
      "step3Desc": "Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.",
      "step4Title": "Verification Report",
      "step4Desc": "Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output."
},
    featuresSection: {
      "badge": "Advanced Capabilities",
      "title": "Enterprise Technology Built for Revenue Administration",
      "subtitle": "From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.",
      "feat1Title": "Digital Landholder Onboarding",
      "feat1Desc": "Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.",
      "feat2Title": "Ground & Drone Evidence",
      "feat2Desc": "Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.",
      "feat3Title": "Image Comparison Workspace",
      "feat3Desc": "Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.",
      "feat4Title": "Crop Identification System",
      "feat4Desc": "Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.",
      "feat5Title": "Event-Driven SMS Notifications",
      "feat5Desc": "Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.",
      "feat6Title": "Administrative Analytics",
      "feat6Desc": "Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails."
},
    roles: {
      "badge": "Role-Specific Value",
      "title": "Tailored for Every Agricultural Stakeholder",
      "forFarmers": "For Farmers",
      "farmerP1": "Effortless digital submission of 7/12 extract details",
      "farmerP2": "Real-time SMS & in-app stage tracking",
      "farmerP3": "Direct upload of 5-6 land photographs",
      "farmerP4": "Certified PDF report download upon completion",
      "forTahsildars": "For Tahsildars",
      "tahsildarP1": "Geographic review queue for assigned taluk",
      "tahsildarP2": "Side-by-side ground vs drone comparison workspace",
      "tahsildarP3": "Crop declaration cross-matching with AI aid",
      "tahsildarP4": "Mandatory audit trails on decisions",
      "forFieldWorkers": "For Field Workers",
      "fieldWorkerP1": "Clear dispatch list of scheduled inspections",
      "fieldWorkerP2": "GPS mission logging & drone photo uploads",
      "fieldWorkerP3": "Field notes and anomaly documentation",
      "fieldWorkerP4": "Mobile-friendly field data collection",
      "forAdmins": "For Administrators",
      "adminP1": "Role provisioning & staff region allocations",
      "adminP2": "Recharts visualization across districts",
      "adminP3": "Verification turnaround monitoring",
      "adminP4": "Immutable security audit event logging"
},
    faqSection: {
      "badge": "Common Questions",
      "title": "Frequently Asked Questions",
      "q1": "How can a farmer register agricultural land on AgriSurvey?",
      "a1": "Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.",
      "q2": "Why are 5 to 6 farmer ground photographs required?",
      "a2": "Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.",
      "q3": "How does drone-based aerial inspection operate?",
      "a3": "An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.",
      "q4": "Does AgriSurvey verification certify legal land ownership?",
      "a4": "No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.",
      "q5": "How does the Tahsildar review and decide on applications?",
      "a5": "Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports."
},
    cta: {
      "title": "Ready to Begin Digital Agricultural Land Verification?",
      "subtitle": "Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed drone field verification.",
      "registerBtn": "Register Your Land Today",
      "officerBtn": "Revenue Officer Portal"
},
    footer: {
      "mission": "AgriSurvey is a centralized agricultural land administration and verification platform connecting farmers, revenue officers, and field surveyors through drone photogrammetry and intelligent crop monitoring.",
      "evidenceBadge": "Evidence-based land verification system",
      "platform": "Platform",
      "farmerReg": "Farmer Registration",
      "howItWorks": "How It Works",
      "features": "Platform Features",
      "workflow": "Drone Inspection Workflow",
      "officerLogin": "Staff & Officer Sign In",
      "governance": "Governance & Policies",
      "privacy": "Privacy Policy & Data Protection",
      "terms": "Terms of Service & Usage Rules",
      "disclaimer": "Statutory Title Disclaimer",
      "accessibility": "Accessibility Standards",
      "audit": "Audit & Security Assurance",
      "helpdesk": "Administrative Helpdesk",
      "address": "Central Revenue & Land Survey Bhavan, Pune Division, Maharashtra 411001",
      "tollFree": "Toll-Free Kisan Support: 1800-233-0242",
      "rights": "All rights reserved.",
      "notice": "Notice: AgriSurvey verification reports represent evidence-backed field photogrammetry records and do not substitute for judicial determination or certified deeds of title."
},
    nav: {
      home: 'મુખ્ય પૃષ્ઠ',
      howItWorks: 'કાર્યપદ્ધતિ',
      features: 'વિશેષતાઓ',
      verification: 'ચકાસણી',
      faq: 'પ્રશ્નોત્તરી',
      signInSignUp: 'સાઇન ઇન / નોંધણી',
      signIn: 'સાઇન ઇન',
      signUp: 'જમીન નોંધણી',
      dashboard: 'ડેશબોર્ડ',
      tagline: 'જમીન ચકાસણી પ્લેટફોર્મ',
    },
    hero: {
      badge: 'સત્તાવાર કૃષિ જમીન ચકાસણી પ્લેટફોર્મ',
      titlePart1: 'આધુનિક ડ્રોન અને ક્ષેત્રીય',
      titlePart2: 'જમીન ચકાસણી સિસ્ટમ',
      subtitle: 'ખેડૂતો અને મહેસૂલ અધિકારીઓને અત્યાધુનિક ડ્રોન સર્વેક્ષણ, ઉચ્ચ રિઝોલ્યુશન ઇમેજ સરખામણી અને પાક ચકાસણી સાથે જોડવું.',
      registerLand: 'હમણાં જમીન નોંધણી કરો',
      portalLogin: 'પોર્ટલ લોગિન',
      parcelsSurveyed: 'સર્વેક્ષણ કરાયેલ જમીન',
      accuracy: 'ચકાસણી ચોકસાઈ',
      taluksCovered: 'સમાવિષ્ટ તાલુકાઓ',
    },
    auth: {
      backToHome: 'મુખ્ય પૃષ્ઠ પર પાછા જાઓ',
      gatewayTitle: 'કૃષિ જમીન વહીવટ અને ચકાસણી પ્રવેશદ્વાર',
      signInTab: 'સાઇન ઇન',
      signUpTab: 'જમીન નોંધણી',
      signInTitle: 'ખેડૂત અને અધિકારી પોર્ટલ પ્રવેશ',
      signInSubtitle: 'મામલતદાર / તહસીલદાર મંજૂરી પછી SMS દ્વારા મોકલેલ પાસવર્ડ અને નોંધાયેલ મોબાઇલ નંબર દાખલ કરો.',
      mobileOrUser: 'નોંધાયેલ મોબાઇલ નંબર અથવા વપરાશકર્તા નામ',
      password: 'પાસવર્ડ (SMS દ્વારા મળેલ)',
      passwordPlaceholder: 'SMS પાસવર્ડ દાખલ કરો (દા.ત. Agri@8484)',
      signInButton: 'એગ્રીસર્વેમાં સાઇન ઇન કરો',
      newFarmer: 'નવા ખેડૂત છો?',
      registerPrompt: 'પોર્ટલ પ્રવેશ મેળવવા તમારી જમીન નોંધો →',
      alreadyRegistered: 'પહેલેથી મંજૂર થયેલ ખાતું છે?',
      loginPrompt: 'તમારા SMS વિગતો સાથે સાઇન ઇન કરો →',
      instantLogin: 'ઝડપી ડેમો લોગિન (મૂલ્યાંકન મોડ)',
      farmerRole: 'ખેડૂત',
      tahsildarRole: 'તહસીલદાર / મામલતદાર',
      fieldWorkerRole: 'ફીલ્ડ વર્કર',
      adminRole: 'વહીવટકર્તા',
      step1: '1. ખેડૂત અને સંપર્ક વિગત',
      step2: '2. ઓળખ અને સરનામું',
      step3: '3. કૃષિ જમીનની વિગતો',
      step4: '4. સમીક્ષા અને સબમિટ',
      fullName: 'ખેડૂતનું પૂરું નામ',
      mobileNumber: 'મોબાઇલ નંબર (SMS લોગિન માટે)',
      email: 'ઇમેઇલ સરનામું (વૈકલ્પિક)',
      prefLanguage: 'પસંદગીની ભાષા',
      next: 'આગળનું પગલું',
      prev: 'પાછલું પગલું',
      submit: 'જમીન નોંધણી સબમિટ કરો',
      appSubmitted: 'નોંધણી સફળતાપૂર્વક સબમિટ થઈ!',
      approvalNotice: 'તમારી અરજી તહસીલદારને મોકલવામાં આવી છે. મંજૂરી પછી પોર્ટલ પાસવર્ડ SMS દ્વારા પ્રાપ્ત થશે.',
      appRef: 'અરજી સંદર્ભ નંબર',
      propRef: 'મિલકત સંદર્ભ નંબર',
      surveyNo: 'સર્વે / બ્લોક નંબર',
      village: 'ગામ / તાલુકો',
    },
    dashboard: {
      overview: 'ઝાંખી',
      registerLand: 'જમીન નોંધણી કરો',
      myProperties: 'મારી જમીન',
      uploadImages: 'જમીનના ફોટા અપલોડ કરો',
      droneStatus: 'ડ્રોન તપાસ સ્થિતિ',
      verificationReports: 'ચકાસણી અહેવાલો',
      notifications: 'સૂચનાઓ',
      assignInspections: 'તપાસ સોંપો',
      imageComparison: 'ઇમેજ સરખામણી',
      cropVerification: 'પાક ચકાસણી',
      auditLogs: 'ઓડિટ ઇતિહાસ',
      systemNotifications: 'સિસ્ટમ સૂચનાઓ',
      signOut: 'સાઇન આઉટ (Sign Out)',
    },
    common: {
      selectLanguage: 'ભાષા પસંદ કરો',
      languages: 'ભાષાઓ',
      allIndia: 'સર્વ રાજ્ય સમર્થન',
    },
  },

  // Bengali (বাংলা) - West Bengal
  bn: {
    operations: {
      "badge": "Live Platform Operations",
      "subtitle": "Validated metrics retrieved directly from database records",
      "registeredFarmers": "Registered Farmers",
      "activeVerified": "Active verified accounts",
      "landApplications": "Land Applications",
      "submittedRevenue": "Submitted for revenue review",
      "verifiedProperties": "Verified Properties",
      "finalReportIssued": "Final evidence report issued",
      "pendingInspections": "Pending Inspections",
      "inQueue": "In Tahsildar / drone queue"
},
    howItWorks: {
      "badge": "End-To-End Architecture",
      "title": "How AgriSurvey Verifies Agricultural Land",
      "subtitle": "A transparent, 4-stage verification workflow connecting landholders with revenue administration.",
      "phaseWorkflow": "Phase {num} Workflow",
      "step1Title": "Farmer Registration",
      "step1Desc": "Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.",
      "step2Title": "Tahsildar Review",
      "step2Desc": "Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.",
      "step3Title": "Drone-Based Inspection",
      "step3Desc": "Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.",
      "step4Title": "Verification Report",
      "step4Desc": "Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output."
},
    featuresSection: {
      "badge": "Advanced Capabilities",
      "title": "Enterprise Technology Built for Revenue Administration",
      "subtitle": "From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.",
      "feat1Title": "Digital Landholder Onboarding",
      "feat1Desc": "Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.",
      "feat2Title": "Ground & Drone Evidence",
      "feat2Desc": "Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.",
      "feat3Title": "Image Comparison Workspace",
      "feat3Desc": "Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.",
      "feat4Title": "Crop Identification System",
      "feat4Desc": "Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.",
      "feat5Title": "Event-Driven SMS Notifications",
      "feat5Desc": "Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.",
      "feat6Title": "Administrative Analytics",
      "feat6Desc": "Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails."
},
    roles: {
      "badge": "Role-Specific Value",
      "title": "Tailored for Every Agricultural Stakeholder",
      "forFarmers": "For Farmers",
      "farmerP1": "Effortless digital submission of 7/12 extract details",
      "farmerP2": "Real-time SMS & in-app stage tracking",
      "farmerP3": "Direct upload of 5-6 land photographs",
      "farmerP4": "Certified PDF report download upon completion",
      "forTahsildars": "For Tahsildars",
      "tahsildarP1": "Geographic review queue for assigned taluk",
      "tahsildarP2": "Side-by-side ground vs drone comparison workspace",
      "tahsildarP3": "Crop declaration cross-matching with AI aid",
      "tahsildarP4": "Mandatory audit trails on decisions",
      "forFieldWorkers": "For Field Workers",
      "fieldWorkerP1": "Clear dispatch list of scheduled inspections",
      "fieldWorkerP2": "GPS mission logging & drone photo uploads",
      "fieldWorkerP3": "Field notes and anomaly documentation",
      "fieldWorkerP4": "Mobile-friendly field data collection",
      "forAdmins": "For Administrators",
      "adminP1": "Role provisioning & staff region allocations",
      "adminP2": "Recharts visualization across districts",
      "adminP3": "Verification turnaround monitoring",
      "adminP4": "Immutable security audit event logging"
},
    faqSection: {
      "badge": "Common Questions",
      "title": "Frequently Asked Questions",
      "q1": "How can a farmer register agricultural land on AgriSurvey?",
      "a1": "Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.",
      "q2": "Why are 5 to 6 farmer ground photographs required?",
      "a2": "Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.",
      "q3": "How does drone-based aerial inspection operate?",
      "a3": "An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.",
      "q4": "Does AgriSurvey verification certify legal land ownership?",
      "a4": "No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.",
      "q5": "How does the Tahsildar review and decide on applications?",
      "a5": "Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports."
},
    cta: {
      "title": "Ready to Begin Digital Agricultural Land Verification?",
      "subtitle": "Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed drone field verification.",
      "registerBtn": "Register Your Land Today",
      "officerBtn": "Revenue Officer Portal"
},
    footer: {
      "mission": "AgriSurvey is a centralized agricultural land administration and verification platform connecting farmers, revenue officers, and field surveyors through drone photogrammetry and intelligent crop monitoring.",
      "evidenceBadge": "Evidence-based land verification system",
      "platform": "Platform",
      "farmerReg": "Farmer Registration",
      "howItWorks": "How It Works",
      "features": "Platform Features",
      "workflow": "Drone Inspection Workflow",
      "officerLogin": "Staff & Officer Sign In",
      "governance": "Governance & Policies",
      "privacy": "Privacy Policy & Data Protection",
      "terms": "Terms of Service & Usage Rules",
      "disclaimer": "Statutory Title Disclaimer",
      "accessibility": "Accessibility Standards",
      "audit": "Audit & Security Assurance",
      "helpdesk": "Administrative Helpdesk",
      "address": "Central Revenue & Land Survey Bhavan, Pune Division, Maharashtra 411001",
      "tollFree": "Toll-Free Kisan Support: 1800-233-0242",
      "rights": "All rights reserved.",
      "notice": "Notice: AgriSurvey verification reports represent evidence-backed field photogrammetry records and do not substitute for judicial determination or certified deeds of title."
},
    nav: {
      home: 'হোম',
      howItWorks: 'কার্যপদ্ধতি',
      features: 'বৈশিষ্ট্যসমূহ',
      verification: 'যাচাইকরণ',
      faq: 'প্রশ্নোত্তর',
      signInSignUp: 'সাইন ইন / নিবন্ধন',
      signIn: 'সাইন ইন',
      signUp: 'জমি নিবন্ধন',
      dashboard: 'ড্যাশবোর্ড',
      tagline: 'ভূমি যাচাইকরণ প্ল্যাটফর্ম',
    },
    hero: {
      badge: 'অফিসিয়াল কৃষি জমি যাচাইকরণ ব্যবস্থা',
      titlePart1: 'উন্নত ড্রোন এবং প্রত্যক্ষ',
      titlePart2: 'ভূমি যাচাইকরণ প্ল্যাটফর্ম',
      subtitle: 'কৃষক ও রাজস্ব কর্মকর্তাদের আধুনিক ড্রোন সমীক্ষা, উচ্চ রেজোলিউশনের চিত্র তুলনা এবং ফসল যাচাইকরণের সাথে যুক্ত করা।',
      registerLand: 'এখনই জমি নিবন্ধন করুন',
      portalLogin: 'পোর্টাল লগইন',
      parcelsSurveyed: 'জরিপকৃত জমি',
      accuracy: 'যাচাইকরণের যথার্থতা',
      taluksCovered: 'আওতাভুক্ত ব্লক/তালুক',
    },
    auth: {
      backToHome: 'হোমে ফিরে যান',
      gatewayTitle: 'কৃষি জমি প্রশাসন ও যাচাইকরণ গেটওয়ে',
      signInTab: 'সাইন ইন',
      signUpTab: 'জমি নিবন্ধন',
      signInTitle: 'কৃষক ও কর্মকর্তা পোর্টাল লগইন',
      signInSubtitle: 'তহসিলদার অনুমোদনের পর SMS-এর মাধ্যমে প্রেরিত পাসওয়ার্ড এবং মোবাইল নম্বর দিয়ে লগইন করুন।',
      mobileOrUser: 'নিবন্ধিত মোবাইল নম্বর বা ব্যবহারকারীর নাম',
      password: 'পাসওয়ার্ড (SMS দ্বারা প্রাপ্ত)',
      passwordPlaceholder: 'SMS পাসওয়ার্ড লিখুন (যেমন Agri@8484)',
      signInButton: 'অ্যাগ্রিসার্ভে-তে সাইন ইন করুন',
      newFarmer: 'নতুন কৃষক?',
      registerPrompt: 'পোর্টাল অ্যাক্সেস পেতে আপনার জমি নিবন্ধন করুন →',
      alreadyRegistered: 'ইতিমধ্যে অনুমোদিত অ্যাকাউন্ট আছে?',
      loginPrompt: 'আপনার SMS পাসওয়ার্ড দিয়ে লগইন করুন →',
      instantLogin: 'তাত্ক্ষণিক ডেমো লগইন (মূল্যায়ন মোড)',
      farmerRole: 'কৃষক',
      tahsildarRole: 'তহসিলদার',
      fieldWorkerRole: 'মাঠ কর্মী',
      adminRole: 'প্রশাসক',
      step1: '১. কৃষক ও যোগাযোগের বিবরণ',
      step2: '২. পরিচয় ও ঠিকানা',
      step3: '৩. কৃষি জমির বিবরণ',
      step4: '৪. পর্যালোচনা ও জমা দিন',
      fullName: 'কৃষকের পুরো নাম',
      mobileNumber: 'মোবাইল নম্বর (SMS লগইনের জন্য)',
      email: 'ইমেল ঠিকানা (ঐচ্ছিক)',
      prefLanguage: 'পছন্দের ভাষা',
      next: 'পরবর্তী ধাপ',
      prev: 'পূর্ববর্তী ধাপ',
      submit: 'জমি নিবন্ধন জমা দিন',
      appSubmitted: 'নিবন্ধন সফলভাবে জমা হয়েছে!',
      approvalNotice: 'আপনার আবেদন তহসিলদারের কাছে পাঠানো হয়েছে। অনুমোদনের পর SMS মারফত পাসওয়ার্ড পাবেন।',
      appRef: 'আবেদন রেফারেন্স নম্বর',
      propRef: 'সম্পত্তি রেফারেন্স নম্বর',
      surveyNo: 'দাগ / খতিয়ান নম্বর',
      village: 'গ্রাম / ব্লক',
    },
    dashboard: {
      overview: 'সারসংক্ষেপ',
      registerLand: 'জমি নিবন্ধন করুন',
      myProperties: 'আমার জমিসমূহ',
      uploadImages: 'জমির ছবি আপলোড করুন',
      droneStatus: 'ড্রোন পরিদর্শনের অবস্থা',
      verificationReports: 'যাচাইকরণ প্রতিবেদন',
      notifications: 'বিজ্ঞপ্তি',
      assignInspections: 'পরিদর্শন বরাদ্দ করুন',
      imageComparison: 'ছবি তুলনা',
      cropVerification: 'ফসল যাচাইকরণ',
      auditLogs: 'অডিট ইতিহাস',
      systemNotifications: 'সিস্টেম বিজ্ঞপ্তি',
      signOut: 'লগ আউট (Sign Out)',
    },
    common: {
      selectLanguage: 'ভাষা নির্বাচন করুন',
      languages: 'ভাষাসমূহ',
      allIndia: 'সর্বভারতীয় সমর্থন',
    },
  },

  // Punjabi (ਪੰਜਾਬੀ) - Punjab
  pa: {
    operations: {
      "badge": "Live Platform Operations",
      "subtitle": "Validated metrics retrieved directly from database records",
      "registeredFarmers": "Registered Farmers",
      "activeVerified": "Active verified accounts",
      "landApplications": "Land Applications",
      "submittedRevenue": "Submitted for revenue review",
      "verifiedProperties": "Verified Properties",
      "finalReportIssued": "Final evidence report issued",
      "pendingInspections": "Pending Inspections",
      "inQueue": "In Tahsildar / drone queue"
},
    howItWorks: {
      "badge": "End-To-End Architecture",
      "title": "How AgriSurvey Verifies Agricultural Land",
      "subtitle": "A transparent, 4-stage verification workflow connecting landholders with revenue administration.",
      "phaseWorkflow": "Phase {num} Workflow",
      "step1Title": "Farmer Registration",
      "step1Desc": "Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.",
      "step2Title": "Tahsildar Review",
      "step2Desc": "Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.",
      "step3Title": "Drone-Based Inspection",
      "step3Desc": "Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.",
      "step4Title": "Verification Report",
      "step4Desc": "Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output."
},
    featuresSection: {
      "badge": "Advanced Capabilities",
      "title": "Enterprise Technology Built for Revenue Administration",
      "subtitle": "From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.",
      "feat1Title": "Digital Landholder Onboarding",
      "feat1Desc": "Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.",
      "feat2Title": "Ground & Drone Evidence",
      "feat2Desc": "Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.",
      "feat3Title": "Image Comparison Workspace",
      "feat3Desc": "Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.",
      "feat4Title": "Crop Identification System",
      "feat4Desc": "Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.",
      "feat5Title": "Event-Driven SMS Notifications",
      "feat5Desc": "Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.",
      "feat6Title": "Administrative Analytics",
      "feat6Desc": "Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails."
},
    roles: {
      "badge": "Role-Specific Value",
      "title": "Tailored for Every Agricultural Stakeholder",
      "forFarmers": "For Farmers",
      "farmerP1": "Effortless digital submission of 7/12 extract details",
      "farmerP2": "Real-time SMS & in-app stage tracking",
      "farmerP3": "Direct upload of 5-6 land photographs",
      "farmerP4": "Certified PDF report download upon completion",
      "forTahsildars": "For Tahsildars",
      "tahsildarP1": "Geographic review queue for assigned taluk",
      "tahsildarP2": "Side-by-side ground vs drone comparison workspace",
      "tahsildarP3": "Crop declaration cross-matching with AI aid",
      "tahsildarP4": "Mandatory audit trails on decisions",
      "forFieldWorkers": "For Field Workers",
      "fieldWorkerP1": "Clear dispatch list of scheduled inspections",
      "fieldWorkerP2": "GPS mission logging & drone photo uploads",
      "fieldWorkerP3": "Field notes and anomaly documentation",
      "fieldWorkerP4": "Mobile-friendly field data collection",
      "forAdmins": "For Administrators",
      "adminP1": "Role provisioning & staff region allocations",
      "adminP2": "Recharts visualization across districts",
      "adminP3": "Verification turnaround monitoring",
      "adminP4": "Immutable security audit event logging"
},
    faqSection: {
      "badge": "Common Questions",
      "title": "Frequently Asked Questions",
      "q1": "How can a farmer register agricultural land on AgriSurvey?",
      "a1": "Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.",
      "q2": "Why are 5 to 6 farmer ground photographs required?",
      "a2": "Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.",
      "q3": "How does drone-based aerial inspection operate?",
      "a3": "An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.",
      "q4": "Does AgriSurvey verification certify legal land ownership?",
      "a4": "No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.",
      "q5": "How does the Tahsildar review and decide on applications?",
      "a5": "Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports."
},
    cta: {
      "title": "Ready to Begin Digital Agricultural Land Verification?",
      "subtitle": "Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed drone field verification.",
      "registerBtn": "Register Your Land Today",
      "officerBtn": "Revenue Officer Portal"
},
    footer: {
      "mission": "AgriSurvey is a centralized agricultural land administration and verification platform connecting farmers, revenue officers, and field surveyors through drone photogrammetry and intelligent crop monitoring.",
      "evidenceBadge": "Evidence-based land verification system",
      "platform": "Platform",
      "farmerReg": "Farmer Registration",
      "howItWorks": "How It Works",
      "features": "Platform Features",
      "workflow": "Drone Inspection Workflow",
      "officerLogin": "Staff & Officer Sign In",
      "governance": "Governance & Policies",
      "privacy": "Privacy Policy & Data Protection",
      "terms": "Terms of Service & Usage Rules",
      "disclaimer": "Statutory Title Disclaimer",
      "accessibility": "Accessibility Standards",
      "audit": "Audit & Security Assurance",
      "helpdesk": "Administrative Helpdesk",
      "address": "Central Revenue & Land Survey Bhavan, Pune Division, Maharashtra 411001",
      "tollFree": "Toll-Free Kisan Support: 1800-233-0242",
      "rights": "All rights reserved.",
      "notice": "Notice: AgriSurvey verification reports represent evidence-backed field photogrammetry records and do not substitute for judicial determination or certified deeds of title."
},
    nav: {
      home: 'ਮੁੱਖ ਪੰਨਾ',
      howItWorks: 'ਕਾਰਜ ਪ੍ਰਣਾਲੀ',
      features: 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
      verification: 'ਪੜਤਾਲ',
      faq: 'ਸਵਾਲ-ਜਵਾਬ',
      signInSignUp: 'ਸਾਈਨ ਇਨ / ਰਜਿਸਟਰ',
      signIn: 'ਸਾਈਨ ਇਨ',
      signUp: 'ਜ਼ਮੀਨ ਰਜਿਸਟਰ ਕਰੋ',
      dashboard: 'ਡੈਸ਼ਬੋਰਡ',
      tagline: 'ਜ਼ਮੀਨ ਪੜਤਾਲ ਪਲੇਟਫਾਰਮ',
    },
    hero: {
      badge: 'ਅਧਿਕਾਰਤ ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ ਪੜਤਾਲ ਪੋਰਟਲ',
      titlePart1: 'ਆਧੁਨਿਕ ਡਰੋਨ ਅਤੇ ਜ਼ਮੀਨੀ',
      titlePart2: 'ਜ਼ਮੀਨ ਪੜਤਾਲ ਪ੍ਰਣਾਲੀ',
      subtitle: 'ਕਿਸਾਨਾਂ ਅਤੇ ਮਾਲ ਅਧਿਕਾਰੀਆਂ ਨੂੰ ਉੱਨਤ ਡਰੋਨ ਸਰਵੇਖਣ, ਉੱਚ-ਰੈਜ਼ੋਲਿਊਸ਼ਨ ਚਿੱਤਰ ਤੁਲਨਾ ਅਤੇ ਫਸਲ ਤਸਦੀਕ ਨਾਲ ਜੋੜਨਾ।',
      registerLand: 'ਹੁਣੇ ਜ਼ਮੀਨ ਰਜਿਸਟਰ ਕਰੋ',
      portalLogin: 'ਪੋਰਟਲ ਲੌਗਇਨ',
      parcelsSurveyed: 'ਸਰਵੇਖਣ ਕੀਤੇ ਰਕਬੇ',
      accuracy: 'ਪੜਤਾਲ ਸ਼ੁੱਧਤਾ',
      taluksCovered: 'ਸ਼ਾਮਲ ਤਹਿਸੀਲਾਂ',
    },
    auth: {
      backToHome: 'ਮੁੱਖ ਪੰਨੇ ਤੇ ਵਾਪਸ ਜਾਓ',
      gatewayTitle: 'ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ ਪ੍ਰਸ਼ਾਸਨ ਅਤੇ ਪੜਤਾਲ ਗੇਟਵੇ',
      signInTab: 'ਸਾਈਨ ਇਨ',
      signUpTab: 'ਜ਼ਮੀਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
      signInTitle: 'ਕਿਸਾਨ ਅਤੇ ਅਧਿਕਾਰੀ ਪੋਰਟਲ ਲੌਗਇਨ',
      signInSubtitle: 'ਤਹਿਸੀਲਦਾਰ ਦੀ ਪ੍ਰਵਾਨਗੀ ਤੋਂ ਬਾਅਦ SMS ਦੁਆਰਾ ਪ੍ਰਾਪਤ ਅਧਿਕਾਰਤ ਪਾਸਵਰਡ ਅਤੇ ਰਜਿਸਟਰਡ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।',
      mobileOrUser: 'ਰਜਿਸਟਰਡ ਮੋਬਾਈਲ ਨੰਬਰ ਜਾਂ ਯੂਜ਼ਰਨੇਮ',
      password: 'ਪਾਸਵਰਡ (SMS ਰਾਹੀਂ ਪ੍ਰਾਪਤ)',
      passwordPlaceholder: 'SMS ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ (ਉਦਾ: Agri@8484)',
      signInButton: 'ਐਗਰੀਸਰਵੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ',
      newFarmer: 'ਨਵੇਂ ਕਿਸਾਨ ਹੋ?',
      registerPrompt: 'ਪੋਰਟਲ ਪਹੁੰਚ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਆਪਣੀ ਜ਼ਮੀਨ ਰਜਿਸਟਰ ਕਰੋ →',
      alreadyRegistered: 'ਕੀ ਪਹਿਲਾਂ ਤੋਂ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਖਾਤਾ ਹੈ?',
      loginPrompt: 'ਆਪਣੇ SMS ਵੇਰਵਿਆਂ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ →',
      instantLogin: 'ਤੁਰੰਤ ਡੈਮੋ ਲੌਗਇਨ (ਮੁਲਾਂਕਣ ਮੋਡ)',
      farmerRole: 'ਕਿਸਾਨ',
      tahsildarRole: 'ਤਹਿਸੀਲਦਾਰ',
      fieldWorkerRole: 'ਫੀਲਡ ਵਰਕਰ',
      adminRole: 'ਪ੍ਰਬੰਧਕ',
      step1: '1. ਕਿਸਾਨ ਅਤੇ ਸੰਪਰਕ ਵੇਰਵੇ',
      step2: '2. ਪਛਾਣ ਅਤੇ ਪਤਾ',
      step3: '3. ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ ਦਾ ਵੇਰਵਾ',
      step4: '4. ਸਮੀਖਿਆ ਅਤੇ ਜਮ੍ਹਾਂ ਕਰੋ',
      fullName: 'ਕਿਸਾਨ ਦਾ ਪੂਰਾ ਨਾਮ',
      mobileNumber: 'ਮੋਬਾਈਲ ਨੰਬਰ (SMS ਲੌਗਇਨ ਲਈ)',
      email: 'ਈਮੇਲ ਪਤਾ (ਵਿਕਲਪਿਕ)',
      prefLanguage: 'ਤਰਜੀਹੀ ਭਾਸ਼ਾ',
      next: 'ਅਗਲਾ ਕਦਮ',
      prev: 'ਪਿਛਲਾ ਕਦਮ',
      submit: 'ਜ਼ਮੀਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਜਮ੍ਹਾਂ ਕਰੋ',
      appSubmitted: 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲਤਾਪੂਰਵਕ ਜਮ੍ਹਾਂ ਹੋ ਗਈ!',
      approvalNotice: 'ਤੁਹਾਡੀ ਅਰਜ਼ੀ ਤਹਿਸੀਲਦਾਰ ਨੂੰ ਭੇਜੀ ਗਈ ਹੈ। ਮਨਜ਼ੂਰੀ ਉਪਰੰਤ ਪਾਸਵਰਡ SMS ਰਾਹੀਂ ਮਿਲੇਗਾ।',
      appRef: 'ਅਰਜ਼ੀ ਹਵਾਲਾ ਨੰਬਰ',
      propRef: 'ਜਾਇਦਾਦ ਹਵਾਲਾ ਨੰਬਰ',
      surveyNo: 'ਖਸਰਾ / ਸਰਵੇ ਨੰਬਰ',
      village: 'ਪਿੰਡ / ਤਹਿਸੀਲ',
    },
    dashboard: {
      overview: 'ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
      registerLand: 'ਜ਼ਮੀਨ ਰਜਿਸਟਰ ਕਰੋ',
      myProperties: 'ਮੇਰੀਆਂ ਜ਼ਮੀਨਾਂ',
      uploadImages: 'ਜ਼ਮੀਨ ਦੀਆਂ ਤਸਵੀਰਾਂ ਅੱਪਲੋਡ ਕਰੋ',
      droneStatus: 'ਡਰੋਨ ਨਿਰੀਖਣ ਸਥਿਤੀ',
      verificationReports: 'ਪੜਤਾਲ ਰਿਪੋਰਟਾਂ',
      notifications: 'ਸੂਚਨਾਵਾਂ',
      assignInspections: 'ਨਿਰੀਖਣ ਨਿਰਧਾਰਤ ਕਰੋ',
      imageComparison: 'ਚਿੱਤਰ ਤੁਲਨਾ',
      cropVerification: 'ਫਸਲ ਪੜਤਾਲ',
      auditLogs: 'ਆਡਿਟ ਇਤਿਹਾਸ',
      systemNotifications: 'ਸਿਸਟਮ ਸੂਚਨਾਵਾਂ',
      signOut: 'ਲੌਗ ਆਊਟ (Sign Out)',
    },
    common: {
      selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
      languages: 'ਭਾਸ਼ਾਵਾਂ',
      allIndia: 'ਸਾਰੇ ਰਾਜਾਂ ਦਾ ਸਮਰਥਨ',
    },
  },

  // Malayalam (മലയാളം) - Kerala
  ml: {
    operations: {
      "badge": "Live Platform Operations",
      "subtitle": "Validated metrics retrieved directly from database records",
      "registeredFarmers": "Registered Farmers",
      "activeVerified": "Active verified accounts",
      "landApplications": "Land Applications",
      "submittedRevenue": "Submitted for revenue review",
      "verifiedProperties": "Verified Properties",
      "finalReportIssued": "Final evidence report issued",
      "pendingInspections": "Pending Inspections",
      "inQueue": "In Tahsildar / drone queue"
},
    howItWorks: {
      "badge": "End-To-End Architecture",
      "title": "How AgriSurvey Verifies Agricultural Land",
      "subtitle": "A transparent, 4-stage verification workflow connecting landholders with revenue administration.",
      "phaseWorkflow": "Phase {num} Workflow",
      "step1Title": "Farmer Registration",
      "step1Desc": "Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.",
      "step2Title": "Tahsildar Review",
      "step2Desc": "Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.",
      "step3Title": "Drone-Based Inspection",
      "step3Desc": "Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.",
      "step4Title": "Verification Report",
      "step4Desc": "Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output."
},
    featuresSection: {
      "badge": "Advanced Capabilities",
      "title": "Enterprise Technology Built for Revenue Administration",
      "subtitle": "From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.",
      "feat1Title": "Digital Landholder Onboarding",
      "feat1Desc": "Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.",
      "feat2Title": "Ground & Drone Evidence",
      "feat2Desc": "Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.",
      "feat3Title": "Image Comparison Workspace",
      "feat3Desc": "Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.",
      "feat4Title": "Crop Identification System",
      "feat4Desc": "Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.",
      "feat5Title": "Event-Driven SMS Notifications",
      "feat5Desc": "Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.",
      "feat6Title": "Administrative Analytics",
      "feat6Desc": "Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails."
},
    roles: {
      "badge": "Role-Specific Value",
      "title": "Tailored for Every Agricultural Stakeholder",
      "forFarmers": "For Farmers",
      "farmerP1": "Effortless digital submission of 7/12 extract details",
      "farmerP2": "Real-time SMS & in-app stage tracking",
      "farmerP3": "Direct upload of 5-6 land photographs",
      "farmerP4": "Certified PDF report download upon completion",
      "forTahsildars": "For Tahsildars",
      "tahsildarP1": "Geographic review queue for assigned taluk",
      "tahsildarP2": "Side-by-side ground vs drone comparison workspace",
      "tahsildarP3": "Crop declaration cross-matching with AI aid",
      "tahsildarP4": "Mandatory audit trails on decisions",
      "forFieldWorkers": "For Field Workers",
      "fieldWorkerP1": "Clear dispatch list of scheduled inspections",
      "fieldWorkerP2": "GPS mission logging & drone photo uploads",
      "fieldWorkerP3": "Field notes and anomaly documentation",
      "fieldWorkerP4": "Mobile-friendly field data collection",
      "forAdmins": "For Administrators",
      "adminP1": "Role provisioning & staff region allocations",
      "adminP2": "Recharts visualization across districts",
      "adminP3": "Verification turnaround monitoring",
      "adminP4": "Immutable security audit event logging"
},
    faqSection: {
      "badge": "Common Questions",
      "title": "Frequently Asked Questions",
      "q1": "How can a farmer register agricultural land on AgriSurvey?",
      "a1": "Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.",
      "q2": "Why are 5 to 6 farmer ground photographs required?",
      "a2": "Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.",
      "q3": "How does drone-based aerial inspection operate?",
      "a3": "An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.",
      "q4": "Does AgriSurvey verification certify legal land ownership?",
      "a4": "No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.",
      "q5": "How does the Tahsildar review and decide on applications?",
      "a5": "Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports."
},
    cta: {
      "title": "Ready to Begin Digital Agricultural Land Verification?",
      "subtitle": "Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed drone field verification.",
      "registerBtn": "Register Your Land Today",
      "officerBtn": "Revenue Officer Portal"
},
    footer: {
      "mission": "AgriSurvey is a centralized agricultural land administration and verification platform connecting farmers, revenue officers, and field surveyors through drone photogrammetry and intelligent crop monitoring.",
      "evidenceBadge": "Evidence-based land verification system",
      "platform": "Platform",
      "farmerReg": "Farmer Registration",
      "howItWorks": "How It Works",
      "features": "Platform Features",
      "workflow": "Drone Inspection Workflow",
      "officerLogin": "Staff & Officer Sign In",
      "governance": "Governance & Policies",
      "privacy": "Privacy Policy & Data Protection",
      "terms": "Terms of Service & Usage Rules",
      "disclaimer": "Statutory Title Disclaimer",
      "accessibility": "Accessibility Standards",
      "audit": "Audit & Security Assurance",
      "helpdesk": "Administrative Helpdesk",
      "address": "Central Revenue & Land Survey Bhavan, Pune Division, Maharashtra 411001",
      "tollFree": "Toll-Free Kisan Support: 1800-233-0242",
      "rights": "All rights reserved.",
      "notice": "Notice: AgriSurvey verification reports represent evidence-backed field photogrammetry records and do not substitute for judicial determination or certified deeds of title."
},
    nav: {
      home: 'ഹോം',
      howItWorks: 'പ്രവർത്തന രീതി',
      features: 'സവിശേഷതകൾ',
      verification: 'പരിശോധന',
      faq: 'പതിവുചോദ്യങ്ങൾ',
      signInSignUp: 'സൈൻ ഇൻ / രജിസ്റ്റർ',
      signIn: 'സൈൻ ഇൻ',
      signUp: 'ഭൂമി രജിസ്ട്രേഷൻ',
      dashboard: 'ഡാഷ്‌ബോർഡ്',
      tagline: 'ഭൂമി പരിശോധനാ പ്ലാറ്റ്‌ഫോം',
    },
    hero: {
      badge: 'ഔദ്യോഗിക കാർഷിക ഭൂമി പരിശോധന',
      titlePart1: 'ആധുനിക ഡ്രോൺ & നേരിട്ടുള്ള',
      titlePart2: 'ഭൂമി പരിശോധനാ സംവിധാനം',
      subtitle: 'കർഷകരെയും റവന്യൂ ഉദ്യോഗസ്ഥരെയും ഡ്രോൺ സർവേ, ഉയർന്ന റെസല്യൂഷൻ ചിത്ര താരതമ്യം, വിള പരിശോധന എന്നിവയുമായി ബന്ധിപ്പിക്കുന്നു.',
      registerLand: 'ഭൂമി രജിസ്റ്റർ ചെയ്യുക',
      portalLogin: 'പോർട്ടൽ ലോഗിൻ',
      parcelsSurveyed: 'സർവേ ചെയ്ത ഭൂമി',
      accuracy: 'പരിശോധനാ കൃത്യത',
      taluksCovered: 'ഉൾപ്പെടുത്തിയ താലൂക്കുകൾ',
    },
    auth: {
      backToHome: 'ഹോമിലേക്ക് മടങ്ങുക',
      gatewayTitle: 'കാർഷിക ഭൂമി ഭരണ & പരിശോധനാ കവാടം',
      signInTab: 'സൈൻ ഇൻ',
      signUpTab: 'ഭൂമി രജിസ്ട്രേഷൻ',
      signInTitle: 'കർഷക & ഉദ്യോഗസ്ഥ ലോഗിൻ',
      signInSubtitle: 'തഹസിൽദാർ അംഗീകാരത്തിന് ശേഷം SMS വഴി ലഭിച്ച ഔദ്യോഗിക പാസ്‌വേഡും രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പറും നൽകുക.',
      mobileOrUser: 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ അല്ലെങ്കിൽ ഉപയോക്തൃനാമം',
      password: 'പാസ്‌വേഡ് (SMS വഴി ലഭിച്ചത്)',
      passwordPlaceholder: 'SMS പാസ്‌വേഡ് നൽകുക (ഉദാ: Agri@8484)',
      signInButton: 'അഗ്രിസർവേയിൽ സൈൻ ഇൻ ചെയ്യുക',
      newFarmer: 'പുതിയ കർഷകനാണോ?',
      registerPrompt: 'പോർട്ടൽ പ്രവേശനത്തിനായി ഭൂമി രജിസ്റ്റർ ചെയ്യുക →',
      alreadyRegistered: 'മുമ്പ് അംഗീകരിച്ച അക്കൗണ്ട് ഉണ്ടോ?',
      loginPrompt: 'SMS വിവരങ്ങൾ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക →',
      instantLogin: 'തൽക്ഷണ ഡെമോ ലോഗിൻ (മൂല്യനിർണ്ണയ മോഡ്)',
      farmerRole: 'കർഷകൻ',
      tahsildarRole: 'തഹസിൽദാർ',
      fieldWorkerRole: 'ഫീൽഡ് വർക്കർ',
      adminRole: 'അഡ്മിനിസ്ട്രേറ്റർ',
      step1: '1. കർഷക & ബന്ധപ്പെടൽ വിവരങ്ങൾ',
      step2: '2. തിരിച്ചറിയൽ & വിലാസം',
      step3: '3. കാർഷിക ഭൂമി വിവരങ്ങൾ',
      step4: '4. അവലോകനവും സമർപ്പിക്കലും',
      fullName: 'കർഷകന്റെ പൂർണ്ണ പേര്',
      mobileNumber: 'മൊബൈൽ നമ്പർ (SMS ലോഗിനായി)',
      email: 'ഇമെയിൽ വിലാസം (ഓപ്ഷണൽ)',
      prefLanguage: 'തിരഞ്ഞെടുത്ത ഭാഷ',
      next: 'അടുത്ത ഘട്ടം',
      prev: 'മുമ്പത്തെ ഘട്ടം',
      submit: 'ഭൂമി രജിസ്ട്രേഷൻ സമർപ്പിക്കുക',
      appSubmitted: 'രജിസ്ട്രേഷൻ വിജയകരമായി സമർപ്പിച്ചു!',
      approvalNotice: 'നിങ്ങളുടെ അപേക്ഷ തഹസിൽദാർക്ക് അയച്ചിരിക്കുന്നു. അംഗീകാരത്തിന് ശേഷം പാസ്‌വേഡ് SMS വഴി ലഭിക്കും.',
      appRef: 'അപേക്ഷാ റഫറൻസ് നമ്പർ',
      propRef: 'വസ്തു റഫറൻസ് നമ്പർ',
      surveyNo: 'സർവേ നമ്പർ',
      village: 'വില്ലേജ് / താലൂക്ക്',
    },
    dashboard: {
      overview: 'അവലോകനം',
      registerLand: 'ഭൂമി രജിസ്റ്റർ ചെയ്യുക',
      myProperties: 'എന്റെ ഭൂമികൾ',
      uploadImages: 'ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക',
      droneStatus: 'ഡ്രോൺ പരിശോധന നില',
      verificationReports: 'പരിശോധനാ റിപ്പോർട്ടുകൾ',
      notifications: 'അറിയിപ്പുകൾ',
      assignInspections: 'പരിശോധനകൾ നിയോഗിക്കുക',
      imageComparison: 'ചിത്ര താരതമ്യം',
      cropVerification: 'വിള പരിശോധന',
      auditLogs: 'ഓഡിറ്റ് ചരിത്രം',
      systemNotifications: 'സിസ്റ്റം അറിയിപ്പുകൾ',
      signOut: 'പുറത്തുകടക്കുക (Sign Out)',
    },
    common: {
      selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
      languages: 'ഭാഷകൾ',
      allIndia: 'എല്ലാ സംസ്ഥാന പിന്തുണയും',
    },
  },
};
