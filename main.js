
const APP_STATE = {
  dados: [],
  mapa: null,
  markers: []
};

const ROUTES = {
  '/': 'catalogo',
  '/catalogo': 'catalogo',
  '/mapa': 'mapa',
  '/sobre': 'sobre',
  '/inscricao': 'inscricao'
};

const popup = document.querySelector('div.popup');
const popupContainer = document.querySelector('div.popup .container');
const btnClose = document.querySelector('div.popup .btn-close');
const catalogoContainer = document.getElementById('catalogo-container');
const searchInput = document.getElementById('catalogo-busca');
const bairroSelect = document.getElementById('catalogo-bairro');
const totalResultadosEl = document.getElementById('catalogo-total-resultados');
const totalSegmentosEl = document.getElementById('catalogo-total-segmentos');
const limparBuscaBtn = document.getElementById('catalogo-limpar');

const MAPBOX_TOKEN = window.MAPBOX_TOKEN || '';

const CORES_SEGMENTO = {
  'Folguedo': '#F06292',
  'Música': '#7C4DFF',
  'Artesanato': '#FF8A65',
  'Cultura Popular': '#26C6DA',
  'Teatro': '#FFD54F',
  'Audiovisual': '#66BB6A',
  'Literatura': '#B39DDB',
  'Outros': '#A96BD0'
};

const ICONES_SEGMENTO = {
  'Folguedo': '✦',
  'Música': '♪',
  'Artesanato': '◆',
  'Cultura Popular': '★',
  'Teatro': '◭',
  'Audiovisual': '▣',
  'Literatura': '✎',
  'Outros': '•'
};

popup.style.display = 'none';

btnClose.addEventListener('click', () => {
  popup.style.display = 'none';
});

popup.addEventListener('click', (e) => {
  if (!popupContainer.contains(e.target)) {
    popup.style.display = 'none';
  }
});

const ASSET_PREFIX = /^\/(catalogo|mapa|sobre|inscricao)(\/|$)/.test(window.location.pathname) ? '../' : './';

function getAssetPath(relativePath) {
  return `${ASSET_PREFIX}${relativePath}`;
}

function showSection(sectionName, { push = true } = {}) {
  document.querySelectorAll('div.menu .btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('section').forEach((section) => (section.style.display = 'none'));

  const targetSection = document.querySelector(`section.${sectionName}`);
  const targetButton = document.querySelector(`div.menu .btn.${sectionName}`);

  if (targetSection) targetSection.style.display = 'flex';
  if (targetButton) targetButton.classList.add('active');

  const targetPath = sectionName === 'catalogo' ? '/catalogo' : `/${sectionName}`;
  if (push && window.location.pathname !== targetPath) {
    history.pushState({ sectionName }, '', targetPath);
  }

if (sectionName === 'mapa' && APP_STATE.mapa) {
  setTimeout(() => {
    APP_STATE.mapa.resize();
    aplicarEnquadramentoMapa(APP_STATE.mapa, APP_STATE.dados);
  }, 120);
}
}

function routeFromLocation() {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  return ROUTES[pathname] || 'catalogo';
}

function initMenuRouting() {
  document.querySelectorAll('div.menu .btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const classes = ['catalogo', 'mapa', 'inscricao', 'sobre'];
      const sectionName = classes.find((name) => e.currentTarget.classList.contains(name));
      if (sectionName) showSection(sectionName, { push: true });
    });
  });

  window.addEventListener('popstate', () => {
    showSection(routeFromLocation(), { push: false });
  });
}

async function carregarCatalogo() {
  try {
    const response = await fetch(getAssetPath('data/dados.json'));
    if (!response.ok) throw new Error(`Erro ao carregar dados: ${response.statusText}`);

    const dados = await response.json();
    APP_STATE.dados = dados;
    preencherFiltroBairro(dados);
    renderizarCatalogo(dados);
    inicializarMapa(dados);
    showSection(routeFromLocation(), { push: false });
  } catch (error) {
    console.error('Falha ao carregar catálogo:', error);
    if (catalogoContainer) {
      catalogoContainer.innerHTML = "<p style='color: #C1B3D6;'>Erro ao carregar o catálogo. Verifique se o arquivo './data/dados.json' existe e tente novamente mais tarde.</p>";
    }
  }
}

