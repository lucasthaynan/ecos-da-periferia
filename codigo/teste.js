
const idAgente = 2754767;
const url = `https://mapa.cultura.gov.br/api/agent/findOne?id=EQ%28${idAgente}%29&%40select=*`;

async function buscarDados() {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      credentials: "include" // importante se tiver cookie/sessão
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

  } catch (error) {
    console.error("Erro:", error);
  }
}

buscarDados();


const agentIds = [662, 693];

async function buscarTodosAgentes() {
  const resultados = [];

  for (let i = 0; i < agentIds.length; i++) {
    const idAgente = agentIds[i];
    const url = `https://mapa.cultura.gov.br/api/agent/findOne?id=EQ%28${idAgente}%29&%40select=*`;

    try {
      console.log(`[${i + 1}/${agentIds.length}] Buscando agente ${idAgente}...`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();

      resultados.push({
        id: idAgente,
        data: data
      });

    } catch (error) {
      console.error(`Erro no agente ${idAgente}:`, error.message);
    }
  }

  console.log("Finalizado!", resultados);

  // 🔽 baixar JSON
  baixarJSON(resultados);
}

// função para baixar arquivo
function baixarJSON(dados) {
  const blob = new Blob([JSON.stringify(dados, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "agentes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// executar
buscarTodosAgentes();