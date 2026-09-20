# ROLETA PIX

Sistema completo de jogo de roleta com integração PIX (Mercado Pago).

## Stack
- Vite (React + TypeScript)
- Tailwind CSS
- Supabase (Auth + DB)
- Mercado Pago (API)
- Vercel (Hosting + API Routes)

## Configuração

1. Clone o repositório
2. Rode `npm install`
3. Crie um projeto no Supabase
4. Rode o SQL contido em `supabase/schema.sql` no SQL Editor do Supabase
5. Rode o SQL contido em `supabase/seed.sql` para dados iniciais
6. Configure as variáveis de ambiente:

Crie o arquivo `.env.local` na raiz:
```
VITE_SUPABASE_URL=seu_url
VITE_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
MERCADOPAGO_ACCESS_TOKEN=seu_mp_token
```

## Vercel

O projeto está configurado para deploy no Vercel. 
As Serverless Functions estão na pasta `api/`.
Para testar localmente as Serverless Functions, use a CLI da Vercel:
`npx vercel dev`

## Webhook Mercado Pago

Configure no painel de desenvolvedores do Mercado Pago o webhook apontando para:
`https://seu-dominio.vercel.app/api/mercadopago/webhook`
Selecionar o evento `Pagamento criado` e `Pagamento atualizado`.