function preencherFiltroBairro(dados) {
  if (!bairroSelect) return;
  const bairros = [...new Set(dados.map((item) => (item.Bairro || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  bairroSelect.innerHTML = '<option value="">Todos os bairros</option>' + bairros.map((bairro) => `<option value="${bairro}">${bairro}</option>`).join('');
}

function getDadosFiltrados() {
  const termo = (searchInput?.value || '').trim().toLowerCase();
  const bairroSelecionado = (bairroSelect?.value || '').trim().toLowerCase();

  return APP_STATE.dados.filter((item) => {
    const nome = (item['Artista/Grupo'] || '').toLowerCase();
    const bairro = (item.Bairro || '').toLowerCase();

    const matchNome = !termo || nome.includes(termo);
    const matchBairro = !bairroSelecionado || bairro === bairroSelecionado;

    return matchNome && matchBairro;
  });
}

function atualizarResumoCatalogo(dadosFiltrados, totalSegmentos) {
  if (totalResultadosEl) totalResultadosEl.textContent = String(dadosFiltrados.length);
  if (totalSegmentosEl) totalSegmentosEl.textContent = String(totalSegmentos);
}

function renderizarCatalogo(dados) {
  if (!catalogoContainer) return;

  const segmentos = dados.reduce((acc, artista) => {
    const segmento = artista.Segmento || 'Outros';
    if (!acc[segmento]) acc[segmento] = [];
    acc[segmento].push(artista);
    return acc;
  }, {});

  catalogoContainer.innerHTML = '';
  const segmentosOrdenados = Object.entries(segmentos).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'pt-BR'));
  atualizarResumoCatalogo(dados, segmentosOrdenados.length);

  if (!segmentosOrdenados.length) {
    catalogoContainer.innerHTML = '<div class="catalogo-vazio">Nenhum grupo ou artista encontrado com esse filtro.</div>';
    return;
  }

  segmentosOrdenados.forEach(([segmento, artistas]) => {
    const divContainerGrupo = document.createElement('div');
    divContainerGrupo.className = 'container-grupos';

    const divChapeu = document.createElement('div');
    divChapeu.className = 'chapeu';
    divChapeu.textContent = `${segmento}`;
    divContainerGrupo.appendChild(divChapeu);

    const btnLeft = document.createElement('div');
    btnLeft.className = 'scroll-arrow left';
    btnLeft.innerHTML = '&#10094;';

    const btnRight = document.createElement('div');
    btnRight.className = 'scroll-arrow right';
    btnRight.innerHTML = '&#10095;';

    const divLista = document.createElement('div');
    divLista.className = 'lista';

    artistas.forEach((artista) => {
      const divArtista = document.createElement('div');
      divArtista.className = 'artista';
      divArtista.innerHTML = `
        <img src="${getAssetPath(`imagens/${artista.Foto}`)}" alt="${artista['Artista/Grupo']}" onerror="this.src='https://placehold.co/320x220/311E6D/C1B3D6?text=Foto+indisp.'">
        <p class="nome">${artista['Artista/Grupo']}</p>
        <p class="bairro-card">${artista.Bairro || 'Bairro não informado'}</p>
      `;

      divArtista.dataset.segmento = artista.Segmento || '';
      divArtista.dataset.nome = artista['Artista/Grupo'] || '';
      divArtista.dataset.bairro = artista.Bairro || '';
      divArtista.dataset.sobre = (artista.Sobre || '').replace(/\n/g, '<br>');
      divArtista.dataset.foto = artista.Foto || '';
      divArtista.dataset.credito = artista['Credito Foto'] || '';
      divArtista.dataset.redes = artista['Redes sociais'] || '';
      divArtista.dataset.spotify = artista.Spotify || '';
      divArtista.addEventListener('click', () => abrirPopup(divArtista.dataset));
      divLista.appendChild(divArtista);
    });

    divContainerGrupo.appendChild(divLista);
    divContainerGrupo.appendChild(btnLeft);
    divContainerGrupo.appendChild(btnRight);
    catalogoContainer.appendChild(divContainerGrupo);
  });

  initCarousels();
}

function abrirPopup(data) {
  const popupImg = popup.querySelector('.imagem .container-foto img');
  popupImg.src = getAssetPath(`imagens/${data.foto}`);
  popupImg.alt = data.nome;
  popupImg.onerror = () => {
    popupImg.src = 'https://placehold.co/288x417/311E6D/C1B3D6?text=Foto+indisp.';
  };

  popup.querySelector('.imagem p.credito').innerHTML = `<strong>Crédito:</strong> ${data.credito || 'Divulgação'}`;
  popup.querySelector('.infos .chapeu').textContent = data.segmento;
  popup.querySelector('.infos p.nome').textContent = data.nome;
  popup.querySelector('.infos p.bairro').textContent = data.bairro || 'Bairro não informado';
  popup.querySelector('.infos .biografia').innerHTML = `<p>${data.sobre || 'Biografia não informada.'}</p>`;

  const redesContainer = popup.querySelector('.infos .redes-sociais');
  redesContainer.innerHTML = '';

  if (data.redes && data.redes.trim()) {
    let urlInstagram = data.redes.trim();
    if (urlInstagram.startsWith('@')) {
      urlInstagram = `https://www.instagram.com/${urlInstagram.substring(1)}`;
    } else if (!urlInstagram.startsWith('http')) {
      urlInstagram = `https://www.instagram.com/${urlInstagram}`;
    }

    redesContainer.innerHTML += `<a href="${urlInstagram}" target="_blank" rel="noopener noreferrer"><p class="instagram">Instagram</p></a>`;
  }

  if (data.spotify && data.spotify.trim()) {
    redesContainer.innerHTML += `<a href="${data.spotify}" target="_blank" rel="noopener noreferrer"><p class="spotify">Spotify</p></a>`;
  }

  popup.style.display = 'flex';
}

function initCarousels() {
  document.querySelectorAll('.container-grupos').forEach((container) => {
    const lista = container.querySelector('.lista');
    const btnLeft = container.querySelector('.scroll-arrow.left');
    const btnRight = container.querySelector('.scroll-arrow.right');
    if (!lista || !btnLeft || !btnRight) return;

    const scrollAmount = 400;
    btnLeft.onclick = () => lista.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    btnRight.onclick = () => lista.scrollBy({ left: scrollAmount, behavior: 'smooth' });

    function updateArrowVisibility() {
      const hasOverflow = lista.scrollWidth > lista.clientWidth + 5;
      container.classList.toggle('has-overflow', hasOverflow);
      if (hasOverflow) {
        btnLeft.style.visibility = lista.scrollLeft > 0 ? 'visible' : 'hidden';
        const atEnd = lista.scrollWidth - lista.clientWidth - lista.scrollLeft < 1;
        btnRight.style.visibility = atEnd ? 'hidden' : 'visible';
      }
    }

    lista.addEventListener('scroll', updateArrowVisibility);
    window.addEventListener('resize', updateArrowVisibility);
    updateArrowVisibility();
  });
}

function applyCatalogoFiltros() {
  renderizarCatalogo(getDadosFiltrados());
}

function initBuscaCatalogo() {
  if (searchInput) searchInput.addEventListener('input', applyCatalogoFiltros);
  if (bairroSelect) bairroSelect.addEventListener('change', applyCatalogoFiltros);
  if (limparBuscaBtn) {
    limparBuscaBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (bairroSelect) bairroSelect.value = '';
      applyCatalogoFiltros();
    });
  }
}

