/* ============================================================
   DSA Interactive Dashboard — script.js
   Authors: Adinai Temirbekova & Ailin Adylova
   ============================================================ */

'use strict';

/* ── Utility ── */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Highlight active nav link */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/** Scroll reveal */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/** Did You Know toggles */
function initDYK() {
  document.querySelectorAll('.dyk-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const isOpen = content.classList.toggle('open');
      btn.querySelector('.dyk-arrow').textContent = isOpen ? '▲' : '▼';
    });
  });
}

/* ================================================================
   SEARCHING ALGORITHMS
   ================================================================ */

// ── Linear Search ──
let linearSteps = [], linearIdx = 0, linearRunning = false;

function initLinearSearch() {
  const startBtn = document.getElementById('ls-start');
  const nextBtn  = document.getElementById('ls-next');
  const resetBtn = document.getElementById('ls-reset');
  if (!startBtn) return;

  function getArray() {
    return document.getElementById('ls-array').value
      .split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  }

  function buildSteps(arr, target) {
    const steps = [];
    steps.push({ arr: [...arr], active: -1, msg: `Starting linear search for target <strong>${target}</strong> in array [${arr.join(', ')}]` });
    for (let i = 0; i < arr.length; i++) {
      steps.push({ arr: [...arr], active: i, msg: `Checking index ${i}: <strong>${arr[i]}</strong> ${arr[i] === target ? '== ' + target + ' ✓ Found!' : '≠ ' + target + ', continue...'}`, found: arr[i] === target });
      if (arr[i] === target) {
        steps.push({ arr: [...arr], active: i, found: true, msg: `🎉 Target <strong>${target}</strong> found at index <strong>${i}</strong>!` });
        return steps;
      }
    }
    steps.push({ arr: [...arr], active: -1, msg: `Target <strong>${target}</strong> not found in the array.` });
    return steps;
  }

  function render(step) {
    const area = document.getElementById('ls-viz');
    area.innerHTML = '';
    step.arr.forEach((v, i) => {
      const el = document.createElement('div');
      el.className = 'viz-element' + (i === step.active ? (step.found ? ' found' : ' active') : '');
      el.innerHTML = `${v}<span class="idx-label">[${i}]</span>`;
      area.appendChild(el);
    });
    document.getElementById('ls-msg').innerHTML = step.msg;
    const pct = Math.round((linearIdx / (linearSteps.length - 1)) * 100);
    document.getElementById('ls-progress').style.width = pct + '%';
    document.getElementById('ls-step-count').textContent = `Step ${linearIdx + 1} / ${linearSteps.length}`;
  }

  startBtn.addEventListener('click', () => {
    const arr = getArray();
    const target = parseInt(document.getElementById('ls-target').value);
    if (!arr.length || isNaN(target)) return;
    linearSteps = buildSteps(arr, target);
    linearIdx = 0;
    linearRunning = true;
    render(linearSteps[0]);
    startBtn.disabled = true;
    nextBtn.disabled = false;
  });

  nextBtn.addEventListener('click', () => {
    if (linearIdx < linearSteps.length - 1) {
      linearIdx++;
      render(linearSteps[linearIdx]);
    }
    if (linearIdx >= linearSteps.length - 1) nextBtn.disabled = true;
  });

  resetBtn.addEventListener('click', () => {
    linearSteps = []; linearIdx = 0; linearRunning = false;
    document.getElementById('ls-viz').innerHTML = '<span style="color:var(--text3);font-size:0.85rem;">Press Start to begin visualization</span>';
    document.getElementById('ls-msg').innerHTML = 'Press Start to begin.';
    document.getElementById('ls-progress').style.width = '0%';
    document.getElementById('ls-step-count').textContent = 'Step 0 / 0';
    startBtn.disabled = false; nextBtn.disabled = true;
  });
}

// ── Binary Search ──
let binarySteps = [], binaryIdx = 0;

