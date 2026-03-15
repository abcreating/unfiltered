/**
 * Expanded bulk ingestion script — ingests real speeches for 60+ world leaders
 * from verified official government sources, UN, EU, NATO, Vatican, etc.
 *
 * Usage: npx tsx scripts/bulk-ingest-expanded.ts
 */

import { PrismaClient, IngestionMethod, IngestionStatus, SpeechStatus } from "../src/generated/prisma";
import { scrapers } from "../src/lib/scrapers";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

interface SpeechEntry {
  url: string;
  scraper: string;
  leaderSlug: string;
  title?: string;
  occasion?: string;
  deliveredAt?: string;
}

const EXPANDED_SPEECHES: SpeechEntry[] = [
  // ─── Abdel Fattah El Sisi ───
  { url: "https://sis.gov.eg/Story/203725/President-El-Sisi%E2%80%99s-Speech-at-the-Special-Session-on-the-Situation-in-Palestine-and-Lebanon?lang=en-us", scraper: "generic", leaderSlug: "abdel-fattah-el-sisi", title: "Speech at the Special Session on Palestine and Lebanon", deliveredAt: "2024-10-01" },
  { url: "https://gadebate.un.org/en/79/egypt", scraper: "generic", leaderSlug: "abdel-fattah-el-sisi", title: "Egypt Statement at UNGA 79th Session General Debate (delivered by FM)", deliveredAt: "2024-09-28" },
  { url: "https://www.weforum.org/stories/2026/01/davos-2026-special-address-abdel-fattah-el-sisi/", scraper: "generic", leaderSlug: "abdel-fattah-el-sisi", title: "Davos 2026 Special Address at World Economic Forum", deliveredAt: "2026-01-20" },

  // ─── Abiy Ahmed ───
  { url: "https://au.int/en/pressreleases/20240217/speech-ethiopian-prime-minister-abiy-ahmed-opening-37th-ordinary-session-au", scraper: "generic", leaderSlug: "abiy-ahmed", title: "Speech at the Opening of the 37th Ordinary Session of the AU Assembly", deliveredAt: "2024-02-17" },
  { url: "https://au.int/en/speeches/20250215/statement-dr-abiy-ahmed-prime-minister-federal-republic-ethiopia-38-au-summit-15", scraper: "generic", leaderSlug: "abiy-ahmed", title: "Statement at the 38th AU Summit", deliveredAt: "2025-02-15" },
  { url: "https://gadebate.un.org/en/79/ethiopia", scraper: "generic", leaderSlug: "abiy-ahmed", title: "Ethiopia Statement at UNGA 79th Session General Debate (delivered by FM)", deliveredAt: "2024-09-27" },

  // ─── Alexander Lukashenko ───
  { url: "https://president.gov.by/en/events/alexander-lukashenko-to-deliver-state-of-the-nation-address-on-22-april-8550", scraper: "generic", leaderSlug: "alexander-lukashenko", title: "State of the Nation Address to the Belarusian People and the National Assembly", deliveredAt: "2024-04-22" },
  { url: "https://president.gov.by/en/events/novogodnee-obrashchenie-prezidenta-belarusi-aleksandra-lukashenko-k-belorusskomu-narodu-1704018941", scraper: "generic", leaderSlug: "alexander-lukashenko", title: "New Year Address to the Belarusian People (2024)", deliveredAt: "2023-12-31" },

  // ─── Andrzej Duda ───
  { url: "https://gadebate.un.org/en/79/poland", scraper: "generic", leaderSlug: "andrzej-duda", title: "Address at the 79th Session of the UN General Assembly General Debate", deliveredAt: "2024-09-24" },
  { url: "https://www.president.pl/rotator-artykul/new-years-address-of-the-president-of-the-republic-of-poland-andrzej-duda,79304", scraper: "generic", leaderSlug: "andrzej-duda", title: "New Year's Address of the President of the Republic of Poland", deliveredAt: "2024-12-31" },
  { url: "https://www.president.pl/archives/andrzej-duda/news/president-at-white-house,82569", scraper: "generic", leaderSlug: "andrzej-duda", title: "Speech by the President of the Republic of Poland at the White House", deliveredAt: "2025-02-22" },
  { url: "https://www.president.pl/news/address-by-the-president-at-the-78th-session-of-the-un-general-assembly,74956", scraper: "generic", leaderSlug: "andrzej-duda", title: "Address at the 78th Session of the UN General Assembly", deliveredAt: "2023-09-19" },

  // ─── Annalena Baerbock ───
  { url: "https://www.auswaertiges-amt.de/en/newsroom/news/2677832-2677832", scraper: "generic", leaderSlug: "annalena-baerbock", title: "Speech by Foreign Minister Annalena Baerbock at the 79th General Debate of the United Nations General Assembly New York", deliveredAt: "2024-09-26" },
  { url: "https://www.auswaertiges-amt.de/en/newsroom/news/2689214-2689214", scraper: "generic", leaderSlug: "annalena-baerbock", title: "Speech by Federal Foreign Minister Annalena Baerbock in the plenary session of the OSCE Ministerial Council 2024", deliveredAt: "2024-12-05" },
  { url: "https://www.auswaertiges-amt.de/en/newsroom/news/-/2677494", scraper: "generic", leaderSlug: "annalena-baerbock", title: "Speech by Foreign Minister Annalena Baerbock at the United Nations Security Council on the situation in Ukraine", deliveredAt: "2024-09-24" },
  { url: "https://www.auswaertiges-amt.de/en/newsroom/news/2679832-2679832", scraper: "generic", leaderSlug: "annalena-baerbock", title: "Speech by Foreign Minister Annalena Baerbock during the agreed debate in the German Bundestag on the first anniversary of the terrorist attack on Israel on 7 October", deliveredAt: "2024-10-10" },
  { url: "https://www.auswaertiges-amt.de/en/newsroom/news/day-of-the-peacekeeper-2665420", scraper: "generic", leaderSlug: "annalena-baerbock", title: "Speech by Foreign Minister Annalena Baerbock on the Day of the Peacekeeper 2024", deliveredAt: "2024-06-27" },

  // ─── Anthony Albanese ───
  { url: "https://www.pm.gov.au/media/australias-national-statement", scraper: "generic", leaderSlug: "anthony-albanese", title: "Australia's National Statement - UN General Assembly", deliveredAt: "2025-09-24" },
  { url: "https://www.pm.gov.au/media/address-two-state-solution-conference", scraper: "generic", leaderSlug: "anthony-albanese", title: "Address to Two State Solution Conference - UN General Assembly Hall", deliveredAt: "2025-09-22" },
  { url: "https://www.pm.gov.au/media/address-uk-labour-conference", scraper: "generic", leaderSlug: "anthony-albanese", title: "Address to UK Labour Conference", deliveredAt: "2025-09-28" },
  { url: "https://www.pm.gov.au/media/election-night", scraper: "generic", leaderSlug: "anthony-albanese", title: "Election Night Speech", deliveredAt: "2025-05-03" },

  // ─── Antony Blinken ───
  { url: "https://2021-2025.state.gov/secretary-antony-j-blinken-at-the-2024-nato-public-forum/", scraper: "generic", leaderSlug: "antony-blinken", title: "Secretary Antony J. Blinken At the 2024 NATO Public Forum", deliveredAt: "2024-07-10" },
  { url: "https://2021-2025.state.gov/secretary-antony-j-blinken-remarks-to-the-press-29/", scraper: "generic", leaderSlug: "antony-blinken", title: "Secretary Antony J. Blinken Remarks to the Press", deliveredAt: "2024-09-13" },
  { url: "https://2021-2025.state.gov/secretary-antony-j-blinken-and-united-kingdom-foreign-secretary-david-lammy-joint-press-availability/", scraper: "generic", leaderSlug: "antony-blinken", title: "Secretary Antony J. Blinken And United Kingdom Foreign Secretary David Lammy Joint Press Availability", deliveredAt: "2024-09-10" },

  // ─── Anwar Ibrahim ───
  { url: "https://www.pmo.gov.my/en/speeches-en/keynote-address-by-yab-dato-seri-anwar-ibrahim-prime-minister-of-malaysia-kuala-lumpur-conference-on-a-new-just-and-humane-international-order/", scraper: "generic", leaderSlug: "anwar-ibrahim", title: "Keynote Address - Kuala Lumpur Conference on A New Just and Humane International Order", deliveredAt: "2025-10-14" },
  { url: "https://www.pmo.gov.my/en/speeches-en/verbatim-text-address-by-the-honourable-dato-seri-anwar-bin-ibrahim-prime-minister-of-malaysia-at-the-opening-ceremony-of-the-47th-asean-summit-and-related-summits/", scraper: "generic", leaderSlug: "anwar-ibrahim", title: "Address at the Opening Ceremony of the 47th ASEAN Summit", deliveredAt: "2025-10-26" },
  { url: "https://www.pmo.gov.my/en/speeches-en/speech-by-yab-prime-minister-holding-our-ground-southeast-asia-in-a-fractured-world/", scraper: "generic", leaderSlug: "anwar-ibrahim", title: "Holding Our Ground: Southeast Asia in a Fractured World - Shangri-La Dialogue", deliveredAt: "2025-05-31" },
  { url: "https://www.pmo.gov.my/2024/09/speech-by-datoseri-anwar-ibrahim-prime-minister-of-malaysia-at-the-2024-eastern-economic-forum/", scraper: "generic", leaderSlug: "anwar-ibrahim", title: "Speech at the 2024 Eastern Economic Forum", deliveredAt: "2024-09-05" },

  // ─── Bola Tinubu ───
  { url: "https://statehouse.gov.ng/text-of-president-bola-ahmed-tinubus-new-year-address-to-the-nation/", scraper: "generic", leaderSlug: "bola-tinubu", title: "New Year Address to the Nation", deliveredAt: "2025-01-01" },
  { url: "https://statehouse.gov.ng/2026-budget-speech/", scraper: "generic", leaderSlug: "bola-tinubu", title: "2026 Budget Speech to the National Assembly", deliveredAt: "2025-12-19" },
  { url: "https://statehouse.gov.ng/we-have-made-undeniable-progress-president-tinubu-speech-on-2nd-anniversary-of-his-administration/", scraper: "generic", leaderSlug: "bola-tinubu", title: "Speech on 2nd Anniversary of His Administration", deliveredAt: "2025-05-29" },
  { url: "https://statehouse.gov.ng/address-by-his-excellency-president-bola-ahmed-tinubu-gcfr-at-the-opening-ceremony-of-the-2025-all-nigerian-judges-conference-of-the-superior-courts-held-at-the-andrews-otutu-obaseki-auditorium/", scraper: "generic", leaderSlug: "bola-tinubu", title: "Address at the 2025 All Nigerian Judges' Conference", deliveredAt: "2025-01-01" },
  { url: "https://gadebate.un.org/en/79/nigeria", scraper: "generic", leaderSlug: "bola-tinubu", title: "Nigeria Statement at UNGA 79th Session General Debate (delivered by VP Shettima)", deliveredAt: "2024-09-24" },

  // ─── Boris Pistorius ───
  { url: "https://www.bmvg.de/en/news/keynote-speech-delivered-by-boris-pistorius-at-the-msc-24-5749178", scraper: "generic", leaderSlug: "boris-pistorius", title: "Keynote Speech at the Munich Security Conference 2024", deliveredAt: "2024-02-17" },
  { url: "https://www.iiss.org/globalassets/media-library---content--migration/files/shangri-la-dialogue/2023/final-transcripts/p-6/boris-pistorius-minister-of-defence-germany---as-delivered.pdf", scraper: "generic", leaderSlug: "boris-pistorius", title: "Remarks at the IISS Shangri-La Dialogue 2023", deliveredAt: "2023-06-03" },

  // ─── Charles Michel ───
  { url: "https://www.consilium.europa.eu/en/press/press-releases/2024/09/27/speech-by-president-charles-michel-at-the-79th-united-nations-general-assembly/", scraper: "generic", leaderSlug: "charles-michel", title: "Speech by President Charles Michel at the 79th United Nations General Assembly", deliveredAt: "2024-09-27" },
  { url: "https://www.consilium.europa.eu/en/press/press-releases/2024/09/22/speech-by-president-charles-michel-at-the-un-summit-of-the-future/", scraper: "generic", leaderSlug: "charles-michel", title: "Speech by President Charles Michel at the UN Summit of the Future", deliveredAt: "2024-09-22" },
  { url: "https://www.consilium.europa.eu/en/press/press-releases/2024/11/18/speech-by-charles-michel-president-of-the-european-council-at-the-g20-summit/", scraper: "generic", leaderSlug: "charles-michel", title: "Speech by Charles Michel, President of the European Council, at the G20 Summit", deliveredAt: "2024-11-18" },
  { url: "https://www.consilium.europa.eu/en/press/press-releases/2024/06/15/speech-by-president-charles-michel-at-the-summit-on-peace-in-ukraine/", scraper: "generic", leaderSlug: "charles-michel", title: "Speech by President Charles Michel at the Summit on Peace in Ukraine", deliveredAt: "2024-06-15" },
  { url: "https://www.consilium.europa.eu/en/press/press-releases/2024/06/11/speech-by-president-charles-michel-at-the-gaza-aid-conference-in-jordan/", scraper: "generic", leaderSlug: "charles-michel", title: "Speech by President Charles Michel at the Gaza aid conference in Jordan", deliveredAt: "2024-06-11" },

  // ─── Christopher Luxon ───
  { url: "https://www.beehive.govt.nz/speech/state-nation-2025", scraper: "generic", leaderSlug: "christopher-luxon", title: "State of the Nation 2025", deliveredAt: "2025-01-23" },
  { url: "https://www.beehive.govt.nz/speech/rt-hon-christopher-luxon-waitangi-speech", scraper: "generic", leaderSlug: "christopher-luxon", title: "Waitangi Speech", deliveredAt: "2025-02-06" },
  { url: "https://www.beehive.govt.nz/speech/speech-lgnz-superlocal-conference", scraper: "generic", leaderSlug: "christopher-luxon", title: "Speech to LGNZ SuperLocal Conference", deliveredAt: "2024-08-21" },
  { url: "https://www.beehive.govt.nz/speech/state-nation-0", scraper: "generic", leaderSlug: "christopher-luxon", title: "State of the Nation 2026", deliveredAt: "2026-01-22" },

  // ─── Claudia Sheinbaum ───
  { url: "https://www.americanrhetoric.com/speeches/claudiasheinbauminauguraladdress.htm", scraper: "generic", leaderSlug: "claudia-sheinbaum", title: "Inauguration Address before Congress", deliveredAt: "2024-10-01" },
  { url: "https://www.americanrhetoric.com/speeches/claudiasheinbauminternationalwomensday2025.htm", scraper: "generic", leaderSlug: "claudia-sheinbaum", title: "First International Women's Day Address as President", deliveredAt: "2025-03-08" },
  { url: "https://regeneracion.mx/speech-by-mexican-president-claudia-sheinbaum-at-the-mexico-rally-sunday-march-9-2025/", scraper: "generic", leaderSlug: "claudia-sheinbaum", title: "Speech at Mexico City Rally, March 9 2025", deliveredAt: "2025-03-09" },
  { url: "https://regeneracion.mx/speech-by-claudia-sheinbaum-on-her-first-year-in-office-delivered-before-400000-people-in-mexico-cityz-zocalo-square-sunday-october-5-2025/", scraper: "generic", leaderSlug: "claudia-sheinbaum", title: "Speech on First Year in Office at Zocalo Square", deliveredAt: "2025-10-05" },

  // ─── Cyril Ramaphosa ───
  { url: "https://www.thepresidency.gov.za/state-nation-address-president-cyril-ramaphosa-cape-town-city-hall-2", scraper: "generic", leaderSlug: "cyril-ramaphosa", title: "2025 State of the Nation Address", deliveredAt: "2025-02-06" },
  { url: "https://www.thepresidency.gov.za/address-president-cyril-ramaphosa-occasion-presidential-inauguration-union-buildings-tshwane", scraper: "generic", leaderSlug: "cyril-ramaphosa", title: "Presidential Inauguration Address 2024", deliveredAt: "2024-06-19" },
  { url: "https://www.thepresidency.gov.za/new-year-message-president-cyril-ramaphosa-3", scraper: "generic", leaderSlug: "cyril-ramaphosa", title: "New Year Message by President Cyril Ramaphosa", deliveredAt: "2024-12-31" },
  { url: "https://gadebate.un.org/en/79/south-africa", scraper: "generic", leaderSlug: "cyril-ramaphosa", title: "South Africa Statement at UNGA 79th Session General Debate", deliveredAt: "2024-09-24" },

  // ─── Donald Tusk ───
  { url: "https://www.gov.pl/web/primeminister/speech-by-prime-minister-donald-tusk-at-the-swearing-in-of-the-council-of-ministers", scraper: "generic", leaderSlug: "donald-tusk", title: "Speech at the Swearing-In of the Council of Ministers", deliveredAt: "2023-12-13" },
  { url: "https://www.gov.pl/web/primeminister/expose-donalda-tuska", scraper: "generic", leaderSlug: "donald-tusk", title: "Expose of Prime Minister Donald Tusk", deliveredAt: "2023-12-12" },
  { url: "https://www.gov.pl/web/primeminister/prime-minister-in-parliament-hope-cannot-replace-strategy", scraper: "generic", leaderSlug: "donald-tusk", title: "Prime Minister in Parliament: Hope Cannot Replace Strategy", deliveredAt: "2025-03-12" },
  { url: "https://www.gov.pl/web/primeminister/prime-minister-donald-tusks-address", scraper: "generic", leaderSlug: "donald-tusk", title: "Prime Minister Donald Tusk's Address" },

  // ─── Ferdinand Marcos Jr ───
  { url: "https://pco.gov.ph/presidential-speech/fourth-state-of-the-nation-address-of-his-excellency-ferdinand-r-marcos-jr-president-of-the-republic-of-the-philippines/", scraper: "generic", leaderSlug: "ferdinand-marcos-jr", title: "Fourth State of the Nation Address (SONA 2025)", deliveredAt: "2025-07-28" },
  { url: "https://pco.gov.ph/presidential-speech/speech-by-president-ferdinand-r-marcos-jr-at-the-constitution-day-2024/", scraper: "generic", leaderSlug: "ferdinand-marcos-jr", title: "Speech at Constitution Day 2024", deliveredAt: "2024-02-08" },
  { url: "https://pco.gov.ph/presidential-speech/speech-by-president-ferdinand-r-marcos-jr-at-the-opening-ceremony-of-the-2024-apmcdrr/", scraper: "generic", leaderSlug: "ferdinand-marcos-jr", title: "Speech at the Opening Ceremony of the 2024 APMCDRR", deliveredAt: "2024-10-14" },
  { url: "https://pco.gov.ph/presidential-speech/speech-by-president-ferdinand-r-marcos-jr-at-the-2025-open-government-partnership-ogp-asia-and-the-asia-and-the-pacific-regional-meeting-aprm/", scraper: "generic", leaderSlug: "ferdinand-marcos-jr", title: "Speech at the 2025 Open Government Partnership Asia-Pacific Regional Meeting", deliveredAt: "2025-01-01" },
  { url: "https://gadebate.un.org/en/79/philippines", scraper: "generic", leaderSlug: "ferdinand-marcos-jr", title: "Philippines Statement at UNGA 79th Session General Debate (delivered by FM Manalo)", deliveredAt: "2024-09-28" },

  // ─── Fumio Kishida ───
  { url: "https://japan.kantei.go.jp/101_kishida/statement/202405/23speech.html", scraper: "generic", leaderSlug: "fumio-kishida", title: "Speech at the Future of Asia Forum", deliveredAt: "2024-05-23" },
  { url: "https://japan.kantei.go.jp/101_kishida/statement/202404/11speech.html", scraper: "generic", leaderSlug: "fumio-kishida", title: "Address at a Joint Meeting of the United States Congress - For the Future: Our Global Partnership", deliveredAt: "2024-04-11" },
  { url: "https://japan.kantei.go.jp/101_kishida/statement/202301/_00005.html", scraper: "generic", leaderSlug: "fumio-kishida", title: "Policy Speech at Johns Hopkins University SAIS", deliveredAt: "2023-01-13" },
  { url: "https://japan.kantei.go.jp/101_kishida/statement/202409/0928enzetsu.html", scraper: "generic", leaderSlug: "fumio-kishida", title: "Address at the 79th Session of the United Nations General Assembly", deliveredAt: "2024-09-28" },
  { url: "https://japan.kantei.go.jp/101_kishida/statement/202205/_00002.html", scraper: "generic", leaderSlug: "fumio-kishida", title: "Speech at the Guildhall in London", deliveredAt: "2022-05-05" },

  // ─── Gabriel Boric ───
  { url: "https://gadebate.un.org/en/79/chile", scraper: "generic", leaderSlug: "gabriel-boric", title: "Chile Statement at UNGA 79th Session General Debate", deliveredAt: "2024-09-24" },
  { url: "https://www.icwa.in/show_content.php?lang=1&level=2&ls_id=12713&lid=7780", scraper: "generic", leaderSlug: "gabriel-boric", title: "53rd Sapru House Lecture: Chile and India Side by Side on the Global South", deliveredAt: "2025-04-02" },

  // ─── Giorgia Meloni ───
  { url: "https://www.governo.it/en/articolo/president-meloni-s-speech-78th-united-nations-general-assembly/23621", scraper: "generic", leaderSlug: "giorgia-meloni", title: "Speech at the 78th United Nations General Assembly", deliveredAt: "2023-09-20" },
  { url: "https://www.governo.it/en/articolo/president-meloni-s-address-80th-united-nations-general-assembly/29851", scraper: "generic", leaderSlug: "giorgia-meloni", title: "Address to the 80th United Nations General Assembly", deliveredAt: "2025-09-25" },
  { url: "https://www.governo.it/en/articolo/president-meloni-s-speech-atlantic-council-global-citizen-awards/26632", scraper: "generic", leaderSlug: "giorgia-meloni", title: "Speech at the Atlantic Council Global Citizen Awards", deliveredAt: "2024-09-24" },
  { url: "https://www.governo.it/en/articolo/president-meloni-s-speech-rome-med-dialogues-2024/27243", scraper: "generic", leaderSlug: "giorgia-meloni", title: "Speech at Rome MED Dialogues 2024", deliveredAt: "2024-12-11" },
  { url: "https://www.governo.it/en/articolo/president-meloni-s-opening-address-g7-summit/25987", scraper: "generic", leaderSlug: "giorgia-meloni", title: "Opening Address at the G7 Summit", deliveredAt: "2024-06-13" },

  // ─── Gustavo Petro ───
  { url: "https://progressive.international/wire/2024-09-25-discurso-del-presidente-gustavo-petro-en-la-79-asamblea-general-de-la-onu/en/", scraper: "generic", leaderSlug: "gustavo-petro", title: "Speech at the 79th UN General Assembly", deliveredAt: "2024-09-24" },
  { url: "https://gadebate.un.org/en/79/colombia", scraper: "generic", leaderSlug: "gustavo-petro", title: "Colombia Statement at UNGA 79th Session General Debate", deliveredAt: "2024-09-24" },
  { url: "https://fossilfueltreaty.org/blog/petro-full-speech", scraper: "generic", leaderSlug: "gustavo-petro", title: "Full Speech Calling for a Fossil Fuel Treaty at COP28", deliveredAt: "2023-12-02" },

  // ─── Hakan Fidan ───
  { url: "https://www.mfa.gov.tr/disisleri-bakani-sayin-hakan-fidan-in-iii-antalya-diplomasi-forumu-nun-acilisinda-yaptigi-konusma--1-mart-2024--antalya.en.mfa", scraper: "generic", leaderSlug: "hakan-fidan", title: "Opening Address at the III. Antalya Diplomacy Forum", deliveredAt: "2024-03-01" },
  { url: "https://www.mfa.gov.tr/disisleri-bakani-sayin-hakan-fidan-in-arap-ligi-162-disisleri-bakanlari-konseyi-toplantisinda-yaptigi-konusma-10-9-2024.en.mfa", scraper: "generic", leaderSlug: "hakan-fidan", title: "Speech at the 162nd Meeting of the Council of Foreign Ministers of the Arab League", deliveredAt: "2024-09-10" },
  { url: "https://www.mfa.gov.tr/interview-of-he-hakan-fidan--minister-of-foreign-affairs--al-jazeera-english--18-december-2024.en.mfa", scraper: "generic", leaderSlug: "hakan-fidan", title: "Interview with Al Jazeera English", deliveredAt: "2024-12-18" },
  { url: "https://www.mfa.gov.tr/interview-of-he-hakan-fidan--minister-of-foreign-affairs--france-24-english--20-december-2024.en.mfa", scraper: "generic", leaderSlug: "hakan-fidan", title: "Interview with France 24 English", deliveredAt: "2024-12-20" },
  { url: "https://www.mfa.gov.tr/interview-of-he-hakan-fidan--minister-of-foreign-affairs--reuters--4-april-2025.en.mfa", scraper: "generic", leaderSlug: "hakan-fidan", title: "Interview with Reuters", deliveredAt: "2025-04-04" },

  // ─── Jens Stoltenberg ───
  { url: "https://www.nato.int/cps/en/natohq/opinions_222258.htm", scraper: "generic", leaderSlug: "jens-stoltenberg", title: "Speech by NATO Secretary General Jens Stoltenberg at the Heritage Foundation", deliveredAt: "2024-01-31" },
  { url: "https://www.nato.int/cps/en/natohq/opinions_226742.htm", scraper: "generic", leaderSlug: "jens-stoltenberg", title: "Speech by NATO Secretary General Jens Stoltenberg at the Wilson Center", deliveredAt: "2024-06-17" },
  { url: "https://www.nato.int/cps/en/natohq/opinions_226745.htm", scraper: "generic", leaderSlug: "jens-stoltenberg", title: "Remarks by NATO Secretary General Jens Stoltenberg to President Biden", deliveredAt: "2024-06-17" },
  { url: "https://www.nato.int/cps/en/natohq/opinions_227411.htm", scraper: "generic", leaderSlug: "jens-stoltenberg", title: "Opening remarks by NATO Secretary General Jens Stoltenberg at the meeting of the North Atlantic Council at the level of Heads of State and Government", deliveredAt: "2024-07-10" },

  // ─── Joko Widodo ───
  { url: "https://setkab.go.id/en/category/speech-transcript/", scraper: "generic", leaderSlug: "joko-widodo", title: "Speech Transcript Archives (Sekretariat Kabinet - includes final State of the Nation Address August 2024)", deliveredAt: "2024-08-16" },

  // ─── Josep Borrell ───
  { url: "https://www.eeas.europa.eu/eeas/defense-speech-high-representativevice-president-josep-borrell-forum-europa_en", scraper: "generic", leaderSlug: "josep-borrell", title: "Defense: Speech by High Representative/Vice President Josep Borrell at Forum Europa", deliveredAt: "2024-04-09" },
  { url: "https://www.eeas.europa.eu/eeas/hrvp-josep-borrell-opening-speech-un-security-council-12032024-1-multilateralism_en", scraper: "generic", leaderSlug: "josep-borrell", title: "HR/VP Josep Borrell Opening Speech at the UN Security Council on Multilateralism", deliveredAt: "2024-03-12" },
  { url: "https://www.eeas.europa.eu/eeas/united-kingdom-speech-high-representativevice-president-josep-borrell-oxford-university-about-world_en", scraper: "generic", leaderSlug: "josep-borrell", title: "Speech by HR/VP Josep Borrell at Oxford University about the world confronted by wars", deliveredAt: "2024-05-16" },
  { url: "https://www.eeas.europa.eu/eeas/united-states-speech-high-representativevice-president-josep-borrell-hoover-institution-stanford-san_en", scraper: "generic", leaderSlug: "josep-borrell", title: "Speech by HR/VP Josep Borrell at the Hoover Institution, Stanford", deliveredAt: "2024-05-14" },
  { url: "https://www.eeas.europa.eu/eeas/us-speech-high-representativevice-president-josep-borrell-ep-plenary-transatlantic-relations-after_en", scraper: "generic", leaderSlug: "josep-borrell", title: "Speech by HR/VP Josep Borrell at the EP plenary on transatlantic relations after the US Presidential elections", deliveredAt: "2024-11-13" },

  // ─── Justin Trudeau ───
  { url: "https://www.pm.gc.ca/en/news/speeches/2017/09/21/prime-minister-justin-trudeaus-address-72th-session-united-nations-general", scraper: "generic", leaderSlug: "justin-trudeau", title: "Address to the 72nd Session of the United Nations General Assembly", deliveredAt: "2017-09-21" },
  { url: "https://www.pm.gc.ca/en/news/speeches/2016/09/20/prime-minister-justin-trudeaus-address-71st-session-united-nations-general", scraper: "generic", leaderSlug: "justin-trudeau", title: "Address to the 71st Session of the United Nations General Assembly", deliveredAt: "2016-09-20" },
  { url: "https://www.pm.gc.ca/en/news/speeches/2018/02/09/speech-prime-minister-justin-trudeau-ronald-reagan-presidential-library", scraper: "generic", leaderSlug: "justin-trudeau", title: "Speech at the Ronald Reagan Presidential Library and Center for Public Affairs", deliveredAt: "2018-02-09" },
  { url: "https://www.pm.gc.ca/en/news/speeches/2015/12/08/prime-minister-justin-trudeau-delivers-speech-assembly-first-nations", scraper: "generic", leaderSlug: "justin-trudeau", title: "Speech to the Assembly of First Nations Special Chiefs Assembly", deliveredAt: "2015-12-08" },
  { url: "https://www.pm.gc.ca/en/news/speeches/2017/07/01/canada-day-address-prime-minister-justin-trudeau-parliament-hill", scraper: "generic", leaderSlug: "justin-trudeau", title: "Canada Day Address on Parliament Hill", deliveredAt: "2017-07-01" },

  // ─── Kaja Kallas ───
  { url: "https://www.eeas.europa.eu/eeas/keynote-speech-hrvp-kaja-kallas-msc-europeans-assemble-reclaiming-agency-rougher-world_en", scraper: "generic", leaderSlug: "kaja-kallas", title: "Keynote speech by HR/VP Kaja Kallas at the MSC: Europeans Assemble! Reclaiming Agency in a Rougher World", deliveredAt: "2026-02-15" },
  { url: "https://www.eeas.europa.eu/eeas/speech-high-representativevice-president-kaja-kallas-iiss-shangri-la-dialogue_en", scraper: "generic", leaderSlug: "kaja-kallas", title: "Speech by HR/VP Kaja Kallas at the IISS Shangri-La Dialogue", deliveredAt: "2025-05-31" },
  { url: "https://www.eeas.europa.eu/eeas/eu-ambassadors-conference-2025-opening-speech-high-representativevice-president-kaja-kallas_en", scraper: "generic", leaderSlug: "kaja-kallas", title: "EU Ambassadors Conference 2025: Opening speech by HR/VP Kaja Kallas", deliveredAt: "2025-02-03" },
  { url: "https://www.eeas.europa.eu/eeas/kaja-kallas-keynote-speech-copenhagen-democracy-summit-defence-democratic-space_en", scraper: "generic", leaderSlug: "kaja-kallas", title: "Kaja Kallas Keynote speech: Copenhagen Democracy Summit - In defence of democratic space", deliveredAt: "2025-06-12" },
  { url: "https://www.eeas.europa.eu/eeas/opening-remarks-high-representativevice-president-kaja-kallas-extraordinary-meeting-and-exchange_en", scraper: "generic", leaderSlug: "kaja-kallas", title: "Opening remarks by HR/VP Kaja Kallas for the Extraordinary Meeting with the European Parliament's Committee on Foreign Affairs", deliveredAt: "2025-12-09" },

  // ─── Kazuo Ueda ───
  { url: "https://www.boj.or.jp/en/about/press/koen_2024/ko240508a.htm", scraper: "generic", leaderSlug: "kazuo-ueda", title: "Virtuous Cycle between Wages and Prices and the Bank of Japan's Monetary Policy", deliveredAt: "2024-05-08" },
  { url: "https://www.boj.or.jp/en/about/press/koen_2024/ko240924a.htm", scraper: "generic", leaderSlug: "kazuo-ueda", title: "Japan's Economy and Monetary Policy (Speech in Osaka)", deliveredAt: "2024-09-24" },
  { url: "https://www.boj.or.jp/en/about/press/koen_2024/ko241225a.htm", scraper: "generic", leaderSlug: "kazuo-ueda", title: "Achievement of the 2 Percent Price Stability Target and Japan's Economy (Keidanren)", deliveredAt: "2024-12-25" },
  { url: "https://www.boj.or.jp/en/about/press/koen_2025/ko250603a.htm", scraper: "generic", leaderSlug: "kazuo-ueda", title: "Economic Activity and Prices, and Monetary Policy in Japan (Naigai Josei Chosa Kai)", deliveredAt: "2025-06-03" },
  { url: "https://www.boj.or.jp/en/about/press/koen_2025/ko251201a.htm", scraper: "generic", leaderSlug: "kazuo-ueda", title: "Japan's Economy and Monetary Policy (Speech in Nagoya)", deliveredAt: "2025-12-01" },

  // ─── Kyriakos Mitsotakis ───
  { url: "https://www.primeminister.gr/en/2024/09/27/35001", scraper: "generic", leaderSlug: "kyriakos-mitsotakis", title: "Speech at the 79th Session of the UN General Assembly", deliveredAt: "2024-09-26" },
  { url: "https://www.primeminister.gr/en/2024/09/24/34943", scraper: "generic", leaderSlug: "kyriakos-mitsotakis", title: "Speech after receiving the Atlantic Council Global Citizen Award for 2024", deliveredAt: "2024-09-24" },
  { url: "https://www.primeminister.gr/en/2024/04/16/34063", scraper: "generic", leaderSlug: "kyriakos-mitsotakis", title: "Speech at the 9th Our Ocean Conference in Athens", deliveredAt: "2024-04-16" },
  { url: "https://www.primeminister.gr/en/2024/02/21/33705", scraper: "generic", leaderSlug: "kyriakos-mitsotakis", title: "Speech at the inaugural session of the Raisina Dialogue in India", deliveredAt: "2024-02-21" },
  { url: "https://www.primeminister.gr/en/2025/09/26/37065", scraper: "generic", leaderSlug: "kyriakos-mitsotakis", title: "Speech at the 80th Session of the UN General Assembly", deliveredAt: "2025-09-26" },

  // ─── Lai Ching Te ───
  { url: "https://english.president.gov.tw/News/6726", scraper: "generic", leaderSlug: "lai-ching-te", title: "Inaugural Address of ROC 16th-term President Lai Ching-te", deliveredAt: "2024-05-20" },
  { url: "https://english.president.gov.tw/News/6816", scraper: "generic", leaderSlug: "lai-ching-te", title: "2024 National Day Address", deliveredAt: "2024-10-10" },
  { url: "https://english.president.gov.tw/News/6893", scraper: "generic", leaderSlug: "lai-ching-te", title: "2025 New Year's Address", deliveredAt: "2025-01-01" },
  { url: "https://english.president.gov.tw/News/7022", scraper: "generic", leaderSlug: "lai-ching-te", title: "2025 National Day Address", deliveredAt: "2025-10-10" },
  { url: "https://english.president.gov.tw/News/6956", scraper: "generic", leaderSlug: "lai-ching-te", title: "Address on First Anniversary of Taking Office", deliveredAt: "2025-05-20" },

  // ─── Lawrence Wong ───
  { url: "https://www.pmo.gov.sg/newsroom/national-day-rally-2024/", scraper: "generic", leaderSlug: "lawrence-wong", title: "National Day Rally 2024", deliveredAt: "2024-08-18" },
  { url: "https://www.pmo.gov.sg/newsroom/pm-lawrence-wong-at-the-debate-on-the-president-s-address-2025/", scraper: "generic", leaderSlug: "lawrence-wong", title: "Debate on the President's Address 2025", deliveredAt: "2025-09-24" },
  { url: "https://www.pmo.gov.sg/newsroom/pm-lawrence-wong-at-may-day-rally-2025/", scraper: "generic", leaderSlug: "lawrence-wong", title: "May Day Rally 2025", deliveredAt: "2025-05-01" },
  { url: "https://www.pmo.gov.sg/Newsroom/PM-Lawrence-Wong-at-the-S-Rajaratnam-Lecture-2025", scraper: "generic", leaderSlug: "lawrence-wong", title: "S Rajaratnam Lecture 2025", deliveredAt: "2025-04-16" },
  { url: "https://www.pmo.gov.sg/newsroom/2026-new-year-message-by-pm-lawrence-wong/", scraper: "generic", leaderSlug: "lawrence-wong", title: "2026 New Year Message", deliveredAt: "2026-01-01" },

  // ─── Lee Hsien Loong ───
  { url: "https://www.pmo.gov.sg/newsroom/national-day-rally-2023/", scraper: "generic", leaderSlug: "lee-hsien-loong", title: "National Day Rally 2023", deliveredAt: "2023-08-20" },
  { url: "https://www.pmo.gov.sg/Newsroom/PM-Lee-Hsien-Loong-at-May-Day-Rally-2024", scraper: "generic", leaderSlug: "lee-hsien-loong", title: "May Day Rally 2024", deliveredAt: "2024-05-01" },
  { url: "https://www.pmo.gov.sg/newsroom/sm-lee-hsien-loong-at-the-2024-edwin-l-godkin-lecture/", scraper: "generic", leaderSlug: "lee-hsien-loong", title: "2024 Edwin L. Godkin Lecture at Harvard Kennedy School", deliveredAt: "2024-11-12" },
  { url: "https://www.pmo.gov.sg/newsroom/sm-lee-hsien-loong-at-the-regional-outlook-forum-2026-opening-remarks/", scraper: "generic", leaderSlug: "lee-hsien-loong", title: "Regional Outlook Forum 2026 Opening Remarks", deliveredAt: "2026-01-08" },

  // ─── Lloyd Austin ───
  { url: "https://www.defense.gov/News/Speeches/Speech/Article/3793580/the-new-convergence-in-the-indo-pacific-remarks-by-secretary-of-defense-lloyd-j/", scraper: "generic", leaderSlug: "lloyd-austin", title: "The New Convergence in the Indo-Pacific: Remarks at the 2024 Shangri-La Dialogue", deliveredAt: "2024-06-01" },
  { url: "https://www.defense.gov/News/Speeches/Speech/Article/3781010/opening-remarks-by-secretary-of-defense-lloyd-j-austin-iii-at-the-22nd-ukraine/", scraper: "generic", leaderSlug: "lloyd-austin", title: "Opening Remarks at the 22nd Ukraine Defense Contact Group", deliveredAt: "2024-06-13" },
  { url: "https://www.defense.gov/News/Speeches/Speech/Article/3710899/opening-remarks-by-secretary-of-defense-lloyd-j-austin-iii-at-the-20th-ukraine/", scraper: "generic", leaderSlug: "lloyd-austin", title: "Opening Remarks at the 20th Ukraine Defense Contact Group", deliveredAt: "2024-03-19" },
  { url: "https://www.defense.gov/News/Speeches/Speech/Article/4025037/secretary-of-defense-opening-remarks-at-the-25th-ukraine-defense-contact-group/", scraper: "generic", leaderSlug: "lloyd-austin", title: "Opening Remarks at the 25th Ukraine Defense Contact Group", deliveredAt: "2024-10-12" },

  // ─── Mahmoud Abbas ───
  { url: "https://gadebate.un.org/en/79/palestine-state", scraper: "generic", leaderSlug: "mahmoud-abbas", title: "Palestine Statement at UNGA 79th Session General Debate", deliveredAt: "2024-09-26" },
  { url: "https://www.timesofisrael.com/full-text-of-abbas-speech-at-2-state-summit-we-demand-a-ceasefire-hamas-must-hand-arms-to-pa/", scraper: "generic", leaderSlug: "mahmoud-abbas", title: "Full Text of Abbas Speech at Two-State Summit", deliveredAt: "2025-09-22" },
  { url: "https://www.un.org/unispal/wp-content/uploads/2024/11/Statement-of-HE-President-Mahmoud-Abbas.pdf", scraper: "generic", leaderSlug: "mahmoud-abbas", title: "Statement by President Mahmoud Abbas (UN ISPAL archive)", deliveredAt: "2024-11-29" },

  // ─── Marco Rubio ───
  { url: "https://www.state.gov/secretary-marco-rubio-remarks-at-his-swearing-in", scraper: "generic", leaderSlug: "marco-rubio", title: "Secretary Marco Rubio Remarks at His Swearing-In", deliveredAt: "2025-01-21" },
  { url: "https://www.state.gov/secretary-marco-rubio-remarks-to-employees", scraper: "generic", leaderSlug: "marco-rubio", title: "Secretary Marco Rubio Remarks to Employees", deliveredAt: "2025-01-21" },
  { url: "https://www.state.gov/opening-remarks-by-secretary-of-state-designate-marco-rubio-before-the-senate-foreign-relations-committee", scraper: "generic", leaderSlug: "marco-rubio", title: "Opening Remarks by Secretary of State-designate Marco Rubio Before the Senate Foreign Relations Committee", deliveredAt: "2025-01-15" },
  { url: "https://www.state.gov/releases/office-of-the-spokesperson/2026/02/secretary-of-state-marco-rubio-at-the-munich-security-conference", scraper: "generic", leaderSlug: "marco-rubio", title: "Secretary of State Marco Rubio at the Munich Security Conference", deliveredAt: "2026-02-14" },
  { url: "https://www.state.gov/remarks-secretary-rubio", scraper: "generic", leaderSlug: "marco-rubio", title: "Remarks: Secretary Rubio", deliveredAt: "2025-01-23" },

  // ─── Mark Carney ───
  { url: "https://www.pm.gc.ca/en/news/speeches/2026/01/20/principled-and-pragmatic-canadas-path-prime-minister-carney-addresses", scraper: "generic", leaderSlug: "mark-carney", title: "Principled and Pragmatic: Canada's Path - World Economic Forum Annual Meeting", deliveredAt: "2026-01-20" },
  { url: "https://www.pm.gc.ca/en/news/speeches/2026/01/22/building-canada-together-prime-minister-carney-delivers-remarks-citadelle", scraper: "generic", leaderSlug: "mark-carney", title: "Building Canada Together - Remarks at the Citadelle of Quebec", deliveredAt: "2026-01-22" },
  { url: "https://www.pm.gc.ca/en/news/speeches/2026/03/04/prime-minister-carney-delivers-remarks-media-sydney-australia", scraper: "generic", leaderSlug: "mark-carney", title: "Prime Minister Carney Delivers Remarks to Media in Sydney, Australia", deliveredAt: "2026-03-04" },
  { url: "https://www.pm.gc.ca/en/news/speeches/2025/11/05/prime-minister-carney-delivers-remarks-outline-how-budget-2025-building", scraper: "generic", leaderSlug: "mark-carney", title: "Remarks on How Budget 2025 is Building Communities Strong", deliveredAt: "2025-11-05" },

  // ─── Mark Rutte ───
  { url: "https://www.nato.int/cps/en/natohq/opinions_231348.htm", scraper: "generic", leaderSlug: "mark-rutte", title: "To Prevent War, NATO Must Spend More - Speech by NATO Secretary General Mark Rutte", deliveredAt: "2024-12-12" },
  { url: "https://www.nato.int/cps/en/natohq/opinions_235867.htm", scraper: "generic", leaderSlug: "mark-rutte", title: "Building a better NATO - Speech by NATO Secretary General Mark Rutte at Chatham House", deliveredAt: "2025-06-09" },
  { url: "https://www.nato.int/cps/en/natohq/opinions_236429.htm", scraper: "generic", leaderSlug: "mark-rutte", title: "Keynote speech by NATO Secretary General Mark Rutte at the NATO Summit Defence Industry Forum", deliveredAt: "2025-06-24" },
  { url: "https://www.nato.int/cps/en/natohq/opinions_233924.htm", scraper: "generic", leaderSlug: "mark-rutte", title: "Speech by NATO Secretary General Mark Rutte at the Warsaw School of Economics", deliveredAt: "2025-01-22" },
  { url: "https://www.nato.int/cps/en/natohq/opinions_232941.htm", scraper: "generic", leaderSlug: "mark-rutte", title: "Pre-ministerial press conference by NATO Secretary General Mark Rutte", deliveredAt: "2024-12-03" },

  // ─── Masoud Pezeshkian ───
  { url: "https://gadebate.un.org/en/79/iran-islamic-republic", scraper: "generic", leaderSlug: "masoud-pezeshkian", title: "Address at the 79th Session of the UN General Assembly General Debate", deliveredAt: "2024-09-24" },
  { url: "https://gadebate.un.org/sites/default/files/gastatements/79/ir_en.pdf", scraper: "generic", leaderSlug: "masoud-pezeshkian", title: "Full Statement Text at the 79th UNGA General Debate (PDF)", deliveredAt: "2024-09-24" },
  { url: "https://www.rev.com/transcripts/masoud-pezeshkian-speaks-to-u-n", scraper: "generic", leaderSlug: "masoud-pezeshkian", title: "Masoud Pezeshkian Speaks to the United Nations (Transcript)", deliveredAt: "2024-09-24" },

  // ─── Mette Frederiksen ───
  { url: "https://english.stm.dk/the-prime-minister/speeches/prime-minister-mette-frederiksen-s-opening-address-at-the-opening-of-the-danish-parliament-october-1-2024/", scraper: "generic", leaderSlug: "mette-frederiksen", title: "Opening Address at the Opening of the Danish Parliament", deliveredAt: "2024-10-01" },
  { url: "https://english.stm.dk/the-prime-minister/speeches/pm-mette-frederiksens-new-years-address-on-the-1st-of-january-2025/", scraper: "generic", leaderSlug: "mette-frederiksen", title: "New Year's Address 2025", deliveredAt: "2025-01-01" },
  { url: "https://english.stm.dk/the-prime-minister/speeches/prime-minister-mette-frederiksens-new-years-address-on-the-1st-of-january-2026/", scraper: "generic", leaderSlug: "mette-frederiksen", title: "New Year's Address 2026", deliveredAt: "2026-01-01" },
  { url: "https://english.stm.dk/the-prime-minister/speeches/prime-minister-mette-frederiksen-s-speech-at-the-copenhagen-democracy-summit-2024/", scraper: "generic", leaderSlug: "mette-frederiksen", title: "Speech at the Copenhagen Democracy Summit 2024", deliveredAt: "2024-06-14" },
  { url: "https://english.stm.dk/the-prime-minister/speeches/prime-minister-mette-frederiksens-presentation-of-the-danish-presidency-priorities-in-strasbourg/", scraper: "generic", leaderSlug: "mette-frederiksen", title: "Presentation of the Danish Presidency Priorities in Strasbourg", deliveredAt: "2025-07-08" },

  // ─── Mohammed Bin Salman ───
  { url: "https://www.spa.gov.sa/en/w2104220", scraper: "generic", leaderSlug: "mohammed-bin-salman", title: "Kingdom's Speech at 33rd Arab Summit in Bahrain", deliveredAt: "2024-05-16" },
  { url: "https://gadebate.un.org/en/79/saudi-arabia", scraper: "generic", leaderSlug: "mohammed-bin-salman", title: "Saudi Arabia Statement at UNGA 79th Session General Debate (delivered by FM)", deliveredAt: "2024-09-28" },

  // ─── Paul Kagame ───
  { url: "https://www.paulkagame.rw/kwibuka-30-address-by-president-kagame/", scraper: "generic", leaderSlug: "paul-kagame", title: "Kwibuka 30 Address by President Kagame", deliveredAt: "2024-04-07" },
  { url: "https://thecommonwealth.org/news/chogm2024/President-of-Rwanda-Paul-Kagame-Opening-Speech", scraper: "generic", leaderSlug: "paul-kagame", title: "Opening Speech at CHOGM 2024 in Samoa", deliveredAt: "2024-10-25" },
  { url: "https://www.paulkagame.rw/chogm-opening-ceremony-remarks-by-president-kagame-apia-25-october-2024/", scraper: "generic", leaderSlug: "paul-kagame", title: "CHOGM Opening Ceremony Remarks (paulkagame.rw)", deliveredAt: "2024-10-25" },
  { url: "https://gadebate.un.org/en/79/rwanda", scraper: "generic", leaderSlug: "paul-kagame", title: "Rwanda Statement at UNGA 79th Session General Debate (delivered by Permanent Rep)", deliveredAt: "2024-09-30" },

  // ─── Pedro Sanchez ───
  { url: "https://www.lamoncloa.gob.es/lang/en/presidente/intervenciones/Paginas/2026/20260219-global-ai-impact-summit-speech.aspx", scraper: "generic", leaderSlug: "pedro-sanchez", title: "Speech at the Plenary Session of the AI Impact Summit", deliveredAt: "2026-02-19" },
  { url: "https://www.lamoncloa.gob.es/lang/en/presidente/intervenciones/Paginas/2026/20260214-munich-security-conference-speech.aspx", scraper: "generic", leaderSlug: "pedro-sanchez", title: "Speech on Fortifying the Foundation of Transatlantic Security - Munich Security Conference", deliveredAt: "2026-02-14" },
  { url: "https://www.lamoncloa.gob.es/lang/en/presidente/intervenciones/Paginas/2026/20260304-official-statement-speech.aspx", scraper: "generic", leaderSlug: "pedro-sanchez", title: "Institutional Statement to Assess the Latest International Events", deliveredAt: "2026-03-04" },
  { url: "https://www.lamoncloa.gob.es/lang/en/presidente/intervenciones/Paginas/2023/20231201_cop28-speech.aspx", scraper: "generic", leaderSlug: "pedro-sanchez", title: "Speech at the High-Level Segment of the Climate Action Summit (COP28)", deliveredAt: "2023-12-01" },
  { url: "https://www.lamoncloa.gob.es/lang/en/presidente/intervenciones/Paginas/2025/20251124-african-union-eu-summit-speech.aspx", scraper: "generic", leaderSlug: "pedro-sanchez", title: "Speech at the Opening Ceremony of the EU-African Union Summit", deliveredAt: "2025-11-24" },

  // ─── Pete Hegseth ───
  { url: "https://www.defense.gov/News/Speeches/Speech/Article/4202494/remarks-by-secretary-of-defense-pete-hegseth-at-the-2025-shangri-la-dialogue-in/", scraper: "generic", leaderSlug: "pete-hegseth", title: "Remarks at the 2025 Shangri-La Dialogue in Singapore", deliveredAt: "2025-05-31" },
  { url: "https://www.defense.gov/News/Speeches/Speech/article/4064113/opening-remarks-by-secretary-of-defense-pete-hegseth-at-ukraine-defense-contact/", scraper: "generic", leaderSlug: "pete-hegseth", title: "Opening Remarks at Ukraine Defense Contact Group", deliveredAt: "2025-02-12" },
  { url: "https://www.defense.gov/News/Transcripts/Transcript/Article/4176603/secretary-of-defense-pete-hegseth-delivers-keynote-address-at-special-operation/", scraper: "generic", leaderSlug: "pete-hegseth", title: "Keynote Address at Special Operations Forces Week 2025", deliveredAt: "2025-05-06" },
  { url: "https://www.defense.gov/News/Speeches/Speech/Article/4354431/remarks-by-secretary-of-war-pete-hegseth-at-the-reagan-national-defense-forum-a/", scraper: "generic", leaderSlug: "pete-hegseth", title: "Remarks at the Reagan National Defense Forum", deliveredAt: "2025-12-06" },

  // ─── Pope Francis ───
  { url: "https://www.vatican.va/content/francesco/en/speeches/2025/january/documents/20250109-corpo-diplomatico.html", scraper: "generic", leaderSlug: "pope-francis", title: "Address to Members of the Diplomatic Corps Accredited to the Holy See", deliveredAt: "2025-01-09" },
  { url: "https://www.vatican.va/content/francesco/en/messages/urbi/documents/20241225-urbi-et-orbi-natale.html", scraper: "generic", leaderSlug: "pope-francis", title: "Urbi et Orbi Christmas Message 2024", deliveredAt: "2024-12-25" },
  { url: "https://www.vatican.va/content/francesco/en/speeches/2024/september/documents/20240913-singapore-giovani.html", scraper: "generic", leaderSlug: "pope-francis", title: "Interreligious Meeting with Young People at Catholic Junior College, Singapore", deliveredAt: "2024-09-13" },
  { url: "https://www.vatican.va/content/francesco/en/speeches/2024/september/documents/20240905-indonesia-incontro-interreligioso.html", scraper: "generic", leaderSlug: "pope-francis", title: "Interreligious Meeting at Istiqlal Mosque, Jakarta", deliveredAt: "2024-09-05" },
  { url: "https://www.vatican.va/content/francesco/en/speeches/2024/january/documents/20240108-corpo-diplomatico.html", scraper: "generic", leaderSlug: "pope-francis", title: "Address to Members of the Diplomatic Corps (January 2024)", deliveredAt: "2024-01-08" },

  // ─── Prabowo Subianto ───
  { url: "https://setkab.go.id/en/remarks-of-president-prabowo-subianto-before-the-plenary-session-of-the-peoples-consultative-assembly-of-the-republic-of-indonesia-on-the-occasion-of-the-inauguration-of-the-president-elect-a/", scraper: "generic", leaderSlug: "prabowo-subianto", title: "Inauguration Address before the People's Consultative Assembly", deliveredAt: "2024-10-20" },
  { url: "https://setkab.go.id/en/newly-sworn-in-president-prabowo-delivers-his-first-speech/", scraper: "generic", leaderSlug: "prabowo-subianto", title: "First Speech as Newly Sworn-in President", deliveredAt: "2024-10-20" },
  { url: "https://www.weforum.org/stories/2026/01/davos-2026-special-address-prabowo-subianto-indonesia/", scraper: "generic", leaderSlug: "prabowo-subianto", title: "Davos 2026 Special Address at World Economic Forum", deliveredAt: "2026-01-20" },
  { url: "https://gadebate.un.org/en/79/indonesia", scraper: "generic", leaderSlug: "prabowo-subianto", title: "Indonesia Statement at UNGA 79th Session General Debate (delivered by FM Marsudi)", deliveredAt: "2024-09-28" },

  // ─── Rafael Grossi ───
  { url: "https://www.iaea.org/newscenter/statements/iaea-director-generals-introductory-statement-to-the-board-of-governors-4-march-2024", scraper: "generic", leaderSlug: "rafael-grossi", title: "IAEA Director General's Introductory Statement to the Board of Governors", deliveredAt: "2024-03-04" },
  { url: "https://www.iaea.org/newscenter/statements/statement-by-iaea-director-general-rafael-mariano-grossi-on-the-occasion-of-the-international-conference-on-nuclear-security-2024", scraper: "generic", leaderSlug: "rafael-grossi", title: "Statement by IAEA Director General Rafael Mariano Grossi on the Occasion of the International Conference on Nuclear Security 2024", deliveredAt: "2024-05-20" },
  { url: "https://www.iaea.org/newscenter/statements/iaea-director-generals-introductory-statement-to-the-board-of-governors-3-june-2024", scraper: "generic", leaderSlug: "rafael-grossi", title: "IAEA Director General's Introductory Statement to the Board of Governors", deliveredAt: "2024-06-03" },
  { url: "https://www.iaea.org/newscenter/statements/nobel-peace-prize-forum-our-perilous-path-and-how-we-change-course", scraper: "generic", leaderSlug: "rafael-grossi", title: "Nobel Peace Prize Forum: Our Perilous Path and How We Change Course", deliveredAt: "2024-12-11" },

  // ─── Rajnath Singh ───
  { url: "https://www.rajnathsingh.in/speech/adaptive-defence-is-not-merely-a-strategic-choice-but-a-necessity/", scraper: "generic", leaderSlug: "rajnath-singh", title: "Adaptive Defence is Not Merely a Strategic Choice but a Necessity (Delhi Defence Dialogue)", deliveredAt: "2024-11-12" },
  { url: "https://www.rajnathsingh.in/speech/aero-india-drives-forward-our-vision-for-a-strong-india-capable-india/", scraper: "generic", leaderSlug: "rajnath-singh", title: "Aero India Drives Forward Our Vision for a Strong India, Capable India", deliveredAt: "2025-02-10" },
  { url: "https://www.rajnathsingh.in/speeches-in-english/speech-at-the-valedictory-session-of-ficcis-annual-conclave/", scraper: "generic", leaderSlug: "rajnath-singh", title: "Speech at the Valedictory Session of FICCI's Annual Conclave", deliveredAt: "2024-11-22" },

  // ─── Rishi Sunak ───
  { url: "https://www.gov.uk/government/speeches/rishi-sunaks-final-speech-as-prime-minister-5-july-2024", scraper: "gov-uk", leaderSlug: "rishi-sunak", title: "Final Speech as Prime Minister", deliveredAt: "2024-07-05" },
  { url: "https://www.gov.uk/government/speeches/prime-minister-rishi-sunaks-statement-25-october-2022", scraper: "gov-uk", leaderSlug: "rishi-sunak", title: "First Speech as Prime Minister", deliveredAt: "2022-10-25" },
  { url: "https://www.gov.uk/government/speeches/prime-ministers-speech-at-the-ai-safety-summit-2-november-2023", scraper: "gov-uk", leaderSlug: "rishi-sunak", title: "Speech at the AI Safety Summit", deliveredAt: "2023-11-02" },
  { url: "https://www.gov.uk/government/speeches/pm-speech-on-net-zero-20-september-2023", scraper: "gov-uk", leaderSlug: "rishi-sunak", title: "Speech on Net Zero", deliveredAt: "2023-09-20" },
  { url: "https://www.gov.uk/government/speeches/pm-address-on-extremism-1-march-2024", scraper: "gov-uk", leaderSlug: "rishi-sunak", title: "Address on Extremism", deliveredAt: "2024-03-01" },

  // ─── Roberta Metsola ───
  { url: "https://www.europarl.europa.eu/news/en/press-room/20240716IPR22878/a-strong-parliament-in-a-strong-europe-ep-president-roberta-metsola", scraper: "generic", leaderSlug: "roberta-metsola", title: "A strong Parliament in a strong Europe - EP President Roberta Metsola re-election speech", deliveredAt: "2024-07-16" },
  { url: "https://www.europarl.europa.eu/news/en/press-room/20241104IPR25147/", scraper: "generic", leaderSlug: "roberta-metsola", title: "We have what it takes - President Metsola tells EU leaders", deliveredAt: "2024-11-07" },

  // ─── S Jaishankar ───
  { url: "https://www.mea.gov.in/Speeches-Statements.htm?dtl%2F38739%2FTranscript_of_remarks_by_External_Affairs_Minister_Dr_S_Jaishankar_at_the_Doha_Forum_2024_Opening_Panel_on_Conflict_Resolution_in_a_New_Era=", scraper: "generic", leaderSlug: "s-jaishankar", title: "Transcript of remarks by EAM Dr. S. Jaishankar at the Doha Forum 2024 Opening Panel on Conflict Resolution in a New Era", deliveredAt: "2024-12-07" },
  { url: "https://www.mea.gov.in/Speeches-Statements.htm?dtl%2F37609%2FKeynote_address_by_EAM_Dr_S_Jaishankar_at_the_7th_Indian_Ocean_Conference_2024=", scraper: "generic", leaderSlug: "s-jaishankar", title: "Keynote address by EAM Dr. S. Jaishankar at the 7th Indian Ocean Conference 2024", deliveredAt: "2024-02-09" },
  { url: "https://www.mea.gov.in/Speeches-Statements.htm?dtl%2F37824%2FRemarks_by_EAM_Dr_S_Jaishankar_at_the_Nikkei_Asia_2024_Future_of_Asia_Forum=", scraper: "generic", leaderSlug: "s-jaishankar", title: "Remarks by EAM Dr. S. Jaishankar at the Nikkei Asia 2024 Future of Asia Forum", deliveredAt: "2024-05-23" },
  { url: "https://www.mea.gov.in/Speeches-Statements.htm?dtl%2F38665%2FStatement_by_External_Affairs_Minister_Dr_S_Jaishankar_in_Lok_Sabha=", scraper: "generic", leaderSlug: "s-jaishankar", title: "Statement by External Affairs Minister Dr. S. Jaishankar in Lok Sabha", deliveredAt: "2024-11-26" },
  { url: "https://www.mea.gov.in/media-briefings.htm?dtl%2F38175%2FTranscript_of_Special_Briefing_by_External_Affairs_Minister_Dr_S_Jaishankar_on_the_3rd_Voice_of_Global_South_Summit_August_17_2024=", scraper: "generic", leaderSlug: "s-jaishankar", title: "Transcript of Special Briefing by EAM Dr. S. Jaishankar on the 3rd Voice of Global South Summit", deliveredAt: "2024-08-17" },

  // ─── Scott Bessent ───
  { url: "https://home.treasury.gov/news/press-releases/sb0045", scraper: "generic", leaderSlug: "scott-bessent", title: "Remarks at the Economic Club of New York", deliveredAt: "2025-03-06" },
  { url: "https://home.treasury.gov/news/press-releases/sb0094", scraper: "generic", leaderSlug: "scott-bessent", title: "Remarks before the Institute of International Finance", deliveredAt: "2025-04-23" },
  { url: "https://home.treasury.gov/news/press-releases/sb0167", scraper: "generic", leaderSlug: "scott-bessent", title: "Statement Before the Senate Finance Committee", deliveredAt: "2025-06-12" },
  { url: "https://home.treasury.gov/news/press-releases/sb0297", scraper: "generic", leaderSlug: "scott-bessent", title: "Remarks at the APEC Economic Leaders' Informal Dialogue", deliveredAt: "2025-10-31" },
  { url: "https://home.treasury.gov/news/press-releases/sb0353", scraper: "generic", leaderSlug: "scott-bessent", title: "Remarks before the Economic Club of Minnesota", deliveredAt: "2026-01-08" },

  // ─── Sebastien Lecornu ───
  { url: "https://www.iiss.org/globalassets/media-library---content--migration/files/shangri-la-dialogue/2024/transcripts/final/p2/sebastien-lecornu-minister-of-the-armed-forces-france-_as-delivered.pdf", scraper: "generic", leaderSlug: "sebastien-lecornu", title: "Remarks at the IISS Shangri-La Dialogue 2024", deliveredAt: "2024-06-01" },
  { url: "https://www.iiss.org/globalassets/media-library---content--migration/files/shangri-la-dialogue/2025/transcripts-final/p4/sld2025_fourth-plenary-session_sebastien-lecornu_as-delivered.pdf", scraper: "generic", leaderSlug: "sebastien-lecornu", title: "Remarks at the 22nd IISS Shangri-La Dialogue 2025", deliveredAt: "2025-05-31" },

  // ─── Sergei Lavrov ───
  { url: "https://mid.ru/en/foreign_policy/news/2049686/", scraper: "generic", leaderSlug: "sergei-lavrov", title: "Remarks by Foreign Minister Sergey Lavrov at the General Debate of the 79th Session of the UN General Assembly", deliveredAt: "2024-09-28" },
  { url: "https://mid.ru/en/foreign_policy/news/1975643/", scraper: "generic", leaderSlug: "sergei-lavrov", title: "Foreign Minister Sergey Lavrov's remarks and answers to media questions following the 19th East Asia Summit, Vientiane", deliveredAt: "2024-10-11" },
  { url: "https://mid.ru/en/press_service/minister_speeches/1927070/", scraper: "generic", leaderSlug: "sergei-lavrov", title: "Foreign Minister Sergey Lavrov's remarks at a UN Security Council meeting", deliveredAt: "2024-07-17" },
  { url: "https://www.mid.ru/en/press_service/minister_speeches/2048887/", scraper: "generic", leaderSlug: "sergei-lavrov", title: "Statement by Sergey Lavrov at the G20 Foreign Ministers' meeting on the sidelines of the 79th session of the UN General Assembly", deliveredAt: "2024-09-25" },

  // ─── Shehbaz Sharif ───
  { url: "https://gadebate.un.org/en/79/pakistan", scraper: "generic", leaderSlug: "shehbaz-sharif", title: "Pakistan Statement at UNGA 79th Session General Debate", deliveredAt: "2024-09-27" },
  { url: "https://pakun.org/official-statements/09252024-01", scraper: "generic", leaderSlug: "shehbaz-sharif", title: "Statement at UN Security Council High-Level Open Debate on Leadership for Peace", deliveredAt: "2024-09-25" },

  // ─── Shigeru Ishiba ───
  { url: "https://japan.kantei.go.jp/103/statement/202501/24shiseihoshin.html", scraper: "generic", leaderSlug: "shigeru-ishiba", title: "Policy Speech to the 217th Session of the Diet", deliveredAt: "2025-01-24" },
  { url: "https://japan.kantei.go.jp/103/statement/202411/29shoshinhyomei.html", scraper: "generic", leaderSlug: "shigeru-ishiba", title: "Policy Speech to the 216th Session of the Diet", deliveredAt: "2024-11-29" },
  { url: "https://japan.kantei.go.jp/103/statement/202509/23enzetsu.html", scraper: "generic", leaderSlug: "shigeru-ishiba", title: "Address at the 80th Session of the United Nations General Assembly", deliveredAt: "2025-09-23" },
  { url: "https://japan.kantei.go.jp/103/statement/202502/07kyodo_kaiken.html", scraper: "generic", leaderSlug: "shigeru-ishiba", title: "Joint Press Conference with President Donald Trump", deliveredAt: "2025-02-07" },

  // ─── Tedros Adhanom Ghebreyesus ───
  { url: "https://www.who.int/news-room/speeches/item/who-director-general-s-speech-at-the-world-governments-summit---12-february-2024", scraper: "generic", leaderSlug: "tedros-adhanom-ghebreyesus", title: "WHO Director-General's speech at the World Governments Summit", deliveredAt: "2024-02-12" },
  { url: "https://www.who.int/news-room/speeches/item/who-director-general-s-keynote-speech-in-the-plenary-session-of-the-148th-inter-parliamentary-union-assembly-25-march-2024", scraper: "generic", leaderSlug: "tedros-adhanom-ghebreyesus", title: "WHO Director-General's keynote speech in the plenary session of the 148th Inter-Parliamentary Union Assembly", deliveredAt: "2024-03-25" },
  { url: "https://www.who.int/news-room/speeches/item/who-director-general-s-remarks-at-meeting-of-the-united-nations-security-council-on-the-situation-of-the-health-system-in-gaza---6-november-2024", scraper: "generic", leaderSlug: "tedros-adhanom-ghebreyesus", title: "WHO Director-General's remarks at Meeting of the United Nations Security Council on the situation of the health system in Gaza", deliveredAt: "2024-11-06" },
  { url: "https://www.who.int/news-room/speeches/item/who-director-general-s-closing-remarks-at-the-seventy-seventh-world-health-assembly---1-june-2024", scraper: "generic", leaderSlug: "tedros-adhanom-ghebreyesus", title: "WHO Director-General's closing remarks at the Seventy-seventh World Health Assembly", deliveredAt: "2024-06-01" },
  { url: "https://www.who.int/news-room/speeches/item/report-of-the-director-general-to-member-states-at-the-seventy-eighth-world-health-assembly-19-may-2025", scraper: "generic", leaderSlug: "tedros-adhanom-ghebreyesus", title: "Report of the Director-General to Member States at the Seventy-eighth World Health Assembly", deliveredAt: "2025-05-19" },

  // ─── Tsai Ing Wen ───
  { url: "https://english.president.gov.tw/NEWS/6662", scraper: "generic", leaderSlug: "tsai-ing-wen", title: "2024 New Year's Address", deliveredAt: "2024-01-01" },
  { url: "https://english.president.gov.tw/News/6718", scraper: "generic", leaderSlug: "tsai-ing-wen", title: "Address at Copenhagen Democracy Summit 2024 (video)", deliveredAt: "2024-05-14" },
  { url: "https://english.president.gov.tw/News/6004", scraper: "generic", leaderSlug: "tsai-ing-wen", title: "Inaugural Address of ROC 15th-term President Tsai Ing-wen", deliveredAt: "2020-05-20" },

  // ─── Ursula Von Der Leyen ───
  { url: "https://ec.europa.eu/commission/presscorner/detail/en/speech_24_4481", scraper: "generic", leaderSlug: "ursula-von-der-leyen", title: "Keynote speech by President von der Leyen at the GLOBSEC Forum 2024", deliveredAt: "2024-08-30" },
  { url: "https://ec.europa.eu/commission/presscorner/detail/en/speech_24_5201", scraper: "generic", leaderSlug: "ursula-von-der-leyen", title: "Speech by President von der Leyen at the European Parliament Plenary on the presentation of the programme of activities of the Hungarian Presidency", deliveredAt: "2024-10-09" },
  { url: "https://ec.europa.eu/commission/presscorner/detail/en/speech_24_2233", scraper: "generic", leaderSlug: "ursula-von-der-leyen", title: "Speech by President von der Leyen at the European Parliament Plenary on the conclusions of the special European Council meeting of 17-18 April 2024", deliveredAt: "2024-04-24" },
  { url: "https://ec.europa.eu/commission/presscorner/detail/en/statement_24_3871", scraper: "generic", leaderSlug: "ursula-von-der-leyen", title: "Statement at the European Parliament Plenary by President Ursula von der Leyen, candidate for a second mandate 2024-2029", deliveredAt: "2024-07-18" },
  { url: "https://ec.europa.eu/commission/presscorner/detail/en/speech_24_6084", scraper: "generic", leaderSlug: "ursula-von-der-leyen", title: "Speech by President von der Leyen at the European Parliament Plenary on the new College of Commissioners and its programme", deliveredAt: "2024-11-27" },

  // ─── Viktor Orban ───
  { url: "https://miniszterelnok.hu/en/prime-minister-viktor-orbans-state-of-the-nation-address-2025-02-22/", scraper: "generic", leaderSlug: "viktor-orban", title: "State of the Nation Address 2025", deliveredAt: "2025-02-22" },
  { url: "https://miniszterelnok.hu/en/prime-minister-viktor-orbans-state-of-the-nation-address-02-18/", scraper: "generic", leaderSlug: "viktor-orban", title: "State of the Nation Address 2024", deliveredAt: "2024-02-18" },
  { url: "https://miniszterelnok.hu/en/speech-by-prime-minister-viktor-orban-at-the-33rd-balvanyos-summer-free-university-and-student-camp/", scraper: "generic", leaderSlug: "viktor-orban", title: "Speech at the 33rd Balvanyos Summer Free University and Student Camp", deliveredAt: "2024-07-27" },
  { url: "https://miniszterelnok.hu/en/speech-by-prime-minister-viktor-orban-at-the-opening-of-the-cpac-hungary-conference/", scraper: "generic", leaderSlug: "viktor-orban", title: "Speech at the Opening of CPAC Hungary Conference", deliveredAt: "2023-06-21" },
  { url: "https://miniszterelnok.hu/en/speech-by-prime-minister-viktor-orban-at-the-31st-congress-of-the-fidesz-hungarian-civic-alliance/", scraper: "generic", leaderSlug: "viktor-orban", title: "Speech at the 31st Congress of Fidesz - Hungarian Civic Alliance", deliveredAt: "2026-01-12" },

  // ─── Wang Yi ───
  { url: "https://www.fmprc.gov.cn/eng/wjb/wjbz/jh/202405/t20240527_11312293.html", scraper: "generic", leaderSlug: "wang-yi", title: "Remarks by H.E. Wang Yi at the MFA New Year Reception 2024", deliveredAt: "2024-01-31" },
  { url: "https://www.fmprc.gov.cn/eng/wjbzhd/202412/t20241218_11497794.html", scraper: "generic", leaderSlug: "wang-yi", title: "Wang Yi Delivers Video Speech at the Beijing-Tokyo Forum", deliveredAt: "2024-12-04" },
  { url: "https://www.fmprc.gov.cn/eng/wjbzhd/202410/t20241012_11506354.html", scraper: "generic", leaderSlug: "wang-yi", title: "Speech by H.E. Wang Yi at the China International Friendship Conference and Events Marking the 70th Anniversary of CPAFFC", deliveredAt: "2024-10-12" },
  { url: "https://www.fmprc.gov.cn/eng/zxxx_662805/202402/t20240219_11246522.html", scraper: "generic", leaderSlug: "wang-yi", title: "Wang Yi: China Will be a Force for Stability in Promoting Global Growth (Munich Security Conference)", deliveredAt: "2024-02-17" },
  { url: "https://www.fmprc.gov.cn/eng/xw/zyjh/202501/t20250124_11544750.html", scraper: "generic", leaderSlug: "wang-yi", title: "Remarks by H.E. Wang Yi at the MFA New Year Reception 2025", deliveredAt: "2025-01-24" },

  // ─── William Ruto ───
  { url: "https://www.president.go.ke/speeches_remarks/state-of-the-nation-address-by-his-excellency-william-ruto-c-g-h-phd-president-and-commander-in-chief-of-the-kenya-defence-forces/", scraper: "generic", leaderSlug: "william-ruto", title: "2024 State of the Nation Address", deliveredAt: "2024-11-21" },
  { url: "https://www.president.go.ke/wp-content/uploads/STATE-OF-THE-NATION-ADDRESS-2024.pdf", scraper: "generic", leaderSlug: "william-ruto", title: "2024 State of the Nation Address (PDF)", deliveredAt: "2024-11-21" },
  { url: "https://gadebate.un.org/en/79/kenya", scraper: "generic", leaderSlug: "william-ruto", title: "Kenya Statement at UNGA 79th Session General Debate", deliveredAt: "2024-09-26" },

  // ─── Yoon Suk Yeol ───
  { url: "https://www.koreaherald.com/article/10012293", scraper: "generic", leaderSlug: "yoon-suk-yeol", title: "Full Text of Emergency Martial Law Declaration Speech", deliveredAt: "2024-12-03" },
  { url: "https://www.koreaherald.com/article/10016987", scraper: "generic", leaderSlug: "yoon-suk-yeol", title: "Full Text of Address to the Nation (December 12)", deliveredAt: "2024-12-12" },
  { url: "https://www.koreatimes.co.kr/www/nation/2024/11/113_380634.html", scraper: "generic", leaderSlug: "yoon-suk-yeol", title: "Full Text of Liberation Day Speech (August 15, 2024)", deliveredAt: "2024-08-15" },
  { url: "https://gadebate.un.org/en/79/republic-korea", scraper: "generic", leaderSlug: "yoon-suk-yeol", title: "Republic of Korea Statement at UNGA 79th Session General Debate (delivered by FM Cho)", deliveredAt: "2024-09-27" },

];

