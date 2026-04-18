// ===============================
// BANCO DE DADOS DE VAGAS
// ===============================
let jobs = [
    {
        id: 1,
        title: "Garçom para Evento Corporativo",
        payment: "R$ 300,00 + gorjetas",
        employer: "Gourmet Eventos",
        location: "Centro, Curitiba",
        time: "05/11 - 19h às 23h",
        description: "Atendimento em coquetel para 150 pessoas.",
        category: "destaque",
        employerRating: 4.5,
        employerPhone: "554130001111"
    },
    {
        id: 2,
        title: "Promotor de Vendas",
        payment: "R$ 180/dia",
        employer: "MM Branding",
        location: "Shopping Palladium",
        time: "Finais de semana - 10h às 22h",
        description: "Divulgação de produtos eletrônicos.",
        category: "destaque",
        employerRating: 4.2,
        employerPhone: "554130002222"
    },
    {
        id: 3,
        title: "Auxiliar de Cozinha",
        payment: "R$ 350,00",
        employer: "Restaurante Famiglia",
        location: "Batel, Curitiba",
        time: "Sexta e Sábado - 18h às 00h",
        description: "Preparo de ingredientes e organização da cozinha.",
        category: "destaque",
        employerRating: 4.7,
        employerPhone: "554130003333"
    }
];

// ===============================
// USUÁRIOS / ESTADO
// ===============================
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let userCVs = JSON.parse(localStorage.getItem('userCVs')) || {};

const ADMIN_PHONE_NUMBER = "5541998061078";

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    setupEventListeners();
    
    const savedJobs = JSON.parse(localStorage.getItem('jobs'));
    if (savedJobs && savedJobs.length > 0) {
        jobs = savedJobs;
    }
    
    if (currentUser) {
        showMainScreen();
        updateProfileDisplay();
        updateMenuByUserType();
    }
    
    renderJobs();
});

// ===============================
// AUTENTICAÇÃO
// ===============================
function registerUser(name, email, phone, password, userType) {
    if (users.some(user => user.email === email)) {
        showToast('E-mail já cadastrado!');
        return false;
    }

    const newUser = { 
        id: Date.now(), 
        name, 
        email, 
        phone, 
        password, 
        type: userType,
        bio: '',
        profilePic: 'https://via.placeholder.com/150',
        companyData: userType === 'empregador' ? {
            companyName: '',
            cnpj: '',
            description: '',
            phone: ''
        } : null
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    loginUser(email, password);
    return true;
}

function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        showToast('E-mail ou senha incorretos!');
        return false;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showMainScreen();
    updateProfileDisplay();
    updateMenuByUserType();
    showToast(`Bem-vindo, ${user.name.split(' ')[0]}!`);
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    showToast('Você saiu da conta');
}

// ===============================
// MENU POR TIPO DE USUÁRIO
// ===============================
function updateMenuByUserType() {
    if (!currentUser) return;
    
    const favoritesBtn = document.getElementById('favorites-btn');
    const employerBtn = document.getElementById('employer-btn');
    const candidateForm = document.getElementById('candidate-profile-form');
    const companyForm = document.getElementById('company-profile-form');
    
    if (currentUser.type === 'candidato') {
        if (favoritesBtn) favoritesBtn.style.display = 'flex';
        if (employerBtn) employerBtn.style.display = 'none';
        if (candidateForm) candidateForm.style.display = 'block';
        if (companyForm) companyForm.style.display = 'none';
    } else if (currentUser.type === 'empregador') {
        if (favoritesBtn) favoritesBtn.style.display = 'none';
        if (employerBtn) employerBtn.style.display = 'flex';
        if (candidateForm) candidateForm.style.display = 'none';
        if (companyForm) companyForm.style.display = 'block';
        renderEmployerJobs();
        updateCompanyInfoDisplay();
        loadCompanyData();
    }
}

function updateCompanyInfoDisplay() {
    const container = document.getElementById('company-info-display');
    if (!container) return;
    
    if (currentUser.companyData && currentUser.companyData.companyName) {
        container.innerHTML = `
            <h4>${currentUser.companyData.companyName}</h4>
            ${currentUser.companyData.cnpj ? `<p><strong>CNPJ:</strong> ${currentUser.companyData.cnpj}</p>` : ''}
            ${currentUser.companyData.description ? `<p><strong>Sobre:</strong> ${currentUser.companyData.description}</p>` : ''}
            ${currentUser.companyData.phone ? `<p><strong>WhatsApp:</strong> ${currentUser.companyData.phone}</p>` : ''}
        `;
    } else {
        container.innerHTML = '<p>Complete os dados da empresa no seu perfil</p>';
    }
}