function initBinarySearch() {
  const startBtn = document.getElementById('bs-start');
  const nextBtn  = document.getElementById('bs-next');
  const resetBtn = document.getElementById('bs-reset');
  if (!startBtn) return;

  function buildSteps(arr, target) {
    const sorted = [...arr].sort((a, b) => a - b);
    const steps = [];
    steps.push({ arr: sorted, lo: 0, hi: sorted.length - 1, mid: -1, eliminated: [], msg: `Array sorted: [${sorted.join(', ')}]. Searching for <strong>${target}</strong>.` });
    let lo = 0, hi = sorted.length - 1, eliminated = [];
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (sorted[mid] === target) {
        steps.push({ arr: sorted, lo, hi, mid, eliminated: [...eliminated], msg: `Middle index ${mid}: <strong>${sorted[mid]}</strong> == ${target} ✓ Found!`, found: mid });
        return steps;
      } else if (sorted[mid] < target) {
        steps.push({ arr: sorted, lo, hi, mid, eliminated: [...eliminated], msg: `Middle index ${mid}: <strong>${sorted[mid]}</strong> < ${target}, search right half.` });
        for (let i = lo; i <= mid; i++) eliminated.push(i);
        lo = mid + 1;
      } else {
        steps.push({ arr: sorted, lo, hi, mid, eliminated: [...eliminated], msg: `Middle index ${mid}: <strong>${sorted[mid]}</strong> > ${target}, search left half.` });
        for (let i = mid; i <= hi; i++) eliminated.push(i);
        hi = mid - 1;
      }
    }
    steps.push({ arr: sorted, lo: -1, hi: -1, mid: -1, eliminated: [...Array(sorted.length).keys()], msg: `Target <strong>${target}</strong> not found.` });
    return steps;
  }

  function render(step) {
    const area = document.getElementById('bs-viz');
    area.innerHTML = '';
    step.arr.forEach((v, i) => {
      const el = document.createElement('div');
      let cls = 'viz-element';
      if (step.found === i) cls += ' found';
      else if (i === step.mid) cls += ' active';
      else if (step.eliminated.includes(i)) cls += ' eliminated';
      else if (i >= step.lo && i <= step.hi) cls += ' comparing';
      el.className = cls;
      el.innerHTML = `${v}<span class="idx-label">[${i}]</span>`;
      area.appendChild(el);
    });
    document.getElementById('bs-msg').innerHTML = step.msg;
    const pct = Math.round((binaryIdx / (binarySteps.length - 1)) * 100);
    document.getElementById('bs-progress').style.width = pct + '%';
    document.getElementById('bs-step-count').textContent = `Step ${binaryIdx + 1} / ${binarySteps.length}`;
  }

  startBtn.addEventListener('click', () => {
    const arr = document.getElementById('bs-array').value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const target = parseInt(document.getElementById('bs-target').value);
    if (!arr.length || isNaN(target)) return;
    binarySteps = buildSteps(arr, target);
    binaryIdx = 0;
    render(binarySteps[0]);
    startBtn.disabled = true; nextBtn.disabled = false;
  });

  nextBtn.addEventListener('click', () => {
    if (binaryIdx < binarySteps.length - 1) { binaryIdx++; render(binarySteps[binaryIdx]); }
    if (binaryIdx >= binarySteps.length - 1) nextBtn.disabled = true;
  });

  resetBtn.addEventListener('click', () => {
    binarySteps = []; binaryIdx = 0;
    document.getElementById('bs-viz').innerHTML = '<span style="color:var(--text3);font-size:0.85rem;">Press Start to begin visualization</span>';
    document.getElementById('bs-msg').innerHTML = 'Press Start to begin.';
    document.getElementById('bs-progress').style.width = '0%';
    document.getElementById('bs-step-count').textContent = 'Step 0 / 0';
    startBtn.disabled = false; nextBtn.disabled = true;
  });
}

/* ================================================================
   SORTING ALGORITHMS
   ================================================================ */

let sortSteps = [], sortIdx = 0, sortTimer = null;

