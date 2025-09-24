import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, FileText, Briefcase, ArrowLeft, Copy, CheckCircle, UserCheck, Lock, Plus, Trash2, Building, Edit, Settings, LogOut, Shield, Eye, EyeOff, Database } from 'lucide-react';

const CareerRepositionPlatform = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPersonalForm, setShowPersonalForm] = useState(false);
  const [showProfessionalForm, setShowProfessionalForm] = useState(false);
  const [isProcessingInitial, setIsProcessingInitial] = useState(false);
  const [processedBullets, setProcessedBullets] = useState(null); // Cache dos bullets processados
  const [lastProcessedHash, setLastProcessedHash] = useState(null); // Hash dos dados processados
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [adminLoginError, setAdminLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [personalData, setPersonalData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    linkedinUrl: '',
    email: ''
  });
  const [personalDataErrors, setPersonalDataErrors] = useState({});
  const [professionalData, setProfessionalData] = useState([]);
  const messagesEndRef = useRef(null);

  // Credenciais de administrador (em produção, isso deveria estar em um backend seguro)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'Admin2024!'
  };

  // Dados do banco (baseado na planilha)
  const databaseOptions = {
    verbos: [
      "Desenvolveu", "Liderou", "Implementou", "Gerenciou", "Coordenou", "Executou", "Planejou", 
      "Organizou", "Supervisionou", "Analisou", "Criou", "Otimizou", "Aumentou", "Reduziu", 
      "Melhorou", "Estabeleceu", "Conduziu", "Negociou", "Administrou", "Controlou"
    ],
    descricoes: [
      "estratégias de vendas", "equipe multidisciplinar", "processos operacionais", 
      "projetos estratégicos", "campanhas de marketing", "sistema de gestão", 
      "relacionamento com clientes", "treinamentos corporativos", "análise de dados", 
      "controle de qualidade", "orçamentos e custos", "parcerias comerciais", 
      "políticas internas", "fluxos de trabalho", "indicadores de performance"
    ],
    conectores: [
      "resultando em", "alcançando", "gerando", "obtendo", "atingindo", 
      "proporcionando", "conquistando", "promovendo", "estabelecendo"
    ],
    resultados: [
      "aumento de 30% nas vendas", "redução de 25% nos custos", "melhoria de 40% na produtividade",
      "crescimento de 20% na receita", "otimização de 35% dos processos", "economia de 15% no orçamento",
      "aumento de 50% na satisfação do cliente", "redução de 30% no tempo de entrega",
      "crescimento de 45% na equipe", "melhoria de 25% na qualidade"
    ]
  };

  const agents = [
    { id: 1, name: "Escrita Curricular", icon: FileText, description: "Otimização de currículos para ATS e recrutadores", active: true },
    { id: 2, name: "Mapear Habilidades", icon: Briefcase, description: "Em breve", active: false },
    { id: 3, name: "Resumo Profissional", icon: User, description: "Em breve", active: false },
    { id: 4, name: "Análise Curricular", icon: FileText, description: "Em breve", active: false },
    { id: 5, name: "Análise de Tendências", icon: Briefcase, description: "Em breve", active: false },
    { id: 6, name: "Proposta de Valor", icon: User, description: "Em breve", active: false },
    { id: 7, name: "Simulação de Entrevistas", icon: FileText, description: "Em breve", active: false },
    { id: 8, name: "Análise de Compatibilidade", icon: Briefcase, description: "Em breve", active: false },
    { id: 9, name: "Mercado Oculto", icon: User, description: "Em breve", active: false }
  ];

  // Regras de validação para dados pessoais
  const validatePersonalData = () => {
    const errors = {};

    // Nome completo - deve ter pelo menos nome e sobrenome
    if (!personalData.fullName.trim()) {
      errors.fullName = 'Nome é obrigatório';
    } else if (personalData.fullName.trim().split(' ').length < 2) {
      errors.fullName = 'Informe nome e sobrenome';
    } else if (personalData.fullName.length < 3) {
      errors.fullName = 'Nome deve ter pelo menos 3 caracteres';
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(personalData.fullName)) {
      errors.fullName = 'Nome deve conter apenas letras e espaços';
    }

    // Telefone - formato brasileiro
    if (!personalData.phone.trim()) {
      errors.phone = 'Telefone é obrigatório';
    } else {
      const phoneClean = personalData.phone.replace(/\D/g, '');
      if (phoneClean.length < 10) {
        errors.phone = 'Telefone deve ter pelo menos 10 dígitos';
      } else if (phoneClean.length > 11) {
        errors.phone = 'Telefone deve ter no máximo 11 dígitos';
      } else if (!phoneClean.match(/^(\d{2})(\d{4,5})(\d{4})$/)) {
        errors.phone = 'Formato inválido. Ex: (11) 99999-9999';
      }
    }

    // Endereço
    if (!personalData.address.trim()) {
      errors.address = 'Endereço é obrigatório';
    } else if (personalData.address.length < 10) {
      errors.address = 'Endereço muito curto. Informe rua, número e bairro';
    }

    // Cidade
    if (!personalData.city.trim()) {
      errors.city = 'Cidade é obrigatória';
    } else if (personalData.city.length < 2) {
      errors.city = 'Nome da cidade muito curto';
    } else if (!/^[A-Za-zÀ-ÿ\s\-]+$/.test(personalData.city)) {
      errors.city = 'Cidade deve conter apenas letras, espaços e hífens';
    }

    // Estado - deve ser sigla de 2 letras
    if (!personalData.state.trim()) {
      errors.state = 'Estado é obrigatório';
    } else if (personalData.state.length !== 2) {
      errors.state = 'Use sigla do estado (ex: SP, RJ, MG)';
    } else if (!/^[A-Z]{2}$/.test(personalData.state.toUpperCase())) {
      errors.state = 'Estado deve ter 2 letras maiúsculas';
    }

    // LinkedIn URL
    if (!personalData.linkedinUrl.trim()) {
      errors.linkedinUrl = 'URL do LinkedIn é obrigatória';
    } else if (!personalData.linkedinUrl.startsWith('https://linkedin.com/in/') && 
               !personalData.linkedinUrl.startsWith('https://www.linkedin.com/in/') &&
               !personalData.linkedinUrl.startsWith('http://linkedin.com/in/') && 
               !personalData.linkedinUrl.startsWith('http://www.linkedin.com/in/')) {
      errors.linkedinUrl = 'URL deve começar com https://linkedin.com/in/ ou https://www.linkedin.com/in/';
    } else if (personalData.linkedinUrl.length < 30) {
      errors.linkedinUrl = 'URL do LinkedIn parece incompleta';
    }

    // Email
    if (!personalData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalData.email)) {
        errors.email = 'Formato de email inválido';
      } else if (personalData.email.length > 100) {
        errors.email = 'Email muito longo';
      }
    }

    return errors;
  };

  // Verifica se todos os dados pessoais foram preenchidos e são válidos
  const isPersonalDataComplete = () => {
    const errors = validatePersonalData();
    return Object.values(personalData).every(value => value.trim() !== '') && Object.keys(errors).length === 0;
  };

  // Verifica se o histórico profissional está completo
  const isProfessionalDataComplete = () => {
    return professionalData.length > 0 && professionalData.every(exp => 
      exp.empresa && exp.cargo && exp.dataInicio && exp.dataFim && 
      exp.bulletPoints && exp.bulletPoints.length > 0 && 
      exp.bulletPoints.every(bp => bp.verbo && bp.descricao && bp.conector && bp.resultado)
    );
  };

  // Gera um hash dos dados para verificar mudanças
  const getCurrentDataHash = () => {
    const dataToHash = {
      personal: personalData,
      professional: professionalData.map(exp => ({
        ...exp,
        bulletPoints: exp.bulletPoints.map(bp => ({
          verbo: bp.verbo,
          descricao: bp.descricao,
          conector: bp.conector,
          resultado: bp.resultado
        }))
      }))
    };
    return JSON.stringify(dataToHash);
  };

  // Verifica se os dados mudaram desde o último processamento
  const hasDataChanged = () => {
    const currentHash = getCurrentDataHash();
    return currentHash !== lastProcessedHash;
  };

  // Pega todos os bullet points formatados
  const getAllBulletPoints = () => {
    const bulletPoints = [];
    professionalData.forEach(exp => {
      exp.bulletPoints.forEach(bp => {
        bulletPoints.push(`${bp.verbo} ${bp.descricao} ${bp.conector} ${bp.resultado}`);
      });
    });
    return bulletPoints;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePersonalDataSubmit = (e) => {
    e.preventDefault();
    const errors = validatePersonalData();
    setPersonalDataErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setShowPersonalForm(false);
    }
  };

  const handlePersonalDataChange = (field, value) => {
    // Formatações automáticas
    let formattedValue = value;
    
    if (field === 'phone') {
      // Formatar telefone automaticamente
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 11) {
        formattedValue = numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
      }
    } else if (field === 'state') {
      // Estado sempre maiúsculo e máximo 2 caracteres
      formattedValue = value.toUpperCase().slice(0, 2);
    } else if (field === 'email') {
      // Email sempre minúsculo
      formattedValue = value.toLowerCase();
    } else if (field === 'fullName' || field === 'city') {
      // Capitalizar primeira letra de cada palavra
      formattedValue = value.replace(/\b\w/g, l => l.toUpperCase());
    }

    setPersonalData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpar erro do campo específico quando usuário começar a digitar
    if (personalDataErrors[field]) {
      setPersonalDataErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addProfessionalExperience = () => {
    setProfessionalData(prev => [...prev, {
      id: Date.now(),
      empresa: '',
      cargo: '',
      dataInicio: '',
      dataFim: '',
      bulletPoints: [{
        id: Date.now(),
        verbo: '',
        descricao: '',
        conector: '',
        resultado: ''
      }]
    }]);
  };

  const removeProfessionalExperience = (id) => {
    setProfessionalData(prev => prev.filter(exp => exp.id !== id));
  };

  const updateProfessionalExperience = (id, field, value) => {
    setProfessionalData(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addBulletPoint = (expId) => {
    setProfessionalData(prev => prev.map(exp => 
      exp.id === expId ? {
        ...exp,
        bulletPoints: [...exp.bulletPoints, {
          id: Date.now(),
          verbo: '',
          descricao: '',
          conector: '',
          resultado: ''
        }]
      } : exp
    ));
  };

  const removeBulletPoint = (expId, bulletId) => {
    setProfessionalData(prev => prev.map(exp => 
      exp.id === expId ? {
        ...exp,
        bulletPoints: exp.bulletPoints.filter(bp => bp.id !== bulletId)
      } : exp
    ));
  };

  const updateBulletPoint = (expId, bulletId, field, value) => {
    setProfessionalData(prev => prev.map(exp => 
      exp.id === expId ? {
        ...exp,
        bulletPoints: exp.bulletPoints.map(bp => 
          bp.id === bulletId ? { ...bp, [field]: value } : bp
        )
      } : exp
    ));
  };

  const getBulletPointText = (bp) => {
    if (!bp.verbo || !bp.descricao || !bp.conector || !bp.resultado) return '';
    return `${bp.verbo} ${bp.descricao} ${bp.conector} ${bp.resultado}`;
  };

  const handleProfessionalDataSubmit = () => {
    if (isProfessionalDataComplete()) {
      setShowProfessionalForm(false);
    }
  };

  const processInitialBulletPoints = async () => {
    // Verifica se os dados mudaram
    if (!hasDataChanged() && processedBullets) {
      // Usa o cache - não precisa reprocessar
      const assistantMessage = { role: 'assistant', content: processedBullets };
      setMessages([assistantMessage]);
      return;
    }

    // Dados mudaram ou é o primeiro processamento - processa novamente
    setIsProcessingInitial(true);
    try {
      const bulletPoints = getAllBulletPoints();
      const personalInfo = isPersonalDataComplete() ? `
DADOS PESSOAIS DO USUÁRIO:
- Nome: ${personalData.fullName}
- Telefone: ${personalData.phone}
- Endereço: ${personalData.address}, ${personalData.city}, ${personalData.state}
- LinkedIn: ${personalData.linkedinUrl}
- Email: ${personalData.email}
` : '';

      const prompt = `${personalInfo}
Você é um consultor especializado em otimização de currículos, focado em torná-los compatíveis com sistemas ATS (Applicant Tracking Systems) e com boa visibilidade em SEO.

SEU OBJETIVO: O usuário forneceu bullet points do histórico profissional. Você deve otimizar cada um deles individualmente, mantendo proporção 1:1 (um bullet point de entrada = um bullet point de saída otimizado).

BULLET POINTS FORNECIDOS:
${bulletPoints.map((bp, index) => `${index + 1}. ${bp}`).join('\n')}

INSTRUÇÕES:
- Otimize cada bullet point para ATS
- Mantenha a essência e informações de cada um
- Use verbos de ação adequados
- Máximo 240 caracteres por bullet
- Linguagem natural e impactante
- Responda APENAS com os bullet points otimizados na mesma ordem
- Cada bullet point deve começar em uma nova linha com um hífen (-)

Responda APENAS com os bullet points otimizados, sem explicações adicionais.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const claudeResponse = data.content[0].text;

      // Salva no cache
      setProcessedBullets(claudeResponse);
      setLastProcessedHash(getCurrentDataHash());

      const assistantMessage = { role: 'assistant', content: claudeResponse };
      setMessages([assistantMessage]);
    } catch (error) {
      console.error("Erro ao processar bullet points iniciais:", error);
      const errorMessage = { 
        role: 'assistant', 
        content: "Desculpe, ocorreu um erro ao otimizar seus bullet points. Tente novamente." 
      };
      setMessages([errorMessage]);
    } finally {
      setIsProcessingInitial(false);
    }
  };

  const handleAgentSelect = (agent) => {
    if (!agent.active) return;
    
    // Se for o agente de Escrita Curricular e os dados não estão completos
    if (agent.id === 1) {
      if (!isPersonalDataComplete()) {
        setShowPersonalForm(true);
        return;
      }
      if (!isProfessionalDataComplete()) {
        setShowProfessionalForm(true);
        return;
      }
      
      // Se tudo estiver completo, processar automaticamente
      setSelectedAgent(agent);
      setMessages([]);
      setInput('');
      processInitialBulletPoints();
    }
  };

  const handleBackToAgents = () => {
    setSelectedAgent(null);
    setMessages([]);
    setInput('');
    setShowAdminPanel(false); // Adiciona reset do painel admin
  };

  const getCurriculumPrompt = (userInput) => {
    const personalInfo = isPersonalDataComplete() ? `
DADOS PESSOAIS DO USUÁRIO:
- Nome: ${personalData.fullName}
- Telefone: ${personalData.phone}
- Endereço: ${personalData.address}, ${personalData.city}, ${personalData.state}
- LinkedIn: ${personalData.linkedinUrl}
- Email: ${personalData.email}
` : '';

    const bulletPoints = getAllBulletPoints();
    const professionalInfo = `
BULLET POINTS OTIMIZADOS EXISTENTES:
${bulletPoints.map((bp, index) => `${index + 1}. ${bp}`).join('\n')}
`;

    return `${personalInfo}${professionalInfo}

Você é um consultor especializado em otimização de currículos, focado em torná-los compatíveis com sistemas ATS (Applicant Tracking Systems) e com boa visibilidade em SEO.

SEU OBJETIVO: O usuário quer fazer ajustes adicionais ou adicionar novas informações aos bullet points já otimizados. Processe a solicitação mantendo os bullet points existentes e criando novos conforme necessário.

SOLICITAÇÃO DO USUÁRIO:
${userInput}

Responda APENAS com bullet points, sem explicações adicionais. Cada bullet point deve começar em uma nova linha com um hífen (-).`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const prompt = getCurriculumPrompt(input);
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const claudeResponse = data.content[0].text;

      const assistantMessage = { role: 'assistant', content: claudeResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      const errorMessage = { 
        role: 'assistant', 
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente em alguns instantes." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  // Formulário de dados pessoais
  if (showPersonalForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Informações Pessoais
            </h1>
            <p className="text-gray-600">
              Preencha seus dados para personalizar a experiência
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={personalData.fullName}
                  onChange={(e) => handlePersonalDataChange('fullName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    personalDataErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="João Silva Santos"
                />
                {personalDataErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{personalDataErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone de Contato *
                </label>
                <input
                  type="tel"
                  value={personalData.phone}
                  onChange={(e) => handlePersonalDataChange('phone', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    personalDataErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                  maxLength="15"
                />
                {personalDataErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{personalDataErrors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Formato: (11) 99999-9999</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço *
                </label>
                <input
                  type="text"
                  value={personalData.address}
                  onChange={(e) => handlePersonalDataChange('address', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    personalDataErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Rua das Flores, 123, Centro"
                />
                {personalDataErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{personalDataErrors.address}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Informe rua, número e bairro</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={personalData.city}
                    onChange={(e) => handlePersonalDataChange('city', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      personalDataErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="São Paulo"
                  />
                  {personalDataErrors.city && (
                    <p className="mt-1 text-sm text-red-600">{personalDataErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={personalData.state}
                    onChange={(e) => handlePersonalDataChange('state', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      personalDataErrors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="SP"
                    maxLength="2"
                  />
                  {personalDataErrors.state && (
                    <p className="mt-1 text-sm text-red-600">{personalDataErrors.state}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Sigla: SP, RJ, MG...</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do perfil LinkedIn *
                </label>
                <input
                  type="url"
                  value={personalData.linkedinUrl}
                  onChange={(e) => handlePersonalDataChange('linkedinUrl', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    personalDataErrors.linkedinUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="https://linkedin.com/in/seuperfil"
                />
                {personalDataErrors.linkedinUrl && (
                  <p className="mt-1 text-sm text-red-600">{personalDataErrors.linkedinUrl}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Ex: https://linkedin.com/in/joaosilva</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={personalData.email}
                  onChange={(e) => handlePersonalDataChange('email', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    personalDataErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="joao.silva@email.com"
                />
                {personalDataErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{personalDataErrors.email}</p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPersonalForm(false);
                    setPersonalDataErrors({});
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePersonalDataSubmit}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar e Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de histórico profissional
  if (showProfessionalForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Building className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Histórico Profissional
            </h1>
            <p className="text-gray-600">
              Monte bullet points otimizados selecionando as opções abaixo
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {professionalData.length === 0 && (
              <div className="text-center py-8">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Nenhuma experiência adicionada ainda</p>
              </div>
            )}

            {professionalData.map((exp, expIndex) => (
              <div key={exp.id} className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Experiência {expIndex + 1}
                  </h3>
                  <button
                    onClick={() => removeProfessionalExperience(exp.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Linha com dados básicos da experiência */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      value={exp.empresa}
                      onChange={(e) => updateProfessionalExperience(exp.id, 'empresa', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Nome da empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo *
                    </label>
                    <input
                      type="text"
                      value={exp.cargo}
                      onChange={(e) => updateProfessionalExperience(exp.id, 'cargo', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Cargo ocupado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Início *
                    </label>
                    <input
                      type="month"
                      value={exp.dataInicio}
                      onChange={(e) => updateProfessionalExperience(exp.id, 'dataInicio', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Fim *
                    </label>
                    <input
                      type="month"
                      value={exp.dataFim}
                      onChange={(e) => updateProfessionalExperience(exp.id, 'dataFim', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Bullet Points */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">Bullet Points:</h4>
                  
                  {exp.bulletPoints.map((bp, bpIndex) => (
                    <div key={bp.id} className="border-l-4 border-green-400 pl-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-600">
                          Bullet Point {bpIndex + 1}
                        </span>
                        {exp.bulletPoints.length > 1 && (
                          <button
                            onClick={() => removeBulletPoint(exp.id, bp.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Verbo de Ação *
                          </label>
                          <select
                            value={bp.verbo}
                            onChange={(e) => updateBulletPoint(exp.id, bp.id, 'verbo', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          >
                            <option value="">Selecione...</option>
                            {databaseOptions.verbos.map(verbo => (
                              <option key={verbo} value={verbo}>{verbo}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Descrição *
                          </label>
                          <select
                            value={bp.descricao}
                            onChange={(e) => updateBulletPoint(exp.id, bp.id, 'descricao', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          >
                            <option value="">Selecione...</option>
                            {databaseOptions.descricoes.map(desc => (
                              <option key={desc} value={desc}>{desc}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Conector *
                          </label>
                          <select
                            value={bp.conector}
                            onChange={(e) => updateBulletPoint(exp.id, bp.id, 'conector', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          >
                            <option value="">Selecione...</option>
                            {databaseOptions.conectores.map(conector => (
                              <option key={conector} value={conector}>{conector}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Resultado *
                          </label>
                          <select
                            value={bp.resultado}
                            onChange={(e) => updateBulletPoint(exp.id, bp.id, 'resultado', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          >
                            <option value="">Selecione...</option>
                            {databaseOptions.resultados.map(resultado => (
                              <option key={resultado} value={resultado}>{resultado}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {getBulletPointText(bp) && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800 mb-1">Preview:</p>
                          <p className="text-sm text-green-700">{getBulletPointText(bp)}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => addBulletPoint(exp.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Bullet Point</span>
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={addProfessionalExperience}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Experiência</span>
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowProfessionalForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProfessionalDataSubmit}
                  disabled={!isProfessionalDataComplete()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Salvar e Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela inicial com grid de agentes
  if (!selectedAgent && !showAdminPanel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Plataforma de Recolocação Profissional
            </h1>
            <p className="text-lg text-gray-600">
              Acelere sua recolocação com agentes de IA especializados
            </p>
            
            <div className="mt-6 max-w-2xl mx-auto space-y-3">
              {/* Botão de Acesso do Administrador */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => {
                    console.log('Clicou no botão admin!'); // Debug
                    setShowAdminPanel(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm shadow-lg"
                >
                  <Settings className="w-4 h-4" />
                  <span>Área do Administrador</span>
                </button>
              </div>

              {/* Status dos dados pessoais */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">1. Dados Pessoais</span>
                {isPersonalDataComplete() ? (
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 text-sm">Completo</span>
                    </div>
                    <button
                      onClick={() => setShowPersonalForm(true)}
                      className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPersonalForm(true)}
                    className="text-sm bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Preencher
                  </button>
                )}
              </div>

              {/* Status do histórico profissional */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">2. Histórico Profissional</span>
                {isProfessionalDataComplete() ? (
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 text-sm">
                        Completo ({professionalData.length} exp. | {getAllBulletPoints().length} bullets)
                      </span>
                    </div>
                    <button
                      onClick={() => setShowProfessionalForm(true)}
                      className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>
                ) : isPersonalDataComplete() ? (
                  <button
                    onClick={() => setShowProfessionalForm(true)}
                    className="text-sm bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Preencher
                  </button>
                ) : (
                  <span className="text-sm text-gray-400 px-4 py-1">Bloqueado</span>
                )}
              </div>

              {/* Status do agente */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">3. Escrita Curricular</span>
                {isPersonalDataComplete() && isProfessionalDataComplete() ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 text-sm">Pronto para usar</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 px-4 py-1">Bloqueado</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => {
              const IconComponent = agent.icon;
              const isAccessible = agent.active && (agent.id === 1 ? (isPersonalDataComplete() && isProfessionalDataComplete()) : true);
              
              return (
                <div
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    isAccessible
                      ? 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer'
                      : agent.id === 1 && (!isPersonalDataComplete() || !isProfessionalDataComplete())
                      ? 'bg-orange-50 border-orange-200 cursor-pointer'
                      : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full mb-4 relative ${
                      isAccessible ? 'bg-blue-100' : 
                      agent.id === 1 && (!isPersonalDataComplete() || !isProfessionalDataComplete()) ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isAccessible ? 'text-blue-600' : 
                        agent.id === 1 && (!isPersonalDataComplete() || !isProfessionalDataComplete()) ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                      {agent.id === 1 && (!isPersonalDataComplete() || !isProfessionalDataComplete()) && (
                        <Lock className="w-3 h-3 text-orange-600 absolute -top-1 -right-1 bg-white rounded-full" />
                      )}
                    </div>
                    <h3 className={`font-semibold mb-2 text-sm ${
                      isAccessible ? 'text-gray-800' : 
                      agent.id === 1 && (!isPersonalDataComplete() || !isProfessionalDataComplete()) ? 'text-orange-700' : 'text-gray-500'
                    }`}>
                      {agent.name}
                    </h3>
                    <p className={`text-xs ${
                      isAccessible ? 'text-gray-600' : 
                      agent.id === 1 && (!isPersonalDataComplete() || !isProfessionalDataComplete()) ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {agent.id === 1 && (!isPersonalDataComplete() || !isProfessionalDataComplete()) ? 
                        'Complete os dados obrigatórios primeiro' : 
                        agent.description
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Tela do agente selecionado
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToAgents}
            className="mr-4 p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedAgent.name}
            </h1>
            <p className="text-gray-600 text-sm">
              Bullet points otimizados automaticamente para ATS
            </p>
          </div>
        </div>

        {/* Resumo dos dados carregados */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm">Dados processados:</h3>
          <div className="text-blue-700 text-sm space-y-1">
            <p><strong>Pessoais:</strong> {personalData.fullName} • {personalData.city}/{personalData.state}</p>
            <p><strong>Histórico:</strong> {professionalData.length} experiências • {getAllBulletPoints().length} bullet points otimizados</p>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && isProcessingInitial && (
              <div className="text-center text-gray-500 py-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-sm">Processando seus bullet points...</p>
              </div>
            )}

            {messages.length === 0 && !isProcessingInitial && (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <div className="text-sm space-y-2">
                  <p>Seus bullet points serão otimizados automaticamente!</p>
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-lg p-3 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                    >
                      {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="p-1.5 bg-blue-600 rounded-full flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={messages.length > 0 ? "Ex: 'Adicione mais detalhes sobre liderança' ou 'Crie bullet para projeto X'" : "Aguarde o processamento automático dos seus bullet points..."}
                disabled={messages.length === 0}
                className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-400"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading || messages.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm">Enviar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Seção CV Formatado */}
        {messages.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Experiência Profissional - Formato CV</h3>
                <div className="flex items-center space-x-3">
                  {!hasDataChanged() && processedBullets && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Cache ativo
                    </span>
                  )}
                  <button
                    onClick={() => copyToClipboard(getCVFormattedText())}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>Copiar CV</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {professionalData.map((exp, index) => (
                  <div key={exp.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    {/* Linha do cabeçalho da experiência */}
                    <div className="flex flex-wrap items-center justify-between mb-3">
                      <div className="flex flex-wrap items-center space-x-4">
                        <h4 className="text-lg font-semibold text-gray-900">{exp.cargo}</h4>
                        <span className="text-gray-600">•</span>
                        <span className="text-lg font-medium text-blue-600">{exp.empresa}</span>
                      </div>
                      <div className="text-gray-600 font-medium">
                        {formatDate(exp.dataInicio)} - {formatDate(exp.dataFim)}
                      </div>
                    </div>

                    {/* Bullet points otimizados */}
                    <div className="ml-4">
                      {messages.length > 0 && (
                        <div className="space-y-2">
                          {getOptimizedBulletsForExperience(index).map((bullet, bulletIndex) => (
                            <div key={bulletIndex} className="flex items-start">
                              <span className="text-gray-600 mr-2 mt-1">•</span>
                              <p className="text-gray-700 leading-relaxed">{bullet}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Funções auxiliares
  function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

  function getOptimizedBulletsForExperience(expIndex) {
    // Pega os bullet points otimizados da primeira mensagem do agente
    if (messages.length === 0) return [];
    
    const optimizedContent = messages[0].content;
    const bullets = optimizedContent.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, ''));
    
    // Calcula quantos bullets pertencem a cada experiência
    let currentIndex = 0;
    for (let i = 0; i < expIndex; i++) {
      currentIndex += professionalData[i].bulletPoints.length;
    }
    
    return bullets.slice(currentIndex, currentIndex + professionalData[expIndex].bulletPoints.length);
  }

  function getCVFormattedText() {
    let cvText = 'EXPERIÊNCIA PROFISSIONAL\n\n';
    
    professionalData.forEach((exp, index) => {
      cvText += `${exp.cargo} • ${exp.empresa}\n`;
      cvText += `${formatDate(exp.dataInicio)} - ${formatDate(exp.dataFim)}\n\n`;
      
      const bullets = getOptimizedBulletsForExperience(index);
      bullets.forEach(bullet => {
        cvText += `• ${bullet}\n`;
      });
      cvText += '\n';
    });
    
    return cvText;
  }

  // Funções de autenticação de administrador
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminLoginError('');

    if (adminCredentials.username === ADMIN_CREDENTIALS.username && 
        adminCredentials.password === ADMIN_CREDENTIALS.password) {
      setIsAdminAuthenticated(true);
      setAdminCredentials({ username: '', password: '' });
    } else {
      setAdminLoginError('Credenciais inválidas. Tente novamente.');
      setAdminCredentials({ username: '', password: '' });
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setShowAdminPanel(false);
    setAdminCredentials({ username: '', password: '' });
    setAdminLoginError('');
  };

  const handleBackToMain = () => {
    setShowAdminPanel(false);
    setIsAdminAuthenticated(false);
    setAdminCredentials({ username: '', password: '' });
    setAdminLoginError('');
  };

  const updateDatabaseOption = (category, index, newValue) => {
    // Esta função atualizaria o banco de dados em um sistema real
    // Por agora, vamos apenas simular a atualização
    console.log(`Atualizando ${category}[${index}] para: ${newValue}`);
  };
};

export default CareerRepositionPlatform;
