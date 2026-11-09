# Yanwen Wang

I'm a PhD student in Computer Science at Western University in London, Ontario, supervised by Prof. Fang Fang. I study how machine learning can help build fault-tolerant quantum computers.

This repository is my personal website: **[yanwenwang1125.github.io](https://yanwenwang1125.github.io)**

## Who I am

I came to quantum computing through software and machine learning. I did a BSc in Honours Computer Science (2019–2024) and an MSc in Artificial Intelligence (2024–2025), both at Western. Along the way I did two software engineering internships at Geotab, pulled data out of noisy scanned PDFs as a research assistant at Ivey Business School, built a multimodal model that predicts next-day wildfires across Canada, and spent a year on a team of three building an LLM front desk for a health care centre.

In September 2026 I started the PhD and opened a quantum textbook for the first time.

## What I'm working on

**Fault-tolerant circuit rewrites.** This is my main PhD project. Quantum error correction runs syndrome-extraction circuits over and over, and every ancilla qubit and gate in them is another place for errors to get in. I start from a circuit that is known to be fault tolerant, change it only with rewrite rules that provably keep it that way, and use search and machine learning to decide which changes are worth simulating. On the distance-5 [[17,1,5]] colour code the search found circuits with 11 ancillas instead of the reference's 15, at a simulated logical error rate no worse than the original. I'm writing it up as my first paper.

**Real hardware.** With PINQ² and IBM Quantum System One, I'm taking rewritten circuits and a symmetry-reduced QAOA from simulation onto a real quantum computer.

**Quantum ML and chemistry, checked honestly.** VQE on H₂, LiH and BeH₂ ([code](https://github.com/YanwenWang1125/qml-chemistry-projects)), a QCNN design ablation, and reproducing claims from quantum machine learning papers with a script open beside them. When a 9-parameter logistic regression beat my QCNN, that became the result.

**Around the PhD.** A cancellation-recovery scheduler for a flight school (Spring Boot, PostgreSQL, React), the Q-AICON lab website, interactive pages that explain qubits and stabiliser checks, a TA position for CS3357, and tutoring in programming, maths and science.

## What I'm like

I like turning an idea into something that runs. When a question interests me, I want to know whether it can become a tool someone else can use, which is how I ended up with a Discord voice assistant for League of Legends, an AI grading tool, clinic workflows and quantum animations.

I need to understand things in my own words: plain language, one step at a time, starting from intuition. In research that has become a habit of asking what an experiment really shows, whether the comparison is fair, and whether the conclusion says more than the data does.

I think about the person on the other end. Teaching runs through most of what I do, and I care whether a student, a reader or someone with no quantum background can follow.

I set a high bar and start things quickly, and my curiosity runs wide. What I'm practising now is trusting what I've already built and giving the few directions that matter enough time.

Outside research I read, game, cook and play badminton. Sometimes a game turns into a project.

## Some things I've built

- [qml-chemistry-projects](https://github.com/YanwenWang1125/qml-chemistry-projects): VQE, UCCSD and ADAPT-VQE on small molecules, with GPU runs on an H100
- [RealtorOS](https://github.com/YanwenWang1125/RealtorOS): an AI CRM for real estate agents (FastAPI, Next.js, PostgreSQL, Azure)
- [RubriCheck](https://github.com/YanwenWang1125/RubriCheck): upload a rubric and an essay, get a grade per criterion, each backed by a quote
- [LOLBOT](https://github.com/YanwenWang1125/LOLBOT): a Discord bot that analyses League of Legends matches and reads the analysis aloud
- [Family-Photo](https://github.com/YanwenWang1125/Family-Photo): a private family photo hub with AI tagging and conversational search
- [hololens-2-project](https://github.com/YanwenWang1125/hololens-2-project): 3D holograms of brain aneurysms on HoloLens 2, built with Robarts Research Institute

## Contact

[yanwenwang1125@gmail.com](mailto:yanwenwang1125@gmail.com) · [LinkedIn](https://www.linkedin.com/in/wang-yanwen-21a199271/)

## About this site

The homepage is an interactive star map. I'm the star in the middle; the stars around me are my research, projects, knowledge, code, story and life. There's also a daily log of the PhD, a projects page and a timeline.

Plain HTML, CSS and JavaScript, no build step. The stars live in `data.js`, the daily log in `log.js`, and the projects and timeline pages in `projects.js` and `timeline.js`.