function generateSortSteps(arr, algo) {
  const steps = [];
  let a = [...arr]; // Рабочая копия массива

  // Универсальная функция snap для фиксации состояния
  const snap = (active = [], comparing = [], sorted = [], msg = '', pivot = -1) => {
    steps.push({
      arr: [...a],
      active: Array.isArray(active) ? active : [active],
      comparing: Array.isArray(comparing) ? comparing : [comparing],
      sorted: Array.isArray(sorted) ? sorted : [sorted],
      msg,
      pivot: pivot ?? -1
    });
  };

  // ── Bubble Sort ──
  if (algo === 'bubble') {
    const sortedSet = new Set();
    snap([], [], [], 'Starting Bubble Sort...');
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        snap([j, j + 1], [], [...sortedSet], `Comparing ${a[j]} and ${a[j + 1]}`);
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          snap([j, j + 1], [], [...sortedSet], `Swapped → ${a[j]} and ${a[j + 1]}`);
        }
      }
      sortedSet.add(a.length - 1 - i);
      snap([], [], [...sortedSet], `Pass ${i + 1} complete. Largest element in place.`);
    }
    snap([], [], [...Array(a.length).keys()], 'Bubble Sort completed! ✓');
  }

  // ── Selection Sort ──
  else if (algo === 'selection') {
    const sortedSet = new Set();
    snap([], [], [], 'Starting Selection Sort...');
    for (let i = 0; i < a.length - 1; i++) {
      let minIdx = i;
      snap([i], [], [...sortedSet], `Finding min from index ${i}`);
      for (let j = i + 1; j < a.length; j++) {
        snap([minIdx, j], [], [...sortedSet], `Comparing ${a[minIdx]} vs ${a[j]}`);
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        snap([i, minIdx], [], [...sortedSet], `Placed min at position ${i}`);
      }
      sortedSet.add(i);
    }
    snap([], [], [...Array(a.length).keys()], 'Selection Sort completed! ✓');
  }

  // ── Insertion Sort ──
  else if (algo === 'insertion') {
    const sortedSet = new Set([0]);
    snap([], [], [...sortedSet], 'Starting Insertion Sort...');
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      snap([i], [], [...sortedSet], `Inserting ${key}`);
      while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        snap([j + 1, j], [], [...sortedSet], `Shifting ${a[j]}`);
        j--;
      }
      a[j + 1] = key;
      sortedSet.add(i);
      snap([j + 1], [], [...sortedSet], `Inserted ${key}`);
    }
    snap([], [], [...Array(a.length).keys()], 'Insertion Sort completed! ✓');
  }

  // ── Merge Sort ── (улучшенная версия)
  else if (algo === 'merge') {
    function mergeSortHelper(start, end) {
      if (end - start <= 1) return;

      const mid = Math.floor((start + end) / 2);
      snap([], [], [], `Dividing [${a.slice(start, end).join(', ')}]`);

      mergeSortHelper(start, mid);
      mergeSortHelper(mid, end);

      // Merge
      const left = a.slice(start, mid);
      const right = a.slice(mid, end);
      let i = 0, j = 0, k = start;

      snap([], [], [], `Merging left [${left.join(', ')}] and right [${right.join(', ')}]`);

      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          a[k++] = left[i++];
        } else {
          a[k++] = right[j++];
        }
        snap(Array.from({ length: k - start }, (_, idx) => start + idx), [], [], `Merged: ${a.slice(start, k).join(', ')}`);
      }
      while (i < left.length) a[k++] = left[i++];
      while (j < right.length) a[k++] = right[j++];
    }

    snap([], [], [], 'Starting Merge Sort...');
    mergeSortHelper(0, a.length);
    snap([], [], [...Array(a.length).keys()], 'Merge Sort completed! ✓');
  }

  // ── Quick Sort ──
  else if (algo === 'quick') {
    function quickHelper(low, high) {
      if (low >= high) return;

      const pivotIdx = high;
      const pivot = a[pivotIdx];
      let i = low - 1;

      snap([], [], [], `Pivot = ${pivot} (index ${pivotIdx})`);

      for (let j = low; j < high; j++) {
        snap([j, pivotIdx], [i + 1], [], `Comparing ${a[j]} with pivot`);
        if (a[j] < pivot) {
          i++;
          if (i !== j) {
            [a[i], a[j]] = [a[j], a[i]];
            snap([i, j], [], [], `Swapped ${a[i]} and ${a[j]}`);
          }
        }
      }
      [a[i + 1], a[high]] = [a[high], a[i + 1]];
      const pi = i + 1;

      snap([pi], [], [], `Pivot placed at ${pi}`);

      quickHelper(low, pi - 1);
      quickHelper(pi + 1, high);
    }

    snap([], [], [], 'Starting Quick Sort...');
    quickHelper(0, a.length - 1);
    snap([], [], [...Array(a.length).keys()], 'Quick Sort completed! ✓');
  }

  // ── COUNTING SORT ── (исправлено!)
  else if (algo === 'counting') {
    if (a.length === 0) return steps;

    const min = Math.min(...a);
    const max = Math.max(...a);
    const range = max - min + 1;
    const count = new Array(range).fill(0);
    const output = new Array(a.length).fill(0);

    snap([], [], [], `Counting Sort: range ${min} to ${max}`);

    // Шаг 1: Подсчёт
    for (let num of a) {
      count[num - min]++;
    }
    snap([], [], [], `Count array: [${count.join(', ')}]`);

    // Шаг 2: Префиксная сумма
    for (let i = 1; i < count.length; i++) {
      count[i] += count[i - 1];
    }
    snap([], [], [], `Cumulative count: [${count.join(', ')}]`);

    // Шаг 3: Построение результата (справа налево)
    for (let i = a.length - 1; i >= 0; i--) {
      const digit = a[i] - min;
      const pos = count[digit] - 1;
      output[pos] = a[i];
      count[digit]--;
      snap([], [], [pos], `Placed ${a[i]} at position ${pos}`);
    }

    a = output;
    snap([], [], [...Array(a.length).keys()], 'Counting Sort completed! ✓ (O(n + k))');
  }

  // ── RADIX SORT ── (исправлено!)
  else if (algo === 'radix') {
    if (a.length === 0) return steps;

    const max = Math.max(...a);
    let exp = 1;

    snap([], [], [], `Starting Radix Sort (LSD) - max = ${max}`);

    while (Math.floor(max / exp) > 0) {
      const output = new Array(a.length).fill(0);
      const count = new Array(10).fill(0);

      snap([], [], [], `Digit place = ${exp}`);

      // Подсчёт цифр
      for (let i = 0; i < a.length; i++) {
        const digit = Math.floor(a[i] / exp) % 10;
        count[digit]++;
      }

      // Префиксная сумма
      for (let i = 1; i < 10; i++) count[i] += count[i - 1];

      // Распределение
      for (let i = a.length - 1; i >= 0; i--) {
        const digit = Math.floor(a[i] / exp) % 10;
        output[count[digit] - 1] = a[i];
        count[digit]--;
      }

      a = output;
      snap([], [], [], `After digit ${exp}: [${a.join(', ')}]`);

      exp *= 10;
    }

    snap([], [], [...Array(a.length).keys()], 'Radix Sort completed! ✓ (O(nk))');
  }

  return steps;
}
function initSorting() {
  const startBtn = document.getElementById('sort-start');
  if (!startBtn) return;

  function getArray() {
    return document.getElementById('sort-array').value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  }

  function getAlgo() {
    return document.getElementById('sort-algo').value;
  }

  function renderSort(step) {
    const maxVal = Math.max(...step.arr);
    const container = document.getElementById('sort-bars');
    container.innerHTML = '';
    step.arr.forEach((v, i) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      if (step.active.includes(i)) bar.classList.add('active');
      if (step.comparing.includes(i)) bar.classList.add('comparing');
      if (step.sorted.includes(i)) bar.classList.add('sorted');
      if (i === step.pivot) bar.classList.add('pivot');
      bar.style.height = Math.max(12, Math.round((v / maxVal) * 150)) + 'px';
      bar.innerHTML = `<span class="bar-label">${v}</span>`;
      container.appendChild(bar);
    });
    document.getElementById('sort-msg').innerHTML = step.msg;
    const pct = Math.round((sortIdx / (sortSteps.length - 1)) * 100);
    document.getElementById('sort-progress').style.width = pct + '%';
    document.getElementById('sort-step-count').textContent = `Step ${sortIdx + 1} / ${sortSteps.length}`;
  }

  startBtn.addEventListener('click', () => {
    if (sortTimer) clearInterval(sortTimer);
    const arr = getArray();
    const algo = getAlgo();
    if (!arr.length) return;
    sortSteps = generateSortSteps(arr, algo);
    sortIdx = 0;
    renderSort(sortSteps[0]);
    startBtn.disabled = true;
    document.getElementById('sort-next').disabled = false;
  });

  document.getElementById('sort-next').addEventListener('click', () => {
    if (sortIdx < sortSteps.length - 1) { sortIdx++; renderSort(sortSteps[sortIdx]); }
    if (sortIdx >= sortSteps.length - 1) document.getElementById('sort-next').disabled = true;
  });

  document.getElementById('sort-auto').addEventListener('click', () => {
    if (sortTimer) { clearInterval(sortTimer); sortTimer = null; document.getElementById('sort-auto').textContent = '▶ Auto Play'; return; }
    document.getElementById('sort-auto').textContent = '⏸ Pause';
    sortTimer = setInterval(() => {
      if (sortIdx < sortSteps.length - 1) {
        sortIdx++;
        renderSort(sortSteps[sortIdx]);
      } else {
        clearInterval(sortTimer); sortTimer = null;
        document.getElementById('sort-auto').textContent = '▶ Auto Play';
      }
    }, 600);
  });

  document.getElementById('sort-reset').addEventListener('click', () => {
    if (sortTimer) { clearInterval(sortTimer); sortTimer = null; }
    sortSteps = []; sortIdx = 0;
    document.getElementById('sort-bars').innerHTML = '<span style="color:var(--text3);font-size:0.85rem;">Press Start to begin</span>';
    document.getElementById('sort-msg').innerHTML = 'Press Start to begin.';
    document.getElementById('sort-progress').style.width = '0%';
    document.getElementById('sort-step-count').textContent = 'Step 0 / 0';
    startBtn.disabled = false;
    document.getElementById('sort-next').disabled = true;
    document.getElementById('sort-auto').textContent = '▶ Auto Play';
  });
}

