export interface AyahEntry {
  id: number;
  arabic: string;
  ayah: string;
  surah: string;
  verse: string;
  reflection: string;
}

export interface HadithEntry {
  id: number;
  hadith: string;
  source: string;
  reflection: string;
}

export interface DailyAction {
  id: number;
  action: string;
  category: "prayer" | "charity" | "knowledge" | "character" | "community";
}

export const AYAHS: AyahEntry[] = [
  { id: 1, arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", ayah: "Indeed, with hardship will be ease.", surah: "Al-Inshirah", verse: "94:6", reflection: "Every moment of difficulty carries within it the seeds of relief. Trust in Allah's perfect timing." },
  { id: 2, arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", ayah: "And He is with you wherever you are.", surah: "Al-Hadid", verse: "57:4", reflection: "No matter how alone you feel, the Divine is always present. Let this awareness bring you peace." },
  { id: 3, arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", ayah: "So remember Me; I will remember you.", surah: "Al-Baqarah", verse: "2:152", reflection: "Every dhikr, every salah, every moment of mindfulness is returned by divine attention and care." },
  { id: 4, arabic: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ", ayah: "Verily, Allah does not change the condition of a people until they change what is in themselves.", surah: "Ar-Ra'd", verse: "13:11", reflection: "Growth starts within. The salah is not just a ritual — it is a daily practice of self-renewal." },
  { id: 5, arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", ayah: "And seek help through patience and prayer.", surah: "Al-Baqarah", verse: "2:45", reflection: "When life feels overwhelming, return to salah. It is both anchor and sail." },
  { id: 6, arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", ayah: "Allah does not burden a soul beyond that it can bear.", surah: "Al-Baqarah", verse: "2:286", reflection: "Your struggles are sized to your strength. You are more capable than you know." },
  { id: 7, arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", ayah: "Whoever fears Allah — He will make for him a way out.", surah: "At-Talaq", verse: "65:2", reflection: "Taqwa opens doors that no human hand could unlock. Trust and remain steadfast." },
  { id: 8, arabic: "وَهُوَ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ", ayah: "And it is He who created the night and day, the sun and moon.", surah: "Al-Anbiya", verse: "21:33", reflection: "The same Creator who orders the cosmos also orders your life. There is wisdom in every moment." },
  { id: 9, arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", ayah: "Your Lord has not abandoned you, nor has He become dissatisfied.", surah: "Ad-Duha", verse: "93:3", reflection: "Even in silence, Allah is near. Difficult seasons are not signs of abandonment." },
  { id: 10, arabic: "وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ", ayah: "And whatever good you put forward for yourselves — you will find it with Allah.", surah: "Al-Muzammil", verse: "73:20", reflection: "Every prayer offered, every sacrifice made, is stored with Allah awaiting your return." },
  { id: 11, arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ", ayah: "Indeed, prayer prohibits immorality and wrongdoing.", surah: "Al-Ankabut", verse: "29:45", reflection: "The salah, when performed with presence, shapes your character and protects your soul." },
  { id: 12, arabic: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ", ayah: "My mercy encompasses all things.", surah: "Al-A'raf", verse: "7:156", reflection: "No matter how far you feel, the ocean of mercy is wider than any distance you could travel." },
  { id: 13, arabic: "وَوَجَدَكَ ضَالًّا فَهَدَىٰ", ayah: "And He found you lost and guided you.", surah: "Ad-Duha", verse: "93:7", reflection: "Guidance is a gift, not an achievement. Approach each salah with gratitude for being called." },
  { id: 14, arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", ayah: "On no soul does Allah place a burden greater than it can bear.", surah: "Al-Baqarah", verse: "2:286", reflection: "You were made for this life. Every challenge you face is evidence of your inner capacity." },
  { id: 15, arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", ayah: "And your Lord is going to give you, and you will be satisfied.", surah: "Ad-Duha", verse: "93:5", reflection: "What Allah has planned for you is beyond what you can imagine. Keep walking the path." },
  { id: 16, arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ayah: "Verily, in the remembrance of Allah do hearts find rest.", surah: "Ar-Ra'd", verse: "13:28", reflection: "When your heart is restless, it is because it has wandered from its source. Return through dhikr." },
  { id: 17, arabic: "ادْعُونِي أَسْتَجِبْ لَكُمْ", ayah: "Call upon Me; I will respond to you.", surah: "Ghafir", verse: "40:60", reflection: "Dua is not a ritual — it is a direct line. Every sincere call is heard." },
  { id: 18, arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", ayah: "And We are closer to him than his jugular vein.", surah: "Qaf", verse: "50:16", reflection: "Allah is not distant. He is closer to you than you are to yourself." },
  { id: 19, arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", ayah: "Indeed, Allah is with the patient.", surah: "Al-Baqarah", verse: "2:153", reflection: "Patience is not passive. It is an active trust that the One who holds all things is holding you too." },
  { id: 20, arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", ayah: "And whoever relies upon Allah — then He is sufficient for him.", surah: "At-Talaq", verse: "65:3", reflection: "Tawakkul is freedom. When you stop carrying everything yourself, you find strength you never knew." },
  { id: 21, arabic: "فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ", ayah: "So wherever you turn, there is the Face of Allah.", surah: "Al-Baqarah", verse: "2:115", reflection: "There is no place where Allah is absent. Every direction holds His presence." },
  { id: 22, arabic: "وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ", ayah: "And Allah loves the doers of good.", surah: "Ali 'Imran", verse: "3:134", reflection: "Ihsan — excellence in worship and kindness — is the path to divine love." },
  { id: 23, arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا", ayah: "O you who have believed, persevere and endure and remain stationed.", surah: "Ali 'Imran", verse: "3:200", reflection: "Faith is not a single act. It is a lifelong commitment to showing up — especially when it is hard." },
  { id: 24, arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", ayah: "And do not despair of the mercy of Allah.", surah: "Yusuf", verse: "12:87", reflection: "Despair is the one door that closes all others. As long as you breathe, hope is alive." },
  { id: 25, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", ayah: "Indeed, with hardship comes ease.", surah: "Al-Inshirah", verse: "94:5", reflection: "Not after — with. Ease is already woven into your difficulty. Look closer." },
  { id: 26, arabic: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ", ayah: "And We will surely test you with something of fear and hunger.", surah: "Al-Baqarah", verse: "2:155", reflection: "Tests are not punishments — they are invitations to grow. Trust the process." },
  { id: 27, arabic: "وَقُلْ رَبِّ زِدْنِي عِلْمًا", ayah: "And say: My Lord, increase me in knowledge.", surah: "Ta-Ha", verse: "20:114", reflection: "The humility to ask for more knowledge is itself a sign of wisdom." },
  { id: 28, arabic: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ", ayah: "Perhaps you dislike a thing and it is good for you.", surah: "Al-Baqarah", verse: "2:216", reflection: "Your perspective is limited. What feels like loss may be divine redirection." },
  { id: 29, arabic: "وَاللَّهُ خَيْرُ الرَّازِقِينَ", ayah: "And Allah is the best of providers.", surah: "Al-Jumu'ah", verse: "62:11", reflection: "Your rizq is guaranteed. Free yourself from anxiety and focus on worship." },
  { id: 30, arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", ayah: "Our Lord, give us in this world good and in the Hereafter good.", surah: "Al-Baqarah", verse: "2:201", reflection: "Balance in dua — asking for both worlds — reflects the wholeness of Islam." },
  { id: 31, arabic: "إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ", ayah: "Indeed, Allah does not allow to be lost the reward of those who do good.", surah: "Yusuf", verse: "12:90", reflection: "No good deed is wasted. Even the ones no one sees are recorded with the Most Just." },
  { id: 32, arabic: "وَبَشِّرِ الصَّابِرِينَ", ayah: "And give good tidings to the patient.", surah: "Al-Baqarah", verse: "2:155", reflection: "The patient are the ones who receive the good news. Endure — the best is coming." },
  { id: 33, arabic: "وَإِلَىٰ رَبِّكَ فَارْغَبْ", ayah: "And to your Lord direct your longing.", surah: "Al-Inshirah", verse: "94:8", reflection: "When the world overwhelms you, redirect your longing. He is the only destination that satisfies." },
  { id: 34, arabic: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ", ayah: "Every soul will taste death.", surah: "Ali 'Imran", verse: "3:185", reflection: "This reminder is not to frighten — but to clarify what matters. Pray as if it is your last." },
  { id: 35, arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ", ayah: "And We have certainly made the Quran easy for remembrance.", surah: "Al-Qamar", verse: "54:17", reflection: "The Quran was made accessible. Begin anywhere. Even one ayah a day changes your heart." },
  { id: 36, arabic: "وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا", ayah: "And hold firmly to the rope of Allah all together and do not become divided.", surah: "Ali 'Imran", verse: "3:103", reflection: "Unity is strength. The ummah grows when we hold onto the same rope." },
  { id: 37, arabic: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ", ayah: "And turn to Allah in repentance, all of you, O believers.", surah: "An-Nur", verse: "24:31", reflection: "Repentance is not a sign of weakness — it is the door to renewal." },
  { id: 38, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", ayah: "Say: He is Allah, the One.", surah: "Al-Ikhlas", verse: "112:1", reflection: "Tawhid simplifies everything. When you know the One, you need nothing else." },
  { id: 39, arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", ayah: "And when My servants ask you about Me — indeed I am near.", surah: "Al-Baqarah", verse: "2:186", reflection: "He did not say 'Tell them I am near.' He said it directly. That is how close He is." },
  { id: 40, arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ", ayah: "O you who have believed, fear Allah and be with those who are truthful.", surah: "At-Tawbah", verse: "9:119", reflection: "Your company shapes you. Surround yourself with those who remind you of Allah." },
  { id: 41, arabic: "فَفِرُّوا إِلَى اللَّهِ", ayah: "So flee to Allah.", surah: "Adh-Dhariyat", verse: "51:50", reflection: "When the world is chaotic, do not run away — run toward. Salah is your shelter." },
  { id: 42, arabic: "وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ", ayah: "And be patient, for indeed Allah does not allow to be lost the reward of the good-doers.", surah: "Hud", verse: "11:115", reflection: "Patience paired with good deeds is an unbeatable combination." },
  { id: 43, arabic: "وَلَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا", ayah: "Do not grieve; indeed Allah is with us.", surah: "At-Tawbah", verse: "9:40", reflection: "The same reassurance given in the cave applies to every cave you find yourself in." },
  { id: 44, arabic: "وَاللَّهُ يُرِيدُ أَن يَتُوبَ عَلَيْكُمْ", ayah: "And Allah wants to accept your repentance.", surah: "An-Nisa", verse: "4:27", reflection: "He is not waiting for you to be perfect. He is waiting for you to turn back." },
  { id: 45, arabic: "وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", ayah: "And say: My Lord, have mercy upon them as they brought me up when I was small.", surah: "Al-Isra", verse: "17:24", reflection: "Making dua for your parents is one of the most beautiful acts of worship." },
  { id: 46, arabic: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ", ayah: "Indeed, Allah orders justice and good conduct.", surah: "An-Nahl", verse: "16:90", reflection: "Justice and kindness are not optional extras — they are divine commands." },
  { id: 47, arabic: "وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا", ayah: "And do not walk upon the earth arrogantly.", surah: "Al-Isra", verse: "17:37", reflection: "Humility is the posture of the believer. Walk gently through this world." },
  { id: 48, arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", ayah: "So which of the favors of your Lord would you deny?", surah: "Ar-Rahman", verse: "55:13", reflection: "Count your blessings — they are endless. Gratitude transforms perspective." },
  { id: 49, arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", ayah: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah.", surah: "Az-Zumar", verse: "39:53", reflection: "No sin is too great for His mercy. The door of tawbah never closes." },
  { id: 50, arabic: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", ayah: "Indeed, Allah loves those who are constantly repentant and loves those who purify themselves.", surah: "Al-Baqarah", verse: "2:222", reflection: "The cycle of sin and repentance is not failure — it is the human journey. Keep returning." },
  { id: 51, arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", ayah: "Sufficient for us is Allah, and He is the best Disposer of affairs.", surah: "Ali 'Imran", verse: "3:173", reflection: "When you feel powerless, remember you have the most powerful ally." },
  { id: 52, arabic: "وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ", ayah: "And remember your Lord when you forget.", surah: "Al-Kahf", verse: "18:24", reflection: "Forgetting is human. Remembering after forgetting is the believer's way." },
  { id: 53, arabic: "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا", ayah: "Indeed, We have given you a clear conquest.", surah: "Al-Fath", verse: "48:1", reflection: "Victories come in forms you may not recognize. Trust the openings Allah sends." },
  { id: 54, arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ", ayah: "So do not weaken and do not grieve, and you will be superior.", surah: "Ali 'Imran", verse: "3:139", reflection: "Your worth is not defined by your circumstances. Stand tall in your faith." },
  { id: 55, arabic: "وَلِلَّهِ الْعِزَّةُ وَلِرَسُولِهِ وَلِلْمُؤْمِنِينَ", ayah: "And to Allah belongs all honor, and to His Messenger, and to the believers.", surah: "Al-Munafiqun", verse: "63:8", reflection: "True honor comes from faith, not status. Walk in the dignity of iman." },
  { id: 56, arabic: "وَكَفَىٰ بِاللَّهِ وَكِيلًا", ayah: "And sufficient is Allah as Disposer of affairs.", surah: "An-Nisa", verse: "4:81", reflection: "You do not need to control every outcome. Let Him handle what you cannot." },
  { id: 57, arabic: "أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ", ayah: "Is not Allah sufficient for His servant?", surah: "Az-Zumar", verse: "39:36", reflection: "This rhetorical question is an answer in itself. He is enough." },
  { id: 58, arabic: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ", ayah: "And We have not sent you except as a mercy to the worlds.", surah: "Al-Anbiya", verse: "21:107", reflection: "The Prophet was sent as mercy. Following his sunnah is an act of embracing that mercy." },
  { id: 59, arabic: "لَا إِكْرَاهَ فِي الدِّينِ", ayah: "There shall be no compulsion in religion.", surah: "Al-Baqarah", verse: "2:256", reflection: "Faith chosen freely is the strongest faith. Your journey is yours." },
  { id: 60, arabic: "وَأَنَّ إِلَىٰ رَبِّكَ الْمُنتَهَىٰ", ayah: "And that to your Lord is the finality.", surah: "An-Najm", verse: "53:42", reflection: "Everything leads back to Him. This truth simplifies every decision." },
  { id: 61, arabic: "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ", ayah: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another.", surah: "Al-Hujurat", verse: "49:13", reflection: "Diversity is by design. Learning from others is a divine instruction." },
  { id: 62, arabic: "وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا مَتَاعُ الْغُرُورِ", ayah: "And the worldly life is not but the enjoyment of delusion.", surah: "Ali 'Imran", verse: "3:185", reflection: "This life is temporary. Invest in what lasts." },
  { id: 63, arabic: "وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", ayah: "And Allah is over all things competent.", surah: "Al-Baqarah", verse: "2:284", reflection: "Nothing is too big for Him. Nothing is too small for His attention." },
  { id: 64, arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا", ayah: "O you who have believed, remember Allah with much remembrance.", surah: "Al-Ahzab", verse: "33:41", reflection: "Not just a little. Not once a day. Much remembrance. Fill your day with His name." },
  { id: 65, arabic: "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", ayah: "So whoever does an atom's weight of good will see it.", surah: "Az-Zalzalah", verse: "99:7", reflection: "No kindness is too small. Every atom of good matters." },
  { id: 66, arabic: "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا", ayah: "Exalted is He who took His servant by night.", surah: "Al-Isra", verse: "17:1", reflection: "Even in the darkest night, Allah can elevate you to the highest heavens." },
  { id: 67, arabic: "قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ", ayah: "Say: If you love Allah, then follow me, Allah will love you.", surah: "Ali 'Imran", verse: "3:31", reflection: "Love is demonstrated through action. Following the Prophet is how love becomes real." },
  { id: 68, arabic: "وَلَا تَمْنُن تَسْتَكْثِرُ", ayah: "And do not consider your efforts to be great.", surah: "Al-Muddaththir", verse: "74:6", reflection: "Stay humble in your worship. The greatest acts are those done without counting." },
  { id: 69, arabic: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ", ayah: "And cooperate in righteousness and piety.", surah: "Al-Ma'idah", verse: "5:2", reflection: "Faith is communal. Help others grow and you grow with them." },
  { id: 70, arabic: "يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ", ayah: "Allah intends for you ease and does not intend for you hardship.", surah: "Al-Baqarah", verse: "2:185", reflection: "The religion is not meant to break you. It is meant to build you up." },
  { id: 71, arabic: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ", ayah: "And indeed, you are of a great moral character.", surah: "Al-Qalam", verse: "68:4", reflection: "Character is the truest measure of faith. Build yours with every prayer." },
  { id: 72, arabic: "وَقُولُوا لِلنَّاسِ حُسْنًا", ayah: "And speak to people good words.", surah: "Al-Baqarah", verse: "2:83", reflection: "Your words carry weight. Choose them with care and kindness." },
  { id: 73, arabic: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ", ayah: "Indeed, Allah and His angels send blessings upon the Prophet.", surah: "Al-Ahzab", verse: "33:56", reflection: "Sending salawat connects you to a chain of blessings stretching across all creation." },
  { id: 74, arabic: "وَلَا تَقْرَبُوا الصَّلَاةَ وَأَنتُمْ سُكَارَىٰ", ayah: "Do not approach prayer while you are intoxicated.", surah: "An-Nisa", verse: "4:43", reflection: "Approach prayer with a clear mind. Presence is the essence of salah." },
  { id: 75, arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ", ayah: "And establish prayer and give zakah.", surah: "Al-Baqarah", verse: "2:43", reflection: "Prayer and giving are paired together — the vertical and horizontal axes of faith." },
  { id: 76, arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ", ayah: "O you who have believed, decreed upon you is fasting.", surah: "Al-Baqarah", verse: "2:183", reflection: "Fasting trains the body so the soul can lead. Discipline creates freedom." },
  { id: 77, arabic: "خُذُوا زِينَتَكُمْ عِندَ كُلِّ مَسْجِدٍ", ayah: "Take your adornment at every place of worship.", surah: "Al-A'raf", verse: "7:31", reflection: "Approaching Allah with dignity — in dress and demeanor — honors the meeting." },
  { id: 78, arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا", ayah: "And those who strive for Us — We will surely guide them to Our ways.", surah: "Al-Ankabut", verse: "29:69", reflection: "The effort itself attracts guidance. You do not need to be perfect to begin." },
  { id: 79, arabic: "وَاتَّقُوا يَوْمًا تُرْجَعُونَ فِيهِ إِلَى اللَّهِ", ayah: "And fear a Day when you will be returned to Allah.", surah: "Al-Baqarah", verse: "2:281", reflection: "Awareness of return sharpens intention. Live each day as preparation." },
  { id: 80, arabic: "وَمَن يُوقَ شُحَّ نَفْسِهِ فَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ", ayah: "And whoever is protected from the stinginess of his soul — it is those who will be successful.", surah: "Al-Hashr", verse: "59:9", reflection: "Generosity of spirit leads to true success. Give freely." },
  { id: 81, arabic: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ", ayah: "Certainly successful are the believers who are humble in their prayer.", surah: "Al-Mu'minun", verse: "23:1-2", reflection: "Success begins with khushu — full presence in prayer. Quality matters more than quantity." },
  { id: 82, arabic: "وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ", ayah: "And worship your Lord until there comes to you the certainty.", surah: "Al-Hijr", verse: "15:99", reflection: "Worship is a lifelong journey, not a phase. Keep going until your last breath." },
  { id: 83, arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ فَصَلِّ لِرَبِّكَ وَانْحَرْ", ayah: "Indeed, We have granted you Al-Kawthar. So pray to your Lord and sacrifice.", surah: "Al-Kawthar", verse: "108:1-2", reflection: "Every blessing calls for gratitude in action — prayer and giving." },
  { id: 84, arabic: "وَاللَّيْلِ إِذَا يَغْشَىٰ وَالنَّهَارِ إِذَا تَجَلَّىٰ", ayah: "By the night when it covers and the day when it appears.", surah: "Al-Layl", verse: "92:1-2", reflection: "Day and night are signs. Both have purpose. Both are blessings." },
  { id: 85, arabic: "وَلَنَجْزِيَنَّ الَّذِينَ صَبَرُوا أَجْرَهُم بِأَحْسَنِ مَا كَانُوا يَعْمَلُونَ", ayah: "And We will surely give those who were patient their reward according to the best of what they used to do.", surah: "An-Nahl", verse: "16:96", reflection: "Allah rewards based on your best — not your worst. Keep striving." },
  { id: 86, arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُبْطِلُوا صَدَقَاتِكُم بِالْمَنِّ وَالْأَذَىٰ", ayah: "O you who have believed, do not invalidate your charities with reminders or injury.", surah: "Al-Baqarah", verse: "2:264", reflection: "Give without strings. Charity spoken of loses its reward." },
  { id: 87, arabic: "وَاخْفِضْ جَنَاحَكَ لِلْمُؤْمِنِينَ", ayah: "And lower your wing to the believers.", surah: "Al-Hijr", verse: "15:88", reflection: "Be gentle with those around you. Kindness is the wing that shelters the ummah." },
  { id: 88, arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ", ayah: "O you who have believed, fulfill your contracts.", surah: "Al-Ma'idah", verse: "5:1", reflection: "Integrity in promises is a form of worship. Be someone whose word can be trusted." },
  { id: 89, arabic: "إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ", ayah: "Only those fear Allah, from among His servants, who have knowledge.", surah: "Fatir", verse: "35:28", reflection: "Knowledge deepens awe. The more you learn, the more you understand His greatness." },
  { id: 90, arabic: "وَلَقَدْ خَلَقْنَا الْإِنسَانَ وَنَعْلَمُ مَا تُوَسْوِسُ بِهِ نَفْسُهُ", ayah: "And We have already created man and know what his soul whispers to him.", surah: "Qaf", verse: "50:16", reflection: "He knows your inner world — every thought, every struggle. You are never unseen." },
  { id: 91, arabic: "وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا", ayah: "And if you should count the favors of Allah, you could not enumerate them.", surah: "Ibrahim", verse: "14:34", reflection: "Blessings outnumber breaths. Start your day by acknowledging even one." },
  { id: 92, arabic: "إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ", ayah: "Indeed, the righteous will be in pleasure.", surah: "Al-Infitar", verse: "82:13", reflection: "The righteous find joy not just in the akhirah — but in the peace of this life too." },
  { id: 93, arabic: "وَالْعَصْرِ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", ayah: "By time, indeed mankind is in loss.", surah: "Al-Asr", verse: "103:1-2", reflection: "Time is the most precious resource. How you spend it defines everything." },
  { id: 94, arabic: "وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ", ayah: "And do not turn your cheek in contempt toward people.", surah: "Luqman", verse: "31:18", reflection: "Arrogance distances you from people and from Allah. Stay grounded." },
  { id: 95, arabic: "وَمِنَ اللَّيْلِ فَسَبِّحْهُ وَأَدْبَارَ السُّجُودِ", ayah: "And in part of the night exalt Him and after prostration.", surah: "Qaf", verse: "50:40", reflection: "The night prayers carry a special sweetness. Meet Him in the quiet hours." },
];

export const HADITHS: HadithEntry[] = [
  { id: 1, hadith: "The first thing a person will be accountable for on the Day of Judgment is the prayer.", source: "Abu Dawud", reflection: "Salah is not merely a habit — it is the foundation of your entire spiritual ledger." },
  { id: 2, hadith: "Make things easy and do not make them difficult. Give glad tidings and do not repel people.", source: "Bukhari", reflection: "Islam is ease. If your spiritual practice feels like a burden, simplify and begin again." },
  { id: 3, hadith: "The prayer is the pillar of the religion.", source: "Bayhaqi", reflection: "Everything else in your deen rests on this foundation. Protect it above all else." },
  { id: 4, hadith: "When one of you stands to pray, he stands in conversation with his Lord.", source: "Bukhari", reflection: "You are not reciting words to the ceiling — you are speaking directly to the Divine." },
  { id: 5, hadith: "Whoever loves for Allah's sake, hates for Allah's sake, gives for Allah's sake and withholds for Allah's sake, has completed faith.", source: "Abu Dawud", reflection: "Salah trains the heart to orient all actions toward the divine. This is its deeper purpose." },
  { id: 6, hadith: "A man asked the Prophet about the best deeds. He replied: Prayer at its proper time.", source: "Bukhari & Muslim", reflection: "Praying on time is not a small act — it is the best deed. SalahLock exists to help you achieve it." },
  { id: 7, hadith: "Pray as you have seen me pray.", source: "Bukhari", reflection: "The form of salah is a living connection to the Prophet, preserved across 14 centuries." },
  { id: 8, hadith: "The similitude of the five prayers is that of a river running at the door of one of you, in which he bathes five times daily.", source: "Muslim", reflection: "Each prayer is a cleansing — not just of sins, but of the heaviness of daily life." },
  { id: 9, hadith: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.", source: "Bukhari & Muslim", reflection: "Consistency beats intensity. A small daily act done faithfully outweighs occasional bursts of effort." },
  { id: 10, hadith: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Bukhari & Muslim", reflection: "Faith is relational. Your iman grows when you extend its warmth to others." },
  { id: 11, hadith: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.", source: "Bukhari & Muslim", reflection: "Silence is worship when the alternative is harm. Guard your tongue." },
  { id: 12, hadith: "The strong person is not the one who wrestles others, but the one who controls himself when angry.", source: "Bukhari & Muslim", reflection: "True strength is inner mastery. Salah is training ground for this kind of strength." },
  { id: 13, hadith: "Smiling in the face of your brother is charity.", source: "Tirmidhi", reflection: "Charity is not just money. Every moment of kindness counts." },
  { id: 14, hadith: "Take advantage of five before five: your youth before old age, your health before sickness, your wealth before poverty, your free time before busyness, and your life before death.", source: "Al-Hakim", reflection: "Time passes regardless. Use it before it uses you." },
  { id: 15, hadith: "Whoever treads a path seeking knowledge, Allah will make easy for him the path to Paradise.", source: "Muslim", reflection: "Learning is an act of worship. Seek knowledge and you seek Jannah." },
  { id: 16, hadith: "The best of you are those who are best to their families.", source: "Tirmidhi", reflection: "Your character at home reveals your true faith." },
  { id: 17, hadith: "Modesty is part of faith.", source: "Bukhari & Muslim", reflection: "Modesty is not shyness — it is dignity in how you carry yourself." },
  { id: 18, hadith: "Cleanliness is half of faith.", source: "Muslim", reflection: "Wudu and cleanliness prepare the body so the soul can worship freely." },
  { id: 19, hadith: "Allah is beautiful and He loves beauty.", source: "Muslim", reflection: "There is no contradiction between worship and beauty. Allah created both." },
  { id: 20, hadith: "Do not belittle any good deed, even meeting your brother with a cheerful face.", source: "Muslim", reflection: "Small acts ripple outward. Your smile may be the light someone needed." },
  { id: 21, hadith: "The world is a prison for the believer and a paradise for the disbeliever.", source: "Muslim", reflection: "Temporary restraint for eternal reward. Keep the bigger picture in view." },
  { id: 22, hadith: "Whoever says SubhanAllah wa bihamdihi a hundred times a day, his sins are wiped away even if they are like the foam of the sea.", source: "Bukhari & Muslim", reflection: "Dhikr is powerful medicine. A few words, sincerely repeated, cleanse the heart." },
  { id: 23, hadith: "The best prayer after the obligatory prayers is the night prayer.", source: "Muslim", reflection: "Tahajjud is the prayer of intimacy. Meet your Lord when the world is asleep." },
  { id: 24, hadith: "Leave that which makes you doubt for that which does not make you doubt.", source: "Tirmidhi & Nasai", reflection: "When in doubt, choose the path of certainty. Clarity follows caution." },
  { id: 25, hadith: "A believer to another believer is like a building whose different parts enforce each other.", source: "Bukhari & Muslim", reflection: "You are not alone in this journey. The ummah is your structure and support." },
  { id: 26, hadith: "Whoever relieves a believer of a burden, Allah will relieve him of a burden on the Day of Resurrection.", source: "Muslim", reflection: "Helping others is an investment in your own relief. Ease their load." },
  { id: 27, hadith: "The most beloved people to Allah are those who are most beneficial to the people.", source: "Tabarani", reflection: "Service to others is the highest form of devotion after salah." },
  { id: 28, hadith: "He who is not grateful to the people is not grateful to Allah.", source: "Abu Dawud & Tirmidhi", reflection: "Thank the people around you. Gratitude is a doorway to divine consciousness." },
  { id: 29, hadith: "Tie your camel and then put your trust in Allah.", source: "Tirmidhi", reflection: "Tawakkul is not passivity. Do your part, then trust the outcome to Allah." },
  { id: 30, hadith: "Fear Allah wherever you are, follow a bad deed with a good one and it will erase it, and treat people with good character.", source: "Tirmidhi", reflection: "Three principles that cover all of life: consciousness of Allah, recovery from mistakes, and kindness to people." },
  { id: 31, hadith: "The believer does not taunt, curse, abuse or talk indecently.", source: "Tirmidhi", reflection: "Your speech reflects your heart. Let your words be as clean as your wudu." },
  { id: 32, hadith: "Verily, the heaviest thing to be placed on the scale of a believer on the Day of Resurrection will be good character.", source: "Abu Dawud & Tirmidhi", reflection: "Akhlaq is the heaviest currency in the akhirah. Invest in good character daily." },
  { id: 33, hadith: "Actions are judged by their intentions, and every person will get the reward according to what they intended.", source: "Bukhari & Muslim", reflection: "Before you act, check your intention. A pure niyyah transforms the ordinary into worship." },
  { id: 34, hadith: "Every act of kindness is charity.", source: "Bukhari & Muslim", reflection: "You do not need money to give sadaqah. Kindness in any form counts." },
  { id: 35, hadith: "The supplication of a fasting person is not rejected.", source: "Ibn Majah", reflection: "Fasting opens a direct channel. Use it for your deepest duas." },
];

export const DAILY_ACTIONS: DailyAction[] = [
  { id: 1, action: "Pray one extra rakah of voluntary prayer today", category: "prayer" },
  { id: 2, action: "Give a genuine compliment to someone", category: "character" },
  { id: 3, action: "Read one page of the Quran with translation", category: "knowledge" },
  { id: 4, action: "Make dua for someone you haven't spoken to in a while", category: "community" },
  { id: 5, action: "Give a small amount of sadaqah today", category: "charity" },
  { id: 6, action: "Say SubhanAllah 33 times after your next prayer", category: "prayer" },
  { id: 7, action: "Forgive someone in your heart today", category: "character" },
  { id: 8, action: "Learn the meaning of one new ayah", category: "knowledge" },
  { id: 9, action: "Send a message of encouragement to a friend", category: "community" },
  { id: 10, action: "Donate to a cause you believe in", category: "charity" },
  { id: 11, action: "Pray Duha (mid-morning) prayer", category: "prayer" },
  { id: 12, action: "Practice patience in one frustrating moment today", category: "character" },
  { id: 13, action: "Listen to a short Islamic lecture or podcast", category: "knowledge" },
  { id: 14, action: "Check on a neighbor or elderly person", category: "community" },
  { id: 15, action: "Buy food for someone in need", category: "charity" },
  { id: 16, action: "Make wudu mindfully, reflecting on each step", category: "prayer" },
  { id: 17, action: "Avoid backbiting for the entire day", category: "character" },
  { id: 18, action: "Memorize one short surah or ayah", category: "knowledge" },
  { id: 19, action: "Call a family member you haven't spoken to recently", category: "community" },
  { id: 20, action: "Leave water or food out for birds or animals", category: "charity" },
  { id: 21, action: "Pray two rakah of Tahajjud tonight", category: "prayer" },
  { id: 22, action: "Smile at everyone you meet today", category: "character" },
  { id: 23, action: "Read a hadith and reflect on its meaning", category: "knowledge" },
  { id: 24, action: "Invite someone to pray together", category: "community" },
  { id: 25, action: "Help someone carry their groceries or luggage", category: "charity" },
  { id: 26, action: "Say Bismillah before every action today", category: "prayer" },
  { id: 27, action: "Control your anger in one difficult moment", category: "character" },
  { id: 28, action: "Look up the tafsir of a verse you find challenging", category: "knowledge" },
  { id: 29, action: "Reconcile with someone you have a disagreement with", category: "community" },
  { id: 30, action: "Sponsor an orphan's meal through an online charity", category: "charity" },
  { id: 31, action: "Extend your sujood and make personal dua", category: "prayer" },
  { id: 32, action: "Speak only good words today — or remain silent", category: "character" },
  { id: 33, action: "Learn three names of Allah and their meanings", category: "knowledge" },
  { id: 34, action: "Share an Islamic reminder on social media", category: "community" },
  { id: 35, action: "Tip generously at your next meal", category: "charity" },
  { id: 36, action: "Pray your next salah in the masjid if possible", category: "prayer" },
  { id: 37, action: "Express gratitude to someone who often goes unnoticed", category: "character" },
  { id: 38, action: "Watch a documentary about Islamic history", category: "knowledge" },
  { id: 39, action: "Organize a small gathering for dhikr or Quran reading", category: "community" },
  { id: 40, action: "Donate clothes you no longer wear", category: "charity" },
  { id: 41, action: "Make istighfar 100 times today", category: "prayer" },
  { id: 42, action: "Write down three things you are grateful for", category: "character" },
  { id: 43, action: "Read about the life of one companion of the Prophet", category: "knowledge" },
  { id: 44, action: "Teach a child something about Islam", category: "community" },
  { id: 45, action: "Set up a recurring monthly charity donation", category: "charity" },
];

export function getTodayAyah(): AyahEntry {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return AYAHS[dayOfYear % AYAHS.length];
}

export function getTodayHadith(): HadithEntry {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return HADITHS[dayOfYear % HADITHS.length];
}
