import type { TaskInput } from "@/lib/task-schema";

/**
 * I kept the fictional sample data in its own file so the store only
 * holds logic. I chose 30 tasks (3 pages of 10) because that is enough to try
 * infinite scroll right away. They are ordered oldest first, so the last one
 * appears at the top of the list.
 */
export const SEED_TASKS: TaskInput[] = [
  { titulo: "Pagar a fatura do cartão", descricao: "Vence dia 10. Conferir se a assinatura do streaming foi cobrada duas vezes." },
  { titulo: "Daily com o time de produto", descricao: "Às 9h30. Atualizar o status da integração de pagamentos antes da reunião." },
  { titulo: "Revisar pull request do checkout", descricao: "PR do Lucas com a refatoração do carrinho. Atenção aos testes de desconto." },
  { titulo: "Levar o carro na revisão", descricao: "Revisão dos 40 mil km na oficina às 8h. Pedir para checar o barulho no freio." },
  { titulo: "Comprar presente da minha mãe", descricao: "Aniversário no sábado. Ela comentou que queria um livro de receitas novo." },
  { titulo: "Lavar a louça e limpar a cozinha", descricao: "Antes de dormir, para não acumular para amanhã." },
  { titulo: "Reunião de planejamento da sprint", descricao: "Quinta às 14h. Levar as estimativas das tarefas de performance da API." },
  { titulo: "Academia: treino de pernas", descricao: "Ir às 7h, antes do trabalho. Não esquecer a garrafa de água." },
  { titulo: "Ligar para o encanador", descricao: "A torneira do banheiro está pingando. Pedir orçamento e marcar a visita." },
  { titulo: "Corrigir bug no login com Google", descricao: "Usuários com e-mail corporativo recebem erro 500. Ver os logs de ontem." },
  { titulo: "Fazer o mercado da semana", descricao: "Arroz, ovos, frutas, café, frango e produtos de limpeza. Levar sacolas." },
  { titulo: "Almoço de domingo com os pais", descricao: "Ao meio-dia na casa deles. Fiquei de levar a sobremesa." },
  { titulo: "1:1 com a gestora", descricao: "Conversar sobre o plano de carreira e a possibilidade de promoção para Sênior." },
  { titulo: "Estudar para a certificação AWS", descricao: "Revisar o módulo de VPC e fazer um simulado de 30 questões." },
  { titulo: "Levar o cachorro ao veterinário", descricao: "Vacina anual do Thor às 18h. Levar a carteirinha de vacinação." },
  { titulo: "Escrever documentação da nova API", descricao: "Documentar os endpoints de pedidos no Swagger e atualizar o README." },
  { titulo: "Lavar e estender a roupa", descricao: "Separar a roupa de cama. Ver a previsão do tempo antes de estender." },
  { titulo: "Retrospectiva da sprint", descricao: "Sexta às 16h. Anotar o que travou o deploy da semana passada." },
  { titulo: "Marcar consulta no dentista", descricao: "Limpeza semestral. Tentar um horário depois das 18h." },
  { titulo: "Ajudar o sobrinho com o trabalho de escola", descricao: "Ele precisa montar uma maquete do sistema solar até segunda." },
  { titulo: "Atualizar dependências do projeto", descricao: "Subir as versões do Next e do React e rodar a suíte de testes completa." },
  { titulo: "Pagar o condomínio e a conta de luz", descricao: "Os dois vencem esta semana. Agendar pelo app do banco." },
  { titulo: "Jantar de aniversário de namoro", descricao: "Reserva no restaurante italiano às 20h. Confirmar a reserva por telefone." },
  { titulo: "Entrevista técnica com candidato", descricao: "Vaga de dev junior. Preparar o exercício e as perguntas." },
  { titulo: "Organizar o home office", descricao: "Arrumar os cabos da mesa e trocar a lâmpada da luminária." },
  { titulo: "Ligar para a avó", descricao: "Faz tempo que não converso com ela. Perguntar como foi a consulta médica." },
  { titulo: "Investigar lentidão no dashboard", descricao: "A consulta de relatórios passa de 5 segundos. Verificar índices no banco." },
  { titulo: "Futebol com os amigos", descricao: "Quarta às 21h na quadra de sempre. É minha vez de levar a bola." },
  { titulo: "Deploy da versão 2.3 em produção", descricao: "Depois das 18h, com o time de QA de prontidão. Avisar o suporte antes." },
  { titulo: "Planejar a viagem de férias em família", descricao: "Pesquisar pousadas na praia para julho e comparar preços das passagens." },
];
