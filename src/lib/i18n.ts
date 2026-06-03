// ─── FamilyQuest translations ─────────────────────────────────────────────
// Supported: es (Español), en (English), fr (Français)

export type Lang = 'es' | 'en' | 'fr'

export const T = {
  // ── Sidebar ──────────────────────────────────────────────────
  nav: {
    calendar:  { es:'Calendar',  en:'Calendar',  fr:'Calendrier'  },
    tasks:     { es:'Tasks',     en:'Tasks',      fr:'Tâches'      },
    rewards:   { es:'Rewards',   en:'Rewards',    fr:'Récompenses' },
    meals:     { es:'Meals',     en:'Meals',      fr:'Repas'       },
    photos:    { es:'Photos',    en:'Photos',     fr:'Photos'      },
    sleep:     { es:'Sleep',     en:'Sleep',      fr:'Sommeil'     },
    settings:  { es:'Settings',  en:'Settings',   fr:'Paramètres'  },
  },

  // ── Calendar ─────────────────────────────────────────────────
  cal: {
    addEvent:    { es:'Add Event',   en:'Add Event',    fr:'Ajouter' },
    week:        { es:'Week',        en:'Week',          fr:'Semaine' },
    nextWeek:    { es:'Next Week',   en:'Next Week',     fr:'Semaine suivante' },
    goNext:      { es:'Go',          en:'Go',            fr:'Aller'   },
    allDay:      { es:'All day',     en:'All day',       fr:'Journée' },
    today:       { es:'Hoy',         en:'Today',         fr:"Aujourd'hui" },
    days: {
      short: {
        es: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
        en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        fr: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
      }
    }
  },

  // ── Tasks ────────────────────────────────────────────────────
  tasks: {
    addTask:      { es:'Add Task',          en:'Add Task',           fr:'Ajouter tâche' },
    fixedTasks:   { es:'Fixed Tasks',       en:'Fixed Tasks',        fr:'Tâches fixes' },
    fixedSub:     { es:'Se repiten todos los días', en:'Repeats every day', fr:'Se répète chaque jour' },
    onceTasks:    { es:'One-time Tasks',    en:'One-time Tasks',     fr:'Tâches ponctuelles' },
    onceSub:      { es:'Tareas específicas',en:'Specific tasks',     fr:'Tâches spécifiques' },
    completed:    { es:'Completados',       en:'Completed',          fr:'Terminés' },
    noFixed:      { es:'Sin tasks fijos',   en:'No fixed tasks',     fr:'Aucune tâche fixe' },
    noPending:    { es:'Sin tasks pendientes', en:'No pending tasks',fr:'Aucune tâche en attente' },
    addFirst:     { es:'Agregar task',      en:'Add task',           fr:'Ajouter tâche' },
    noTasks:      { es:'no tiene tasks',    en:'has no tasks',       fr:'n\'a pas de tâches' },
    addFirstTask: { es:'Agregar primer task', en:'Add first task',   fr:'Ajouter la première tâche' },
    type:         { es:'Tipo',              en:'Type',               fr:'Type' },
    priority:     { es:'Prioridad',         en:'Priority',           fr:'Priorité' },
    time:         { es:'Hora',              en:'Time',               fr:'Heure' },
    points:       { es:'Puntos al completar', en:'Points on complete', fr:'Points à compléter' },
    note:         { es:'Nota (opcional)',   en:'Note (optional)',     fr:'Note (optionnel)' },
    days:         { es:'¿Qué días se repite?', en:'Which days?',     fr:'Quels jours?' },
    everyday:     { es:'Todos los días',    en:'Every day',          fr:'Chaque jour' },
    weekdays:     { es:'Lun–Vie (escuela)', en:'Mon–Fri (school)',   fr:'Lun–Ven (école)' },
    weekends:     { es:'Sáb–Dom',          en:'Sat–Sun',             fr:'Sam–Dim' },
    custom:       { es:'Personalizado',     en:'Custom',             fr:'Personnalisé' },
    saveTask:     { es:'💾 Guardar cambios', en:'💾 Save changes',   fr:'💾 Enregistrer' },
    addTaskBtn:   { es:'✨ Agregar Task',    en:'✨ Add Task',        fr:'✨ Ajouter' },
    noSpecificTime:{ es:'Sin hora específica', en:'No specific time', fr:'Pas d\'heure' },
    cancel:       { es:'Cancelar',          en:'Cancel',             fr:'Annuler' },
    chooseHow:    { es:'¿Cómo quieres crearlo?', en:'How to create it?', fr:'Comment créer ?' },
    fromLibrary:  { es:'Elegir de biblioteca', en:'Choose from library', fr:'Choisir dans la bibliothèque' },
    fromScratch:  { es:'Crear desde cero',  en:'Create from scratch', fr:'Créer de zéro' },
    library:      { es:'📚 Biblioteca',     en:'📚 Library',         fr:'📚 Bibliothèque' },
    selectItems:  { es:'Toca para seleccionar', en:'Tap to select',  fr:'Appuyer pour sélectionner' },
    useSelected:  { es:'Usar seleccionados', en:'Use selected',      fr:'Utiliser la sélection' },
    configTask:   { es:'Configurar task',   en:'Configure task',     fr:'Configurer la tâche' },
    members:      { es:'Miembros',          en:'Members',            fr:'Membres' },
    assignTo:     { es:'Asignar a',         en:'Assign to',          fr:'Assigner à' },
    urgent:       { es:'Urgente',           en:'Urgent',             fr:'Urgent' },
    medium:       { es:'Media',             en:'Medium',             fr:'Moyenne' },
    low:          { es:'Baja',              en:'Low',                fr:'Faible' },
    fixed:        { es:'🔄 Fixed',          en:'🔄 Fixed',           fr:'🔄 Fixe' },
    onetime:      { es:'📅 One-time',       en:'📅 One-time',        fr:'📅 Ponctuel' },
    reset:        { es:'Reiniciar',         en:'Reset',              fr:'Réinitialiser' },
    daily:        { es:'Diario',            en:'Daily',              fr:'Quotidien' },
    editTask:     { es:'✏️ Editar Task',    en:'✏️ Edit Task',       fr:'✏️ Modifier' },
    newTask:      { es:'✏️ Nuevo Task',     en:'✏️ New Task',        fr:'✏️ Nouvelle tâche' },
  },

  // ── Rewards ──────────────────────────────────────────────────
  rewards: {
    title:        { es:'Rewards',           en:'Rewards',            fr:'Récompenses' },
    store:        { es:'🎁 Tienda',         en:'🎁 Store',           fr:'🎁 Boutique' },
    history:      { es:'📜 Historial',      en:'📜 History',         fr:'📜 Historique' },
    addReward:    { es:'Agregar Premio',     en:'Add Reward',         fr:'Ajouter' },
    claim:        { es:'✓ Canjear',         en:'✓ Redeem',           fr:'✓ Échanger' },
    locked:       { es:'🔒 No alcanza',     en:'🔒 Not enough',      fr:'🔒 Insuffisant' },
    pointsAvail:  { es:'puntos disponibles', en:'points available',  fr:'points disponibles' },
    noRewards:    { es:'Sin premios todavía', en:'No rewards yet',   fr:'Pas encore de récompenses' },
    addNew:       { es:'Agregar Premio',     en:'Add Reward',         fr:'Ajouter' },
    cost:         { es:'Costo en puntos',    en:'Point cost',         fr:'Coût en points' },
    newReward:    { es:'🎁 Nuevo Premio',    en:'🎁 New Reward',      fr:'🎁 Nouvelle récompense' },
    rewardName:   { es:'Nombre del premio...', en:'Reward name...', fr:'Nom de la récompense...' },
    currentBalance:{ es:'Balance actual',   en:'Current balance',    fr:'Solde actuel' },
    noHistory:    { es:'Sin historial aún', en:'No history yet',     fr:'Pas encore d\'historique' },
  },

  // ── Settings ────────────────────────────────────────────────
  settings: {
    title:        { es:'Ajustes',           en:'Settings',           fr:'Paramètres' },
    profile:      { es:'Perfil',            en:'Profile',            fr:'Profil' },
    family:       { es:'Familia',           en:'Family',             fr:'Famille' },
    appearance:   { es:'Apariencia',        en:'Appearance',         fr:'Apparence' },
    notifications:{ es:'Notificaciones',    en:'Notifications',      fr:'Notifications' },
    gamification: { es:'Gamificación',      en:'Gamification',       fr:'Gamification' },
    calendar:     { es:'Calendario',        en:'Calendar',           fr:'Calendrier' },
    security:     { es:'Seguridad',         en:'Security',           fr:'Sécurité' },
    plan:         { es:'Plan',              en:'Plan',               fr:'Abonnement' },
    about:        { es:'Acerca de',         en:'About',              fr:'À propos' },
    save:         { es:'Guardar cambios',   en:'Save changes',       fr:'Enregistrer' },
    saved:        { es:'Guardado',          en:'Saved',              fr:'Enregistré' },
    administrator:{ es:'Administrador familiar', en:'Family administrator', fr:'Administrateur familial' },
    language:     { es:'Idioma',            en:'Language',           fr:'Langue' },
    temperature:  { es:'Temperatura',       en:'Temperature',        fr:'Température' },
    timeFormat:   { es:'Hora',              en:'Time',               fr:'Heure' },
    name:         { es:'Nombre',            en:'Name',               fr:'Nom' },
    phone:        { es:'Teléfono',          en:'Phone',              fr:'Téléphone' },
    inviteCode:   { es:'Código de invitación', en:'Invite code',     fr:'Code d\'invitation' },
    inviteSub:    { es:'Compártelo para que otros se unan', en:'Share to invite others', fr:'Partager pour inviter' },
    members:      { es:'Miembros',          en:'Members',            fr:'Membres' },
    addMember:    { es:'Agregar miembro',   en:'Add member',         fr:'Ajouter membre' },
    colorMode:    { es:'Modo de color',     en:'Color mode',         fr:'Mode couleur' },
    light:        { es:'Claro',             en:'Light',              fr:'Clair' },
    dark:         { es:'Oscuro',            en:'Dark',               fr:'Sombre' },
    auto:         { es:'Auto',              en:'Auto',               fr:'Auto' },
    fontSize:     { es:'Fuente',            en:'Font',               fr:'Police' },
    accentColor:  { es:'Color de acento',   en:'Accent color',       fr:'Couleur d\'accent' },
    defaultView:  { es:'Vista por defecto', en:'Default view',       fr:'Vue par défaut' },
    showTasks:    { es:'Mostrar tasks',     en:'Show tasks',         fr:'Afficher les tâches' },
    showTasksSub: { es:'Tasks con hora en su slot', en:'Timed tasks in their slot', fr:'Tâches dans leur créneau' },
    weekStarts:   { es:'La semana empieza en', en:'Week starts on',  fr:'La semaine commence le' },
    showWeekends: { es:'Mostrar fines de semana', en:'Show weekends', fr:'Afficher les week-ends' },
    showWeekendsSub:{ es:'Sábado y domingo en la vista semanal', en:'Saturday and Sunday in week view', fr:'Samedi et dimanche en vue semaine' },
    autoSave:     { es:'Cambios instantáneos — sin botón de guardar', en:'Instant changes — no save button needed', fr:'Changements instantanés' },
    // Profile
    preferences:  { es:'Preferencias',       en:'Preferences',         fr:'Préférences' },
    saveProfile:  { es:'Guardar perfil',      en:'Save profile',        fr:'Enregistrer le profil' },
    // Appearance
    colorModeRow: { es:'Modo',                en:'Mode',                fr:'Mode' },
    fontGroup:    { es:'Fuente',              en:'Font',                fr:'Police' },
    fontSizeLabel:{ es:'Tamaño de letra',     en:'Font size',           fr:'Taille de police' },
    // Family / sync
    syncGroup:    { es:'📱 Sincronizar en todos tus dispositivos', en:'📱 Sync across all your devices', fr:'📱 Synchroniser sur tous vos appareils' },
    syncConnected:{ es:'✅ Conectado a la nube', en:'✅ Connected to cloud', fr:'✅ Connecté au cloud' },
    syncManage:   { es:'Gestionar',           en:'Manage',              fr:'Gérer' },
    syncConnect:  { es:'☁️ Conectar mis dispositivos', en:'☁️ Connect my devices', fr:'☁️ Connecter mes appareils' },
    syncDesc:     { es:'Conecta para que el iPad, teléfono y PC compartan los mismos datos.', en:'Connect so iPad, phone and PC share the same data.', fr:'Connecte pour que iPad, téléphone et PC partagent les mêmes données.' },
    addMemberTitle:{ es:'Agregar miembro',    en:'Add member',          fr:'Ajouter un membre' },
    // Notifications
    notifAll:     { es:'Notificaciones',      en:'Notifications',       fr:'Notifications' },
    notifAllSub:  { es:'Activar o desactivar todas', en:'Enable or disable all', fr:'Activer ou désactiver tout' },
    notifByType:  { es:'Por tipo',            en:'By type',             fr:'Par type' },
    taskReminder: { es:'Recordatorio de task', en:'Task reminder',      fr:'Rappel de tâche' },
    taskReminderSub:{ es:'Antes de que venza', en:'Before it\'s due',   fr:'Avant l\'échéance' },
    taskDoneNotif:{ es:'Task completado',     en:'Task completed',      fr:'Tâche terminée' },
    taskDoneSub:  { es:'Cuando un hijo termina', en:'When a child finishes', fr:'Quand un enfant termine' },
    newEventNotif:{ es:'Nuevo evento',        en:'New event',           fr:'Nouvel événement' },
    newEventSub:  { es:'Eventos en el calendario', en:'Calendar events', fr:'Événements du calendrier' },
    achievementNotif:{ es:'Logro desbloqueado', en:'Achievement unlocked', fr:'Succès débloqué' },
    achievementSub:{ es:'¡Felicidades!',      en:'Congratulations!',    fr:'Félicitations !' },
    rewardNotif:  { es:'Premio reclamado',    en:'Reward claimed',      fr:'Récompense réclamée' },
    rewardSub:    { es:'Solicitudes de recompensa', en:'Reward requests', fr:'Demandes de récompense' },
    silentGroup:  { es:'Horas de silencio',   en:'Silent hours',        fr:'Heures silencieuses' },
    silentToggle: { es:'Silenciar notificaciones', en:'Mute notifications', fr:'Désactiver les notifications' },
    silentFrom:   { es:'Desde',              en:'From',                 fr:'De' },
    silentTo:     { es:'Hasta',              en:'To',                   fr:'À' },
    // Gamification
    pointsSystem: { es:'Sistema de puntos',   en:'Points system',       fr:'Système de points' },
    pointsSub:    { es:'Los hijos ganan puntos al completar tasks', en:'Children earn points completing tasks', fr:'Les enfants gagnent des points en complétant les tâches' },
    streaks:      { es:'Rachas',              en:'Streaks',             fr:'Séries' },
    streaksSub:   { es:'Días consecutivos completando tasks', en:'Consecutive days completing tasks', fr:'Jours consécutifs à compléter des tâches' },
    achievementsGroup:{ es:'Logros disponibles', en:'Available achievements', fr:'Succès disponibles' },
    // Calendar
    integrations: { es:'Integraciones',       en:'Integrations',        fr:'Intégrations' },
    googleCal:    { es:'Google Calendar',     en:'Google Calendar',     fr:'Google Agenda' },
    googleCalSub: { es:'Sincronizar eventos', en:'Sync events',         fr:'Synchroniser les événements' },
    appleCal:     { es:'Apple Calendar',      en:'Apple Calendar',      fr:'Calendrier Apple' },
    appleCalSub:  { es:'Importar/exportar',   en:'Import/export',       fr:'Importer/exporter' },
    exportIcs:    { es:'Exportar calendario (.ics)', en:'Export calendar (.ics)', fr:'Exporter le calendrier (.ics)' },
    // Security
    passwordGroup:{ es:'Contraseña',          en:'Password',            fr:'Mot de passe' },
    currentPw:    { es:'Contraseña actual',   en:'Current password',    fr:'Mot de passe actuel' },
    newPw:        { es:'Nueva contraseña',    en:'New password',        fr:'Nouveau mot de passe' },
    confirmPw:    { es:'Confirmar nueva',     en:'Confirm new',         fr:'Confirmer le nouveau' },
    updatePw:     { es:'Actualizar contraseña', en:'Update password',   fr:'Mettre à jour le mot de passe' },
    additionalSec:{ es:'Seguridad adicional', en:'Additional security', fr:'Sécurité supplémentaire' },
    twoFA:        { es:'Autenticación 2 factores', en:'Two-factor auth', fr:'Authentification 2 facteurs' },
    twoFASub:     { es:'Más seguridad con autenticador', en:'Extra security with authenticator', fr:'Plus de sécurité avec un authentificateur' },
    dataGroup:    { es:'Datos',               en:'Data',                fr:'Données' },
    downloadData: { es:'Descargar mis datos', en:'Download my data',    fr:'Télécharger mes données' },
    logoutAll:    { es:'Cerrar sesión en todos', en:'Sign out everywhere', fr:'Se déconnecter partout' },
    dangerZone:   { es:'Zona peligrosa',      en:'Danger zone',         fr:'Zone dangereuse' },
    deleteConfirm:{ es:'⚠️ Escribe ELIMINAR para confirmar el borrado de cuenta', en:'⚠️ Type DELETE to confirm account deletion', fr:'⚠️ Tapez SUPPRIMER pour confirmer la suppression du compte' },
    deleteWord:   { es:'ELIMINAR',            en:'DELETE',              fr:'SUPPRIMER' },
    deleteWordPlaceholder:{ es:'Escribe "ELIMINAR"', en:'Type "DELETE"', fr:'Tapez "SUPPRIMER"' },
    deleteBtn:    { es:'Eliminar cuenta permanentemente', en:'Permanently delete account', fr:'Supprimer définitivement le compte' },
    pwMatch:      { es:'Contraseña actualizada ✅', en:'Password updated ✅', fr:'Mot de passe mis à jour ✅' },
    pwNoMatch:    { es:'Las contraseñas no coinciden o son muy cortas', en:'Passwords do not match or are too short', fr:'Les mots de passe ne correspondent pas ou sont trop courts' },
    // Plan
    currentPlan:  { es:'Plan actual',         en:'Current plan',        fr:'Plan actuel' },
    planFree:     { es:'Gratis',              en:'Free',                fr:'Gratuit' },
    planFreeDesc: { es:'5 miembros · 30 tasks/mes', en:'5 members · 30 tasks/month', fr:'5 membres · 30 tâches/mois' },
    availablePlans:{ es:'Planes disponibles', en:'Available plans',     fr:'Plans disponibles' },
    upgrade:      { es:'Upgrade',             en:'Upgrade',             fr:'Passer au suivant' },
    // About
    madeWith:     { es:'Hecho con ❤️ para las familias · © 2026 FamilyQuest', en:'Made with ❤️ for families · © 2026 FamilyQuest', fr:'Fait avec ❤️ pour les familles · © 2026 FamilyQuest' },
    terms:        { es:'Términos de uso',     en:'Terms of use',        fr:'Conditions d\'utilisation' },
    privacy:      { es:'Política de privacidad', en:'Privacy policy',   fr:'Politique de confidentialité' },
    support:      { es:'Contacto / Soporte',  en:'Contact / Support',   fr:'Contact / Support' },
    rate:         { es:'Calificar la app',    en:'Rate the app',        fr:'Évaluer l\'application' },
    version:      { es:'Versión',             en:'Version',             fr:'Version' },
  },

  // ── Common ───────────────────────────────────────────────────
  common: {
    save:         { es:'Guardar',           en:'Save',               fr:'Enregistrer' },
    cancel:       { es:'Cancelar',          en:'Cancel',             fr:'Annuler' },
    delete:       { es:'Eliminar',          en:'Delete',             fr:'Supprimer' },
    edit:         { es:'Editar',            en:'Edit',               fr:'Modifier' },
    add:          { es:'Agregar',           en:'Add',                fr:'Ajouter' },
    done:         { es:'Listo',             en:'Done',               fr:'Terminé' },
    close:        { es:'Cerrar',            en:'Close',              fr:'Fermer' },
    confirm:      { es:'Confirmar',         en:'Confirm',            fr:'Confirmer' },
    back:         { es:'Volver',            en:'Back',               fr:'Retour' },
    connect:      { es:'Conectar',          en:'Connect',            fr:'Connecter' },
    soon:         { es:'Próximamente',      en:'Coming soon',        fr:'Bientôt disponible' },
    upload:       { es:'Subir foto',        en:'Upload photo',       fr:'Télécharger photo' },
    points:       { es:'puntos',            en:'points',             fr:'points' },
    adult:        { es:'Adulto',            en:'Adult',              fr:'Adulte' },
    child:        { es:'Niño/a',            en:'Child',              fr:'Enfant' },
    all:          { es:'Todos',             en:'All',                fr:'Tous' },
    today:        { es:'Hoy',              en:'Today',               fr:"Aujourd'hui" },
    monday:       { es:'Lunes',             en:'Monday',             fr:'Lundi' },
    sunday:       { es:'Domingo',           en:'Sunday',             fr:'Dimanche' },
  }
} as const

// ─── Hook ──────────────────────────────────────────────────────────────────
import { useAppSettings } from '@/hooks/useAppStore'

export function useT() {
  const { settings } = useAppSettings()
  const lang = (settings.language || 'es') as Lang

  function t(path: string): string {
    const parts = path.split('.')
    let node: any = T
    for (const p of parts) {
      node = node?.[p]
      if (!node) return path
    }
    if (typeof node === 'object' && lang in node) return node[lang]
    return path
  }

  return { t, lang }
}
