import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// English and Arabic translations
const translations = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.pitches": "Pitches",
    "nav.reservations": "Reservations",
    "nav.leaderboards": "Leaderboards",
    "nav.login": "Login",
    "nav.logout": "Log out",
    "nav.language": "Language",
    "nav.profile": "My Profile",
    "nav.bookings": "My Bookings",
    "nav.darkMode": "Dark mode",
    "nav.lightMode": "Light mode",

    // Home page
    "home.hero.title": "Book Football Pitches",
    "home.hero.subtitle":
      "Find and reserve the best football pitches in your area, connect with players, and track your progress.",
    "home.cta.findPitches": "Find Pitches",
    "home.cta.viewReservations": "View Reservations",
    "home.services.title": "Our Services",
    "home.feature.booking.title": "Easy Booking",
    "home.feature.booking.desc":
      "Book football pitches in just a few clicks. View availability in real-time and secure your spot instantly.",
    "home.feature.nearby.title": "Find Nearby Pitches",
    "home.feature.nearby.desc":
      "Discover the best football pitches in your area with detailed information and photos.",
    "home.feature.games.title": "Join Games",
    "home.feature.games.desc":
      "Looking for a game? Join existing reservations and connect with other players in your area.",
    "home.feature.rate.title": "Rate & Review",
    "home.feature.rate.desc":
      "Share your experience by rating pitches and helping other players find the best venues.",
    "home.feature.payments.title": "Secure Payments",
    "home.feature.payments.desc":
      "Pay securely for your bookings. Our admin team handles all payment processing.",
    "home.feature.leaderboards.title": "Leaderboards",
    "home.feature.leaderboards.desc":
      "Track your stats, compare with friends, and climb the leaderboard rankings.",
    "home.howItWorks.title": "How It Works",
    "home.step.find.title": "Find a Pitch",
    "home.step.find.desc":
      "Browse through our selection of football pitches and find the perfect one for your game.",
    "home.step.book.title": "Book Your Slot",
    "home.step.book.desc":
      "Select your preferred date and time, and book your pitch with just a few clicks.",
    "home.step.play.title": "Play & Enjoy",
    "home.step.play.desc":
      "Show up, meet with the admin, play your game, and track your stats on the leaderboard!",
    "home.ready.title": "Ready to Play?",
    "home.ready.desc":
      "Join thousands of football enthusiasts who are using BOKIT to find and book pitches.",
    "home.ready.cta": "Get Started",

    // Pitches page
    "pitches.title": "Available Pitches",
    "pitches.search": "Search pitches...",
    "pitches.addPitch": "Add Pitch",
    "pitches.noResults": "No pitches found. Try adjusting your search.",
    "pitches.viewDetails": "View Details",
    "pitches.bookNow": "Book Now",
    "pitches.about": "About this Pitch",
    "pitches.openingHours": "Opening Hours",
    "pitches.playersFormat": "Players Format",
    "pitches.address": "Address",
    "pitches.surfaceType": "Surface Type",
    "pitches.pitchSize": "Pitch Size",
    "pitches.price": "Price",
    "pitches.facilities": "Available Facilities",
    "pitches.rules": "Pitch Rules",
    "pitches.selectDate": "Select Date for Booking",
    "pitches.availableTimes": "Available Times on",
    "pitches.noGames": "No games scheduled for this date",
    "pitches.createReservation": "Create New Reservation",
    "pitches.viewAllReservations": "View All Reservations",
    "pitches.close": "Close",
    "pitches.players": "players",
    "pitches.join": "Join",
    "pitches.cancel": "Cancel",
    "pitches.full": "Full",

    // Reservations page
    "reservations.title": "Manage Reservations",
    "reservations.upcoming": "Upcoming Reservations",
    "reservations.past": "Past Reservations",
    "reservations.createNew": "Create New Reservation",
    "reservations.noUpcoming": "No upcoming reservations found.",
    "reservations.noPast": "No past reservations found.",
    "reservations.pitch": "Pitch",
    "reservations.date": "Date",
    "reservations.time": "Time",
    "reservations.status": "Status",
    "reservations.players": "Players",
    "reservations.actions": "Actions",
    "reservations.cancel": "Cancel",
    "reservations.details": "Details",
    "reservations.join": "Join",
    "reservations.viewAll": "View All",
    "reservations.createReservation": "Create Reservation",
    "reservations.selectPitch": "Select Pitch",
    "reservations.selectDate": "Select Date",
    "reservations.selectTime": "Select Time",
    "reservations.playersNeeded": "Players Needed",
    "reservations.notes": "Additional Notes",
    "reservations.create": "Create",
    "reservations.goBack": "Go Back",
    "reservations.reservationDetails": "Reservation Details",
    "reservations.participatingPlayers": "Participating Players",
    "reservations.joinedPlayers": "Joined Players",
    "reservations.noPlayers": "No players have joined yet",
    "reservations.organizer": "Organizer",
    "reservations.completed": "Completed",
    "reservations.open": "Open",
    "reservations.cancelled": "Cancelled",
    "reservations.alreadyJoined": "Already Joined",
    "reservations.joinWaitingList": "Join Waiting List",
    "reservations.joinGame": "Join Game",
    "reservations.availability": "Availability for",
    "reservations.morningSlots": "Morning Slots",
    "reservations.afternoonSlots": "Afternoon Slots",
    "reservations.eveningSlots": "Evening Slots",
    "reservations.available": "Available",
    "reservations.limited": "Limited",
    "reservations.booked": "Booked",
    "reservations.gamesOn": "Games on",
    "reservations.noGamesScheduled": "No games scheduled on this date",
    "reservations.viewDetails": "View Details",
    "reservations.pricePerPlayer": "per player",
    "reservations.youreInThisGame": "You're in this game",
    "reservations.gameStatsSummary": "Game Stats Summary",
    "reservations.goalsScored": "Goals Scored",
    "reservations.mvpAwards": "MVP Awards",
    "reservations.dateVenue": "Date & Venue",
    "reservations.findGames": "Find Games to Join",
    "reservations.showingUpcoming": "Showing upcoming games",

    // Leaderboards page
    "leaderboards.title": "Leaderboards",
    "leaderboards.description":
      "Track top performers across individual players and teams. Points are calculated based on victories, goals, assists, and MVP performances.",
    "leaderboards.players": "Players",
    "leaderboards.teams": "Teams",
    "leaderboards.points": "Points",
    "leaderboards.goals": "Goals",
    "leaderboards.assists": "Assists",
    "leaderboards.mvps": "MVPs",
    "leaderboards.winRate": "Win Rate",
    "leaderboards.playerRankings": "Player Rankings",
    "leaderboards.wins": "Wins",
    "leaderboards.teamStandings": "Team Standings",
    "leaderboards.pos": "Pos",
    "leaderboards.team": "Team",
    "leaderboards.p": "P",
    "leaderboards.w": "W",
    "leaderboards.d": "D",
    "leaderboards.l": "L",
    "leaderboards.gf": "GF",
    "leaderboards.ga": "GA",
    "leaderboards.gd": "GD",
    "leaderboards.pts": "Pts",
    "leaderboards.form": "Form",
    "leaderboards.bestAttack": "Best Attack",
    "leaderboards.bestDefense": "Best Defense",
    "leaderboards.bestForm": "Best Form",
    "leaderboards.goalsScored": "goals scored",
    "leaderboards.goalsConceded": "goals conceded",
    "leaderboards.lastMatches": "Last 5 matches",

    // Profile page
    "profile.title": "My Profile",
    "profile.editProfile": "Edit Profile",
    "profile.personalInfo": "Personal Information",
    "profile.name": "Name",
    "profile.email": "Email",
    "profile.phone": "Phone",
    "profile.location": "Location",
    "profile.memberSince": "Member Since",
    "profile.updateProfile": "Update Profile",
    "profile.upcomingGames": "Upcoming Games",
    "profile.noUpcomingGames":
      "No upcoming games. Join a game or create a reservation!",
    "profile.viewAll": "View All",
    "profile.pastGames": "Past Games",
    "profile.noPastGames": "No past games recorded.",
    "profile.gameHistory": "Game History",
    "profile.statistics": "Statistics",
    "profile.gamesPlayed": "Games Played",
    "profile.wins": "Wins",
    "profile.goals": "Goals",
    "profile.assists": "Assists",
    "profile.winRate": "Win Rate",
    "profile.achievements": "Achievements",
    "profile.noAchievements":
      "No achievements yet. Keep playing to earn achievements!",
    "profile.joinGame": "Join Game",
    "profile.createReservation": "Create Reservation",
    "profile.preferences": "My Preferences",
    "profile.preferredPosition": "Preferred Position",
    "profile.preferredPitches": "Preferred Pitches",
    "profile.notificationsOn": "Game Notifications",
    "profile.save": "Save Changes",
    "profile.cancel": "Cancel",
    "profile.stamina": "Stamina",
    "profile.teamwork": "Teamwork",
    "profile.skillLevel": "Skill Level",
    "profile.greatGame": "Great game!",

    // Footer
    "footer.about":
      "BOKIT is the premier platform for football pitch reservations, connecting players with the best pitches in your area.",
    "footer.quickLinks": "Quick Links",
    "footer.contactUs": "Contact Us",
    "footer.rights": "© 2025 BOKIT. All rights reserved.",
  },
  ar: {
    // Navbar
    "nav.home": "الرئيسية",
    "nav.pitches": "الملاعب",
    "nav.reservations": "الحجوزات",
    "nav.leaderboards": "المتصدرين",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج",
    "nav.language": "اللغة",
    "nav.profile": "ملفي الشخصي",
    "nav.bookings": "حجوزاتي",
    "nav.darkMode": "الوضع المظلم",
    "nav.lightMode": "الوضع المضيء",

    // Home page
    "home.hero.title": "احجز ملاعب كرة القدم فورًا",
    "home.hero.subtitle":
      "ابحث واحجز أفضل ملاعب كرة القدم في منطقتك، وتواصل مع اللاعبين، وتتبع تقدمك.",
    "home.cta.findPitches": "ابحث عن ملاعب",
    "home.cta.viewReservations": "عرض الحجوزات",
    "home.services.title": "خدماتنا",
    "home.feature.booking.title": "حجز سهل",
    "home.feature.booking.desc":
      "احجز ملاعب كرة القدم بنقرات قليلة فقط. شاهد التوفر في الوقت الفعلي واحصل على مكانك فورًا.",
    "home.feature.nearby.title": "ابحث عن ملاعب قريبة",
    "home.feature.nearby.desc":
      "اكتشف أفضل ملاعب كرة القدم في منطقتك مع معلومات وصور مفصلة.",
    "home.feature.games.title": "انضم إلى المباريات",
    "home.feature.games.desc":
      "تبحث عن مباراة؟ انضم إلى الحجوزات الموجودة وتواصل مع لاعبين آخرين في منطقتك.",
    "home.feature.rate.title": "قيم وراجع",
    "home.feature.rate.desc":
      "شارك تجربتك من خلال تقييم الملاعب ومساعدة اللاعبين الآخرين في العثور على أفضل الأماكن.",
    "home.feature.payments.title": "مدفوعات آمنة",
    "home.feature.payments.desc":
      "ادفع بأمان مقابل حجوزاتك. يتعامل فريق الإدارة لدينا مع جميع عمليات الدفع.",
    "home.feature.leaderboards.title": "المتصدرين",
    "home.feature.leaderboards.desc":
      "تتبع إحصائياتك، وقارن مع الأصدقاء، وتسلق تصنيفات المتصدرين.",
    "home.howItWorks.title": "كيف تعمل",
    "home.step.find.title": "ابحث عن ملعب",
    "home.step.find.desc":
      "تصفح مجموعة ملاعب كرة القدم لدينا واعثر على الملعب المثالي لمباراتك.",
    "home.step.book.title": "احجز وقتك",
    "home.step.book.desc":
      "حدد التاريخ والوقت المفضلين لديك، واحجز ملعبك بنقرات قليلة فقط.",
    "home.step.play.title": "العب واستمتع",
    "home.step.play.desc":
      "احضر، قابل المسؤول، العب مباراتك، وتتبع إحصائياتك على لوحة المتصدرين!",
    "home.ready.title": "هل أنت مستعد للعب؟",
    "home.ready.desc":
      "انضم إلى آلاف من عشاق كرة القدم الذين يستخدمون BOKIT للعثور على الملاعب وحجزها.",
    "home.ready.cta": "ابدأ الآن",

    // Pitches page
    "pitches.title": "الملاعب المتاحة",
    "pitches.search": "البحث عن الملاعب...",
    "pitches.addPitch": "إضافة ملعب",
    "pitches.noResults": "لم يتم العثور على ملاعب. حاول تعديل البحث.",
    "pitches.viewDetails": "عرض التفاصيل",
    "pitches.bookNow": "احجز الآن",
    "pitches.about": "حول هذا الملعب",
    "pitches.openingHours": "ساعات العمل",
    "pitches.playersFormat": "تنسيق اللاعبين",
    "pitches.address": "العنوان",
    "pitches.surfaceType": "نوع السطح",
    "pitches.pitchSize": "حجم الملعب",
    "pitches.price": "السعر",
    "pitches.facilities": "المرافق المتاحة",
    "pitches.rules": "قواعد الملعب",
    "pitches.selectDate": "اختر تاريخًا للحجز",
    "pitches.availableTimes": "الأوقات المتاحة في",
    "pitches.noGames": "لا توجد مباريات مجدولة لهذا التاريخ",
    "pitches.createReservation": "إنشاء حجز جديد",
    "pitches.viewAllReservations": "عرض جميع الحجوزات",
    "pitches.close": "إغلاق",
    "pitches.players": "اللاعبين",
    "pitches.join": "انضم",
    "pitches.cancel": "إلغاء",
    "pitches.full": "مكتمل",

    // Reservations page
    "reservations.title": "إدارة الحجوزات",
    "reservations.upcoming": "الحجوزات القادمة",
    "reservations.past": "الحجوزات السابقة",
    "reservations.createNew": "إنشاء حجز جديد",
    "reservations.noUpcoming": "لم يتم العثور على حجوزات قادمة.",
    "reservations.noPast": "لم يتم العثور على حجوزات سابقة.",
    "reservations.pitch": "الملعب",
    "reservations.date": "التاريخ",
    "reservations.time": "الوقت",
    "reservations.status": "الحالة",
    "reservations.players": "اللاعبون",
    "reservations.actions": "الإجراءات",
    "reservations.cancel": "إلغاء",
    "reservations.details": "التفاصيل",
    "reservations.join": "انضم",
    "reservations.viewAll": "عرض الكل",
    "reservations.createReservation": "إنشاء حجز",
    "reservations.selectPitch": "اختر الملعب",
    "reservations.selectDate": "اختر التاريخ",
    "reservations.selectTime": "اختر الوقت",
    "reservations.playersNeeded": "اللاعبون المطلوبون",
    "reservations.notes": "ملاحظات إضافية",
    "reservations.create": "إنشاء",
    "reservations.goBack": "عودة",
    "reservations.reservationDetails": "تفاصيل الحجز",
    "reservations.participatingPlayers": "اللاعبون المشاركون",
    "reservations.joinedPlayers": "اللاعبون المنضمون",
    "reservations.noPlayers": "لم ينضم أي لاعب بعد",
    "reservations.organizer": "المنظم",
    "reservations.completed": "مكتمل",
    "reservations.open": "مفتوح",
    "reservations.cancelled": "ملغي",
    "reservations.alreadyJoined": "منضم بالفعل",
    "reservations.joinWaitingList": "انضم إلى قائمة الانتظار",
    "reservations.joinGame": "انضم للمباراة",
    "reservations.availability": "التوفر ليوم",
    "reservations.morningSlots": "فترات الصباح",
    "reservations.afternoonSlots": "فترات الظهيرة",
    "reservations.eveningSlots": "فترات المساء",
    "reservations.available": "متاح",
    "reservations.limited": "محدود",
    "reservations.booked": "محجوز",
    "reservations.gamesOn": "المباريات في",
    "reservations.noGamesScheduled": "لا توجد مباريات مجدولة في هذا اليوم",
    "reservations.viewDetails": "عرض التفاصيل",
    "reservations.pricePerPlayer": "لكل لاعب",
    "reservations.youreInThisGame": "أنت في هذه المباراة",
    "reservations.gameStatsSummary": "ملخص إحصاءات المباراة",
    "reservations.goalsScored": "الأهداف المسجلة",
    "reservations.mvpAwards": "جوائز أفضل لاعب",
    "reservations.dateVenue": "التاريخ والمكان",
    "reservations.findGames": "البحث عن مباريات للانضمام",
    "reservations.showingUpcoming": "عرض المباريات القادمة",

    // Leaderboards page
    "leaderboards.title": "المتصدرين",
    "leaderboards.description":
      "تتبع أفضل اللاعبين والفرق. يتم احتساب النقاط بناءً على الانتصارات والأهداف والتمريرات الحاسمة وأداء أفضل لاعب.",
    "leaderboards.players": "اللاعبون",
    "leaderboards.teams": "الفرق",
    "leaderboards.points": "النقاط",
    "leaderboards.goals": "الأهداف",
    "leaderboards.assists": "التمريرات الحاسمة",
    "leaderboards.mvps": "أفضل لاعب",
    "leaderboards.winRate": "نسبة الفوز",
    "leaderboards.playerRankings": "تصنيفات اللاعبين",
    "leaderboards.wins": "انتصارات",
    "leaderboards.teamStandings": "ترتيب الفرق",
    "leaderboards.pos": "المركز",
    "leaderboards.team": "الفريق",
    "leaderboards.p": "م",
    "leaderboards.w": "ف",
    "leaderboards.d": "ت",
    "leaderboards.l": "خ",
    "leaderboards.gf": "له",
    "leaderboards.ga": "عليه",
    "leaderboards.gd": "ف.أ",
    "leaderboards.pts": "نقاط",
    "leaderboards.form": "النتائج",
    "leaderboards.bestAttack": "أفضل هجوم",
    "leaderboards.bestDefense": "أفضل دفاع",
    "leaderboards.bestForm": "أفضل مستوى",
    "leaderboards.goalsScored": "هدف مسجل",
    "leaderboards.goalsConceded": "هدف مستقبل",
    "leaderboards.lastMatches": "آخر 5 مباريات",

    // Profile page
    "profile.title": "ملفي الشخصي",
    "profile.editProfile": "تعديل الملف الشخصي",
    "profile.personalInfo": "المعلومات الشخصية",
    "profile.name": "الاسم",
    "profile.email": "البريد الإلكتروني",
    "profile.phone": "الهاتف",
    "profile.location": "الموقع",
    "profile.memberSince": "عضو منذ",
    "profile.updateProfile": "تحديث الملف الشخصي",
    "profile.upcomingGames": "المباريات القادمة",
    "profile.noUpcomingGames":
      "لا توجد مباريات قادمة. انضم إلى مباراة أو قم بإنشاء حجز!",
    "profile.viewAll": "عرض الكل",
    "profile.pastGames": "المباريات السابقة",
    "profile.noPastGames": "لا توجد مباريات سابقة مسجلة.",
    "profile.gameHistory": "سجل المباريات",
    "profile.statistics": "الإحصائيات",
    "profile.gamesPlayed": "المباريات الملعوبة",
    "profile.wins": "الانتصارات",
    "profile.goals": "الأهداف",
    "profile.assists": "التمريرات الحاسمة",
    "profile.winRate": "نسبة الفوز",
    "profile.achievements": "الإنجازات",
    "profile.noAchievements":
      "لا توجد إنجازات بعد. استمر في اللعب لتحقيق الإنجازات!",
    "profile.joinGame": "انضم للمباراة",
    "profile.createReservation": "إنشاء حجز",
    "profile.preferences": "تفضيلاتي",
    "profile.preferredPosition": "المركز المفضل",
    "profile.preferredPitches": "الملاعب المفضلة",
    "profile.notificationsOn": "إشعارات المباريات",
    "profile.save": "حفظ التغييرات",
    "profile.cancel": "إلغاء",
    "profile.stamina": "التحمل",
    "profile.teamwork": "العمل الجماعي",
    "profile.skillLevel": "مستوى المهارة",
    "profile.greatGame": "مباراة رائعة!",

    // Footer
    "footer.about":
      "BOKIT هي المنصة الرائدة لحجوزات ملاعب كرة القدم، تربط اللاعبين بأفضل الملاعب في منطقتك.",
    "footer.quickLinks": "روابط سريعة",
    "footer.contactUs": "اتصل بنا",
    "footer.rights": "© 2025 BOKIT. جميع الحقوق محفوظة.",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  // Function to translate text
  const translate = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  // Update document direction based on language
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
