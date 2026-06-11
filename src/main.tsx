/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 9 — Infraestrutura & Camada de Dados
 * PASSO 1 do roteiro: "O ponto de partida da aplicação" (~0:40–1:20)
 *
 * O que falar: arquivo curtinho — mostre o createRoot(...).render(<App />),
 * onde o React "liga" e injeta a aplicação dentro do index.html. Cite o
 * vite.config.ts como a configuração que compila e serve o projeto.
 *
 * 🗣️ Fala sugerida: "Tudo começa aqui: o main.tsx é o ponto de entrada que
 * injeta a aplicação React na página. O Vite é a ferramenta que compila e
 * serve isso durante o desenvolvimento."
 * ========================================================================== */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
