// --- LÓGICA DE NAVEGAÇÃO (EXISTENTE) ---
document.querySelectorAll("div.menu .btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    // Remove 'active' de todos os botões
    document
      .querySelectorAll("div.menu .btn")
      .forEach((b) => b.classList.remove("active"));

    // Esconde todas as seções
    document
      .querySelectorAll("section")
      .forEach((s) => (s.style.display = "none"));

    // Botão clicado
    const el = e.currentTarget;
    el.classList.add("active");

    // Mostra apenas a seção correspondente à classe do botão
    if (el.classList.contains("catalogo")) {
      document.querySelector("section.catalogo").style.display = "flex";
    }
    if (el.classList.contains("sobre")) {
      document.querySelector("section.sobre").style.display = "flex";
    }
    if (el.classList.contains("inscricao")) {
      document.querySelector("section.inscricao").style.display = "flex";
    }
    if (el.classList.contains("mapa")) {
      document.querySelector("section.mapa").style.display = "flex";
    }
  });
});

// --- LÓGICA DO POPUP (EXISTENTE E NOVA) ---

const popup = document.querySelector("div.popup");
const container = document.querySelector("div.popup .container");
const btnClose = document.querySelector("div.popup .btn-close");
const catalogoContainer = document.getElementById("catalogo-container");

// Esconde o popup inicialmente
popup.style.display = "none";

// Fecha ao clicar no X
btnClose.addEventListener("click", () => {
  popup.style.display = "none";
});

// Fecha ao clicar no fundo (fora do container)
popup.addEventListener("click", (e) => {
  if (!container.contains(e.target)) {
    popup.style.display = "none";
  }
});

// --- NOVO: LÓGICA DE CARREGAMENTO DO CATÁLOGO ---

/**
 * Função principal para carregar e renderizar o catálogo a partir do JSON.
 */
async function carregarCatalogo() {
    try {
        const response = await fetch('./dados.json');
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados: ${response.statusText}`);
        }
        const dados = await response.json();
        renderizarCatalogo(dados);
    } catch (error) {
        console.error('Falha ao carregar catálogo:', error);
        if (catalogoContainer) {
            catalogoContainer.innerHTML = "<p>Erro ao carregar o catálogo. Tente novamente mais tarde.</p>";
        }
    }
}

/**
 * Renderiza os dados do catálogo no HTML.
 * @param {Array} dados - O array de artistas vindo do dados.json.
 */
function renderizarCatalogo(dados) {
    if (!catalogoContainer) return;

    // 1. Agrupa os artistas por segmento
    const segmentos = dados.reduce((acc, artista) => {
        const segmento = artista.Segmento || 'Outros';
        if (!acc[segmento]) {
            acc[segmento] = [];
        }
        acc[segmento].push(artista);
        return acc;
    }, {});

    // 2. Limpa o contêiner
    catalogoContainer.innerHTML = '';

    // 3. Cria o HTML para cada segmento
    for (const segmento in segmentos) {
        const artistas = segmentos[segmento];
        
        const divContainerGrupo = document.createElement('div');
        divContainerGrupo.className = 'container-grupos';
        
        const divChapeu = document.createElement('div');
        divChapeu.className = 'chapeu';
        divChapeu.textContent = segmento;
        divContainerGrupo.appendChild(divChapeu);

        // --- NOVO: Criar setas de navegação ---
        const btnLeft = document.createElement('div');
        btnLeft.className = 'scroll-arrow left';
        btnLeft.innerHTML = '&#10094;'; // Símbolo <

        const btnRight = document.createElement('div');
        btnRight.className = 'scroll-arrow right';
        btnRight.innerHTML = '&#10095;'; // Símbolo >
        // --- Fim da NOVIDADE ---

        const divLista = document.createElement('div');
        divLista.className = 'lista';

        // 4. Cria o card para cada artista
        artistas.forEach(artista => {
            const divArtista = document.createElement('div');
            // Adiciona uma classe genérica 'artista' para facilitar a seleção
            divArtista.className = 'artista'; 
            
            divArtista.innerHTML = `
                <img src="./imagens/${artista.Foto}" alt="${artista["Artista/Grupo"]}" onerror="this.src='https://placehold.co/220x150/311E6D/C1B3D6?text=Foto indisp.'">
                <p class="nome">${artista["Artista/Grupo"]}</p>
            `;

            // Armazena todos os dados no elemento para usar no popup
            // Converte quebras de linha \n em tags <br> para o HTML
            const sobreHtml = artista.Sobre.replace(/\n/g, '<br><br>');

            divArtista.dataset.segmento = artista.Segmento;
            divArtista.dataset.nome = artista["Artista/Grupo"];
            divArtista.dataset.bairro = artista.Bairro;
            divArtista.dataset.sobre = sobreHtml; // Armazena como HTML
            divArtista.dataset.foto = artista.Foto;
            divArtista.dataset.credito = artista["Credito Foto"];
            divArtista.dataset.redes = artista["Redes sociais"];
            divArtista.dataset.spotify = artista.Spotify;

            // Adiciona o listener de clique para abrir o popup
            divArtista.addEventListener('click', () => abrirPopup(divArtista.dataset));

            divLista.appendChild(divArtista);
        });

        divContainerGrupo.appendChild(divLista);
        
        // --- NOVO: Adicionar setas ao container ---
        divContainerGrupo.appendChild(btnLeft);
        divContainerGrupo.appendChild(btnRight);
        // --- Fim da NOVIDADE ---

        catalogoContainer.appendChild(divContainerGrupo);
    }

    // --- NOVO: Iniciar a lógica do carrossel depois que tudo for renderizado ---
    initCarousels();
}

/**
 * Preenche e abre o popup com os dados do artista clicado.
 * @param {Object} data - O objeto dataset do elemento do artista.
 */
function abrirPopup(data) {
    // Popula o popup
    const popupImg = popup.querySelector('.imagem .container-foto img');
    popupImg.src = `./imagens/${data.foto}`;
    popupImg.alt = data.nome;
    popupImg.onerror = () => { popupImg.src = 'https://placehold.co/288x417/311E6D/C1B3D6?text=Foto indisp.'; };

    popup.querySelector('.imagem p.credito').innerHTML = `<strong>Crédito:</strong> ${data.credito}`;
    
    popup.querySelector('.infos .chapeu').textContent = data.segmento;
    popup.querySelector('.infos p.nome').textContent = data.nome;
    popup.querySelector('.infos p.bairro').textContent = data.bairro;
    
    // Usa innerHTML para renderizar as quebras de linha <br>
    popup.querySelector('.infos .biografia').innerHTML = `<p>${data.sobre}</p>`; 

    // Popula as redes sociais
    const redesContainer = popup.querySelector('.infos .redes-sociais');
    redesContainer.innerHTML = ''; // Limpa antes de adicionar

    if (data.redes && data.redes.trim() !== "") {
        let urlInstagram = data.redes.trim();
        if (urlInstagram.startsWith('@')) {
            urlInstagram = `https://www.instagram.com/${urlInstagram.substring(1)}`;
        } else if (!urlInstagram.startsWith('http')) {
            // Se não for um @ nem um link http, assume que é um usuário
             urlInstagram = `https://www.instagram.com/${urlInstagram}`; 
        }
        
        redesContainer.innerHTML += `
            <a href="${urlInstagram}" target="_blank" rel="noopener noreferrer"><p class="instagram">Instagram</p></a>
        `;
    }

    if (data.spotify && data.spotify.trim() !== "") {
        redesContainer.innerHTML += `
            <a href="${data.spotify}" target="_blank" rel="noopener noreferrer"><p class="spotify">Spotify</p></a>
        `;
    }

    // Botão de compartilhar (genérico) - descomente se quiser
    // redesContainer.innerHTML += `
    //     <a href="#"><p class="compartilhar">Compartilhar</p></a>
    // `;

    // Mostra o popup
    popup.style.display = "flex";
}


