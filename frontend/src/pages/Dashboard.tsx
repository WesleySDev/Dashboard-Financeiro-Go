import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2, Plus, Calendar, Download, Printer, Upload, Save, FileDown, FileUp, Bell, BellRing, Settings, AlertTriangle } from "lucide-react";
import api from "../api";
import { useAuth } from "../auth/useAuth";
import Sidebar from "../components/Sidebar";

interface Conta {
  id: string;
  tipo: string;
  valor: number;
  dataPagamento: string;
  pago: boolean;
}

interface Notificacao {
  id: string;
  tipo: 'vencimento' | 'lembrete' | 'alerta';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  contaId?: string;
}

interface ConfigNotificacao {
  notificacoesPush: boolean;
  diasAntecedencia: number;
  horarioLembrete: string;
  lembretesDiarios: boolean;
}
const Dashboard = () => {
  const { usuario } = useAuth();
  const [salario, setSalario] = useState(0);
  const [gasto, setGasto] = useState(0);
  const [custo, setCusto] = useState(0);
  const [gastos, setGastos] = useState<string[]>([]);
  const [novoGasto, setNovoGasto] = useState("");
  const [dadosSalvos, setDadosSalvos] = useState(false);
  
  // Novos estados para ganhos mensais e contas
  const [ganhosMensais, setGanhosMensais] = useState(0);
  const [contas, setContas] = useState<Conta[]>([]);
  const [novaConta, setNovaConta] = useState({ tipo: "", valor: "", data: "" });
  const [mostrarFormConta, setMostrarFormConta] = useState(false);
  
  // Estados para sistema de notificações
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [configNotificacao, setConfigNotificacao] = useState<ConfigNotificacao>({
    notificacoesPush: true,
    diasAntecedencia: 3,
    horarioLembrete: "09:00",
    lembretesDiarios: true
  });
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [mostrarConfigNotificacao, setMostrarConfigNotificacao] = useState(false);
  const [permissaoNotificacao, setPermissaoNotificacao] = useState<NotificationPermission>('default');
  
  // Calcular total de contas pagas no mês atual
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  const contasPagasMes = contas.filter(conta => {
    const dataConta = new Date(conta.dataPagamento);
    return conta.pago && dataConta.getMonth() === mesAtual && dataConta.getFullYear() === anoAtual;
  });
  const totalContasPagas = contasPagasMes.reduce((total, conta) => total + conta.valor, 0);

  // Dados para o gráfico baseados nos ganhos mensais
  const saldoDisponivel = Math.max(0, ganhosMensais - totalContasPagas - gasto - custo);
  const data = [
    { name: "Saldo Disponível", value: saldoDisponivel },
    { name: "Contas Pagas", value: totalContasPagas },
    { name: "Gastos Extras", value: gasto },
    { name: "Custos Fixos", value: custo },
  ].filter(item => item.value > 0); // Remove itens com valor zero

  const COLORS = ["#10a37f", "#ef4444", "#f97316", "#3b82f6"];

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    const carregarDadosUsuario = async () => {
      try {
        const response = await api.get('/transacoes/dashboard');
        if (response.data) {
          const salarioCarregado = response.data.salario || 0;
          const ganhosMensaisCarregados = response.data.ganhosMensais || 0;
          
          setSalario(salarioCarregado);
          setGasto(response.data.gasto || 0);
          setCusto(response.data.custo || 0);
          setGastos(response.data.gastos || []);
          
          // Se ganhos mensais não estiver definido, usar o salário como base
          setGanhosMensais(ganhosMensaisCarregados || salarioCarregado);
          setContas(response.data.contas || []);
          setDadosSalvos(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        // Carregar dados do localStorage como fallback
        const dadosSalvos = localStorage.getItem(`dashboard_${usuario?.id}`);
        if (dadosSalvos) {
          const dados = JSON.parse(dadosSalvos);
          const salarioCarregado = dados.salario || 0;
          const ganhosMensaisCarregados = dados.ganhosMensais || 0;
          
          setSalario(salarioCarregado);
          setGasto(dados.gasto || 0);
          setCusto(dados.custo || 0);
          setGastos(dados.gastos || []);
          
          // Se ganhos mensais não estiver definido, usar o salário como base
          setGanhosMensais(ganhosMensaisCarregados || salarioCarregado);
          setContas(dados.contas || []);
        }
      }
    };

    if (usuario?.id) {
      carregarDadosUsuario();
    }
  }, [usuario]);

  // Salvar dados quando houver alterações
  useEffect(() => {
    const salvarDados = async () => {
      if (!usuario?.id || !dadosSalvos) return;
      
      const dadosDashboard = {
        salario,
        gasto,
        custo,
        gastos,
        ganhosMensais,
        contas
      };
      
      // Salvar no localStorage como backup
      localStorage.setItem(`dashboard_${usuario.id}`, JSON.stringify(dadosDashboard));
      
      try {
        await api.post('/transacoes/dashboard', dadosDashboard);
      } catch (error) {
        console.error('Erro ao salvar dados do dashboard:', error);
      }
    };
    
    salvarDados();
  }, [salario, gasto, custo, gastos, ganhosMensais, contas, usuario, dadosSalvos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoGasto.trim()) {
      setGastos([...gastos, novoGasto]);
      const valor = parseFloat(novoGasto);
      if (!isNaN(valor)) setGasto(gasto + valor);
      setNovoGasto("");
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(gastos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setGastos(items);
  };

  const deletarGasto = (index: number) => {
    const itemRemovido = gastos[index];
    const novoArray = [...gastos];
    novoArray.splice(index, 1);
    setGastos(novoArray);
    const valor = parseFloat(itemRemovido);
    if (!isNaN(valor)) setGasto(gasto - valor);
  };

  // Funções para gerenciar contas
  const adicionarConta = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaConta.tipo && novaConta.valor && novaConta.data) {
      const conta: Conta = {
        id: Date.now().toString(),
        tipo: novaConta.tipo,
        valor: parseFloat(novaConta.valor),
        dataPagamento: novaConta.data,
        pago: false
      };
      setContas([...contas, conta]);
      setNovaConta({ tipo: "", valor: "", data: "" });
      setMostrarFormConta(false);
    }
  };

  const marcarContaPaga = (id: string) => {
    setContas(contas.map(conta => 
      conta.id === id ? { ...conta, pago: !conta.pago } : conta
    ));
  };

  const deletarConta = (id: string) => {
    setContas(contas.filter(conta => conta.id !== id));
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const baixarPDF = () => {
    // Criar uma nova janela com o conteúdo para PDF
    const conteudoPDF = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Financeiro - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10a37f; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
          .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
          .value { font-size: 18px; font-weight: bold; margin-top: 5px; }
          .positive { color: #10a37f; }
          .negative { color: #ef4444; }
          .orange { color: #f97316; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .paid { text-decoration: line-through; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório Financeiro</h1>
          <h2>${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
          <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="section">
          <h3>💰 Resumo Mensal</h3>
          <div class="grid">
            <div class="card">
              <strong>Ganhos Totais</strong>
              <div class="value positive">${formatarMoeda(ganhosMensais)}</div>
            </div>
            <div class="card">
              <strong>Contas Pagas (${contasPagasMes.length})</strong>
              <div class="value negative">${formatarMoeda(totalContasPagas)}</div>
            </div>
            <div class="card">
              <strong>Gastos Extras (${gastos.length})</strong>
              <div class="value orange">${formatarMoeda(gasto)}</div>
            </div>
            <div class="card">
              <strong>Custos Fixos</strong>
              <div class="value orange">${formatarMoeda(custo)}</div>
            </div>
            <div class="card">
              <strong>Saldo Disponível</strong>
              <div class="value ${ganhosMensais - totalContasPagas - gasto - custo >= 0 ? 'positive' : 'negative'}">
                ${formatarMoeda(ganhosMensais - totalContasPagas - gasto - custo)}
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>🧾 Contas do Mês</h3>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${contas.map(conta => `
                <tr class="${conta.pago ? 'paid' : ''}">
                  <td>${conta.tipo}</td>
                  <td>${formatarMoeda(conta.valor)}</td>
                  <td>${new Date(conta.dataPagamento).toLocaleDateString('pt-BR')}</td>
                  <td>${conta.pago ? '✅ Pago' : '⏳ Pendente'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>💸 Gastos Extras</h3>
          <ul>
            ${gastos.map(gasto => `<li>${gasto}</li>`).join('')}
          </ul>
        </div>
      </body>
      </html>
    `;
    
    const novaJanela = window.open('', '_blank');
    if (novaJanela) {
      novaJanela.document.write(conteudoPDF);
      novaJanela.document.close();
      novaJanela.print();
    }
  };

  // Funções de Backup e Restauração
  const exportarDados = () => {
    const dadosBackup = {
      versao: "1.0",
      dataExportacao: new Date().toISOString(),
      usuario: usuario?.email || "usuario",
      dados: {
        salario,
        gasto,
        custo,
        gastos,
        ganhosMensais,
        contas
      }
    };

    const dataStr = JSON.stringify(dadosBackup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('✅ Backup exportado com sucesso!');
  };

  const importarDados = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dadosImportados = JSON.parse(e.target?.result as string);
        
        // Validar estrutura do arquivo
        if (!dadosImportados.dados || !dadosImportados.versao) {
          throw new Error('Arquivo de backup inválido');
        }

        const { dados } = dadosImportados;
        
        // Confirmar importação
        const confirmar = window.confirm(
          `🔄 Deseja importar os dados do backup?\n\n` +
          `📅 Data do backup: ${new Date(dadosImportados.dataExportacao).toLocaleString('pt-BR')}\n` +
          `👤 Usuário: ${dadosImportados.usuario}\n` +
          `💰 Ganhos mensais: ${formatarMoeda(dados.ganhosMensais || 0)}\n` +
          `🧾 Contas: ${dados.contas?.length || 0}\n` +
          `💸 Gastos: ${dados.gastos?.length || 0}\n\n` +
          `⚠️ ATENÇÃO: Isso substituirá todos os dados atuais!`
        );

        if (confirmar) {
          // Importar dados com validação
          setSalario(dados.salario || 0);
          setGasto(dados.gasto || 0);
          setCusto(dados.custo || 0);
          setGastos(dados.gastos || []);
          setGanhosMensais(dados.ganhosMensais || dados.salario || 0);
          setContas(dados.contas || []);
          
          alert('✅ Dados importados com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        alert('❌ Erro ao importar dados. Verifique se o arquivo é um backup válido.');
      }
    };
    
    reader.readAsText(file);
    // Limpar o input para permitir reimportação do mesmo arquivo
    event.target.value = '';
  };

  const criarBackupAutomatico = () => {
    const dadosBackup = {
      salario,
      gasto,
      custo,
      gastos,
      ganhosMensais,
      contas,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`backup_automatico_${usuario?.id}`, JSON.stringify(dadosBackup));
  };

  // Criar backup automático a cada mudança importante
  useEffect(() => {
    if (dadosSalvos && usuario?.id) {
      criarBackupAutomatico();
    }
  }, [salario, gasto, custo, gastos, ganhosMensais, contas, usuario, dadosSalvos]);

  // Funções do Sistema de Notificações
  const solicitarPermissaoNotificacao = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissaoNotificacao(permission);
      return permission === 'granted';
    }
    return false;
  };

  const enviarNotificacaoPush = (titulo: string, mensagem: string, icone?: string) => {
    if (permissaoNotificacao === 'granted' && configNotificacao.notificacoesPush) {
      new Notification(titulo, {
        body: mensagem,
        icon: icone || '/vite.svg',
        badge: '/vite.svg',
        tag: 'financial-dashboard'
      });
    }
  };

  const criarNotificacao = (tipo: 'vencimento' | 'lembrete' | 'alerta', titulo: string, mensagem: string, contaId?: string) => {
    const novaNotificacao: Notificacao = {
      id: Date.now().toString(),
      tipo,
      titulo,
      mensagem,
      data: new Date().toISOString(),
      lida: false,
      contaId
    };
    
    setNotificacoes(prev => [novaNotificacao, ...prev]);
    
    // Enviar notificação push se habilitada
    if (configNotificacao.notificacoesPush) {
      enviarNotificacaoPush(titulo, mensagem);
    }
    
    return novaNotificacao;
  };

  const verificarVencimentos = () => {
    const hoje = new Date();
    const diasAntecedencia = configNotificacao.diasAntecedencia;
    
    contas.forEach(conta => {
      if (!conta.pago) {
        const dataVencimento = new Date(conta.dataPagamento);
        const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        // Verificar se já existe notificação para esta conta
        const jaNotificado = notificacoes.some(notif => notif.contaId === conta.id && notif.tipo === 'vencimento');
        
        if (!jaNotificado) {
          if (diasParaVencimento <= diasAntecedencia && diasParaVencimento >= 0) {
            const titulo = diasParaVencimento === 0 ? '🚨 Conta vence hoje!' : `⏰ Conta vence em ${diasParaVencimento} dia(s)`;
            const mensagem = `${conta.tipo}: ${formatarMoeda(conta.valor)} - Vencimento: ${formatarData(conta.dataPagamento)}`;
            
            criarNotificacao('vencimento', titulo, mensagem, conta.id);
          } else if (diasParaVencimento < 0) {
            const diasAtraso = Math.abs(diasParaVencimento);
            const titulo = `🔴 Conta em atraso há ${diasAtraso} dia(s)!`;
            const mensagem = `${conta.tipo}: ${formatarMoeda(conta.valor)} - Venceu em: ${formatarData(conta.dataPagamento)}`;
            
            criarNotificacao('alerta', titulo, mensagem, conta.id);
          }
        }
      }
    });
  };

  const marcarNotificacaoLida = (id: string) => {
    setNotificacoes(prev => prev.map(notif => 
      notif.id === id ? { ...notif, lida: true } : notif
    ));
  };

  const limparNotificacoes = () => {
    setNotificacoes([]);
  };

  const removerNotificacao = (id: string) => {
    setNotificacoes(prev => prev.filter(notif => notif.id !== id));
  };

  const contarNotificacaoNaoLidas = () => {
    return notificacoes.filter(notif => !notif.lida).length;
  };

  // Verificar permissão de notificação ao carregar
  useEffect(() => {
    if ('Notification' in window) {
      setPermissaoNotificacao(Notification.permission);
    }
  }, []);

  // Verificar vencimentos periodicamente
  useEffect(() => {
    if (contas.length > 0) {
      verificarVencimentos();
      
      // Verificar a cada hora
      const interval = setInterval(verificarVencimentos, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [contas, configNotificacao.diasAntecedencia]);

  // Lembrete diário
  useEffect(() => {
    if (configNotificacao.lembretesDiarios) {
      const agora = new Date();
      const [hora, minuto] = configNotificacao.horarioLembrete.split(':').map(Number);
      const proximoLembrete = new Date(agora);
      proximoLembrete.setHours(hora, minuto, 0, 0);
      
      if (proximoLembrete <= agora) {
        proximoLembrete.setDate(proximoLembrete.getDate() + 1);
      }
      
      const timeout = setTimeout(() => {
        const contasPendentes = contas.filter(conta => !conta.pago).length;
        if (contasPendentes > 0) {
          criarNotificacao(
            'lembrete',
            '📋 Lembrete Financeiro Diário',
            `Você tem ${contasPendentes} conta(s) pendente(s) para revisar.`
          );
        }
      }, proximoLembrete.getTime() - agora.getTime());
      
      return () => clearTimeout(timeout);
    }
  }, [configNotificacao.lembretesDiarios, configNotificacao.horarioLembrete, contas]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="bg-[#0d1117] text-white p-6 ml-16 w-full">
        {/* Seção de Ganhos Mensais */}
        <div className="mb-6">
          <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="text-[#10a37f]" size={20} />
                Resumo Mensal - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={imprimirRelatorio}
                  className="flex items-center gap-2 px-3 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0f8e6b] transition-all text-sm"
                  title="Imprimir relatório"
                >
                  <Printer size={16} />
                  Imprimir
                </button>
                <button
                  onClick={baixarPDF}
                  className="flex items-center gap-2 px-3 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-all text-sm"
                  title="Baixar como PDF"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button
                  onClick={exportarDados}
                  className="flex items-center gap-2 px-3 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-all text-sm"
                  title="Exportar backup dos dados"
                >
                  <FileDown size={16} />
                  Backup
                </button>
                <label className="flex items-center gap-2 px-3 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#7c3aed] transition-all text-sm cursor-pointer" title="Importar backup dos dados">
                  <FileUp size={16} />
                  Restaurar
                  <input
                    type="file"
                    accept=".json"
                    onChange={importarDados}
                    className="hidden"
                  />
                </label>
                
                {/* Botão de Notificações */}
                <div className="relative">
                  <button
                    onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all text-sm relative"
                  >
                    {contarNotificacaoNaoLidas() > 0 ? (
                      <BellRing size={16} />
                    ) : (
                      <Bell size={16} />
                    )}
                    Notificações
                    {contarNotificacaoNaoLidas() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {contarNotificacaoNaoLidas()}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Botão de Configurações de Notificação */}
                <button
                  onClick={() => setMostrarConfigNotificacao(!mostrarConfigNotificacao)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm"
                >
                  <Settings size={16} />
                  Config
                </button>
              </div>
            </div>
            
            {/* Linha principal de ganhos */}
            <div className="mb-4">
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                <label className="text-gray-400 text-sm block mb-1">💰 Ganhos Totais do Mês</label>
                <input
                  type="number"
                  placeholder="Digite seus ganhos mensais"
                  value={ganhosMensais === 0 ? "" : ganhosMensais}
                  onChange={(e) => setGanhosMensais(+e.target.value)}
                  className="w-full bg-transparent text-[#10a37f] text-2xl font-bold focus:outline-none placeholder-gray-500"
                />
                {salario > 0 && ganhosMensais !== salario && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Salário base: {formatarMoeda(salario)} 
                    <button 
                      onClick={() => setGanhosMensais(salario)}
                      className="ml-2 text-[#10a37f] hover:underline"
                    >
                      usar como base
                    </button>
                  </p>
                )}
              </div>
            </div>
            
            {/* Grid de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  🧾 Contas Pagas ({contasPagasMes.length})
                </p>
                <p className="text-red-400 text-xl font-bold">{formatarMoeda(totalContasPagas)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {contas.filter(c => !c.pago).length} pendentes
                </p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  💸 Gastos Extras ({gastos.length})
                </p>
                <p className="text-orange-400 text-xl font-bold">{formatarMoeda(gasto)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  + custos: {formatarMoeda(custo)}
                </p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                <p className="text-gray-400 text-sm">💵 Saldo Disponível</p>
                <p className={`text-xl font-bold ${ganhosMensais - totalContasPagas - gasto - custo >= 0 ? 'text-[#10a37f]' : 'text-red-400'}`}>
                  {formatarMoeda(ganhosMensais - totalContasPagas - gasto - custo)}
                </p>
                {ganhosMensais > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {((ganhosMensais - totalContasPagas - gasto - custo) / ganhosMensais * 100).toFixed(1)}% dos ganhos
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Notificações */}
        {mostrarNotificacoes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#161b22] p-6 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="text-yellow-500" size={20} />
                  Notificações ({notificacoes.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={limparNotificacoes}
                    className="text-red-400 hover:text-red-500 text-sm"
                  >
                    Limpar todas
                  </button>
                  <button
                    onClick={() => setMostrarNotificacoes(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {notificacoes.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhuma notificação</p>
              ) : (
                <div className="space-y-3">
                  {notificacoes.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border transition-all ${
                        notif.lida ? 'bg-[#0d1117] border-[#30363d] opacity-60' : 'bg-[#0d1117] border-yellow-500 border-opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {notif.tipo === 'vencimento' && <Calendar className="text-orange-500" size={16} />}
                            {notif.tipo === 'lembrete' && <Bell className="text-blue-500" size={16} />}
                            {notif.tipo === 'alerta' && <AlertTriangle className="text-red-500" size={16} />}
                            <h4 className="font-medium text-sm">{notif.titulo}</h4>
                          </div>
                          <p className="text-gray-400 text-xs mb-2">{notif.mensagem}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(notif.data).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!notif.lida && (
                            <button
                              onClick={() => marcarNotificacaoLida(notif.id)}
                              className="text-green-400 hover:text-green-500 text-xs"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => removerNotificacao(notif.id)}
                            className="text-red-400 hover:text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Modal de Configurações de Notificação */}
        {mostrarConfigNotificacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#161b22] p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="text-gray-400" size={20} />
                  Configurações de Notificação
                </h3>
                <button
                  onClick={() => setMostrarConfigNotificacao(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Permissão de notificação */}
                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Notificações Push</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      permissaoNotificacao === 'granted' ? 'bg-green-600' : 
                      permissaoNotificacao === 'denied' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}>
                      {permissaoNotificacao === 'granted' ? 'Permitido' : 
                       permissaoNotificacao === 'denied' ? 'Negado' : 'Pendente'}
                    </span>
                  </div>
                  {permissaoNotificacao !== 'granted' && (
                    <button
                      onClick={solicitarPermissaoNotificacao}
                      className="w-full bg-[#10a37f] text-white py-2 rounded hover:bg-[#0f8e6b] transition-all text-sm"
                    >
                      Solicitar Permissão
                    </button>
                  )}
                </div>
                
                {/* Configurações */}
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={configNotificacao.notificacoesPush}
                        onChange={(e) => setConfigNotificacao(prev => ({...prev, notificacoesPush: e.target.checked}))}
                        className="w-4 h-4 text-[#10a37f] bg-[#0d1117] border-[#30363d] rounded focus:ring-[#10a37f]"
                      />
                      <span className="text-sm">Ativar notificações push</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Dias de antecedência para avisos:</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={configNotificacao.diasAntecedencia}
                      onChange={(e) => setConfigNotificacao(prev => ({...prev, diasAntecedencia: parseInt(e.target.value)}))}
                      className="w-full p-2 rounded bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Horário do lembrete diário:</label>
                    <input
                      type="time"
                      value={configNotificacao.horarioLembrete}
                      onChange={(e) => setConfigNotificacao(prev => ({...prev, horarioLembrete: e.target.value}))}
                      className="w-full p-2 rounded bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={configNotificacao.lembretesDiarios}
                        onChange={(e) => setConfigNotificacao(prev => ({...prev, lembretesDiarios: e.target.checked}))}
                        className="w-4 h-4 text-[#10a37f] bg-[#0d1117] border-[#30363d] rounded focus:ring-[#10a37f]"
                      />
                      <span className="text-sm">Ativar lembretes diários</span>
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={() => setMostrarConfigNotificacao(false)}
                  className="w-full bg-[#10a37f] text-white py-2 rounded hover:bg-[#0f8e6b] transition-all"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#0d1117] min-h-screen text-white p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Gráfico */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">📊 Distribuição Financeira Mensal</h2>
          {ganhosMensais === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>💡 Defina seus ganhos mensais para ver a distribuição</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          )}
          </div>

        {/* Formulário */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Inserir Dados</h2>
          <input
            type="number"
            placeholder="Salário Base"
            value={salario === 0 ? "" : salario}
            onChange={(e) => {
              const novoSalario = +e.target.value;
              setSalario(novoSalario);
              // Se ganhos mensais ainda não foi definido, sincronizar com salário
              if (ganhosMensais === 0) {
                setGanhosMensais(novoSalario);
              }
            }}
            className="mb-2 w-full p-3 rounded bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
          />
          <input
            type="number"
            placeholder="Custos"
            value={custo === 0 ? "" : custo}
            onChange={(e) => setCusto(+e.target.value)}
            className="mb-2 w-full p-3 rounded bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
          />
          <input
            type="number"
            placeholder="Gastos extras"
            value={gasto === 0 ? "" : gasto}
            onChange={(e) => setGasto(+e.target.value)}
            className="mb-4 w-full p-3 rounded bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
          />
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={novoGasto}
              onChange={(e) => setNovoGasto(e.target.value)}
              placeholder="Adicionar gasto"
              className="w-full p-3 rounded bg-[#0d2117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
            />
            <button className="w-full mt-3 bg-[#10a37f] text-white font-semibold py-2 rounded hover:bg-[#0f8e6b] transition-all">
              Adicionar
            </button>
          </form>
        </div>

        {/* Lista de Gastos */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Gastos</h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gastos">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {gastos.map((item, index) => (
                    <Draggable
                      key={item + index}
                      draggableId={item + index}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-[#0d1117] text-white flex justify-between items-center p-3 rounded mb-2 border border-[#30363d] shadow"
                        >
                          {item}
                          <button onClick={() => deletarGasto(index)}>
                            <Trash2
                              className="text-red-400 hover:text-red-500 transition"
                              size={18}
                            />
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Tabela de Contas */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Contas do Mês</h2>
            <button
              onClick={() => setMostrarFormConta(!mostrarFormConta)}
              className="bg-[#10a37f] text-white p-2 rounded-lg hover:bg-[#0f8e6b] transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Nova Conta
            </button>
          </div>

          {mostrarFormConta && (
            <form onSubmit={adicionarConta} className="mb-4 p-4 bg-[#0d1117] rounded-lg border border-[#30363d]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Tipo de conta (ex: Luz)"
                  value={novaConta.tipo}
                  onChange={(e) => setNovaConta({...novaConta, tipo: e.target.value})}
                  className="p-2 rounded bg-[#161b22] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                  required
                />
                <input
                  type="number"
                  placeholder="Valor"
                  value={novaConta.valor}
                  onChange={(e) => setNovaConta({...novaConta, valor: e.target.value})}
                  className="p-2 rounded bg-[#161b22] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                  required
                />
                <input
                  type="date"
                  value={novaConta.data}
                  onChange={(e) => setNovaConta({...novaConta, data: e.target.value})}
                  className="p-2 rounded bg-[#161b22] border border-[#30363d] text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#10a37f] text-white px-4 py-2 rounded hover:bg-[#0f8e6b] transition-all"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormConta(false)}
                  className="bg-[#30363d] text-white px-4 py-2 rounded hover:bg-[#4a5568] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="max-h-64 overflow-y-auto">
            {contas.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhuma conta cadastrada</p>
            ) : (
              <div className="space-y-2">
                {contas.map((conta) => (
                  <div
                    key={conta.id}
                    className={`p-3 rounded-lg border transition-all ${
                      conta.pago 
                        ? 'bg-[#0d1117] border-[#10a37f] border-opacity-50' 
                        : 'bg-[#0d1117] border-[#30363d]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={conta.pago}
                            onChange={() => marcarContaPaga(conta.id)}
                            className="w-4 h-4 text-[#10a37f] bg-[#161b22] border-[#30363d] rounded focus:ring-[#10a37f]"
                          />
                          <div>
                            <p className={`font-medium ${
                              conta.pago ? 'text-gray-400 line-through' : 'text-white'
                            }`}>
                              {conta.tipo}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatarData(conta.dataPagamento)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${
                          conta.pago ? 'text-gray-400 line-through' : 'text-white'
                        }`}>
                          {formatarMoeda(conta.valor)}
                        </span>
                        <button
                          onClick={() => deletarConta(conta.id)}
                          className="text-red-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
