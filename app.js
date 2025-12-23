// --- IMPORTAÇÕES MODULARES (FIREBASE V9) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// --- SUA CONFIGURAÇÃO (Preenchida com os dados fornecidos) ---
const firebaseConfig = {
  apiKey: "AIzaSyCajvJBLvpOwn8huxEGP8PxndTRwGnvYSs",
  authDomain: "agendamento-online-7859e.firebaseapp.com",
  projectId: "agendamento-online-7859e",
  storageBucket: "agendamento-online-7859e.firebasestorage.app",
  messagingSenderId: "125407458128",
  appId: "1:125407458128:web:7b5ca746e7a897ea053255"
};

// --- INICIALIZAÇÃO DO APP ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ======================================================
// LÓGICA: PÁGINA DO CLIENTE (index.html)
// ======================================================
if (document.getElementById('form-agendamento')) {
    const form = document.getElementById('form-agendamento');
    const btn = document.getElementById('btn-agendar');

    // Define data mínima como hoje para evitar agendamento no passado
    const hoje = new Date().toISOString().split("T")[0];
    document.getElementById('data').min = hoje;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.innerText = "Verificando disponibilidade...";

        // Captura os dados usando os IDs corretos (Português)
        const dados = {
            nome: document.getElementById('nome').value,
            telefone: document.getElementById('telefone').value, // ID corrigido
            data: document.getElementById('data').value,
            hora: document.getElementById('hora').value,
            servico: document.getElementById('servico').value,
            criadoEm: new Date().toISOString()
        };

        try {
            // 1. Verifica duplicidade (Query: Data == X E Hora == Y)
            const q = query(collection(db, "agendamentos"), 
                            where("data", "==", dados.data), 
                            where("hora", "==", dados.hora));
            
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("⚠️ Ops! Este horário já está reservado. Por favor, escolha outro.");
                btn.disabled = false;
                btn.innerText = "Confirmar Agendamento";
                return;
            }

            // 2. Salva se estiver livre
            await addDoc(collection(db, "agendamentos"), dados);
            
            // Feedback de Sucesso
            alert(`✅ Agendamento Confirmado para ${dados.nome}!\nDia: ${dados.data} às ${dados.hora}`);
            form.reset();

        } catch (error) {
            console.error("Erro ao agendar:", error);
            alert("❌ Erro no sistema. Verifique sua conexão e tente novamente.");
        } finally {
            btn.disabled = false;
            btn.innerText = "Confirmar Agendamento";
        }
    });
}

// ======================================================
// LÓGICA: PÁGINA ADMIN (admin.html)
// ======================================================
if (document.getElementById('login-screen')) {
    const loginScreen = document.getElementById('login-screen');
    const painelScreen = document.getElementById('painel-screen');
    const formLogin = document.getElementById('form-login');
    const lista = document.getElementById('lista-agendamentos');
    const msgLogin = document.getElementById('msg-login');

    // 1. Monitora Estado de Login (Proteção da Rota)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário logado: Mostra painel
            loginScreen.style.display = 'none';
            painelScreen.style.display = 'block';
            carregarAgenda(); 
        } else {
            // Usuário deslogado: Mostra login
            loginScreen.style.display = 'block';
            painelScreen.style.display = 'none';
        }
    });

    // 2. Função de Login
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        const pass = document.getElementById('senha-login').value;

        msgLogin.innerText = "Autenticando...";
        
        signInWithEmailAndPassword(auth, email, pass)
            .then(() => {
                msgLogin.innerText = "";
            })
            .catch((error) => {
                console.error(error);
                msgLogin.innerText = "❌ E-mail ou senha inválidos!";
            });
    });

    // 3. Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        if(confirm("Deseja realmente sair?")) {
            signOut(auth);
        }
    });

    // 4. Carregar Dados da Tabela
    async function carregarAgenda() {
        lista.innerHTML = '<tr><td colspan="5" style="text-align:center">🔄 Carregando agendamentos...</td></tr>';
        
        try {
            // Busca ordenada por Data e Hora
            const q = query(collection(db, "agendamentos"), orderBy("data"), orderBy("hora"));
            const snapshot = await getDocs(q);
            
            lista.innerHTML = '';
            
            if (snapshot.empty) {
                lista.innerHTML = '<tr><td colspan="5" style="text-align:center">Nenhum agendamento encontrado.</td></tr>';
                return;
            }

            snapshot.forEach((docSnap) => {
                const d = docSnap.data();
                const datePt = d.data.split('-').reverse().join('/'); // Formata data BR
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><b>${d.hora}</b> <br> <small>${datePt}</small></td>
                    <td>${d.nome}</td>
                    <td>${d.servico}</td>
                    <td>
                        <a href="https://wa.me/55${d.telefone.replace(/\D/g,'')}" target="_blank" style="text-decoration:none; color:green; font-weight:bold;">
                           📱 WhatsApp
                        </a>
                    </td>
                    <td><button class="btn-delete" data-id="${docSnap.id}">✅ Concluir</button></td>
                `;
                lista.appendChild(tr);
            });

            // Adiciona eventos aos botões de excluir
            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if(confirm("Confirmar que este serviço foi realizado? O agendamento será removido.")) {
                        try {
                            await deleteDoc(doc(db, "agendamentos", id));
                            carregarAgenda(); // Recarrega a lista
                        } catch (err) {
                            alert("Erro ao excluir. Você tem permissão de Admin?");
                        }
                    }
                });
            });

        } catch (error) {
            console.error("Erro ao carregar lista:", error);
            lista.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center">Erro ao carregar dados. Verifique o console.</td></tr>';
        }
    }
}
