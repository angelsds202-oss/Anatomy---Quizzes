// You can add as many as you want.
// Keep topics consistent (spelling must match).
// Format:
// { topic:"Renal", q:"...", choices:["A","B","C","D"], answerIndex:1, explanation:"..." }

window.QUESTION_BANK = [
  // Cardiovascular
  { topic:"Cardiovascular", q:"Which valve lies between the left atrium and left ventricle?", choices:["Tricuspid","Mitral (bicuspid)","Pulmonary","Aortic"], answerIndex:1, explanation:"Mitral valve separates the left atrium and left ventricle." },
  { topic:"Cardiovascular", q:"The pacemaker of the heart is the…", choices:["AV node","Bundle of His","SA node","Purkinje fibres"], answerIndex:2, explanation:"The SA node initiates impulses that spread through the atria." },
  { topic:"Cardiovascular", q:"Which vessel carries oxygenated blood from the lungs to the heart?", choices:["Pulmonary artery","Pulmonary vein","Aorta","Vena cava"], answerIndex:1, explanation:"Pulmonary veins return oxygenated blood to the left atrium." },
  { topic:"Cardiovascular", q:"What is the primary function of arteries?", choices:["Carry blood toward the heart","Carry blood away from the heart","Exchange gases","Store blood cells"], answerIndex:1, explanation:"Arteries carry blood away from the heart (usually oxygenated except pulmonary artery)." },
  { topic:"Cardiovascular", q:"Blood pressure is most influenced by…", choices:["Heart rate only","Stroke volume only","Cardiac output and systemic vascular resistance","Blood glucose"], answerIndex:2, explanation:"BP depends largely on CO and SVR." },

  // Respiratory
  { topic:"Respiratory", q:"Gas exchange occurs primarily in the…", choices:["Trachea","Bronchi","Alveoli","Pleura"], answerIndex:2, explanation:"Alveoli provide thin membranes and huge surface area for diffusion." },
  { topic:"Respiratory", q:"Which muscle is the main driver of normal inspiration?", choices:["Diaphragm","Internal intercostals","Rectus abdominis","Trapezius"], answerIndex:0, explanation:"Diaphragm contraction increases thoracic volume." },
  { topic:"Respiratory", q:"Type II alveolar cells mainly…", choices:["Produce surfactant","Perform gas exchange","Form mucus","Carry oxygen in blood"], answerIndex:0, explanation:"Type II pneumocytes produce surfactant to reduce surface tension." },
  { topic:"Respiratory", q:"Most CO₂ is transported in blood as…", choices:["Dissolved CO₂","Carbaminohaemoglobin","Bicarbonate (HCO₃⁻)","Oxyhaemoglobin"], answerIndex:2, explanation:"Most CO₂ is converted to bicarbonate in RBCs and carried in plasma." },

  // Nervous
  { topic:"Nervous", q:"Which part of the neuron speeds up conduction via saltatory conduction?", choices:["Dendrites","Myelin sheath","Nucleus","Synaptic cleft"], answerIndex:1, explanation:"Myelin allows impulses to jump node-to-node (nodes of Ranvier)." },
  { topic:"Nervous", q:"The cerebellum is most associated with…", choices:["Vision","Coordination and balance","Breathing rhythm","Language comprehension"], answerIndex:1, explanation:"Cerebellum fine-tunes movement and balance." },
  { topic:"Nervous", q:"The neurotransmitter at most neuromuscular junctions is…", choices:["Dopamine","Serotonin","Acetylcholine","GABA"], answerIndex:2, explanation:"ACh triggers muscle fibre depolarization at the NMJ." },

  // Musculoskeletal
  { topic:"Musculoskeletal", q:"A tendon connects…", choices:["Bone to bone","Muscle to bone","Nerve to muscle","Cartilage to bone"], answerIndex:1, explanation:"Tendons attach muscle to bone." },
  { topic:"Musculoskeletal", q:"Which is a ball-and-socket joint?", choices:["Elbow","Knee","Shoulder","Wrist"], answerIndex:2, explanation:"Shoulder and hip are ball-and-socket joints." },
  { topic:"Musculoskeletal", q:"The primary function of red bone marrow is…", choices:["Fat storage","Joint lubrication","Blood cell production","Calcium excretion"], answerIndex:2, explanation:"Red marrow performs haematopoiesis." },

  // Gastrointestinal
  { topic:"Gastrointestinal", q:"Most nutrient absorption occurs in the…", choices:["Stomach","Duodenum/jejunum (small intestine)","Large intestine","Oesophagus"], answerIndex:1, explanation:"The small intestine (especially jejunum) is the main site of absorption." },
  { topic:"Gastrointestinal", q:"Bile is produced by the…", choices:["Pancreas","Gallbladder","Liver","Stomach"], answerIndex:2, explanation:"Bile is made in the liver and stored/concentrated in the gallbladder." },
  { topic:"Gastrointestinal", q:"Main function of the large intestine is…", choices:["Protein digestion","Water and electrolyte reabsorption","Bile production","Vitamin D synthesis"], answerIndex:1, explanation:"Large intestine reabsorbs water/electrolytes and forms stool." },

  // Renal / Urinary
  { topic:"Renal", q:"The functional unit of the kidney is the…", choices:["Nephron","Alveolus","Osteon","Neuron"], answerIndex:0, explanation:"Each kidney contains ~1 million nephrons for filtration and regulation." },
  { topic:"Renal", q:"Filtration occurs in the…", choices:["Loop of Henle","Glomerulus","Collecting duct","Ureter"], answerIndex:1, explanation:"The glomerulus filters plasma into Bowman’s capsule." },
  { topic:"Renal", q:"ADH mainly increases water reabsorption in the…", choices:["Proximal tubule","Collecting duct","Ureter","Renal artery"], answerIndex:1, explanation:"ADH inserts aquaporins in collecting ducts to reabsorb water." },

  // Endocrine
  { topic:"Endocrine", q:"Insulin is produced by…", choices:["Alpha cells (pancreas)","Beta cells (pancreas)","Thyroid follicles","Adrenal cortex"], answerIndex:1, explanation:"Pancreatic beta cells produce insulin." },
  { topic:"Endocrine", q:"Which hormone increases blood calcium?", choices:["Calcitonin","Parathyroid hormone (PTH)","Insulin","Oxytocin"], answerIndex:1, explanation:"PTH raises calcium via bone, kidney, and vitamin D activation." },
  { topic:"Endocrine", q:"The fight-or-flight hormones adrenaline/noradrenaline are released from the…", choices:["Adrenal cortex","Adrenal medulla","Pituitary","Thyroid"], answerIndex:1, explanation:"Adrenal medulla releases catecholamines." },

  // Integumentary
  { topic:"Integumentary", q:"The outermost skin layer is the…", choices:["Dermis","Hypodermis","Epidermis","Fascia"], answerIndex:2, explanation:"Epidermis is the most superficial layer." },
  { topic:"Integumentary", q:"Which cells produce melanin?", choices:["Keratinocytes","Melanocytes","Fibroblasts","Erythrocytes"], answerIndex:1, explanation:"Melanocytes produce melanin pigment." },

  // Immune / Lymphatic
  { topic:"Immune/Lymphatic", q:"Which white blood cell is most associated with antibody production?", choices:["Neutrophil","B lymphocyte","Eosinophil","Platelet"], answerIndex:1, explanation:"B cells differentiate into plasma cells that produce antibodies." },
  { topic:"Immune/Lymphatic", q:"Lymph nodes primarily…", choices:["Pump blood","Filter lymph and support immune responses","Produce bile","Store glucose"], answerIndex:1, explanation:"They filter pathogens and activate immune cells." },

  // Reproductive
  { topic:"Reproductive", q:"Where does fertilisation most commonly occur?", choices:["Uterus","Cervix","Fallopian tube (ampulla)","Vagina"], answerIndex:2, explanation:"Fertilisation commonly occurs in the fallopian tube (ampulla)." },
  { topic:"Reproductive", q:"Testosterone is primarily produced by…", choices:["Sertoli cells","Leydig cells","Pituitary cells","Prostate cells"], answerIndex:1, explanation:"Leydig cells in testes produce testosterone." },
];
