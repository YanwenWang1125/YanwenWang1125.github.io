// Projects: the long version of the things on the map, in research, work, projects and study.
(() => {
  const GROUPS = {
    Research: "#f2c46d",
    Work: "#8fe0cf",
    Projects: "#9cc7ff",
    Study: "#ff9e7a",
  };
  const G = "https://github.com/YanwenWang1125/";

  const PROJECTS = [
    {
      id: "rewrite", group: "Research", star: "rewrite",
      title: "Learning-guided fault-tolerant rewrites",
      role: "PhD research, main project", when: "Oct 2026 – now", where: "Western University",
      stack: ["Python", "Stim", "Beam search", "MILP", "Slurm on Fir"],
      lead: "Error correction protects a quantum computer by measuring checks on its qubits over and over. The circuits that take those measurements cost extra qubits and gates, and they must stay fault tolerant: a single fault must never turn into an error the code cannot see.",
      sections: [
        ["The idea", ["Start from a circuit that is known to be fault tolerant, and change it only with rewrite rules that keep it that way. The hard part is choosing among the candidates. That is where machine learning comes in: ranking circuits cheaply instead of simulating each one, and choosing which rewrite to try next."]],
        ["What I did", [
          "Reproduced Jeon et al.'s results on Shor- and Steane-style gadgets, including their flag protocol.",
          "Built a rule-based searcher with beam search and ran it in overnight experiment loops on the Fir cluster.",
          "Added an exact MILP distance check after an outside review showed some circuits I had called distance 5 were really distance 4, and withdrew the claims that rested on them.",
          "Swept idle noise and scheduling to see how much the order of gates matters.",
        ]],
        ["What came out", [
          "For the distance-5 [[17,1,5]] colour code: a circuit with 12 ancillas per Z half-round instead of 15, proven distance ≥ 5, with a logical error rate level with the best published circuit.",
          "11 ancillas also keep distance 5 but err 16–19% more often; no 10-ancilla circuit turned up.",
          "Circuits that are equivalent on paper can differ in error rate once scheduling and idle noise are included, so counting gates is the wrong cost function.",
          "The number of mechanisms in a circuit's detector error model ranks candidates well, and 2-round checks follow 5-round ones while running 14.7× faster.",
        ]],
        ["Next", ["Run original and rewritten circuits on the IBM Quantum System One at PINQ² (December 2026 to March 2027), then train models to rank candidates and steer the search."]],
      ],
    },
    {
      id: "vqe", group: "Research", star: "vqe",
      title: "VQE on H2, LiH and BeH2",
      role: "Independent project", when: "Oct 2026", where: "Western University",
      stack: ["PennyLane", "Qiskit", "NumPy", "Slurm", "NVIDIA H100"],
      image: "assets/fig/lih_error_vs_bond_length.png", plot: true,
      imageAlt: "Energy error against Li–H bond length: UCCSD stays far below the 1.6 mHa line, the hardware-efficient ansatz stays far above it.",
      lead: "Under the same optimisation budget, which is easier to train to chemical accuracy (1.6 mHa): UCCSD, built for chemistry, or a generic hardware-efficient ansatz?",
      sections: [
        ["What I did", [
          "Computed ground-state energies for H2 (4 qubits, 22 bond lengths), LiH (12 qubits) and BeH2 (14 qubits) against exact diagonalisation.",
          "Gave every run the same budget: Adam with step size 0.05, at most 300 steps, one stopping rule. Over 300 training runs in all.",
          "Suspected the generic ansatz had an unfair start, so added a control that starts it from the Hartree–Fock state.",
          "Implemented ADAPT-VQE, cross-checked H2 in Qiskit to 10⁻¹² Ha, and timed gradients on CPU and GPU up to 24 qubits.",
        ]],
        ["What came out", [
          "UCCSD reached chemical accuracy at 22 of 22 H2 bond lengths, 5 of 5 for LiH and 3 of 5 for BeH2.",
          "The hardware-efficient ansatz reached it in 0 of 150 runs. Starting from Hartree–Fock removed the spread between seeds, but every run then stopped at the Hartree–Fock energy.",
          "ADAPT-VQE reached chemical accuracy on LiH with 4–7 of UCCSD's 92 gates, at the cost of 22–27× more optimiser steps.",
          "On an H100 slice, one gradient at 20 qubits ran 5.6× faster than on 4 CPU cores; below 16 qubits the CPU was faster.",
        ]],
        ["What I learned", ["A stopping rule that fired too early made H2 look worse than it was. Requiring five small steps in a row cut the worst error from 0.77 to 0.0099 mHa. Small details of a training loop decide what a benchmark says."]],
      ],
      links: [["Code and results", `${G}qml-chemistry-projects`]],
    },
    {
      id: "qml", group: "Research", star: "qcnn",
      title: "Quantum ML, checked against classical baselines",
      role: "Independent research", when: "Sep – Oct 2026", where: "Western University",
      stack: ["PennyLane", "PyTorch", "NumPy", "scikit-learn"],
      image: "assets/nist-sd-19-f1002-33.png", imagePos: "50% 22%",
      imageAlt: "A 1989 NIST handwriting sample form with rows of hand-printed digits.",
      lead: "Quantum machine learning papers often report a quantum model beating a classical one. I wanted to see how those claims hold up when you rebuild them yourself.",
      sections: [
        ["QCNN design ablation", [
          "Built an 8-qubit quantum convolutional network for handwritten 3 vs 8 and varied two design choices over 5 seeds each.",
          "All four designs landed between 0.948 and 0.961 test accuracy. A 9-parameter logistic regression on the same features reached 0.981.",
        ]],
        ["Checking published claims", [
          "Kernel bandwidth (Shaydulin & Wild, PRA 2022): reproduced quantum kernels concentrating as qubits grow, and bandwidth scaling undoing it.",
          "QCNN for classical data (Hur et al.): PCA plus logistic regression reaches 99.91% on the paper's MNIST 0 vs 1 task, and parameter-shift needs 492 circuits at 32 qubits, not the roughly 40 the paper implies.",
          "EQE-QAOA (2026): reproduced the symmetry reduction to 10⁻¹⁵ and found smaller invariant subspaces by adding the global bit-flip symmetry.",
        ]],
        ["What I learned", ["A quantum result means little without a fair classical baseline next to it. That habit now shapes every experiment I run."]],
      ],
    },
    {
      id: "wildfire", group: "Research", star: "wildfire",
      title: "Wildfire prediction across Canada",
      role: "MSc research, with Guan Qiang and Prof. Fang Fang", when: "2024 – 2025", where: "Western University",
      stack: ["PyTorch", "Vision Transformer", "LSTM", "Data pipelines"],
      image: "assets/northwest-crown-fire-experiment.png",
      imageAlt: "A crown fire burning through boreal forest in the Northwest Territories.",
      lead: "Can a model that reads both fire-danger maps and weather predict where wildfires will start tomorrow, across all of Canada?",
      sections: [
        ["What I did", [
          "Built a pipeline that collects daily fire-danger and satellite-hotspot maps (CWFIS FireM3 and the Fire Weather Index) and weather for 2017–2023, aligns dates across sources and checks for missing or corrupted files.",
          "Designed a two-branch model: an ImageNet-pretrained Vision Transformer for the maps, an LSTM for temperature, humidity, wind speed and dew point, fused before the classifier.",
          "Kept the 70/15/15 split independent in both time and space, and reported metrics that account for class imbalance.",
        ]],
        ["What came out", [
          "The fused model reached accuracy 0.87, F1 0.82 and AUC-ROC 0.91, against 0.81 / 0.74 / 0.85 for the Vision Transformer alone and 0.79 / 0.71 / 0.83 for the LSTM alone.",
          "AUC-PR 0.79 and MCC 0.71, and it was the best calibrated of the three.",
        ]],
      ],
    },
    {
      id: "agent", group: "Work", star: "agent",
      title: "An AI front desk for a health centre",
      role: "AI Solution Intern", when: "Sep 2025 – Sep 2026", where: "SFU Health Care Center",
      stack: ["GPT", "LangGraph", "LangChain", "Retrieval"],
      lead: "Front-desk staff spend their day on the same few tasks: booking, rescheduling, intake forms, common questions and routing calls. I led a team of three that built an agent to take on that work.",
      sections: [
        ["What I did", [
          "Designed the agent's workflow in LangGraph, with tool calls to scheduling, patient records, calendars and messaging, plus retrieval over the centre's policies.",
          "Made staff review every action before it takes effect, and used patient data only with signed consent.",
          "Delivered a working demo covering all five front-desk tasks.",
        ]],
        ["What I learned", ["In healthcare the hard part is not the model, it is fitting into a real workflow with a person in the loop and consent built in from the start."]],
      ],
    },
    {
      id: "geotab", group: "Work", star: "geotab",
      title: "Cloud storage tooling at Geotab",
      role: "Software Engineer Intern", when: "Jan – Aug 2022", where: "Geotab, Toronto",
      stack: ["Python", "Django", "Google Cloud Platform", "SQL"],
      lead: "My first software job: eight months on a team that runs a large fleet-telematics platform.",
      sections: [
        ["What I did", ["Built a Django interface that creates, reads, updates and deletes Google Cloud Storage buckets directly from database records, so the team could manage storage without hand-written scripts."]],
      ],
    },
    {
      id: "ivey", group: "Work", star: "ivey",
      title: "Reading messy documents at Ivey",
      role: "Research Assistant", when: "Apr – Aug 2023", where: "Ivey Business School, London",
      stack: ["Python", "OCR", "Mathematical morphology", "OpenCV"],
      lead: "Research data locked inside scanned PDFs: handwriting, noise, distortion and every kind of font.",
      sections: [
        ["What I did", ["Combined handwriting OCR with mathematical morphology to clean and segment the pages before recognition, and pull the data out into a usable form."]],
      ],
      links: [["Code", `${G}ImageRecogn_OCR`]],
    },
    {
      id: "teaching", group: "Work", star: "ta",
      title: "Teaching",
      role: "Teaching assistant and tutor", when: "2025 – now", where: "Western University and private tutoring",
      stack: ["CS3357", "Physics 11", "Python", "Java", "AP CS A"],
      lead: "Teaching runs through everything I do. I like finding the one sentence that makes an idea click.",
      sections: [
        ["Teaching assistant, CS3357", [
          "Prepared the midterm: removed questions outside the covered chapters, rescored, typeset four versions.",
          "Wrote quiz solutions, kept the class roster in sync and adjusted the assignment autograder.",
        ]],
        ["Tutoring", [
          "Physics 11 from forces to waves: worked solutions for every unit, and a grading tool that checks units and significant figures. Along the way I caught errors in two answer keys.",
          "Python, Java, AP Computer Science A, maths contests and chemistry, with handouts and projects I write myself; now preparing a course for the CCC Senior contest.",
        ]],
        ["A workshop on learning", ["Turned the way I learn a new field into a 20-minute workshop, with a live demo starting from zero on Nielsen & Chuang."]],
      ],
    },
    {
      id: "flight", group: "Projects", star: "flight",
      title: "Flight school cancellation recovery",
      role: "Designer and developer", when: "2026", where: "With Diamond Flight Centre London",
      stack: ["Java 21", "Spring Boot", "PostgreSQL", "Flyway", "React", "TypeScript", "Docker"],
      image: "assets/hfa-cessna-172-training-aircraft.jpg",
      imageAlt: "A Cessna 172 training aircraft in flight.",
      lead: "When a flight lesson is cancelled, the slot only helps if it can be refilled fast: a student who is ready, a qualified instructor, and an aircraft that is free, under weather, daylight and maintenance rules.",
      sections: [
        ["What I did", [
          "Turned the flight school's operating rules into a joint assignment problem for student, instructor and aircraft or simulator.",
          "Designed a modular system whose scheduling core can later be swapped for an optimiser or a learned policy without touching anything else.",
          "Built the Spring Boot backend, the PostgreSQL schema with migrations, user and audit records, the React frontend and container-based tests.",
          "Wrote the pilot's evaluation plan: detection delay, time to refill, refill rate and recovered flight hours.",
          "Co-wrote the NSERC Alliance–Mitacs proposal behind it, including a mock merit review and three rounds of revision.",
        ]],
      ],
    },
    {
      id: "realtor", group: "Projects", star: "realtor",
      title: "RealtorOS",
      role: "Builder", when: "2025", where: "Independent",
      stack: ["FastAPI", "Next.js", "PostgreSQL", "Docker", "Azure"],
      lead: "Real estate agents juggle dozens of clients, each at a different stage. RealtorOS keeps track of them and drafts the follow-ups.",
      sections: [
        ["What I did", ["Built client records, follow-up tasks, AI email drafts and automated workflows, then took it from local development to Azure containers: database migrations, an email service, and debugging third-party integrations in the cloud."]],
      ],
      links: [["Code", `${G}RealtorOS`]],
    },
    {
      id: "rubricheck", group: "Projects", star: "rubricheck",
      title: "RubriCheck",
      role: "Builder", when: "2025", where: "Independent",
      stack: ["LLMs", "OCR", "Structured output", "Python"],
      lead: "Feedback on writing is only useful if you can see why. RubriCheck grades an essay against its rubric and backs every comment with a quote.",
      sections: [
        ["What I did", ["Built the pipeline from upload to feedback: extract the rubric, read the essay (with OCR when needed), score each criterion with structured LLM output, and attach the evidence from the text. Deployed the front and back end and iterated on the grading flow."]],
      ],
      links: [["Code", `${G}RubriCheck`]],
    },
    {
      id: "web", group: "Projects", star: "explainers",
      title: "Websites that explain",
      role: "Designer and developer", when: "Oct 2026 – now", where: "Q-AICON Lab and personal",
      stack: ["HTML", "CSS", "JavaScript", "Canvas", "GitHub Pages"],
      lead: "Quantum computing is hard to picture, so I build things you can poke at.",
      sections: [
        ["What I made", [
          "The Q-AICON lab website, live on 26 October: research map, publications checked one by one, members with their papers, projects and news.",
          "Interactive pages on Bloch spheres, entanglement, a QNN training lab, QAOA, Grover search, and a stabiliser demo with a full 7-qubit circuit.",
          "Two short science videos, from bit to qubit to why it matters.",
          "This site: a star map of everything I have done.",
        ]],
      ],
    },
    {
      id: "familyphoto", group: "Projects", star: "familyphoto",
      title: "Family Photo Hub",
      role: "Builder", when: "2025", where: "Independent",
      stack: ["Python", "AI tagging", "Face clustering", "Cloud storage"],
      lead: "A private photo library for my family for under $100 a year.",
      sections: [
        ["What it does", ["Uploads from any phone or computer, keeps previews hot and originals in cheap storage, tags photos and clusters faces, groups them into a timeline, and answers questions like “show me last Christmas”."]],
      ],
      links: [["Code", `${G}Family-Photo`]],
    },
    {
      id: "phd", group: "Study", star: "phd",
      title: "Learning quantum computing from zero",
      role: "PhD, Computer Science", when: "Sep 2026 – now", where: "Western University, with Prof. Fang Fang",
      stack: ["Quantum kernels", "QNNs", "VQE", "QEC", "Stim"],
      lead: "I opened my first quantum textbook on 17 September 2026. Seven weeks later I had a research topic and my first results.",
      sections: [
        ["How I learn", [
          "One section a day, then a gate: I answer check questions on my own before moving on. Chapter 3 (quantum kernels) and chapter 4 (QNNs) passed this way.",
          "Every claim gets checked in code. That is how I found two errors in the textbook, in a backpropagation formula and in a lemma.",
          "Papers are read twice: first asking questions as I go, then a guided close reading with a written review.",
        ]],
        ["From learning to research", ["From 21 October I moved to error correction: syndromes, Pauli frames, detector error models and surface codes, read through Roffe's guide, Google's below-threshold paper and Jeon et al. On 28 October that became my topic."]],
        ["Courses", ["CS9548 and CS9833, including an attack-and-defence CTF on ML intrusion detection and a paper review."]],
      ],
    },
    {
      id: "degrees", group: "Study", star: "msc",
      title: "BSc and MSc at Western",
      role: "BSc Honours Computer Science, MSc Artificial Intelligence", when: "2019 – 2025", where: "Western University",
      stack: ["Machine learning", "Neural networks", "Databases", "Unstructured data"],
      lead: "Six years at Western, from my first repository to a master's thesis project on wildfires.",
      sections: [
        ["BSc, 2019 – 2024", ["Honours Computer Science, GPA 3.9/4.0, with internships at Geotab and Ivey along the way."]],
        ["MSc, 2024 – 2025", ["Artificial Intelligence, GPA 3.9/4.0: advanced machine learning, neural networks, databases and unstructured data, plus projects on stock prices, cardiovascular risk, speech emotion and traffic signs."]],
      ],
      links: [["Cardiovascular risk code", `${G}Cardiovascular-Risk-Prediction`]],
    },
  ];
  window.PROJECTS = PROJECTS;

  const root = document.getElementById("projects");
  const list = document.getElementById("pjList");
  const article = document.getElementById("pjArticle");
  const toggles = document.querySelectorAll("[data-open='projects']");
  const BEHIND = ["sky", "panel", "index", "connect"].map((id) => document.getElementById(id))
    .concat([document.querySelector(".top"), document.querySelector(".bottom")]);
  const stars = new Map((window.SKY ? window.SKY.stars : []).map((s) => [s.id, s]));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let current = PROJECTS[0].id, lastFocus = null;

  function buildList() {
    list.innerHTML = Object.keys(GROUPS).map((g) => `
      <section>
        <h3 style="--c:${GROUPS[g]}"><i></i>${g}</h3>
        <ul>${PROJECTS.filter((p) => p.group === g).map((p) => `
          <li><button data-pj="${p.id}" aria-current="${p.id === current}">${esc(p.title)}<small>${esc(p.when)}</small></button></li>`).join("")}
        </ul>
      </section>`).join("");
    list.querySelectorAll("[data-pj]").forEach((b) => b.addEventListener("click", () => show(b.dataset.pj, true)));
    // keep the chosen chip in view when the list is a sideways row
    const on = list.querySelector('[aria-current="true"]');
    if (on && matchMedia("(max-width: 760px)").matches) on.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function show(id, scroll) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    current = id;
    if (!root.hidden) history.replaceState(null, "", `#projects/${id}`);
    buildList();
    const i = PROJECTS.indexOf(p);
    const prev = PROJECTS[i - 1], next = PROJECTS[i + 1];
    article.style.setProperty("--c", GROUPS[p.group]);
    article.innerHTML = `
      <p class="pj-meta"><span class="pill"><i></i>${p.group}</span> ${esc(p.when)}</p>
      <h3>${esc(p.title)}</h3>
      <p class="pj-role">${esc(p.role)} · ${esc(p.where)}</p>
      ${p.image ? `<figure class="${p.plot ? "plot" : ""}"><img src="${p.image}" width="960" height="600" decoding="async" alt="${esc(p.imageAlt)}" style="${p.imagePos ? `object-position:${p.imagePos}` : ""}"></figure>` : ""}
      <p class="pj-lead">${esc(p.lead)}</p>
      ${p.sections.map(([h, items]) => `
        <section class="pj-sec">
          <h4>${esc(h)}</h4>
          ${items.length > 1 ? `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : `<p>${esc(items[0])}</p>`}
        </section>`).join("")}
      <ul class="pj-stack" aria-label="Tools">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      <div class="pj-actions">
        ${(p.links || []).map(([k, v]) => `<a class="btn" href="${v}" target="_blank" rel="noopener">${esc(k)}</a>`).join("")}
        ${stars.has(p.star) ? `<button class="ghost" data-star="${p.star}">See it on the map</button>` : ""}
      </div>
      <nav class="pj-pager" aria-label="More projects">
        ${prev ? `<button class="ghost" data-pj="${prev.id}">‹ ${esc(prev.title)}</button>` : "<span></span>"}
        ${next ? `<button class="ghost" data-pj="${next.id}">${esc(next.title)} ›</button>` : ""}
      </nav>`;
    article.querySelectorAll("[data-pj]").forEach((b) => b.addEventListener("click", () => show(b.dataset.pj, true)));
    article.querySelectorAll("[data-star]").forEach((b) => b.addEventListener("click", () => {
      close();
      if (window.openStar) window.openStar(b.dataset.star);
    }));
    // on narrow screens the list sits above the article, so bring the article into view
    if (scroll && matchMedia("(max-width: 900px)").matches) {
      article.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }

  function open(id) {
    if (!root.hidden) { if (id) show(id); return; }
    lastFocus = document.activeElement;
    root.hidden = false;
    show(id || current);
    document.body.classList.add("log-open");
    toggles.forEach((t) => t.setAttribute("aria-expanded", "true"));
    BEHIND.forEach((el) => el && (el.inert = true));
    if (!location.hash.startsWith("#projects")) history.replaceState(null, "", `#projects/${current}`);
    requestAnimationFrame(() => root.classList.add("in"));
    root.querySelector(".log-close").focus({ preventScroll: true });
  }
  function close() {
    if (root.hidden) return;
    root.classList.remove("in");
    root.hidden = true;
    document.body.classList.remove("log-open");
    toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
    BEHIND.forEach((el) => el && (el.inert = false));
    if (location.hash.startsWith("#projects")) history.replaceState(null, "", location.pathname);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.openProject = (id) => open(id);
  window.projectFor = (starId) => (PROJECTS.find((p) => p.star === starId) || {}).id;

  toggles.forEach((t) => t.addEventListener("click", () => (root.hidden ? open() : close())));
  root.querySelector(".log-close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !root.hidden) close(); });
  window.addEventListener("hashchange", () => (location.hash.startsWith("#projects") ? open(location.hash.split("/")[1]) : close()));

  buildList(); show(current);
  if (location.hash.startsWith("#projects")) open(location.hash.split("/")[1]);
})();