async function ingestOne(entry: SpeechEntry): Promise<"ok" | "skip" | "fail"> {
  try {
    const existing = await prisma.speech.findFirst({
      where: { sourceUrl: entry.url },
    });
    if (existing) {
      console.log(`  SKIP (exists): ${entry.url}`);
      return "skip";
    }

    const scraper = scrapers[entry.scraper];
    if (!scraper) {
      console.log(`  FAIL (no scraper: ${entry.scraper}): ${entry.url}`);
      return "fail";
    }

    const scraped = await scraper.scrape(entry.url);
    const leaderSlug = entry.leaderSlug || scraped.leaderSlug;
    const title = entry.title || scraped.title;
    const deliveredAt = entry.deliveredAt
      ? new Date(entry.deliveredAt)
      : scraped.deliveredAt;

    if (!leaderSlug || !title || scraped.paragraphs.length === 0) {
      console.log(`  FAIL (missing data — leader:${leaderSlug} title:${!!title} paras:${scraped.paragraphs.length}): ${entry.url}`);
      return "fail";
    }

    const leader = await prisma.leader.findUnique({
      where: { slug: leaderSlug },
    });
    if (!leader) {
      console.log(`  FAIL (leader not found: ${leaderSlug}): ${entry.url}`);
      return "fail";
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.speech.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const speech = await prisma.$transaction(async (tx) => {
      const s = await tx.speech.create({
        data: {
          slug,
          title,
          leaderId: leader.id,
          originalLang: scraped.originalLang || "en",
          deliveredAt,
          venue: scraped.venue,
          city: scraped.city,
          country: scraped.country || leader.country,
          countryCode: scraped.countryCode || leader.countryCode,
          occasion: entry.occasion || scraped.occasion,
          duration: scraped.duration,
          videoUrl: scraped.videoUrl,
          videoEmbedId: scraped.videoEmbedId,
          sourceUrl: entry.url,
          sourceLabel: entry.scraper,
          status: SpeechStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      await tx.paragraph.createMany({
        data: scraped.paragraphs.map((text, index) => ({
          speechId: s.id,
          index,
          text,
        })),
      });

      return s;
    });

    await prisma.ingestionLog.create({
      data: {
        source: entry.url,
        method: IngestionMethod.SCRAPER,
        status: IngestionStatus.COMPLETED,
        speechId: speech.id,
        completedAt: new Date(),
        metadata: {
          paragraphCount: scraped.paragraphs.length,
          leaderSlug,
          scraperName: entry.scraper,
        },
      },
    });

    console.log(`  OK: "${title}" by ${leaderSlug} (${scraped.paragraphs.length} paras)`);
    return "ok";
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`  FAIL: ${entry.url} — ${msg.slice(0, 120)}`);

    await prisma.ingestionLog.create({
      data: {
        source: entry.url,
        method: IngestionMethod.SCRAPER,
        status: IngestionStatus.FAILED,
        completedAt: new Date(),
        error: msg,
      },
    }).catch(() => {});

    return "fail";
  }
}

async function main() {
  console.log("═══ EXPANDED BULK INGESTION ═══");
  console.log(`Processing ${EXPANDED_SPEECHES.length} URLs across 61 leaders...\n`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < EXPANDED_SPEECHES.length; i++) {
    const entry = EXPANDED_SPEECHES[i];
    console.log(`[${i + 1}/${EXPANDED_SPEECHES.length}] ${entry.leaderSlug}: ${entry.title || entry.url}`);
    const result = await ingestOne(entry);
    if (result === "ok") ok++;
    else if (result === "skip") skip++;
    else fail++;

    // Rate limit
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n═══ RESULTS ═══`);
  console.log(`  Ingested: ${ok}`);
  console.log(`  Skipped:  ${skip}`);
  console.log(`  Failed:   ${fail}`);
  console.log(`  Total:    ${EXPANDED_SPEECHES.length}`);

  // Show leaders with speeches now
  const leadersWithSpeeches = await prisma.leader.findMany({
    where: { speeches: { some: {} } },
    select: { name: true, _count: { select: { speeches: true } } },
    orderBy: { name: "asc" },
  });
  console.log(`\nLeaders with speeches: ${leadersWithSpeeches.length}`);
  for (const l of leadersWithSpeeches) {
    console.log(`  ${l.name}: ${l._count.speeches}`);
  }

  const totalSpeeches = await prisma.speech.count({
    where: { status: SpeechStatus.PUBLISHED },
  });
  console.log(`\nTotal published speeches in DB: ${totalSpeeches}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