function criarMarkerElement(item, cor, icone) {
  const wrapper = document.createElement('button');
  wrapper.className = 'marker-wrapper';
  wrapper.type = 'button';
  wrapper.setAttribute('aria-label', `${item['Artista/Grupo']} - ${item.Segmento || 'Outros'}`);

  const marker = document.createElement('div');
  marker.className = 'custom-marker';
  marker.style.setProperty('--marker-color', cor);
  marker.innerHTML = `<span>${icone}</span>`;

  wrapper.appendChild(marker);
  return wrapper;
}

function inicializarMapa(dados) {
  const mapaEl = document.getElementById('mapbox-mapa');
  if (!mapaEl || typeof mapboxgl === 'undefined') return;

  mapboxgl.accessToken = MAPBOX_TOKEN;
  const comCoordenadas = dados.filter((item) => item.lat !== '' && item.long !== '' && !isNaN(Number(item.lat)) && !isNaN(Number(item.long)));
  const semCoordenadas = dados.length - comCoordenadas.length;

  const totalPontosEl = document.getElementById('mapa-total-pontos');
  const semCoordsEl = document.getElementById('mapa-sem-coordenadas');
  if (totalPontosEl) totalPontosEl.textContent = String(comCoordenadas.length);
  if (semCoordsEl) semCoordsEl.textContent = String(semCoordenadas);

const mapa = new mapboxgl.Map({
  container: 'mapbox-mapa',
  style: 'mapbox://styles/mapbox/dark-v11',
  center: MAPA_CONFIG.centroMaceio,
  zoom: MAPA_CONFIG.zoomInicial,
  pitch: 0,
  attributionControl: false
});

  APP_STATE.mapa = mapa;
  mapa.addControl(new mapboxgl.NavigationControl(), 'top-right');
  mapa.addControl(new mapboxgl.AttributionControl({ compact: true }));

  mapa.on('style.load', () => {
    mapa.setFog({});
    const paintLayers = ['background', 'landuse', 'landuse-overlay', 'park', 'building', 'road-primary', 'road-secondary', 'road-street', 'bridge-road'];
    if (mapa.getLayer('water')) mapa.setPaintProperty('water', 'fill-color', '#0A1538');

    paintLayers.forEach((layerId) => {
      if (!mapa.getLayer(layerId)) return;
      try {
        const layer = mapa.getLayer(layerId);
        if (layer.type === 'background') mapa.setPaintProperty(layerId, 'background-color', '#050519');
        if (layer.type === 'fill' && ['landuse', 'landuse-overlay', 'park', 'building'].includes(layerId)) {
          mapa.setPaintProperty(layerId, 'fill-color', layerId === 'building' ? '#1A1430' : '#0D0B23');
          mapa.setPaintProperty(layerId, 'fill-opacity', layerId === 'building' ? 0.75 : 0.6);
        }
        if (layer.type === 'line' && ['road-primary', 'road-secondary', 'road-street', 'bridge-road'].includes(layerId)) {
          mapa.setPaintProperty(layerId, 'line-color', layerId === 'road-primary' ? '#7A5CE0' : '#493872');
          mapa.setPaintProperty(layerId, 'line-opacity', layerId === 'road-primary' ? 0.55 : 0.35);
        }
      } catch (error) {
        console.warn('Não foi possível ajustar camada do mapa:', layerId, error);
      }
    });
  });

  const bounds = new mapboxgl.LngLatBounds();
  const hoverPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 18,
    className: 'mapa-tooltip-popup'
  });

  comCoordenadas.forEach((item) => {
    const segmento = item.Segmento || 'Outros';
    const cor = CORES_SEGMENTO[segmento] || CORES_SEGMENTO.Outros;
    const icone = ICONES_SEGMENTO[segmento] || ICONES_SEGMENTO.Outros;

    const el = criarMarkerElement(item, cor, icone);
    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([Number(item.long), Number(item.lat)])
      .addTo(mapa);

    APP_STATE.markers.push(marker);

    const tooltipHtml = `
      <div class="mapa-tooltip">
        <div class="tag">${segmento}</div>
        <strong>${item['Artista/Grupo']}</strong>
        <p>${item.Bairro || 'Bairro não informado'}</p>
      </div>
    `;

    el.addEventListener('mouseenter', () => {
      hoverPopup.setLngLat([Number(item.long), Number(item.lat)]).setHTML(tooltipHtml).addTo(mapa);
    });
    el.addEventListener('mouseleave', () => hoverPopup.remove());
    el.addEventListener('click', () => {
      abrirPopup({
        segmento: item.Segmento || '',
        nome: item['Artista/Grupo'] || '',
        bairro: item.Bairro || '',
        sobre: item.Sobre || '',
        foto: item.Foto || '',
        credito: item['Credito Foto'] || '',
        redes: item['Redes sociais'] || '',
        spotify: item.Spotify || ''
      });
    });

    bounds.extend([Number(item.long), Number(item.lat)]);
  });