/* ================================================================
   STACK
   ================================================================ */
function initStack() {
  const pushBtn = document.getElementById('stack-push');
  if (!pushBtn) return;
  let stack = [];

  function render() {
    const viz = document.getElementById('stack-viz');
    const base = viz.querySelector('.stack-base');
    // remove existing elements
    viz.querySelectorAll('.stack-element').forEach(e => e.remove());
    if (!stack.length) {
      viz.querySelector('#stack-empty-msg').style.display = 'block';
    } else {
      viz.querySelector('#stack-empty-msg').style.display = 'none';
      stack.forEach((v, i) => {
        const el = document.createElement('div');
        el.className = 'stack-element' + (i === stack.length - 1 ? ' top' : '');
        el.innerHTML = i === stack.length - 1 ? `${v} <span style="font-size:0.7rem;color:var(--text3);">← TOP</span>` : v;
        viz.insertBefore(el, base);
      });
    }
    document.getElementById('stack-size').textContent = `Size: ${stack.length}`;
  }

  pushBtn.addEventListener('click', () => {
    const input = document.getElementById('stack-input');
    const val = input.value.trim();
    if (!val) return;
    if (stack.length >= 8) { document.getElementById('stack-msg').innerHTML = 'Stack overflow! Max size 8 reached.'; return; }
    stack.push(val);
    document.getElementById('stack-msg').innerHTML = `Pushed <strong>${val}</strong> onto the stack (LIFO).`;
    input.value = '';
    render();
  });

  document.getElementById('stack-pop').addEventListener('click', () => {
    if (!stack.length) { document.getElementById('stack-msg').innerHTML = 'Stack underflow! Stack is empty.'; return; }
    const popped = stack.pop();
    document.getElementById('stack-msg').innerHTML = `Popped <strong>${popped}</strong> from the top of the stack.`;
    render();
  });

  document.getElementById('stack-peek').addEventListener('click', () => {
    if (!stack.length) { document.getElementById('stack-msg').innerHTML = 'Stack is empty!'; return; }
    document.getElementById('stack-msg').innerHTML = `Peek: Top element is <strong>${stack[stack.length - 1]}</strong> (not removed).`;
  });

  document.getElementById('stack-clear').addEventListener('click', () => {
    stack = [];
    document.getElementById('stack-msg').innerHTML = 'Stack cleared.';
    render();
  });

  render();
}

