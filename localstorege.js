// CRUD Peliculas + Auth + UI
const LS_KEYS = {
    movies: "peliculas",
    users: "usuarios",
    session: "sesion",
};

const seedMovies = [];

const seedUsers = [
    { user: "admin", pass: "admin123", nombre: "Administrador", email: "admin@cineflix.com" },
    { user: "usuario", pass: "1234", nombre: "Usuario", email: "usuario@cineflix.com" },
    { user: "demo", pass: "demo", nombre: "Demo", email: "demo@cineflix.com" },
];

function loadOrSeed(key, seed) {
    const raw = localStorage.getItem(key);
    if (!raw) {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
    }
    try {
        return JSON.parse(raw);
    } catch {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
    }
}

function saveLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getSession() {
    const raw = localStorage.getItem(LS_KEYS.session);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setSession(user) {
    saveLS(LS_KEYS.session, user);
}

function clearSession() {
    localStorage.removeItem(LS_KEYS.session);
}

const els = {
    // Auth
    loginSection: document.querySelector("#loginSection"),
    mainContent: document.querySelector("#mainContent"),
    btnLogin: document.querySelector("#btnLogin"),
    btnLogout: document.querySelector("#btnLogout"),
    btnAgregar: document.querySelector("#btnAgregar"),
    formLogin: document.querySelector("#formLogin"),
    formRegistro: document.querySelector("#formRegistro"),
    inputUser: document.querySelector("#inputUser"),
    inputPassword: document.querySelector("#inputPassword"),
    inputNombre: document.querySelector("#inputNombre"),
    inputEmail: document.querySelector("#inputEmail"),
    inputUserReg: document.querySelector("#inputUserReg"),
    inputPasswordReg: document.querySelector("#inputPasswordReg"),
    inputConfirmPassword: document.querySelector("#inputConfirmPassword"),
    linkLogin: document.querySelector("#linkLogin"),

    // Search/Filter
    inputBuscar: document.querySelector("#inputBuscar"),
    selectGenero: document.querySelector("#selectGenero"),

    // Slider/Grid
    carouselMovies: document.querySelector("#carouselMovies"),
    gridPeliculas: document.querySelector("#gridPeliculas"),
    sinResultados: document.querySelector("#sinResultados"),

    // Modal Add/Edit
    modalTitulo: document.querySelector("#modalTitulo"),
    formPelicula: document.querySelector("#formPelicula"),
    inputTitulo: document.querySelector("#inputTitulo"),
    inputGenero: document.querySelector("#inputGenero"),
    inputDirector: document.querySelector("#inputDirector"),
    inputAno: document.querySelector("#inputAno"),
    inputCalificacion: document.querySelector("#inputCalificacion"),
    inputDescripcion: document.querySelector("#inputDescripcion"),
    inputImagen: document.querySelector("#inputImagen"),
    btnGuardarPelicula: document.querySelector("#btnGuardarPelicula"),

    // Modal Details
    detallesTitulo: document.querySelector("#detallesTitulo"),
    detallesImagen: document.querySelector("#detallesImagen"),
    detallesGenero: document.querySelector("#detallesGenero"),
    detallesDirector: document.querySelector("#detallesDirector"),
    detallesAno: document.querySelector("#detallesAno"),
    detallesCalificacion: document.querySelector("#detallesCalificacion"),
    detallesDescripcion: document.querySelector("#detallesDescripcion"),
};

const state = {
    movies: [],
    users: loadOrSeed(LS_KEYS.users, seedUsers),
    editingId: null,
};

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

function isValidMovie(movie) {
    if (!movie || typeof movie !== "object") return false;
    const required = ["titulo", "genero", "director", "ano", "calificacion", "descripcion", "imagen"];
    return required.every((k) => movie[k] !== undefined && movie[k] !== null && String(movie[k]).trim() !== "");
}

function sanitizeMovies(list) {
    if (!Array.isArray(list)) return [];
    return list
        .filter(isValidMovie)
        .map((m) => ({
            id: Number(m.id) || Date.now() + Math.floor(Math.random() * 1000),
            titulo: String(m.titulo).trim(),
            genero: String(m.genero).trim(),
            director: String(m.director).trim(),
            ano: Number(m.ano),
            calificacion: Number(m.calificacion),
            descripcion: String(m.descripcion).trim(),
            imagen: String(m.imagen).trim(),
            createdAt: Number(m.createdAt) || Date.now(),
        }));
}

function loadMovies() {
    const raw = localStorage.getItem(LS_KEYS.movies);
    if (!raw) {
        saveLS(LS_KEYS.movies, seedMovies);
        return seedMovies;
    }
    try {
        const parsed = JSON.parse(raw);
        const cleaned = sanitizeMovies(parsed);
        saveLS(LS_KEYS.movies, cleaned);
        return cleaned;
    } catch {
        saveLS(LS_KEYS.movies, seedMovies);
        return seedMovies;
    }
}

function showAuthUI(isLogged) {
    els.loginSection.style.display = isLogged ? "none" : "block";
    els.mainContent.style.display = isLogged ? "block" : "none";
    els.btnLogin.style.display = isLogged ? "none" : "inline-block";
    els.btnLogout.style.display = isLogged ? "inline-block" : "none";
    els.btnAgregar.style.display = isLogged ? "inline-block" : "none";
}

function validateMovieForm() {
    const titulo = els.inputTitulo.value.trim();
    const genero = els.inputGenero.value.trim();
    const director = els.inputDirector.value.trim();
    const ano = parseInt(els.inputAno.value, 10);
    const calificacion = parseFloat(els.inputCalificacion.value);
    const descripcion = els.inputDescripcion.value.trim();
    const imagen = els.inputImagen.value.trim();

    if (!titulo || !genero || !director || !ano || !calificacion || !descripcion || !imagen) {
        alert("Por favor completa todos los campos");
        return null;
    }

    return { titulo, genero, director, ano, calificacion, descripcion, imagen };
}

function resetMovieForm() {
    els.formPelicula.reset();
    state.editingId = null;
    els.modalTitulo.textContent = "Agregar Pelicula";
}

function upsertMovie(data) {
    if (state.editingId) {
        const idx = state.movies.findIndex((m) => m.id === state.editingId);
        if (idx !== -1) {
            state.movies[idx] = { ...state.movies[idx], ...data };
        }
    } else {
        const newMovie = {
            id: Date.now(),
            createdAt: Date.now(),
            ...data,
        };
        state.movies.push(newMovie);
    }
    saveLS(LS_KEYS.movies, state.movies);
}

function deleteMovie(id) {
    state.movies = state.movies.filter((m) => m.id !== id);
    saveLS(LS_KEYS.movies, state.movies);
}

function getFilteredMovies() {
    const q = normalizeText(els.inputBuscar.value);
    const genero = els.selectGenero.value.trim();

    return state.movies.filter((m) => {
        const matchesText =
            !q ||
            normalizeText(m.titulo).includes(q) ||
            normalizeText(m.director).includes(q) ||
            normalizeText(m.descripcion).includes(q);
        const matchesGenre = !genero || normalizeText(m.genero) === normalizeText(genero);
        return matchesText && matchesGenre;
    });
}

function renderSlider(movies) {
    const recientes = [...movies]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 10);

    els.carouselMovies.innerHTML = recientes
        .map((m) => {
            return `
            <div class="slider-movie-card" data-id="${m.id}">
                <img src="${m.imagen}" alt="${m.titulo}">
                <div class="slider-movie-info">
                    <h6>${m.titulo}</h6>
                    <button class="btn btn-sm btn-outline-primary btn-detalles" data-id="${m.id}">Ver</button>
                </div>
            </div>
        `;
        })
        .join("");
}

