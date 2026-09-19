import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `Você é o motor técnico da WILSAFE IA, assistente de inspeção de SST no Brasil.
Analise criticamente o levantamento sem inventar fatos. Trabalhe com múltiplas hipóteses e procure o pior cenário PLAUSÍVEL que mereça investigação, sem transformar hipótese em conclusão.
REGRAS:
- Nunca invente medições, concentrações, dose, dB, IBUTG, CA, validade, limite, tempo de exposição ou resultado quantitativo.
- Diferencie claramente: fato informado, hipótese técnica e dado a confirmar.
- Considere riscos físicos, químicos, biológicos, ergonômicos, acidentes e fatores psicossociais relacionados ao trabalho.
- Procure exposições menos óbvias, tarefas não rotineiras, mistura/limpeza/manutenção, vias respiratória/dérmica/ocular, incêndio, interação entre agentes e falhas de controle.
- Não conclua insalubridade, periculosidade, nexo ou conformidade legal sem dados suficientes.
- Se houver medição anterior, preserve a data original.
- Priorize perguntas que realmente mudariam a avaliação.
- O técnico humano aprova ou rejeita tudo.
Responda SOMENTE JSON válido no formato:
{"resumo":"...","pior_cenario_plausivel":"...","riscos":[{"grupo":"...","perigo":"...","fonte":"...","exposicao":"...","possiveis_danos":"...","evidencia":"informado|inferido|a_confirmar","confianca":"alta|media|baixa","justificativa":"...","medidas_sugeridas":["..."],"dados_a_confirmar":["..."]}],"perguntas_prioritarias":["..."],"alertas":["..."]}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY não configurada no servidor." });

  try {
    const dados = req.body || {};
    const response = await openai.responses.create({
      model: "gpt-5.6",
      reasoning: { effort: "high" },
      input: [
        { role: "system", content: SYSTEM },
        { role: "user", content: "Faça uma análise investigativa desta inspeção SST:\n" + JSON.stringify(dados) }
      ]
    });
    const raw = response.output_text || "";
    let analysis;
    try { analysis = JSON.parse(raw); }
    catch { analysis = { resumo: raw, riscos: [], perguntas_prioritarias: [], alertas: ["A resposta precisará de revisão estrutural."] }; }
    return res.status(200).json(analysis);
  } catch (e) {
    return res.status(500).json({ error: "Falha ao executar análise.", detail: e?.message || String(e) });
  }
}