/* ================================================================
   LINKED LIST
   ================================================================ */
function initLinkedList() {
  const addBtn = document.getElementById('ll-add');
  if (!addBtn) return;
  let list = [10, 20, 30];

  function render() {
    const viz = document.getElementById('ll-viz');
    viz.innerHTML = '';
    list.forEach((v, i) => {
      const node = document.createElement('div');
      node.className = 'll-node';
      const isLast = i === list.length - 1;
      node.innerHTML = `<div class="ll-box"><span class="ll-data">${v}</span><span class="ll-next">${isLast ? 'NULL' : 'next→'}</span></div>${isLast ? '' : '<div class="ll-arrow"></div>'}`;
      viz.appendChild(node);
    });
    if (!list.length) viz.innerHTML = '<span style="color:var(--text3);font-size:0.85rem;">Empty list. Add a node!</span>';
    const nullEl = document.createElement('div');
    nullEl.className = 'll-null';
    nullEl.textContent = 'NULL';
    viz.appendChild(nullEl);
    document.getElementById('ll-size').textContent = `Size: ${list.length} nodes`;
  }

  function getVal() { return parseInt(document.getElementById('ll-input').value); }

  addBtn.addEventListener('click', () => {
    const v = getVal();
    if (isNaN(v)) return;
    const pos = document.getElementById('ll-pos').value;
    if (pos === 'head') { list.unshift(v); document.getElementById('ll-msg').innerHTML = `Inserted <strong>${v}</strong> at head.`; }
    else { list.push(v); document.getElementById('ll-msg').innerHTML = `Inserted <strong>${v}</strong> at tail.`; }
    document.getElementById('ll-input').value = '';
    render();
  });

  document.getElementById('ll-remove').addEventListener('click', () => {
    const v = getVal();
    if (isNaN(v)) return;
    const idx = list.indexOf(v);
    if (idx === -1) { document.getElementById('ll-msg').innerHTML = `Node <strong>${v}</strong> not found!`; return; }
    list.splice(idx, 1);
    document.getElementById('ll-msg').innerHTML = `Removed node <strong>${v}</strong>.`;
    document.getElementById('ll-input').value = '';
    render();
  });

  document.getElementById('ll-clear').addEventListener('click', () => { list = []; document.getElementById('ll-msg').innerHTML = 'List cleared.'; render(); });

  render();
}