mapa.on('load', () => {
  aplicarEnquadramentoMapa(mapa, dados);
});

  renderizarLegendaMapa(dados);
  window.addEventListener('resize', () => mapa.resize());
}

function renderizarLegendaMapa(dados) {
  const legenda = document.getElementById('mapa-legenda');
  if (!legenda) return;

  const contagem = dados.reduce((acc, item) => {
    const segmento = item.Segmento || 'Outros';
    acc[segmento] = (acc[segmento] || 0) + 1;
    return acc;
  }, {});

  legenda.innerHTML = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .map(([segmento, total]) => {
      const cor = CORES_SEGMENTO[segmento] || CORES_SEGMENTO.Outros;
      return `
        <div class="legenda-item">
          <span class="legenda-cor" style="background:${cor}"></span>
          <span>${segmento}</span>
          <small>${total}</small>
        </div>
      `;
    })
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initMenuRouting();
  initBuscaCatalogo();
  carregarCatalogo();
});


const MAPA_CONFIG = {
  centroMaceio: [-35.735, -9.6658],
  zoomInicial: 11.9,
  maxZoomFit: 12.2
};

function getBoundsDados(dados) {
  const bounds = new mapboxgl.LngLatBounds();

  dados
    .filter((item) => item.lat !== '' && item.long !== '' && !isNaN(Number(item.lat)) && !isNaN(Number(item.long)))
    .forEach((item) => {
      bounds.extend([Number(item.long), Number(item.lat)]);
    });

  return bounds;
}

function aplicarEnquadramentoMapa(mapa, dados) {
  const bounds = getBoundsDados(dados);

  if (bounds.isEmpty()) {
    mapa.jumpTo({
      center: MAPA_CONFIG.centroMaceio,
      zoom: MAPA_CONFIG.zoomInicial
    });
    return;
  }

  mapa.fitBounds(bounds, {
    padding: { top: 70, bottom: 70, left: 70, right: 70 },
    maxZoom: MAPA_CONFIG.maxZoomFit,
    duration: 0
  });

  mapa.once('moveend', () => {
    mapa.easeTo({
      center: MAPA_CONFIG.centroMaceio,
      duration: 0
    });
  });
}

