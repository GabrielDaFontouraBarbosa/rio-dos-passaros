document.addEventListener('DOMContentLoaded', () => {
  const secaoMapa = document.getElementById('mapa');
  if (!secaoMapa) return;

  const GEOJSON_URL = 'data/br_states.json';

  const corRegiaoRaw = { N: '#2e86ab', NE: '#d9a441', CO: '#7a9e5c', SE: '#c0563e', S: '#8e6bb0' };

  const nomeRegiao = {
    N:  { pt: 'Norte',        en: 'North' },
    NE: { pt: 'Nordeste',     en: 'Northeast' },
    CO: { pt: 'Centro-Oeste', en: 'Midwest' },
    SE: { pt: 'Sudeste',      en: 'Southeast' },
    S:  { pt: 'Sul',          en: 'South' }
  };

  const biomaRegiao = {
    N:  { pt: 'Floresta Amazônica',                  en: 'Amazon Rainforest' },
    NE: { pt: 'Caatinga',                             en: 'Caatinga (semi-arid scrubland)' },
    CO: { pt: 'Cerrado e Pantanal',                   en: 'Cerrado savanna and Pantanal wetlands' },
    SE: { pt: 'Mata Atlântica',                       en: 'Atlantic Forest' },
    S:  { pt: 'Mata de Araucárias e Pampa',           en: 'Araucaria forest and Pampas grasslands' }
  };

  const AVES = {
    N: [
      { pt: 'Harpia (Gavião-real)', en: 'Harpy Eagle', latim: 'Harpia harpyja',
        habitat_pt: 'Copas de florestas tropicais densas e conservadas; uma das maiores aves de rapina do mundo, caça macacos e preguiças.',
        habitat_en: 'Canopy of dense, well-preserved tropical rainforest; one of the largest birds of prey in the world.' },
      { pt: 'Arara-vermelha', en: 'Red-and-green Macaw', latim: 'Ara chloropterus',
        habitat_pt: 'Dossel da floresta e áreas com árvores altas, onde nidifica em ocos de troncos.',
        habitat_en: 'Forest canopy and areas with tall trees, where it nests in tree hollows.' },
      { pt: 'Uirapuru-verdadeiro', en: 'Musician Wren', latim: 'Cyphorhinus arada',
        habitat_pt: 'Interior de mata fechada e úmida; símbolo sonoro da Amazônia, com canto muito admirado.',
        habitat_en: 'Interior of dense, humid forest; a sound symbol of the Amazon.' },
      { pt: 'Galo-da-serra', en: 'Guianan Cock-of-the-rock', latim: 'Rupicola rupicola',
        habitat_pt: 'Áreas rochosas próximas a cachoeiras e rios de corredeira, na floresta de terra firme.',
        habitat_en: 'Rocky outcrops near waterfalls and fast-flowing rivers.' },
      { pt: 'Ararajuba (Guaruba)', en: 'Golden Parakeet', latim: 'Guaruba guarouba',
        habitat_pt: 'Floresta primária no Pará; espécie rara e ameaçada por perda de habitat e tráfico.',
        habitat_en: 'Primary forest in the state of Pará; a rare and threatened species.' }
    ],
    NE: [
      { pt: 'Soldadinho-do-araripe', en: 'Araripe Manakin', latim: 'Antilophia bokermanni',
        habitat_pt: 'Matas de galeria da Chapada do Araripe (CE); ave restrita a essa única região, ameaçada de extinção.',
        habitat_en: 'Gallery forests of the Chapada do Araripe (Ceará); found nowhere else on Earth.' },
      { pt: 'Arara-azul-de-Lear', en: "Lear's Macaw", latim: 'Anodorhynchus leari',
        habitat_pt: 'Paredões rochosos (canga) da Bahia, onde nidifica em fendas; alimenta-se do fruto do licuri.',
        habitat_en: 'Sandstone canyon cliffs in Bahia, where it nests in crevices.' },
      { pt: 'Jacucaca', en: 'White-browed Guan', latim: 'Penelope jacucaca',
        habitat_pt: 'Mata seca arbóreo-arbustiva da Caatinga; espécie endêmica e ameaçada.',
        habitat_en: 'Dry, shrubby woodland of the Caatinga; an endemic and threatened species.' },
      { pt: 'Asa-branca', en: 'Picazuro Pigeon', latim: 'Patagioenas picazuro',
        habitat_pt: 'Áreas abertas e caatinga arbustiva; símbolo popular da resistência do sertão nordestino.',
        habitat_en: 'Open areas and scrubby caatinga; a popular symbol of resilience.' },
      { pt: 'Carcará', en: 'Southern Caracara', latim: 'Caracara plancus',
        habitat_pt: 'Campos abertos e semiáridos; ave de rapina generalista, comum em toda a região.',
        habitat_en: 'Open, semi-arid country; a generalist bird of prey.' }
    ],
    CO: [
      { pt: 'Tuiuiú', en: 'Jabiru', latim: 'Jabiru mycteria',
        habitat_pt: 'Brejos, lagoas e áreas alagadas do Pantanal; maior ave voadora da região e símbolo do bioma.',
        habitat_en: "Marshes, lagoons and flooded plains of the Pantanal; the region's symbol." },
      { pt: 'Arara-azul-grande', en: 'Hyacinth Macaw', latim: 'Anodorhynchus hyacinthinus',
        habitat_pt: 'Palmeirais de buriti e acuri no Pantanal e Cerrado; o maior papagaio do mundo.',
        habitat_en: 'Palm groves of buriti and acuri in the Pantanal and Cerrado; the largest parrot in the world.' },
      { pt: 'Tucanuçu', en: 'Toco Toucan', latim: 'Ramphastos toco',
        habitat_pt: 'Matas ciliares e cerradão; o maior tucano do Brasil, com bico alaranjado bem característico.',
        habitat_en: "Gallery forest and wooded savanna; Brazil's largest toucan." },
      { pt: 'Ema', en: 'Greater Rhea', latim: 'Rhea americana',
        habitat_pt: 'Campos abertos do Cerrado; maior ave do Brasil, não voa e vive em bandos.',
        habitat_en: "Open grasslands of the Cerrado; Brazil's largest bird, flightless." },
      { pt: 'Seriema', en: 'Red-legged Seriema', latim: 'Cariama cristata',
        habitat_pt: 'Campos e savanas do Cerrado; terrícola, caminha pelo campo caçando pequenos animais.',
        habitat_en: 'Grasslands and savanna of the Cerrado; a ground-dwelling bird.' }
    ],
    SE: [
      { pt: 'Sabiá-laranjeira', en: 'Rufous-bellied Thrush', latim: 'Turdus rufiventris',
        habitat_pt: 'Matas, jardins e áreas urbanas arborizadas; eleita a ave-símbolo nacional do Brasil.',
        habitat_en: "Forests, gardens and wooded urban areas; Brazil's official national bird." },
      { pt: 'Papagaio-de-peito-roxo', en: 'Vinaceous-breasted Parrot', latim: 'Amazona vinacea',
        habitat_pt: 'Remanescentes de Mata Atlântica e matas de araucária; uma das aves mais ameaçadas do país.',
        habitat_en: "Remnants of Atlantic Forest and araucaria woodland; one of Brazil's most endangered birds." },
      { pt: 'Surucuá-de-barriga-amarela', en: 'Black-throated Trogon', latim: 'Trogon rufus',
        habitat_pt: 'Interior de mata fechada, alimentando-se principalmente de insetos.',
        habitat_en: 'Interior of dense forest, feeding mainly on insects.' },
      { pt: 'Gavião-caranguejeiro', en: 'Rufous Crab Hawk', latim: 'Buteogallus aequinoctialis',
        habitat_pt: 'Manguezais e restingas do litoral sudestino, caçando caranguejos e pequenos animais aquáticos.',
        habitat_en: 'Mangroves and coastal restinga habitat, hunting crabs and small aquatic animals.' }
    ],
    S: [
      { pt: 'Gralha-azul', en: 'Azure Jay', latim: 'Cyanocorax caeruleus',
        habitat_pt: 'Florestas de araucária; ave-símbolo do Paraná e principal dispersora das sementes do pinhão.',
        habitat_en: 'Araucaria forests; the symbol bird of Paraná and main disperser of araucaria seeds.' },
      { pt: 'Papagaio-de-peito-roxo', en: 'Vinaceous-breasted Parrot', latim: 'Amazona vinacea',
        habitat_pt: 'Matas de araucária no Rio Grande do Sul e Santa Catarina, dependente das sementes de pinhão.',
        habitat_en: 'Araucaria forests in Rio Grande do Sul and Santa Catarina, dependent on araucaria seeds.' },
      { pt: 'Jacutinga', en: 'Black-fronted Piping-Guan', latim: 'Pipile jacutinga',
        habitat_pt: 'Sub-bosque de mata com araucárias; espécie ameaçada, sensível à caça e fragmentação florestal.',
        habitat_en: 'Understory of araucaria forest; an endangered species sensitive to hunting.' },
      { pt: 'Quero-quero', en: 'Southern Lapwing', latim: 'Vanellus chilensis',
        habitat_pt: 'Campos abertos e pampas; ave territorialista, muito comum em pastagens do Sul.',
        habitat_en: 'Open fields and pampas grassland; a territorial bird common in pastures.' }
    ]
  };

  function renderAves(regiao) {
    const grid = d3.select('#mapa-aves-grid');
    const aves = AVES[regiao];
    const r = nomeRegiao[regiao] || { pt: '-', en: '-' };
    const b = biomaRegiao[regiao] || { pt: '-', en: '-' };
    const cor = corRegiaoRaw[regiao] || '#ccc';

    if (!aves) {
      grid.html('<div class="mapa-placeholder">Sem dados de aves para esta região. <span class="en">(No bird data for this region.)</span></div>');
      return;
    }

    d3.select('#mapa-aves-titulo').html(`Aves Nativas — ${r.pt} <span class="en">(Native Birds — ${r.en})</span>`);
    d3.select('#mapa-aves-subtitulo').html(`Bioma: ${b.pt} <span class="en">(Biome: ${b.en})</span>`);

    grid.html('');
    grid.selectAll('.mapa-ave-card')
      .data(aves)
      .join('div')
      .attr('class', 'mapa-ave-card')
      .style('--mapa-cor-regiao', cor)
      .html(ave => `
        <div class="mapa-ave-nome">${ave.pt} <span class="en">(${ave.en})</span></div>
        <div class="mapa-ave-latim">${ave.latim}</div>
        <div class="mapa-ave-habitat"><strong>Habitat:</strong> ${ave.habitat_pt}</div>
        <div class="mapa-ave-habitat-en">(${ave.habitat_en})</div>
      `);
  }

  function iniciarMapa() {
    const svg = d3.select('#mapa-svg');
    const tooltip = d3.select('#mapa-tooltip');
    const infoBox = d3.select('#mapa-info');
    let selecionado = null;

    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'mapa-loading';
    loadingMsg.textContent = 'Carregando o mapa... (Loading the map...)';
    loadingMsg.style.cssText = 'padding:40px 16px; text-align:center; color:var(--mapa-muted); font-size:14px;';
    document.getElementById('mapa-wrap').prepend(loadingMsg);

    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(geo => {
        loadingMsg.remove();
        geo.features.forEach(f => {
          const p = f.properties;
          p.regiao = p.FK_macro || p.fk_macro || 'SE';
        });

        const projecao = d3.geoMercator().fitSize([660, 620], geo);
        const path = d3.geoPath().projection(projecao);

        svg.selectAll('path.mapa-estado')
          .data(geo.features)
          .join('path')
          .attr('class', 'mapa-estado')
          .attr('d', path)
          .attr('fill', d => corRegiaoRaw[d.properties.regiao] || '#ccc')
          .on('mousemove', (event, d) => {
            const p = d.properties;
            const r = nomeRegiao[p.regiao] || { pt: '-', en: '-' };
            tooltip
              .style('opacity', 1)
              .style('left', (event.offsetX + 16) + 'px')
              .style('top', (event.offsetY + 8) + 'px')
              .html(`<strong>${p.Estado}</strong> <span class="mapa-uf">(${p.SIGLA})</span><br>
                     ${r.pt} <span class="en">(${r.en})</span><br>
                     População: ${Number(p.Total).toLocaleString('pt-BR')}`);
          })
          .on('mouseleave', () => tooltip.style('opacity', 0))
          .on('click', (event, d) => selecionarEstado(d));

        function selecionarEstado(d) {
          selecionado = d.properties.SIGLA;
          svg.selectAll('path.mapa-estado').classed('selecionado', s => s.properties.SIGLA === selecionado);
          const p = d.properties;
          const r = nomeRegiao[p.regiao] || { pt: '-', en: '-' };
          infoBox.html(`
            <div style="font-size:15px; font-weight:700; margin-bottom:8px; color:var(--mapa-text);">${p.Estado} <span style="color:var(--mapa-muted); font-weight:400;">(${p.SIGLA})</span></div>
            <div class="mapa-row"><span>Região <span class="en">(Region)</span></span><span>${r.pt} <span class="en">(${r.en})</span></span></div>
            <div class="mapa-row"><span>População total <span class="en">(Total population)</span></span><span>${Number(p.Total).toLocaleString('pt-BR')}</span></div>
            <div class="mapa-row"><span>Urbana <span class="en">(Urban)</span></span><span>${Number(p.Urbana).toLocaleString('pt-BR')}</span></div>
            <div class="mapa-row"><span>Rural</span><span>${Number(p.Rural).toLocaleString('pt-BR')}</span></div>
            <div class="mapa-row"><span>Alfabetização <span class="en">(Literacy rate)</span></span><span>${Number(p.TX_Alfab).toFixed(1)}%</span></div>
          `);
          renderAves(p.regiao);
        }
      })
      .catch(() => {
        loadingMsg.textContent = 'Não foi possível carregar o mapa. Tente novamente mais tarde! (Could not load the map. Please try again later!)';
      });

    d3.selectAll('#mapa .mapa-legenda-item').on('click', function () {
      const regiao = this.getAttribute('data-regiao');
      const item = d3.select(this);
      const estaAtiva = item.classed('ativa');

      d3.selectAll('#mapa .mapa-legenda-item').classed('dim', false).classed('ativa', false);
      svg.selectAll('path.mapa-estado').style('opacity', 1);

      if (!estaAtiva) {
        item.classed('ativa', true);
        d3.selectAll('#mapa .mapa-legenda-item').filter(function () { return this !== item.node(); }).classed('dim', true);
        svg.selectAll('path.mapa-estado').style('opacity', d => d.properties.regiao === regiao ? 1 : 0.15);
      }

      renderAves(regiao);
    });
  }

  let mapaIniciado = false;
  function tentarIniciar() {
    if (mapaIniciado) return;
    const visivel = secaoMapa.getAttribute('aria-hidden') === 'false' || getComputedStyle(secaoMapa).display !== 'none';
    if (!visivel) return;
    mapaIniciado = true;
    iniciarMapa();
    observer.disconnect();
  }

  const observer = new MutationObserver(tentarIniciar);
  observer.observe(secaoMapa, { attributes: true, attributeFilter: ['aria-hidden', 'style'] });
  tentarIniciar();

  // O SVG usa viewBox fixo e escala via CSS (width:100%), então o mapa já é
  // responsivo sem recalcular a projeção; o listener só existe para reposicionar
  // a legenda/tooltip caso o layout mude de coluna para linha (breakpoint 768px).
  window.addEventListener('resize', () => {
    d3.select('#mapa-tooltip').style('opacity', 0);
  });
});
