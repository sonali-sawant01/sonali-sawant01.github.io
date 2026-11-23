(() => {
  const root = document.documentElement;

  // Theme
  const themeBtn = document.getElementById('theme');
  const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const shift = document.getElementById('shift');
  const label = () => {
    const next = dark() ? 'Day shift' : 'Night shift';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next.toLowerCase());
    shift.textContent = next;
  };
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = dark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    label();
  });
  label();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Typewriter under the name (types once; the ghost copy reserves the space)
  const typed = document.getElementById('typed');
  const sentence = document.querySelector('.ghost').textContent;
  if (reduce) typed.textContent = sentence;
  else {
    let i = 0;
    const type = () => {
      typed.textContent = sentence.slice(0, ++i);
      if (i >= sentence.length) return;
      const ch = sentence[i - 1];
      setTimeout(type, ch === '.' || ch === ',' ? 320 : 24 + Math.random() * 30);
    };
    setTimeout(type, 450);
  }

  // Quality-check conveyor
  const names = ['MRP', 'BOM', 'Routing', 'Work center', 'Capacity', 'MIC', 'Sampling', 'Kaizen', '5S', 'OEE', 'LSMW', 'Joule agent'];
  const lots = document.getElementById('lots');
  const msg = document.getElementById('qc-msg');
  const passed = new Set();
  const make = (name, copy) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lot'; b.dataset.name = name;
    b.innerHTML = `${name}<span class="stamp"><b>Passed</b></span>`;
    if (copy) { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); }
    else b.setAttribute('aria-label', `Inspect lot: ${name}`);
    b.addEventListener('click', () => inspect(name));
    return b;
  };
  // Two copies make the loop seamless; the second is hidden from assistive tech.
  [false, true].forEach((copy) => names.forEach((n) => lots.appendChild(make(n, copy))));
  const inspect = (name) => {
    if (passed.has(name)) return;
    passed.add(name);
    lots.querySelectorAll(`[data-name="${name}"]`).forEach((b) => b.classList.add('passed'));
    const n = passed.size, total = names.length;
    if (n === total) { msg.textContent = `Zero defects. All ${total} lots released to stock.`; msg.classList.add('done'); }
    else msg.textContent = `${name} passed inspection. ${n} of ${total} lots released.`;
  };
  const line = document.getElementById('line');
  const pause = document.getElementById('pause');
  pause.addEventListener('click', () => {
    const stopped = line.classList.toggle('stopped');
    pause.setAttribute('aria-pressed', stopped);
    pause.textContent = stopped ? 'Restart the line' : 'Stop the line';
  });

  // Today marker (schedule spans Jan 2019 to Dec 2027)
  const now = new Date();
  const months = (now.getFullYear() - 2019) * 12 + now.getMonth() + now.getDate() / 31;
  document.getElementById('gantt').style.setProperty('--t', Math.min(Math.max(months / 108, 0), 1));

  // Role details, condensed from the résumé
  const roles = {
    kbl: { t: 'Assistant Manager, Industrial Engineering', m: 'Kirloskar Brothers Limited, Pune. Aug 2019 to Dec 2021', p: [
      'Ran capacity, manpower and production scheduling with procurement. Order fulfillment up 20%.',
      'Led Kaizen and workstation redesign: productivity up 15%, scrap down 20%, OEE from 72% to 89%.',
      'Wrote process routings and setup instructions for pump parts and assemblies.' ] },
    cap: { t: 'Senior Analyst, SAP PP Support', m: 'Capgemini, Pune. Dec 2021 to May 2022', p: [
      'Resolved SAP PP incidents through root-cause analysis, cutting disruptions 25% and saving $2M a year.',
      'Trained 50+ end users on SAP PP. Support requests dropped 40%.' ] },
    inf: { t: 'Associate Consultant, SAP PP/QM Functional', m: 'Infosys, Pune. May 2022 to Aug 2024', p: [
      'Ran requirement workshops with global aerospace clients and wrote specs for 5+ custom developments. Production delays down 25%.',
      'Configured PP/QM master data: BOMs, work centers, MICs, sampling, DMRs. Mass-maintained production versions via LSMW.',
      'Led PP testing for an ECC EHP5 to EHP7 upgrade with 100% transaction accuracy.' ] },
    lisc: { t: 'Management Consultant, part-time', m: 'LISC Digital Growth Accelerator, Boston. Jun to Jul 2025', p: [
      'Mapped a healthcare provider’s claims process and designed an automation roadmap projected to cut admin costs 25%.' ] },
    gsk: { t: 'Production Systems Co-op, Lean and CI', m: 'GSK, King of Prussia. Jan to Jul 2026', p: [
      'Value stream mapped drug substance production: cycle time down 5%, about 10 hours a week freed.',
      'Used Celonis process mining to find bottlenecks and led CI workshops, saving about $10K.',
      'Drove 5S adoption. Audit scores rose from 70 to 89.' ] },
    edu: { t: 'Education and badges', m: 'Degrees and certifications on the schedule', p: [
      'B.Tech, Production Engineering, Vishwakarma Institute of Technology, Pune. May 2019, GPA 3.6.',
      'SAP Learning Badge, Introducing Joule Studio. Nov 2026.',
      'MS, Industrial Engineering, Northeastern University. Expected May 2027, GPA 3.81.' ] },
  };

  const detail = document.getElementById('detail');
  const rows = [...document.querySelectorAll('.row')];
  const select = (row) => {
    rows.forEach((r) => { const on = r === row; r.setAttribute('aria-selected', on); r.tabIndex = on ? 0 : -1; });
    const d = roles[row.dataset.id];
    detail.innerHTML = `<h3>${d.t}</h3><p class="meta">${d.m}</p><ul>${d.p.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  };
  rows.forEach((r, i) => {
    r.addEventListener('click', () => select(r));
    r.addEventListener('keydown', (e) => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!k) return;
      e.preventDefault();
      const n = rows[(i + k + rows.length) % rows.length];
      n.focus(); select(n);
    });
  });
  select(rows.find((r) => r.dataset.id === 'inf'));
})();
