const STORAGE_USERS = 'librisUsers';
const STORAGE_CURRENT = 'librisCurrentUser';
const STORAGE_REVIEWS = 'librisReviews';
const DB_NAME = 'librisDB';
const DB_VERSION = 1;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB não suportado neste navegador.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('reviews')) {
        db.createObjectStore('reviews', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'email' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Erro ao abrir o banco de dados.'));
  });
}

async function readStore(storeName) {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error(`Erro ao ler ${storeName}.`));
    });
  } catch {
    return [];
  }
}

async function writeStore(storeName, records) {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      records.forEach((record) => store.put(record));

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error(`Erro ao salvar ${storeName}.`));
    });
  } catch {
    return false;
  }
}

const defaultReviews = [
  {
    id: 1,
    author: 'Ana Ribeiro',
    book: 'O Pequeno Príncipe',
    title: 'Uma leitura delicada e memorável',
    review: 'A simplicidade da história esconde camadas profundas sobre amizade, amor e o olhar de uma criança sobre o mundo. Foi uma leitura que me marcou por muito tempo.',
    rating: 5,
    avatar: 'A'
  },
  {
    id: 2,
    author: 'Lucas Mendes',
    book: 'A Biblioteca da Meia-Noite',
    title: 'Uma história que me fez refletir',
    review: 'Achei um livro muito humano, com uma narrativa leve e ao mesmo tempo profunda. A forma como a autora trata a expectativa e a vida pessoal foi muito forte.',
    rating: 5,
    avatar: 'L'
  },
  {
    id: 3,
    author: 'Maria Silva',
    book: 'Dom Casmurro',
    title: 'Um clássico que continua vivo',
    review: 'Mesmo depois de anos, cada leitura revela algo novo. O texto é intenso, psicológico e cheio de dúvidas que ficam na cabeça depois da última página.',
    rating: 4,
    avatar: 'M'
  }
];

const bookCoverPool = [
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521668576207-3386c3f3e98b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80'
];

const bookCoverMap = {
  'A Revolução dos Bichos': 'https://covers.openlibrary.org/b/id/15200524-L.jpg',
  'O Alquimista': 'https://covers.openlibrary.org/b/id/7414780-L.jpg',
  '1984': 'https://covers.openlibrary.org/b/id/9267242-L.jpg',
  'Dom Casmurro': 'https://covers.openlibrary.org/b/id/647501-L.jpg',
  'A Moreninha': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
  'Orgulho e Preconceito': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
  'O Conde de Monte Cristo': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
  'O Pequeno Príncipe': 'https://covers.openlibrary.org/b/id/10708272-L.jpg',
  'Leviatã': 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80',
  'O Poder do Hábito': 'https://covers.openlibrary.org/b/id/9078085-L.jpg',
  'Sapiens': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
  'A Biblioteca da Meia-Noite': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
  'A Casa dos Espíritos': 'https://images.unsplash.com/photo-1521668576207-3386c3f3e98b?auto=format&fit=crop&w=800&q=80',
  'O Jardim dos Finzi-Contini': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
  'Duna': 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  'A Insustentável Leveza do Ser': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
  'A Hora da Estrela': 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80',
  'A Vida de Pi': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
  'A Sociedade Literária e a Torta de Casca de Batata': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
  'P.S. Eu Te Amo': 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80',
  'O Pequeno Livro das Emoções': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'
};

function getBookCoverUrl(title, fallbackIndex = 0) {
  if (!title) return bookCoverPool[fallbackIndex % bookCoverPool.length];

  const normalizedTitle = String(title).trim();
  return bookCoverMap[normalizedTitle] || bookCoverPool[fallbackIndex % bookCoverPool.length];
}