/* ================================================================
   HASHING
   ================================================================ */
function initHashing() {
  const insertBtn = document.getElementById('hash-insert');
  if (!insertBtn) return;
  const SIZE = 7;
  let table = Array.from({length: SIZE}, () => []);

  function hashFn(key) {
    return key % SIZE;
  }

  function renderTable(highlight = -1) {
    const container = document.getElementById('hash-table');
    container.innerHTML = '';
    table.forEach((bucket, i) => {
      const row = document.createElement('div');
      row.className = 'hash-bucket-row';
      const idx = document.createElement('div');
      idx.className = 'hash-idx';
      idx.textContent = i;
      const bkt = document.createElement('div');
      bkt.className = 'hash-bucket' + (i === highlight ? ' active' : '');
      bucket.forEach(item => {
        const el = document.createElement('span');
        el.className = 'hash-item';
        el.textContent = item;
        bkt.appendChild(el);
      });
      if (!bucket.length) { bkt.innerHTML = '<span style="color:var(--text3);font-size:0.75rem;">empty</span>'; }
      row.appendChild(idx); row.appendChild(bkt);
      container.appendChild(row);
    });
  }

  insertBtn.addEventListener('click', () => {
    const v = parseInt(document.getElementById('hash-input').value);
    if (isNaN(v)) return;
    const h = hashFn(v);
    const collision = table[h].length > 0;
    table[h].push(v);
    document.getElementById('hash-msg').innerHTML = `Key <strong>${v}</strong> → hash(${v}) = ${v} % ${SIZE} = <strong>${h}</strong>. ${collision ? '⚠ Collision handled via chaining!' : 'Inserted at index ' + h + '.'}`;
    document.getElementById('hash-input').value = '';
    renderTable(h);
    setTimeout(() => renderTable(-1), 1500);
  });

  document.getElementById('hash-search').addEventListener('click', () => {
    const v = parseInt(document.getElementById('hash-input').value);
    if (isNaN(v)) return;
    const h = hashFn(v);
    const found = table[h].includes(v);
    document.getElementById('hash-msg').innerHTML = `Searching for <strong>${v}</strong>: hash = ${h}. ${found ? '✓ Found!' : 'Not found in bucket ' + h + '.'}`;
    renderTable(h);
    setTimeout(() => renderTable(-1), 1500);
  });

  document.getElementById('hash-clear').addEventListener('click', () => {
    table = Array.from({length: SIZE}, () => []);
    document.getElementById('hash-msg').innerHTML = 'Table cleared.';
    renderTable();
  });

  renderTable();
}