function renderGrid(movies) {
    els.gridPeliculas.innerHTML = movies
        .map((m) => {
            const actions = getSession()
                ? `
                <button class="btn btn-sm btn-outline-primary btn-detalles" data-id="${m.id}">Detalles</button>
                <button class="btn btn-sm btn-outline-warning btn-editar" data-id="${m.id}">Editar</button>
                <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${m.id}">Eliminar</button>
                `
                : `
                <button class="btn btn-sm btn-outline-primary btn-detalles" data-id="${m.id}">Detalles</button>
                `;

            return `
            <div class="col-md-4">
                <div class="movie-card">
                    <img src="${m.imagen}" class="movie-image" alt="${m.titulo}">
                    <div class="movie-content">
                        <h5 class="movie-title">${m.titulo}</h5>
                        <span class="movie-genre">${m.genero}</span>
                        <div class="movie-meta">${m.ano} • ${m.director}</div>
                        <div class="movie-rating">⭐ ${m.calificacion}</div>
                        <div class="movie-description">${m.descripcion}</div>
                        <div class="movie-actions">${actions}</div>
                    </div>
                </div>
            </div>
        `;
        })
        .join("");
}

function renderAll() {
    const filtered = getFilteredMovies();
    renderSlider(state.movies);
    renderGrid(filtered);
    els.sinResultados.style.display = filtered.length ? "none" : "block";
}

