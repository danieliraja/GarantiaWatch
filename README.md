# GarantiaWatch

Aplicativo mobile desenvolvido com Expo (React Native + TypeScript) para que relojoeiros registrem e administrem garantias de trocas de baterias de relógios de pulso. O projeto usa Supabase (Auth, Database, Storage e Realtime) e notificações locais para alertas de garantias prestes a vencer.

## Recursos principais

- Autenticação de relojoeiros com Supabase Auth.
- Cadastro de garantias com imagem do relógio, dados do cliente, data da troca, período de cobertura e observações.
- Cálculo automático da data de vencimento e classificação por status (ativas, vencendo e vencidas).
- Lista responsiva com filtros rápidos, estatísticas e cartões detalhados.
- Tela de alertas para monitorar garantias próximas do vencimento e expiradas.
- Tela de perfil com informações do usuário autenticado e opção de logout.
- Upload das imagens para o Supabase Storage e sincronização em tempo real via Realtime.
- Notificações locais agendadas automaticamente 2 dias antes do vencimento da garantia.
- Interface moderna usando React Native Paper.

## Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Conta no [Supabase](https://supabase.com/)

## Configuração do Supabase

1. Crie um novo projeto no Supabase e copie a URL e a chave `anon` do projeto.
2. Crie a tabela `warranties` com a seguinte estrutura (ajuste tipos conforme necessário):

```sql
create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  client_name text not null,
  client_phone text not null,
  exchange_date date not null,
  warranty_days integer not null,
  due_date timestamptz not null,
  notes text,
  image_url text,
  notification_id text,
  created_at timestamptz default timezone('utc', now())
);

alter table public.warranties enable row level security;

create policy "Users can view their warranties"
  on public.warranties
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their warranties"
  on public.warranties
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their warranties"
  on public.warranties
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their warranties"
  on public.warranties
  for delete
  using (auth.uid() = user_id);
```

3. As políticas acima garantem que cada usuário só leia e modifique seus próprios registros; ajuste os rótulos conforme a necessidade da sua organização, mas mantenha as expressões `auth.uid() = user_id` para preservar a segurança.
4. Habilite a Realtime na tabela `warranties`.
5. Crie um bucket de Storage (por exemplo `warranty-images`) com política pública de leitura e gravação autenticada.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com as chaves do Supabase:

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=seu_token_anon
SUPABASE_STORAGE_BUCKET=warranty-images
```

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o projeto Expo:

```bash
npm start
```

3. Use o Expo Go no dispositivo físico ou um emulador para visualizar o app.

## Estrutura das telas

- **Login**: autenticação (login/cadastro) com Supabase Auth.
- **Lista de garantias**: cards com filtros, estatísticas e botão flutuante para nova garantia.
- **Nova garantia**: formulário para cadastro com upload de imagem e agendamento de notificação.
- **Detalhes**: visão completa da garantia selecionada.
- **Alertas**: destaques de garantias vencidas ou prestes a vencer.
- **Perfil**: informações do usuário autenticado e logout.

## Boas práticas adotadas

- Context API para estado de autenticação e garantias.
- Tipagem forte com TypeScript.
- Separação de responsabilidades em componentes reutilizáveis.
- Utilização do React Navigation com abas e pilha.
- Tratamento básico de erros e feedback visual nas telas.

## Próximos passos sugeridos

- Implementar edição e exclusão de garantias.
- Adicionar suporte a escaneamento de recibos/notas.
- Melhorar a personalização das notificações e relatórios.

