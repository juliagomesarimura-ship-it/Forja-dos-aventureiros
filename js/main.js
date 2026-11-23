/* Forja — interações simples do protótipo */
(function () {
  'use strict';

  // ---- Estado de login (visitante x logado) ----
  function lerLogin() {
    try { return localStorage.getItem('forja-logado') === '1'; } catch (e) { return false; }
  }
  function salvarLogin(v) {
    try { localStorage.setItem('forja-logado', v ? '1' : '0'); } catch (e) { /* sem storage */ }
  }
  if (lerLogin()) document.documentElement.classList.add('logado');

  document.querySelectorAll('[data-login]').forEach(function (el) {
    el.addEventListener('click', function () { salvarLogin(el.getAttribute('data-login') === '1'); });
  });

  // Formulários de autenticação: valida e segue para o destino
  document.querySelectorAll('form[data-destino]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var s1 = form.querySelector('[name="senha"]'), s2 = form.querySelector('[name="confirmar"]');
      if (s1 && s2 && s1.value !== s2.value) {
        s2.setCustomValidity('As senhas não conferem.'); form.reportValidity();
        s2.addEventListener('input', function () { s2.setCustomValidity(''); }, { once: true });
        return;
      }
      if (form.hasAttribute('data-logar')) salvarLogin(true);
      window.location.href = form.getAttribute('data-destino');
    });
  });

  // Mostrar/ocultar senha
  document.querySelectorAll('.olho').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('input');
      var mostrar = input.type === 'password';
      input.type = mostrar ? 'text' : 'password';
      btn.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
    });
  });

  // Prévia da foto de perfil
  var foto = document.getElementById('foto');
  if (foto) {
    foto.addEventListener('change', function () {
      var f = foto.files && foto.files[0]; if (!f) return;
      var box = document.querySelector('.foto-perfil-editar .avatar-padrao');
      var img = document.createElement('img');
      img.className = 'preview'; img.alt = 'Foto de perfil';
      img.src = URL.createObjectURL(f);
      box.replaceWith(img);
    });
  }

  // Voltar
  document.querySelectorAll('.voltar').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      if (history.length > 1) { ev.preventDefault(); history.back(); }
    });
  });

  // ---- Busca ----
  var PAGINAS = [
    ['O que é RPG?', 'o-que-e-rpg.html', 'rpg o que e iniciante'],
    ['Dungeons and Dragons', 'dnd.html', 'dnd d&d dungeons dragons fantasia'],
    ['D&D — Como jogar?', 'dnd-como-jogar.html', 'dnd como jogar dados'],
    ['D&D — Status', 'dnd-status.html', 'dnd status vida mana'],
    ['D&D — Perícias', 'dnd-pericias.html', 'dnd pericias'],
    ['Tormenta 20', 'tormenta20.html', 'tormenta 20 t20 fantasia dinamico'],
    ['Tormenta 20 — Como jogar?', 'tormenta20-como-jogar.html', 'tormenta como jogar dados'],
    ['Tormenta 20 — Status', 'tormenta20-status.html', 'tormenta status vida magia'],
    ['Tormenta 20 — Perícias', 'tormenta20-pericias.html', 'tormenta pericias atributos'],
    ['Estilha', 'estilha.html', 'estilha sci-fi distopia ficcao'],
    ['Estilha — Como jogar?', 'estilha-como-jogar.html', 'estilha como jogar dados vantagem'],
    ['Estilha — Status', 'estilha-status.html', 'estilha status tecnica'],
    ['Estilha — Perícias', 'estilha-pericias.html', 'estilha pericias acrobacia'],
    ['Campanhas disponíveis', 'campanhas.html', 'campanhas jogadores partida'],
    ['Horizonte de Cobiças', 'campanha-horizonte-de-cobicas.html', 'horizonte cobicas campanha'],
    ['Quem somos?', 'quem-somos.html', 'quem somos equipe sobre']
  ];
  function normalizar(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  document.querySelectorAll('.busca').forEach(function (form) {
    var input = form.querySelector('input'), lista = form.querySelector('.busca__sugestoes');
    function render() {
      var q = normalizar(input.value.trim());
      if (!q) { lista.classList.remove('aberta'); return; }
      var res = PAGINAS.filter(function (p) { return normalizar(p[0] + ' ' + p[2]).indexOf(q) !== -1; }).slice(0, 6);
      lista.innerHTML = res.length
        ? res.map(function (p) { return '<li><a href="' + p[1] + '">' + p[0] + '</a></li>'; }).join('')
        : '<li class="vazio">Nada encontrado.</li>';
      lista.classList.add('aberta');
    }
    input.addEventListener('input', render);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var primeiro = lista.querySelector('a');
      if (primeiro) window.location.href = primeiro.getAttribute('href'); else render();
    });
    document.addEventListener('click', function (ev) { if (!form.contains(ev.target)) lista.classList.remove('aberta'); });
  });

  // ---- Chat ----
  var envio = document.querySelector('.envio');
  if (envio) {
    var area = document.querySelector('.mensagens');
    envio.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = envio.querySelector('input'), txt = input.value.trim();
      if (!txt) return;
      var div = document.createElement('div');
      div.className = 'msg msg--eu';
      var small = document.createElement('small'); small.textContent = 'Usuário';
      div.appendChild(small); div.appendChild(document.createTextNode(txt));
      area.appendChild(div); input.value = '';
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }

  // ---- Comentários ----
  document.querySelectorAll('.comentarios form').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ta = form.querySelector('textarea'), txt = ta.value.trim();
      if (!txt) return;
      var vazio = form.parentElement.querySelector('.sem-comentarios'); if (vazio) vazio.remove();
      var c = document.createElement('div'); c.className = 'comentario';
      c.innerHTML = '<div class="av avatar-padrao">' + document.getElementById('svg-avatar').innerHTML + '</div><span class="nome">Você</span><p></p>';
      c.querySelector('p').textContent = txt;
      form.insertAdjacentElement('afterend', c); ta.value = '';
    });
  });
})();