/* ================================================================
   QUEUE
   ================================================================ */
function initQueue() {
  const enqBtn = document.getElementById('queue-enqueue');
  if (!enqBtn) return;
  let queue = [];

  function render() {
    const viz = document.getElementById('queue-viz');
    viz.innerHTML = '';
    if (!queue.length) {
      viz.innerHTML = '<span style="color:var(--text3);font-size:0.85rem;">Queue is empty</span>';
    } else {
      queue.forEach((v, i) => {
        const el = document.createElement('div');
        el.className = 'queue-element' + (i === 0 ? ' front' : '');
        el.innerHTML = i === 0 ? `${v}<br><span style="font-size:0.6rem;color:var(--text3);">FRONT</span>` : `${v}`;
        viz.appendChild(el);
      });
    }
    document.getElementById('queue-size').textContent = `Size: ${queue.length}`;
  }

  enqBtn.addEventListener('click', () => {
    const val = document.getElementById('queue-input').value.trim();
    if (!val) return;
    if (queue.length >= 8) { document.getElementById('queue-msg').innerHTML = 'Queue is full!'; return; }
    queue.push(val);
    document.getElementById('queue-msg').innerHTML = `Enqueued <strong>${val}</strong> at the REAR of the queue.`;
    document.getElementById('queue-input').value = '';
    render();
  });

  document.getElementById('queue-dequeue').addEventListener('click', () => {
    if (!queue.length) { document.getElementById('queue-msg').innerHTML = 'Queue is empty!'; return; }
    const dequeued = queue.shift();
    document.getElementById('queue-msg').innerHTML = `Dequeued <strong>${dequeued}</strong> from the FRONT (FIFO).`;
    render();
  });

  document.getElementById('queue-peek').addEventListener('click', () => {
    if (!queue.length) { document.getElementById('queue-msg').innerHTML = 'Queue is empty!'; return; }
    document.getElementById('queue-msg').innerHTML = `Front element: <strong>${queue[0]}</strong>. Rear: <strong>${queue[queue.length - 1]}</strong>.`;
  });

  document.getElementById('queue-clear').addEventListener('click', () => {
    queue = [];
    document.getElementById('queue-msg').innerHTML = 'Queue cleared.';
    render();
  });

  render();
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initReveal();
  initDYK();
  initLinearSearch();
  initBinarySearch();
  initSorting();
  initStack();
  initLinkedList();
  initHashing();
  initQueue();
});