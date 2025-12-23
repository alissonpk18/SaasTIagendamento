# COMO CONFIGURAR E DEPLOYAR

## 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/).
2. Clique em **"Adicionar projeto"**.
3. Dê um nome (ex: `agendamento-online`) e siga os passos (pode desativar o Google Analytics para ser mais rápido).
4. Após criar, clique no ícone **</>** (Web) para registar um app.
5. Dê um apelido (ex: `Web App`) e clique em **Registrar app**.
6. **IMPORTANTE**: O Firebase vai te mostrar um código com `firebaseConfig`. Mantenha essa tela aberta ou copie as chaves.

## 2. Configurar o Banco de Dados (Firestore)

1. No menu lateral do Firebase, vá em **Criação** > **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha o local (ex: `southamerica-east1` para SP/Brasil) e avance.
4. Escolha **Iniciar no modo de teste** (vamos mudar as regras depois) ou **modo produção**.
5. Quando o banco criar, vá na aba **Regras**.
6. Apague tudo e cole o código abaixo (Regras do `IMPLEMENTATION_PLAN.md`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appointments/{appointment} {
      // Qualquer um pode criar agendamento
      allow create: if true;
      // Só admins autenticados podem ver/editar
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

7. Clique em **Publicar**.

## 3. Configurar Autenticação (Authentication)

1. No menu lateral, vá em **Criação** > **Authentication**.
2. Clique em **Vamos começar**.
3. Em **Sign-in method**, escolha **Email/Password**.
4. Ative a opção **Email/Password** e clique em **Salvar**.
5. Vá na aba **Users** e clique em **Adicionar usuário**.
6. Crie um email e senha para você (esse será seu login de admin).

## 4. Atualizar o Código (app.js)

1. Abra o arquivo `app.js` no seu computador.
2. Procure a parte `const firebaseConfig = { ... }`.
3. Substitua os valores placeholder (`YOUR_API_KEY_HERE`, etc.) pelos valores que você pegou no **Passo 1**.

Exemplo:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456...",
  appId: "1:12345...",
};
```

4. Salve o arquivo.

## 5. Deploy no GitHub Pages

Como é um projeto simples (HTML/JS), o GitHub Pages é ideal.

1. Crie um repositório no [GitHub](https://github.com/new).
2. Suba os arquivos (`index.html`, `admin.html`, `style.css`, `app.js`) para lá.
   - Você pode usar o Git no terminal ou arrastar os arquivos pelo site do GitHub ("Upload files").
3. No repositório, vá em **Settings** > **Pages** (menu lateral esquerdo).
4. Em **Source**, selecione `Deploy from a branch`.
5. Em **Branch**, selecione `main` (ou `master`) e `/root`, depois clique em **Save**.
6. Aguarde uns minutos. O GitHub vai te dar um link (ex: `https://seu-usuario.github.io/seu-repo/`).

Pronto! Seu sistema de agendamento está no ar.