function resolvePdfUrl(url) {
  if (!url || typeof url !== 'string') return 'about:blank';

  const trimmed = url.trim();
  if (/\.pdf(?:[?#]|$)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(trimmed)}`;
}

function applyStaticBookCovers() {
  document.querySelectorAll('.book-cover[data-book-title]').forEach((element) => {
    const title = element.dataset.bookTitle;
    const url = getBookCoverUrl(title);
    element.style.backgroundImage = `linear-gradient(135deg, rgba(20, 34, 58, 0.15), rgba(20, 34, 58, 0.25)), url('${url}')`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
  });
}

const bookCatalog = [
  { slug: 'dom-casmurro', title: 'Dom Casmurro', author: 'Machado de Assis', genre: 'Clássico', pages: 256, rating: 4.9, cover: 'https://covers.openlibrary.org/b/id/647501-L.jpg', pdfUrl: 'https://dominiopublico.mec.gov.br/pesquisa/DetalheObraForm.do?co_obra=1888&select_action' },
  { slug: 'memorias-postumas-bras-cubas', title: 'Memórias Póstumas de Brás Cubas', author: 'Machado de Assis', genre: 'Clássico', pages: 320, rating: 4.6, cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://dominiopublico.mec.gov.br/pesquisa/DetalheObraForm.do?co_obra=2038&select_action' },
  { slug: 'a-moreninha', title: 'A Moreninha', author: 'Joaquim Manuel de Macedo', genre: 'Romance', pages: 192, rating: 4.4, cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://digital.bbm.usp.br/handle/bbm/4002' },
  { slug: 'orgulho-e-preconceito', title: 'Orgulho e Preconceito', author: 'Jane Austen', genre: 'Romance', pages: 432, rating: 4.9, cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://self.gutenberg.org/wplbn0001133606-pride-and-prejudice-by-austen-jane.aspx' },
  { slug: 'o-conde-de-monte-cristo', title: 'O Conde de Monte Cristo', author: 'Alexandre Dumas', genre: 'Aventura', pages: 1360, rating: 4.8, cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://self.gutenberg.org/eBooks/WPLBN0000616906-The-Count-of-Monte-Cristo-by-Dumas-Alexandre.aspx' },
  { slug: 'a-ilustre-casa-de-ramires', title: 'A Ilustre Casa de Ramires', author: 'Eça de Queirós', genre: 'Clássico', pages: 432, rating: 4.5, cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://dominiopublico.mec.gov.br/pesquisa/PesquisaObraForm.do?co_autor=70&select_action' },
  { slug: 'leviata', title: 'Leviatã', author: 'Thomas Hobbes', genre: 'Filosofia', pages: 304, rating: 4.1, cover: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://self.gutenberg.org/wplbn0003468308-leviathan-by-hobbes-thomas.aspx' },
  { slug: 'moby-dick', title: 'Moby Dick', author: 'Herman Melville', genre: 'Clássico', pages: 720, rating: 4.5, cover: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://commons.wikimedia.org/wiki/File:Moby_Dick.pdf' },
  { slug: 'os-miseraveis', title: 'Os Miseráveis', author: 'Victor Hugo', genre: 'Clássico', pages: 1488, rating: 4.8, cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://digital.bbm.usp.br/handle/bbm/8858' },
  { slug: 'a-educacao-sentimental', title: 'A Educação Sentimental', author: 'Gustave Flaubert', genre: 'Clássico', pages: 512, rating: 4.3, cover: 'https://images.unsplash.com/photo-1521668576207-3386c3f3e98b?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://www.gutenberg.org/files/59507/59507-h/59507-h.htm' },
  { slug: 'a-revolucao-dos-bichos', title: 'A Revolução dos Bichos', author: 'George Orwell', genre: 'Ficção', pages: 224, rating: 4.8, cover: 'https://covers.openlibrary.org/b/id/15200524-L.jpg', pdfUrl: 'https://example.com/arquivo-nao-disponivel' },
  { slug: 'o-alquimista', title: 'O Alquimista', author: 'Paulo Coelho', genre: 'Ficção', pages: 208, rating: 4.7, cover: 'https://covers.openlibrary.org/b/id/7414780-L.jpg', pdfUrl: 'https://example.com/arquivo-nao-disponivel' },
  { slug: 'ano-1984', title: '1984', author: 'George Orwell', genre: 'Distopia', pages: 288, rating: 4.9, cover: 'https://covers.openlibrary.org/b/id/9267242-L.jpg', pdfUrl: 'https://example.com/arquivo-nao-disponivel' },
  { slug: 'o-pequeno-principe', title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', genre: 'Infantil', pages: 96, rating: 5.0, cover: 'https://covers.openlibrary.org/b/id/10708272-L.jpg', pdfUrl: 'https://example.com/arquivo-nao-disponivel' },
  { slug: 'o-poder-do-habito', title: 'O Poder do Hábito', author: 'Charles Duhigg', genre: 'Não-ficção', pages: 336, rating: 4.6, cover: 'https://covers.openlibrary.org/b/id/9078085-L.jpg', pdfUrl: 'https://example.com/arquivo-nao-disponivel' },
  { slug: 'a-biblioteca-da-meia-noite', title: 'A Biblioteca da Meia-Noite', author: 'Matt Haig', genre: 'Ficção', pages: 304, rating: 4.8, cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://example.com/arquivo-nao-disponivel' },
  { slug: 'a-casa-dos-espiritos', title: 'A Casa dos Espíritos', author: 'Isabel Allende', genre: 'Ficção', pages: 448, rating: 4.8, cover: 'https://images.unsplash.com/photo-1521668576207-3386c3f3e98b?auto=format&fit=crop&w=800&q=80', pdfUrl: 'https://example.com/arquivo-nao-disponivel' }
];

const booksToRead = bookCatalog;
const allGenres = ['Todos', ...new Set(bookCatalog.map((book) => book.genre))];

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getFilteredBooks(searchTerm = '', selectedGenre = 'Todos') {
  const query = normalizeText(searchTerm);

  return bookCatalog.filter((book) => {
    const matchesGenre = selectedGenre === 'Todos' || normalizeText(book.genre) === normalizeText(selectedGenre);
    const haystack = normalizeText(`${book.title} ${book.author} ${book.genre}`);
    const matchesSearch = !query || haystack.includes(query);
    return matchesGenre && matchesSearch;
  });
}

function renderCatalogGrid(list = bookCatalog) {
  const container = document.getElementById('booksGrid');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = '<div class="empty-state">Nenhum livro encontrado com esse filtro.</div>';
    return;
  }

  container.innerHTML = list.map((book, index) => {
    const coverUrl = getBookCoverUrl(book.title, index) || book.cover;

    return `
      <article class="book-item">
        <div class="book-cover" data-book-title="${escapeHtml(book.title)}" style="background-image: linear-gradient(135deg, rgba(20, 34, 58, 0.15), rgba(20, 34, 58, 0.25)), url('${coverUrl}');"></div>
        <div class="book-meta"><span>${escapeHtml(book.genre)}</span><span>${Number(book.rating).toFixed(1)}</span></div>
        <h3>${escapeHtml(book.title)}</h3>
        <div class="book-author">${escapeHtml(book.author)}</div>
        <div class="book-footer">
          <span class="rating">★ ${Number(book.rating).toFixed(1)}</span>
          <a class="follow-btn" href="livro.html?book=${encodeURIComponent(book.slug)}">Ler</a>
        </div>
      </article>
    `;
  }).join('');

  applyStaticBookCovers();
}

function renderExploreResults(searchTerm = '', selectedGenre = 'Todos') {
  const container = document.getElementById('exploreResults');
  if (!container) return;

  const filteredBooks = getFilteredBooks(searchTerm, selectedGenre);

  if (!filteredBooks.length) {
    container.innerHTML = '<div class="empty-state">Nenhum livro corresponde à busca ou ao gênero selecionado.</div>';
    return;
  }

  container.innerHTML = filteredBooks.map((book, index) => {
    const coverUrl = getBookCoverUrl(book.title, index) || book.cover;
    return `
      <article class="explore-card">
        <div class="explore-cover" style="background-image: linear-gradient(135deg, rgba(13, 28, 46, 0.2), rgba(13, 28, 46, 0.4)), url('${coverUrl}');"></div>
        <div class="explore-info">
          <div class="explore-meta">
            <span>${escapeHtml(book.genre)}</span>
            <span>★ ${Number(book.rating).toFixed(1)}</span>
          </div>
          <h3>${escapeHtml(book.title)}</h3>
          <p>${escapeHtml(book.author)}</p>
          <a href="livro.html?book=${encodeURIComponent(book.slug)}" class="explore-link">Abrir livro</a>
        </div>
      </article>
    `;
  }).join('');
}

function setupSearchAndFilters() {
  const mainSearchInput = document.getElementById('mainSearchInput');
  const exploreSearchInput = document.getElementById('exploreSearchInput');
  const genreFilterContainer = document.querySelector('[data-genre-filters]');

  if (genreFilterContainer) {
    genreFilterContainer.innerHTML = allGenres.map((genre) => `
      <button type="button" class="filter-chip${genre === 'Todos' ? ' active' : ''}" data-genre="${escapeHtml(genre)}">${escapeHtml(genre)}</button>
    `).join('');

    genreFilterContainer.querySelectorAll('.filter-chip').forEach((button) => {
      button.addEventListener('click', () => {
        const selectedGenre = button.dataset.genre;

        genreFilterContainer.querySelectorAll('.filter-chip').forEach((chip) => {
          chip.classList.toggle('active', chip === button);
        });

        const activeSearch = exploreSearchInput ? exploreSearchInput.value : '';
        renderExploreResults(activeSearch, selectedGenre);
      });
    });
  }

  if (mainSearchInput) {
    mainSearchInput.addEventListener('input', (event) => {
      const query = event.target.value.trim();
      renderCatalogGrid(getFilteredBooks(query, 'Todos'));
    });
  }

  if (exploreSearchInput) {
    exploreSearchInput.addEventListener('input', (event) => {
      const selectedGenreButton = document.querySelector('.filter-chip.active');
      const selectedGenre = selectedGenreButton ? selectedGenreButton.dataset.genre : 'Todos';
      renderExploreResults(event.target.value.trim(), selectedGenre);
    });
  }

  if (document.getElementById('exploreResults')) {
    renderExploreResults('', 'Todos');
  }

  if (document.getElementById('booksGrid')) {
    renderCatalogGrid(bookCatalog);
  }
}

async function getReviews() {
  const reviews = await readStore('reviews');

  if (reviews.length) {
    return reviews;
  }

  await writeStore('reviews', defaultReviews);
  return defaultReviews;
}

async function saveReviews(reviews) {
  const saved = await writeStore('reviews', reviews);
  if (!saved) {
    localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(reviews));
  }
}

async function renderReviews() {
  const reviewsList = document.getElementById('reviewsList');
  if (!reviewsList) return;

  const reviews = await getReviews();
  reviewsList.innerHTML = reviews.slice(0, 4).map((item) => `
    <article class="review-item">
      <div class="review-header-row">
        <div class="review-profile">
          <div class="review-avatar">${escapeHtml(item.avatar)}</div>
          <div>
            <strong>${escapeHtml(item.author)}</strong>
            <span>${escapeHtml(item.book)}</span>
          </div>
        </div>
        <div class="review-rating">★ ${Number(item.rating || 0)}</div>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.review)}</p>
    </article>
  `).join('');
}

function renderToReadBooks() {
  const container = document.getElementById('toReadGrid');
  if (!container) return;

  container.innerHTML = booksToRead.map((book, index) => {
    const coverUrl = getBookCoverUrl(book.title, index) || book.cover;

    return `
      <article class="to-read-item">
        <div class="to-read-cover" style="background-image: linear-gradient(135deg, rgba(16, 32, 50, 0.18), rgba(16, 32, 50, 0.28)), url('${coverUrl}');"></div>
        <span class="to-read-badge">${escapeHtml(book.genre)}</span>
        <h3>${escapeHtml(book.title)}</h3>
        <p>${escapeHtml(book.author)}</p>
        <div class="to-read-meta">
          <span>${Number(book.pages)} págs.</span>
          <span>★ ${Number(book.rating).toFixed(1)}</span>
        </div>
        <div class="to-read-actions">
          <a class="read-book-link" href="livro.html?book=${encodeURIComponent(book.slug)}">Ler agora</a>
          <button type="button" class="review-book-btn" data-book="${escapeHtml(book.title)}">Dar review</button>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.review-book-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const bookName = button.getAttribute('data-book');
      if (!getCurrentUser()) {
        alert('Faça login para escrever uma review.');
        if (typeof openAuthModal === 'function') {
          openAuthModal('login');
        }
        return;
      }
      if (typeof openReviewModal === 'function') {
        openReviewModal(bookName);
      }
    });
  });
}

async function getUsers() {
  const users = await readStore('users');
  if (users.length) {
    return users;
  }

  try {
    const storedUsers = JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
    if (storedUsers.length) {
      await writeStore('users', storedUsers);
      return storedUsers;
    }
  } catch {
    // fallback silencioso
  }

  return [];
}

async function saveUsers(users) {
  const saved = await writeStore('users', users);
  if (!saved) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_CURRENT));
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_CURRENT, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_CURRENT);
}

function openAuthModal(type = 'login') {
  const authModal = document.getElementById('authModal');
  if (!authModal) return;

  authModal.classList.remove('hidden');
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.auth === type);
  });

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) loginForm.classList.toggle('active', type === 'login');
  if (signupForm) signupForm.classList.toggle('active', type === 'signup');
}

function closeAuthModal() {
  const authModal = document.getElementById('authModal');
  if (authModal) authModal.classList.add('hidden');
}

function getUserHandle(name) {
  return '@' + String(name || 'visitante').trim().toLowerCase().replace(/\s+/g, '');
}

function updateProfileUI() {
  const currentUser = getCurrentUser();
  const profileName = document.getElementById('profileName');
  const profileUser = document.getElementById('profileUser');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileBox = document.getElementById('profileBox');
  const openLoginBtn = document.getElementById('openLoginBtn');
  const openSignupBtn = document.getElementById('openSignupBtn');

  if (!profileName || !profileUser || !profileAvatar) return;

  if (currentUser) {
    profileName.textContent = currentUser.name;
    profileUser.textContent = getUserHandle(currentUser.name);
    profileAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    profileAvatar.classList.remove('guest');
    if (profileBox) profileBox.classList.remove('guest');
    if (openLoginBtn) openLoginBtn.textContent = 'Conta';
    if (openSignupBtn) openSignupBtn.textContent = 'Sair';
  } else {
    profileName.textContent = 'Nenhum perfil';
    profileUser.textContent = 'Entre para continuar';
    profileAvatar.textContent = '+';
    profileAvatar.classList.add('guest');
    if (profileBox) profileBox.classList.add('guest');
    if (openLoginBtn) openLoginBtn.textContent = 'Entrar';
    if (openSignupBtn) openSignupBtn.textContent = 'Criar conta';
  }
}

function updateProfilePageUI() {
  const currentUser = getCurrentUser();
  const pageName = document.getElementById('profilePageName');
  const pageHandle = document.getElementById('profilePageHandle');
  const pageBio = document.getElementById('profilePageBio');
  const pageMeta = document.getElementById('profilePageMeta');
  const pageAvatar = document.getElementById('profilePageAvatar');

  if (!pageName || !pageHandle || !pageBio || !pageMeta || !pageAvatar) return;

  if (currentUser) {
    const interests = Array.isArray(currentUser.interesses) && currentUser.interesses.length
      ? currentUser.interesses
      : ['Romance', 'Ficção'];

    pageName.textContent = currentUser.name;
    pageHandle.textContent = getUserHandle(currentUser.name);
    pageBio.textContent = currentUser.bio || 'Leitora apaixonada por histórias que provocam reflexão, emoção e imaginação.';
    pageMeta.innerHTML = interests.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
    pageAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
  } else {
    pageName.textContent = 'Perfil privado';
    pageHandle.textContent = '@visitante';
    pageBio.textContent = 'Entre para ver seu perfil personalizável, interesses e histórico de leitura.';
    pageMeta.innerHTML = ['Romance', 'Ficção', 'Clássicos'].map((item) => `<span>${item}</span>`).join('');
    pageAvatar.textContent = 'L';
  }
}

function bindAuthModal() {
  const authModal = document.getElementById('authModal');
  if (!authModal) return;

  const closeAuthButton = document.getElementById('closeAuthModal');
  const openLoginBtn = document.getElementById('openLoginBtn');
  const openSignupBtn = document.getElementById('openSignupBtn');
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (closeAuthButton) {
    closeAuthButton.addEventListener('click', closeAuthModal);
  }

  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', () => openAuthModal('login'));
  }

  if (openSignupBtn) {
    openSignupBtn.addEventListener('click', () => {
      const currentUser = getCurrentUser();

      if (currentUser) {
        clearCurrentUser();
        updateProfileUI();
        updateProfilePageUI();
        return;
      }

      openAuthModal('signup');
    });
  }

  authTabs.forEach((tab) => {
    tab.addEventListener('click', () => openAuthModal(tab.dataset.auth));
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = loginForm.email.value.trim();
      const password = loginForm.password.value.trim();
      const users = await getUsers();
      const user = users.find(
        (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
      );

      if (!user) {
        alert('Email ou senha inválidos.');
        return;
      }

      setCurrentUser({
        name: user.name,
        email: user.email,
        bio: user.bio || 'Leitora apaixonada por histórias que provocam reflexão, emoção e imaginação.',
        genero: user.genero || 'Outro',
        interesses: user.interesses || ['Romance', 'Ficção'],
        categoria: user.categoria || 'Todos'
      });

      updateProfileUI();
      updateProfilePageUI();
      closeAuthModal();
      alert('Login realizado com sucesso!');
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = signupForm.name.value.trim();
      const email = signupForm.email.value.trim();
      const password = signupForm.password.value.trim();

      if (!name || !email || !password) {
        alert('Preencha todos os campos.');
        return;
      }

      const users = await getUsers();
      const alreadyExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

      if (alreadyExists) {
        alert('Este e-mail já está cadastrado.');
        return;
      }

      const selectedGenero = signupForm.genero ? signupForm.genero.value : 'Outro';
      const selectedInteresses = Array.from(
        signupForm.querySelectorAll('input[name="interesses"]:checked')
      ).map((item) => item.value);
      const selectedCategoria = signupForm.categoria ? signupForm.categoria.value : 'Todos';
      const bio = signupForm.bio ? signupForm.bio.value.trim() : '';

      const newUser = {
        name,
        email,
        password,
        genero: selectedGenero,
        interesses: selectedInteresses.length ? selectedInteresses : ['Romance'],
        categoria: selectedCategoria,
        bio: bio || 'Leitora apaixonada por histórias que provocam reflexão, emoção e imaginação.'
      };

      users.push(newUser);
      await saveUsers(users);
      setCurrentUser(newUser);
      updateProfileUI();
      updateProfilePageUI();
      closeAuthModal();
      alert('Conta criada com sucesso!');
    });
  }

  authModal.addEventListener('click', (event) => {
    if (event.target === authModal) {
      closeAuthModal();
    }
  });
}

function openReviewModal(selectedBook = '') {
  const reviewModal = document.getElementById('reviewModal');
  const reviewForm = document.getElementById('reviewForm');

  if (!reviewModal || !reviewForm) return;

  reviewForm.book.value = selectedBook || '';
  reviewModal.classList.remove('hidden');
}

function bindReviewModal() {
  const reviewModal = document.getElementById('reviewModal');
  const writeReviewBtn = document.getElementById('writeReviewBtn');
  const reviewForm = document.getElementById('reviewForm');

  if (!reviewModal || !writeReviewBtn) return;

  const closeReviewModal = () => {
    reviewModal.classList.add('hidden');

    if (reviewForm) {
      reviewForm.reset();
      reviewForm.book.value = '';
    }
  };

  writeReviewBtn.addEventListener('click', () => {
    if (!getCurrentUser()) {
      alert('Faça login para escrever uma revisão.');
      openAuthModal('login');
      return;
    }

    openReviewModal();
  });

  reviewModal.querySelectorAll('[data-close="reviewModal"]').forEach((button) => {
    button.addEventListener('click', closeReviewModal);
  });

  reviewModal.addEventListener('click', (event) => {
    if (event.target === reviewModal) {
      closeReviewModal();
    }
  });

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const title = reviewForm.title.value.trim();
      const book = reviewForm.book.value.trim();
      const review = reviewForm.review.value.trim();

      if (!title || !book || !review) {
        alert('Preencha todos os campos da revisão.');
        return;
      }

      const currentUser = getCurrentUser();
      const currentName = currentUser ? currentUser.name : 'Leitor do Libris';
      const newReview = {
        id: Date.now(),
        author: currentName,
        book,
        title,
        review,
        rating: 5,
        avatar: currentName.charAt(0).toUpperCase()
      };

      const reviews = await getReviews();
      reviews.unshift(newReview);
      await saveReviews(reviews);
      await renderReviews();

      alert(`${currentName} publicou: ${title} para ${book}.`);
      reviewForm.reset();
      closeReviewModal();
    });
  }
}

function bindFollowButtons() {
  document.querySelectorAll('.follow-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const following = button.classList.toggle('following');
      button.textContent = following ? 'Seguindo' : 'Seguir';
    });
  });
}

function bindNavState() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach((link) => {
    const target = link.getAttribute('data-page') || link.getAttribute('href');
    const isActive = target === currentPage;
    link.classList.toggle('active', isActive);
  });
}

function bindTabs() {
  document.querySelectorAll('.tab-row button').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-row button').forEach((item) => {
        item.classList.toggle('active', item === tab);
      });

      if (tab.dataset.tab === 'to-read') {
        const toReadSection = document.getElementById('toReadSection');

        if (toReadSection) {
          toReadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

function getBookBySlug(slug) {
  return bookCatalog.find((book) => book.slug === slug) || null;
}

function getBookReviewsKey(slug) {
  return `librisReviews:${slug}`;
}

function getBookReviews(slug) {
  const key = getBookReviewsKey(slug);
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveBookReviews(slug, reviews) {
  localStorage.setItem(getBookReviewsKey(slug), JSON.stringify(reviews));
}

function renderBookPage() {
  const titleElement = document.getElementById('bookTitle');
  const authorElement = document.getElementById('bookAuthor');
  const genreElement = document.getElementById('bookGenre');
  const pagesElement = document.getElementById('bookPages');
  const ratingElement = document.getElementById('bookRating');
  const coverElement = document.getElementById('bookCover');
  const viewer = document.getElementById('bookViewer');
  const reviewList = document.getElementById('bookReviewsList');
  const reviewForm = document.getElementById('bookReviewForm');
  const pdfLink = document.getElementById('pdfLink');

  if (!titleElement || !authorElement || !genreElement || !viewer) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('book');
  const book = getBookBySlug(slug);

  if (!book) {
    titleElement.textContent = 'Livro não encontrado';
    authorElement.textContent = 'Volte para a página inicial';
    genreElement.textContent = 'Indisponível';
    pagesElement.textContent = '—';
    ratingElement.textContent = '—';
    viewer.src = 'about:blank';
    if (pdfLink) {
      pdfLink.href = '#';
      pdfLink.textContent = 'PDF indisponível';
    }
    return;
  }

  titleElement.textContent = book.title;
  authorElement.textContent = book.author;
  genreElement.textContent = book.genre;
  pagesElement.textContent = `${book.pages} páginas`;
  ratingElement.textContent = `★ ${Number(book.rating).toFixed(1)}`;
  coverElement.style.backgroundImage = `linear-gradient(135deg, rgba(20, 34, 58, 0.15), rgba(20, 34, 58, 0.25)), url('${book.cover}')`;

  const safeViewerUrl = resolvePdfUrl(book.pdfUrl);
  if (pdfLink) {
    pdfLink.href = book.pdfUrl || '#';
    pdfLink.textContent = 'Abrir PDF';
  }
  viewer.src = safeViewerUrl;

  const reviews = getBookReviews(book.slug);
  if (reviewList) {
    reviewList.innerHTML = reviews.length
      ? reviews.map((item) => `
          <article class="book-review-item">
            <div class="book-review-header">
              <strong>${escapeHtml(item.author)}</strong>
              <span>★ ${Number(item.rating || 5)}</span>
            </div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.review)}</p>
          </article>
        `).join('')
      : '<div class="empty-reviews">Ainda não há resenhas para este livro.</div>';
  }

  if (reviewForm) {
    reviewForm.onreset = () => {
      reviewForm.title.value = '';
      reviewForm.review.value = '';
    };

    reviewForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const title = reviewForm.title.value.trim();
      const review = reviewForm.review.value.trim();
      if (!title || !review) {
        alert('Preencha o título e a resenha.');
        return;
      }

      const currentUser = getCurrentUser();
      const author = currentUser ? currentUser.name : 'Leitor do Libris';
      const nextReviews = [{
        author,
        title,
        review,
        rating: 5
      }, ...getBookReviews(book.slug)];

      saveBookReviews(book.slug, nextReviews);
      renderBookPage();
      reviewForm.reset();
      alert('Resenha publicada com sucesso!');
    }, { once: true });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('bookTitle')) {
    renderBookPage();
    return;
  }

  bindNavState();
  bindAuthModal();
  bindReviewModal();
  bindFollowButtons();
  bindTabs();
  applyStaticBookCovers();
  setupSearchAndFilters();
  await renderReviews();
  renderToReadBooks();
  updateProfileUI();
  updateProfilePageUI();
});