function openDetails(movie) {
    els.detallesTitulo.textContent = movie.titulo;
    els.detallesImagen.src = movie.imagen;
    els.detallesImagen.alt = movie.titulo;
    els.detallesGenero.textContent = movie.genero;
    els.detallesDirector.textContent = movie.director;
    els.detallesAno.textContent = movie.ano;
    els.detallesCalificacion.textContent = movie.calificacion;
    els.detallesDescripcion.textContent = movie.descripcion;

    const modal = new bootstrap.Modal(document.getElementById("modalDetalles"));
    modal.show();
}

function openEdit(movie) {
    state.editingId = movie.id;
    els.modalTitulo.textContent = "Editar Pelicula";
    els.inputTitulo.value = movie.titulo;
    els.inputGenero.value = movie.genero;
    els.inputDirector.value = movie.director;
    els.inputAno.value = movie.ano;
    els.inputCalificacion.value = movie.calificacion;
    els.inputDescripcion.value = movie.descripcion;
    els.inputImagen.value = movie.imagen;

    const modal = new bootstrap.Modal(document.getElementById("modalPelicula"));
    modal.show();
}

function handleGridClick(e) {
    const id = Number(e.target.dataset.id);
    if (!id) return;
    const movie = state.movies.find((m) => m.id === id);
    if (!movie) return;

    if (e.target.classList.contains("btn-detalles")) {
        openDetails(movie);
    }

    if (e.target.classList.contains("btn-editar")) {
        openEdit(movie);
    }

    if (e.target.classList.contains("btn-eliminar")) {
        if (confirm("Deseas eliminar esta pelicula?")) {
            deleteMovie(id);
            renderAll();
        }
    }
}

function handleSliderClick(e) {
    const id = Number(e.target.dataset.id);
    if (!id) return;
    const movie = state.movies.find((m) => m.id === id);
    if (!movie) return;

    if (e.target.classList.contains("btn-detalles")) {
        openDetails(movie);
    }
}

function setupAuth() {
    const session = getSession();
    showAuthUI(Boolean(session));

    els.btnLogin.addEventListener("click", () => {
        showAuthUI(false);
    });

    els.btnLogout.addEventListener("click", () => {
        clearSession();
        showAuthUI(false);
    });

    els.formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = els.inputUser.value.trim();
        const pass = els.inputPassword.value.trim();
        const found = state.users.find((u) => u.user === user && u.pass === pass);
        if (!found) {
            alert("Usuario o contrasena incorrectos");
            return;
        }
        setSession({ user: found.user, nombre: found.nombre });
        showAuthUI(true);
        renderAll();
    });

    els.formRegistro.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = els.inputNombre.value.trim();
        const email = els.inputEmail.value.trim();
        const user = els.inputUserReg.value.trim();
        const pass = els.inputPasswordReg.value.trim();
        const confirmPass = els.inputConfirmPassword.value.trim();

        if (user.length < 4) {
            alert("El usuario debe tener al menos 4 caracteres");
            return;
        }
        if (pass.length < 6) {
            alert("La contrasena debe tener al menos 6 caracteres");
            return;
        }
        if (pass !== confirmPass) {
            alert("Las contrasenas no coinciden");
            return;
        }
        const exists = state.users.some((u) => u.user === user);
        if (exists) {
            alert("Ese usuario ya existe");
            return;
        }

        state.users.push({ user, pass, nombre, email });
        saveLS(LS_KEYS.users, state.users);
        alert("Cuenta creada. Ahora puedes iniciar sesion.");

        els.formRegistro.reset();
        document.querySelector("#login-tab").click();
    });

    els.linkLogin.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector("#login-tab").click();
    });
}

function setupUI() {
    els.btnAgregar.addEventListener("click", () => {
        resetMovieForm();
    });

    els.btnGuardarPelicula.addEventListener("click", () => {
        const data = validateMovieForm();
        if (!data) return;
        upsertMovie(data);
        renderAll();
        resetMovieForm();
        const modalEl = document.getElementById("modalPelicula");
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        if (modal) modal.hide();
    });

    els.inputBuscar.addEventListener("input", renderAll);
    els.selectGenero.addEventListener("change", renderAll);

    els.gridPeliculas.addEventListener("click", handleGridClick);
    els.carouselMovies.addEventListener("click", handleSliderClick);
}

function init() {
    state.movies = loadMovies();
    setupAuth();
    setupUI();
    renderAll();
}

window.scrollSlider = function scrollSlider(dir) {
    const container = document.querySelector("#carouselMovies");
    if (!container) return;
    const amount = container.clientWidth * 0.8;
    container.scrollBy({ left: dir * amount, behavior: "smooth" });
};

init();
