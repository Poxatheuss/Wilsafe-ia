# WILSAFE IA — Inspeção SST

Aplicação mobile-first para inspeções de Segurança e Saúde no Trabalho.

## Arquitetura
- Front-end: interface de inspeção.
- Backend: `api/analisar.js`, preparado para execução serverless.
- IA: OpenAI Responses API.
- Segredo: `OPENAI_API_KEY` somente como variável de ambiente do servidor — nunca no HTML.

## Motor técnico
A análise foi desenhada para levantar múltiplas hipóteses, buscar o pior cenário plausível, distinguir fato de inferência e informação a confirmar, e nunca inventar medições, concentrações, CAs ou resultados quantitativos. A aprovação final é do profissional de SST.

## Próximas fases
Persistência de inspeções e correções técnicas, memória de exemplos aprovados/rejeitados, anexos de FDS/fotos, inventário e plano de ação.
