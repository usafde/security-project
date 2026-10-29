/* ===================== ТЕМА ===================== */
(function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
})();

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ===================== АККОРДЕОН ===================== */
function openItem(item) {
  const body = item.querySelector('.item__body');
  const head = item.querySelector('.item__head');
  item.classList.add('is-open');
  head?.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => {
    body.style.maxHeight = body.scrollHeight + 'px';
  });
}

function closeItem(item) {
  const body = item.querySelector('.item__body');
  const head = item.querySelector('.item__head');
  item.classList.remove('is-open');
  head?.setAttribute('aria-expanded', 'false');
  body.style.maxHeight = '0px';
}

document.querySelectorAll('[data-accordion]').forEach(acc => {
  acc.querySelectorAll('.item').forEach(item => {
    const head = item.querySelector('.item__head');
    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      acc.querySelectorAll('.item.is-open').forEach(other => {
        if (other !== item) closeItem(other);
      });
      if (isOpen) closeItem(item);
      else openItem(item);
    });
  });
});

/* ===================== ОГЛАВЛЕНИЕ ===================== */
document.querySelectorAll('[data-toc-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    // Открываем нужный аккордеон (если это item)
    if (target.classList.contains('item') && !target.classList.contains('is-open')) {
      // Закрываем все открытые в этом же аккордеоне
      const acc = target.closest('[data-accordion]');
      if (acc) {
        acc.querySelectorAll('.item.is-open').forEach(other => {
          if (other !== target) closeItem(other);
        });
      }
      openItem(target);
    }

    // Ждём, пока отработает анимация открытия, и скроллим к элементу
    setTimeout(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 60);

    // Подсветка
    target.classList.remove('item--flash');
    void target.offsetWidth;
    target.classList.add('item--flash');
    setTimeout(() => target.classList.remove('item--flash'), 1700);
  });
});

/* ===================== ТЕСТ ===================== */
document.querySelectorAll('[data-quiz]').forEach(quiz => {
  const checkBtn  = quiz.querySelector('[data-quiz-check]');
  const resetBtn  = quiz.querySelector('[data-quiz-reset]');
  const resultEl  = quiz.querySelector('[data-quiz-result]');
  const questions = quiz.querySelectorAll('[data-question]');

  function clearHighlights() {
    quiz.querySelectorAll('.quiz__opt').forEach(o => {
      o.classList.remove('is-correct', 'is-wrong');
    });
    resultEl.hidden = true;
    resultEl.textContent = '';
    resultEl.classList.remove('is-pass', 'is-fail');
  }

  function checkAnswers() {
    let unanswered = 0;
    questions.forEach(q => {
      const any = q.querySelector('input[type="radio"]:checked');
      if (!any) unanswered++;
    });
    if (unanswered > 0) {
      resultEl.hidden = false;
      resultEl.classList.remove('is-pass', 'is-fail');
      resultEl.textContent = `Ответьте на все вопросы (осталось: ${unanswered}).`;
      return;
    }

    clearHighlights();
    quiz.classList.add('is-checked');

    let correct = 0;
    questions.forEach(q => {
      const checked = q.querySelector('input[type="radio"]:checked');
      const isCorrectChoice = checked?.dataset.correct === 'true';
      if (isCorrectChoice) correct++;

      q.querySelectorAll('.quiz__opt').forEach(opt => {
        const input = opt.querySelector('input');
        if (input.dataset.correct === 'true') {
          opt.classList.add('is-correct');
        }
        if (input.checked && input.dataset.correct !== 'true') {
          opt.classList.add('is-wrong');
        }
      });
    });

    quiz.querySelectorAll('input[type="radio"]').forEach(i => (i.disabled = true));

    const total = questions.length;
    resultEl.hidden = false;
    resultEl.classList.remove('is-pass', 'is-fail');
    if (correct === total) {
      resultEl.classList.add('is-pass');
      resultEl.textContent = `Отлично! ${correct} из ${total} — всё верно.`;
    } else {
      resultEl.classList.add('is-fail');
      resultEl.textContent = `Правильных ответов: ${correct} из ${total}. Нажмите «Пройти заново», чтобы попробовать ещё раз.`;
      resetBtn.hidden = false;
    }
    checkBtn.disabled = true;
  }

  function resetQuiz() {
    quiz.classList.remove('is-checked');
    quiz.querySelectorAll('input[type="radio"]').forEach(i => {
      i.checked = false;
      i.disabled = false;
    });
    clearHighlights();
    checkBtn.disabled = false;
    resetBtn.hidden = true;
  }

  checkBtn.addEventListener('click', checkAnswers);
  resetBtn.addEventListener('click', resetQuiz);
});

/* ===================== РЕСАЙЗ ===================== */
window.addEventListener('resize', () => {
  document.querySelectorAll('.item.is-open .item__body').forEach(b => {
    b.style.maxHeight = b.scrollHeight + 'px';
  });
});