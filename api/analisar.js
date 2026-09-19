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
Responda em português do Brasil.`;

const schema = {
  type: "object",
  properties: {
    resumo: { type: "string" },
    pior_cenario_plausivel: { type: "string" },
    riscos: { type: "array", items: { type: "object", properties: {
      grupo:{type:"string"}, perigo:{type:"string"}, fonte:{type:"string"},
      exposicao:{type:"string"}, possiveis_danos:{type:"string"},
      evidencia:{type:"string",enum:["informado","inferido","a_confirmar"]},
      confianca:{type:"string",enum:["alta","media","baixa"]},
      justificativa:{type:"string"},
      medidas_sugeridas:{type:"array",items:{type:"string"}},
      dados_a_confirmar:{type:"array",items:{type:"string"}}
    }, required:["grupo","perigo","fonte","exposicao","possiveis_danos","evidencia","confianca","justificativa","medidas_sugeridas","dados_a_confirmar"] } },
    perguntas_prioritarias:{type:"array",items:{type:"string"}},
    alertas:{type:"array",items:{type:"string"}}
  },
  required:["resumo","pior_cenario_plausivel","riscos","perguntas_prioritarias","alertas"]
};

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Método não permitido"});
  if(!process.env.GEMINI_API_KEY) return res.status(500).json({error:"GEMINI_API_KEY não configurada no servidor."});
  try{
    const prompt = SYSTEM+"\n\nFaça uma análise investigativa desta inspeção SST:\n"+JSON.stringify(req.body||{});
    const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-goog-api-key":process.env.GEMINI_API_KEY},
      body:JSON.stringify({
        contents:[{role:"user",parts:[{text:prompt}]}],
        generationConfig:{responseMimeType:"application/json",responseSchema:schema,thinkingConfig:{thinkingBudget:2048}}
      })
    });
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:"Falha na API Gemini.",detail:data?.error?.message||"Erro desconhecido"});
    const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";
    if(!raw) return res.status(502).json({error:"Gemini não retornou conteúdo analisável."});
    return res.status(200).json(JSON.parse(raw));
  }catch(e){
    return res.status(500).json({error:"Falha ao executar análise.",detail:e?.message||String(e)});
  }
}