// ===============================
// PERFIL
// ===============================
function updateProfileDisplay() {
    if (!currentUser) return;
    
    const usernameSpan = document.getElementById('username');
    const profileName = document.getElementById('profile-name');
    const profilePic = document.getElementById('profile-pic');
    const profileBio = document.getElementById('profile-bio');
    
    if (usernameSpan) usernameSpan.textContent = currentUser.name.split(' ')[0];
    if (profileName) profileName.textContent = currentUser.name;
    if (profilePic) profilePic.src = currentUser.profilePic;
    
    if (currentUser.type === 'candidato' && profileBio) {
        profileBio.value = currentUser.bio || '';
    } else if (currentUser.type === 'empregador' && currentUser.companyData) {
        const companyName = document.getElementById('company-name');
        const companyCnpj = document.getElementById('company-cnpj');
        const companyDescription = document.getElementById('company-description');
        const companyPhone = document.getElementById('company-phone');
        if (companyName) companyName.value = currentUser.companyData.companyName || '';
        if (companyCnpj) companyCnpj.value = currentUser.companyData.cnpj || '';
        if (companyDescription) companyDescription.value = currentUser.companyData.description || '';
        if (companyPhone) companyPhone.value = currentUser.companyData.phone || '';
    }
}

function loadCompanyData() {
    if (currentUser.type === 'empregador' && currentUser.companyData) {
        const companyName = document.getElementById('company-name');
        const companyCnpj = document.getElementById('company-cnpj');
        const companyDescription = document.getElementById('company-description');
        const companyPhone = document.getElementById('company-phone');
        if (companyName) companyName.value = currentUser.companyData.companyName || '';
        if (companyCnpj) companyCnpj.value = currentUser.companyData.cnpj || '';
        if (companyDescription) companyDescription.value = currentUser.companyData.description || '';
        if (companyPhone) companyPhone.value = currentUser.companyData.phone || '';
    }
}

function updateUserData() {
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// ===============================
// VAGAS
// ===============================
function renderJobs() {
    renderJobList('featured-jobs', jobs.filter(job => job.category === "destaque"));
    renderJobList('all-jobs', jobs);
    if (currentUser && currentUser.type === 'candidato') {
        renderFavorites();
    }
}

function renderEmployerJobs() {
    if (!currentUser) return;
    const myJobs = jobs.filter(job => job.ownerId === currentUser.id);
    const container = document.getElementById('my-jobs');
    if (!container) return;
    
    container.innerHTML = myJobs.length > 0 ? '' : '<p>Você ainda não publicou vagas</p>';
    
    myJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <h4>${job.title}</h4>
            <p>💰 ${job.payment}</p>
            <p>📍 ${job.location}</p>
            <p>🕐 ${job.time}</p>
            <button class="btn-view" data-id="${job.id}">Ver detalhes</button>
        `;
        container.appendChild(jobCard);
    });
}

function renderJobList(containerId, jobList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = jobList.length > 0 ? '' : '<p>Nenhuma vaga encontrada</p>';
    
    jobList.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <h4>${job.title}</h4>
            <p>🏢 ${job.employer}</p>
            <p>💰 ${job.payment}</p>
            <p>📍 ${job.location}</p>
            <button class="btn-view" data-id="${job.id}">Ver detalhes</button>
        `;
        container.appendChild(jobCard);
    });
}

function renderFavorites() {
    const favoriteJobs = jobs.filter(job => favorites.includes(job.id));
    const container = document.getElementById('favorite-jobs');
    if (!container) return;
    
    container.innerHTML = favoriteJobs.length > 0 ? '' : '<p>Nenhuma vaga favoritada ainda.</p>';
    
    favoriteJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <h4>${job.title}</h4>
            <p>🏢 ${job.employer}</p>
            <p>💰 ${job.payment}</p>
            <button class="btn-view" data-id="${job.id}">Ver detalhes</button>
        `;
        container.appendChild(jobCard);
    });
}

function addNewJob(jobData) {
    const newJob = {
        id: Date.now(),
        ...jobData,
        category: "geral",
        ownerId: currentUser.id,
        employer: currentUser.companyData?.companyName || currentUser.name,
        employerRating: 5.0,
        employerPhone: currentUser.companyData?.phone || currentUser.phone,
        candidates: 0
    };
    jobs.push(newJob);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    renderJobs();
    renderEmployerJobs();
    showToast('Vaga publicada com sucesso!');
}

function showJobDetails(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    document.getElementById('modal-title').textContent = job.title;
    document.getElementById('modal-employer').textContent = job.employer;
    document.getElementById('modal-payment').textContent = job.payment;
    document.getElementById('modal-location').textContent = job.location;
    document.getElementById('modal-time').textContent = job.time;
    document.getElementById('modal-description').textContent = job.description;
    
    let contactPhone = job.employerPhone || '';
    if (contactPhone) {
        const cleanPhone = contactPhone.replace(/\D/g, '');
        if (cleanPhone.length === 13) {
            const ddd = cleanPhone.substring(2, 4);
            const part1 = cleanPhone.substring(4, 9);
            const part2 = cleanPhone.substring(9);
            contactPhone = `(${ddd}) ${part1}-${part2}`;
        }
        document.getElementById('modal-contact').textContent = contactPhone;
    } else {
        document.getElementById('modal-contact').textContent = 'Não informado';
    }
    
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.setAttribute('data-id', job.id);
        favoriteBtn.innerHTML = favorites.includes(job.id) 
            ? '<i class="fas fa-heart"></i> Favoritado' 
            : '<i class="far fa-heart"></i> Favoritar';
    }
    
    document.getElementById('job-modal').style.display = 'flex';
}

function toggleFavorite(jobId) {
    const index = favorites.indexOf(jobId);
    const favoriteBtn = document.getElementById('favorite-btn');
    
    if (index === -1) {
        favorites.push(jobId);
        if (favoriteBtn) favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favoritado';
        showToast('Vaga favoritada!');
    } else {
        favorites.splice(index, 1);
        if (favoriteBtn) favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Favoritar';
        showToast('Vaga removida dos favoritos');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

function applyForJob(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const message = `Olá! Tenho interesse na vaga: ${job.title}`;
    const whatsappUrl = `https://wa.me/${ADMIN_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    showToast('Mensagem enviada para o WhatsApp!');
    document.getElementById('job-modal').style.display = 'none';
}