// Inicia o carregamento do catálogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarCatalogo);

// --- NOVO: Função para iniciar os carrosséis ---

/**
 * Adiciona a lógica de clique e visibilidade das setas para todos os carrosséis.
 */
function initCarousels() {
    document.querySelectorAll('.container-grupos').forEach(container => {
        const lista = container.querySelector('.lista');
        const btnLeft = container.querySelector('.scroll-arrow.left');
        const btnRight = container.querySelector('.scroll-arrow.right');

        if (!lista || !btnLeft || !btnRight) return;

        const scrollAmount = 400; // Quantidade de pixels para rolar

        // Lógica de clique
        btnLeft.addEventListener('click', () => {
            lista.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        btnRight.addEventListener('click', () => {
            lista.scrollBy({ left: +scrollAmount, behavior: 'smooth' });
        });

        // Lógica para mostrar/esconder setas
        function updateArrowVisibility() {
            // Verifica se há mais conteúdo do que o visível (com uma margem de 5px)
            const hasOverflow = lista.scrollWidth > lista.clientWidth + 5;
            
            // Adiciona/remove uma classe no container para mostrar/esconder ambas as setas
            container.classList.toggle('has-overflow', hasOverflow);

            if (hasOverflow) {
                // Esconde a seta da esquerda se estiver no início
                btnLeft.style.visibility = lista.scrollLeft > 0 ? 'visible' : 'hidden';
                
                // Calcula se está no fim (com uma margem de 1px)
                const atEnd = lista.scrollWidth - lista.clientWidth - lista.scrollLeft < 1;
                btnRight.style.visibility = atEnd ? 'hidden' : 'visible';
            }
        }

        // Adiciona um listener de scroll na *lista*
        lista.addEventListener('scroll', updateArrowVisibility);

        // Adiciona um ResizeObserver para recalcular se o tamanho da lista mudar
        // (Isso é robusto e cobre redimensionamento da janela)
        new ResizeObserver(updateArrowVisibility).observe(lista);

        // Chama a função uma vez no início para definir o estado inicial
        updateArrowVisibility();
    });
}