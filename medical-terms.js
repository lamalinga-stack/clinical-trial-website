const translations = {
  en: {
    notFound: 'Not Found',
    recruitingStatus: 'Recruiting',
    activeNotRecruitingStatus: 'Active, not recruiting',
    enrollingByInvitationStatus: 'Enrolling by invitation',
    completeStatus: 'Complete',
    activeStatus: 'Active',
  },
  fr: {
    notFound: 'Non trouvé',
    recruitingStatus: 'Recrutement en cours',
    activeNotRecruitingStatus: 'Actif, sans recrutement',
    enrollingByInvitationStatus: 'Inscription sur invitation',
    completeStatus: 'Complété',
    activeStatus: 'Actif',
  },
  pt: {
    notFound: 'Não encontrado',
    recruitingStatus: 'Recrutamento em andamento',
    activeNotRecruitingStatus: 'Ativo, sem recrutamento',
    enrollingByInvitationStatus: 'Inscrição por convite',
    completeStatus: 'Concluído',
    activeStatus: 'Ativo',
  },
};

function formatStatusMedical(status) {
  const statusLower = (status || 'Unknown').toLowerCase().replace(/_/g, '');
  
  const statusMap = {
    'recruiting': 'recruitingStatus',
    'activenotrecruiting': 'activeNotRecruitingStatus',
    'enrollingbyinvitation': 'enrollingByInvitationStatus',
    'complete': 'completeStatus',
    'active': 'activeStatus',
  };

  const key = statusMap[statusLower] || 'notFound';
  return translations[window.currentLanguage]?.[key] || translations['en'][key] || status;
}