function searchJobs() {
    const term = document.getElementById('job-search')?.value.toLowerCase().trim() || '';
    if (!term) {
        renderJobList('all-jobs', jobs);
        return;
    }
    
    const results = jobs.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.employer.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
    );
    
    renderJobList('all-jobs', results);
    showToast(`${results.length} vagas encontradas`);
}

// ===============================
// EVENTOS
// ===============================
function setupEventListeners() {
    // Toggle telas
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('signup-screen').style.display = 'flex';
        });
    }
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signup-screen').style.display = 'none';
            document.getElementById('login-screen').style.display = 'flex';
        });
    }
    
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value || '';
            const password = document.getElementById('loginSenha')?.value || '';
            loginUser(email, password);
        });
    }
    
    // Signup
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupNome')?.value || '';
            const email = document.getElementById('signupEmail')?.value || '';
            const phone = document.getElementById('signupWhatsApp')?.value || '';
            const password = document.getElementById('signupSenha')?.value || '';
            const userType = document.getElementById('userType')?.value || 'candidato';
            registerUser(name, email, phone, password, userType);
        });
    }
    
    // Perfil candidato
    const candidateForm = document.getElementById('candidate-profile-form');
    if (candidateForm) {
        candidateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser || currentUser.type !== 'candidato') return;
            currentUser.bio = document.getElementById('profile-bio')?.value || '';
            updateUserData();
            showToast('Perfil atualizado!');
        });
    }
    
    // Perfil empresa
    const companyForm = document.getElementById('company-profile-form');
    if (companyForm) {
        companyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser || currentUser.type !== 'empregador') return;
            if (!currentUser.companyData) currentUser.companyData = {};
            currentUser.companyData.companyName = document.getElementById('company-name')?.value || '';
            currentUser.companyData.cnpj = document.getElementById('company-cnpj')?.value || '';
            currentUser.companyData.description = document.getElementById('company-description')?.value || '';
            currentUser.companyData.phone = document.getElementById('company-phone')?.value || '';
            updateUserData();
            updateCompanyInfoDisplay();
            showToast('Dados da empresa atualizados!');
        });
    }
    
    // Nova vaga
    const newJobForm = document.getElementById('new-job-form');
    if (newJobForm) {
        newJobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser || currentUser.type !== 'empregador') return;
            addNewJob({
                title: document.getElementById('job-title')?.value || '',
                payment: document.getElementById('job-payment')?.value || '',
                location: document.getElementById('job-location')?.value || '',
                time: document.getElementById('job-schedule')?.value || '',
                description: document.getElementById('job-description')?.value || ''
            });
            newJobForm.reset();
        });
    }
    
    // Dark mode
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            darkModeToggle.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('darkMode', isDark);
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Busca
    const searchBtn = document.getElementById('search-btn');
    const jobSearch = document.getElementById('job-search');
    if (searchBtn) searchBtn.addEventListener('click', searchJobs);
    if (jobSearch) jobSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchJobs();
    });
    
    // Navegação menu
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.content').forEach(c => c.style.display = 'none');
            const screenId = this.getAttribute('data-screen') + '-content';
            const contentEl = document.getElementById(screenId);
            if (contentEl) contentEl.style.display = 'block';
            if (this.getAttribute('data-screen') === 'employer') {
                renderEmployerJobs();
                updateCompanyInfoDisplay();
            }
        });
    });
    
    // Ver detalhes da vaga
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-view');
        if (btn && btn.getAttribute('data-id')) {
            const jobId = parseInt(btn.getAttribute('data-id'));
            showJobDetails(jobId);
        }
    });
    
    // Fechar modal
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('job-modal').style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Favoritar
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function() {
            const jobId = parseInt(this.getAttribute('data-id'));
            toggleFavorite(jobId);
        });
    }
    
    // Aplicar
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const favBtn = document.getElementById('favorite-btn');
            const jobId = parseInt(favBtn?.getAttribute('data-id') || '0');
            applyForJob(jobId);
        });
    }
}

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toast-message').textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) toggle.textContent = '☀️';
    }
}

function showMainScreen() {
    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');
    const mainScreen = document.getElementById('main-screen');
    const homeContent = document.getElementById('home-content');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (signupScreen) signupScreen.style.display = 'none';
    if (mainScreen) mainScreen.style.display = 'flex';
    if (homeContent) homeContent.style.display = 'block';
}