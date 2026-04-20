import { useState } from "react";

// --- CONFIG ------------------------------------------------------------------
// 200 fondateurs max  -  TODO: brancher sur Supabase COUNT(users WHERE plan != 'free')
const MEMBER_COUNT = 47;
const IS_FONDATEUR = MEMBER_COUNT < 200;

const PRICES = {
  artiste_fondateur: "price_1TODOE0aQuevE1QtePnpoIz6",
  artiste_standard:  "price_1TODOG0aQuevE1QtMpBThg5S",
  label_fondateur:   "price_1TODOI0aQuevE1Qtr1kCGHb3",
  label_standard:    "price_1TODOL0aQuevE1QtRrMdgkyc",
  label_artiste_supp:"price_1TODTy0aQuevE1QtQfoGQHUl",
};
const AFF = {
  distrokid: "https://distrokid.com/vip/seven/TONCODE",
  tunecore:  "https://www.tunecore.com/?ref=TONCODE",
  spotify:   "https://artists.spotify.com",
  sacem:     "https://www.sacem.fr/cms/home/la-sacem/rejoindre-la-sacem",
  isrc:      "https://www.scpp.fr/SCPP/fr/Les-Services/ISRC/L-ISRC.aspx",
  cnm:       "https://cnm.fr/aides/",
  drac:      "https://www.culture.gouv.fr/Regions",
  irma:      "https://www.irma.asso.fr",
  adami:     "https://www.adami.fr/artiste/aides-et-bourses/",
  spedidam:  "https://www.spedidam.fr/aides/",
  ifcic:     "https://www.ifcic.fr/",
  kkbb:      "https://www.kisskissbankbank.com/",
  bandsintown:"https://www.bandsintown.com/artist-signup",
  groover:   "https://groover.co/?ref=indy",
};

// --- COACH DATA ---------------------------------------------------------------
const STAGES = [
  { id:"creation",     label:"Créer",      icon:"🎛️", color:"#FF6B35" },
  { id:"protection",   label:"Protéger",   icon:"🔐", color:"#00C9A7" },
  { id:"distribution", label:"Distribuer", icon:"🚀", color:"#845EF7" },
  { id:"promotion",    label:"Promouvoir", icon:"📣", color:"#FFD43B" },
  { id:"financement",  label:"Financer",   icon:"💰", color:"#F03E3E" },
  { id:"live",         label:"Performer",  icon:"🎤", color:"#20C997" },
];
const TASKS = {
  creation:[
    {id:"c1",text:"Composition & arrangement finalisés",tip:"Fais écouter à 3 personnes extérieures avant de valider."},
    {id:"c2",text:"Mix professionnel (niveaux, EQ, compression)",tip:"Référence ton mix avec un titre commercial du même genre."},
    {id:"c3",text:"Master aux normes streaming (-14 LUFS)",tip:"DistroKid et Spotify normalisent à -14 LUFS."},
    {id:"c4",text:"Titre et durée définis",tip:"Entre 2:30 et 3:30 pour maximiser les écoutes complètes."},
    {id:"c5",text:"Featuring / co-prod documentés",tip:"Prévoir le partage de droits AVANT la sortie."},
  ],
  protection:[
    {id:"p1",text:"Œuvre déposée à la SACEM",tip:"Déposer AVANT la distribution."},
    {id:"p2",text:"Co-auteurs et répartitions définis",tip:"Chaque part doit être convenue par écrit."},
    {id:"p3",text:"ISRC généré ou demandé au distributeur",tip:"DistroKid l'attribue automatiquement."},
    {id:"p4",text:"Samples clearés ou libres de droits",tip:"Un sample non clearé peut faire retirer ton titre."},
    {id:"p5",text:"Contrat signé avec les featuring",tip:"Un accord simple par email vaut mieux que rien."},
  ],
  distribution:[
    {id:"d1",text:"Distributeur choisi",tip:"DistroKid = rapidité. TuneCore = contrôle total."},
    {id:"d2",text:"Artwork 3000x3000px validé",tip:"Spotify rejette les artworks flous."},
    {id:"d3",text:"Metadata complètes",tip:"Des metadata précises améliorent la découvrabilité."},
    {id:"d4",text:"Date de sortie fixée (min. 3 semaines)",tip:"7 semaines pour le pitch éditorial Spotify."},
    {id:"d5",text:"Pitch éditorial Spotify envoyé",tip:"Une seule chance par sortie."},
  ],
  promotion:[
    {id:"pr1",text:"Press kit artiste à jour",tip:"Bio courte (100 mots) + longue (300 mots)."},
    {id:"pr2",text:"Contenu TikTok / Reels préparé",tip:"3 à 5 vidéos prêtes le jour J."},
    {id:"pr3",text:"Blogs & playlists contactés (J-14)",tip:"Pitcher 2 semaines avant."},
    {id:"pr4",text:"Smart link créé",tip:"Un seul lien dans la bio."},
    {id:"pr5",text:"Plan de posts semaine 1 défini",tip:"Lundi teaser · Mercredi sortie · Vendredi réaction."},
  ],
  financement:[
    {id:"f1",text:"Dossier CNM vérifié",tip:"Aides à la production, clip, tournée."},
    {id:"f2",text:"Aides SACEM explorées",tip:"Bourse Création, aide numérique."},
    {id:"f3",text:"Dispositifs régionaux & DRAC identifiés",tip:"Chaque région a ses propres fonds."},
    {id:"f4",text:"Résidences artistiques consultées",tip:"Studio gratuit + accompagnement."},
    {id:"f5",text:"Crowdfunding envisagé",tip:"Ta communauté finance ET promeut."},
  ],
  live:[
    {id:"l1",text:"EPK live créé",tip:"Bio + vidéo live + rider technique."},
    {id:"l2",text:"Liste de salles cibles établie",tip:"Commence par 50-100 personnes."},
    {id:"l3",text:"Mail de démarchage rédigé",tip:"Court, direct, lien EN PREMIER."},
    {id:"l4",text:"Plateformes de booking consultées",tip:"Bandsintown Pro pour contacter des bookers."},
    {id:"l5",text:"Première partie visée",tip:"Souvent plus accessible que booker solo."},
  ],
};
const INIT_PROJECTS = [];
const PLANS = [
  {id:"free",name:"ESSAI 3 JOURS",price:"0€",period:"",color:"#999",features:["Dashboard + Coach parcours","Annuaire en lecture","Accès limité 3 jours"],locked:["Press Kit IA","Module Booking & email IA","Matching subventions complet","Bibliothèque documents","💬 Chatbot IA coach"],cta:"Commencer l'essai gratuit"},
  {id:"artiste",name:"ARTISTE",price:IS_FONDATEUR?"9,90€":"14,90€",priceFutur:IS_FONDATEUR?"puis 14,90€":null,period:"/mois",color:"#FF6B35",badge:IS_FONDATEUR?"FONDATEUR":null,features:["Titres illimités","Press Kit IA illimité","Module Booking + email IA","Matching subventions complet","Bibliothèque 20+ documents","Split sheet & contrat featuring","💬 Chatbot IA coach personnel","Rappels & relances auto"],locked:["Multi-artistes","Vue label globale","Contrats cession / co-prod / licence","Rider & fiche technique"],cta:"Devenir INDY Artiste",priceId:IS_FONDATEUR?PRICES.artiste_fondateur:PRICES.artiste_standard},
  {id:"label",name:"STUDIO / LABEL",price:IS_FONDATEUR?"29,90€":"34,90€",priceFutur:IS_FONDATEUR?"puis 34,90€":null,period:"/mois",color:"#C8A96E",badge:IS_FONDATEUR?"FONDATEUR":null,labelInfo:"5 artistes inclus · +4,90€/artiste · max 20",features:["Tout du plan Artiste","5 artistes inclus","+4,90€ par artiste supplémentaire","Bibliothèque 24 docs complète","Tous les contrats (cession, co-prod, licence, management)","Template rider & fiche technique","Vue globale label","💬 Chatbot IA coach personnel","Support prioritaire"],locked:[],cta:"Passer en mode Label",priceId:IS_FONDATEUR?PRICES.label_fondateur:PRICES.label_standard},
];

// --- SALLES -------------------------------------------------------------------
const SALLES = [
  {id:1,nom:"Le Trabendo",ville:"Paris",region:"idf",type:"smac",jauge:350,cachet_min:800,cachet_max:3000,genres:["hip-hop","afro","rnb","pop","electro"],subv:true,smac:true,res:true,contact:"programmation@letrabendo.net",site:"https://letrabendo.net",adresse:"211 Av. Jean Jaurès, 75019",delai:"4-6 sem.",tips:"Pitcher 6 mois à l'avance. EPK complet obligatoire.",color:"#FF6B35",desc:"Salle emblématique de la Villette. Programmation éclectique, forte en musiques actuelles."},
  {id:2,nom:"La Cigale",ville:"Paris",region:"idf",type:"prive",jauge:1900,cachet_min:2000,cachet_max:15000,genres:["pop","rock","afro","hip-hop","rnb"],subv:false,smac:false,res:false,contact:"booking@lacigale.fr",site:"https://lacigale.fr",adresse:"120 Bd Rochechouart, 75018",delai:"6-8 sem.",tips:"Nécessite historique de dates et communauté active.",color:"#845EF7",desc:"Grande salle parisienne mythique pour artistes en ascension."},
  {id:3,nom:"Le Flow",ville:"Paris",region:"idf",type:"club",jauge:600,cachet_min:500,cachet_max:2500,genres:["afro","afrobeats","dancehall","rnb","hip-hop"],subv:false,smac:false,res:false,contact:"booking@leflow.fr",site:"https://leflow.fr",adresse:"Port de la Villette, 75019",delai:"2-3 sem.",tips:"Envoi mix + démo + photos. Réponse rapide.",color:"#F783AC",desc:"Club parisien spécialisé dans les musiques afro et diaspora."},
  {id:4,nom:"Point Éphémère",ville:"Paris",region:"idf",type:"smac",jauge:300,cachet_min:400,cachet_max:1500,genres:["electro","rock","hip-hop","world","jazz"],subv:true,smac:true,res:true,contact:"contact@pointephemere.org",site:"https://pointephemere.org",adresse:"200 Quai de Valmy, 75010",delai:"3-5 sem.",tips:"Résidences fréquentes. Très orienté création.",color:"#20C997",desc:"Lieu culturel sur le canal Saint-Martin, résidences et concerts."},
  {id:5,nom:"La Maroquinerie",ville:"Paris",region:"idf",type:"prive",jauge:400,cachet_min:600,cachet_max:2500,genres:["rock","pop","electro","indie","hip-hop"],subv:false,smac:false,res:false,contact:"booking@lamaroquinerie.fr",site:"https://lamaroquinerie.fr",adresse:"23 Rue Boyer, 75020",delai:"4-5 sem.",tips:"Salle alternative parisienne, très ouverte aux indés.",color:"#74C0FC",desc:"Salle de référence du 20e, programmation alternative et émergente."},
  {id:6,nom:"La Boule Noire",ville:"Paris",region:"idf",type:"prive",jauge:350,cachet_min:500,cachet_max:2000,genres:["rock","pop","hip-hop","electro","afro"],subv:false,smac:false,res:false,contact:"booking@laboulenoire.fr",site:"https://laboulenoire.fr",adresse:"120 Bd Rochechouart, 75018",delai:"4-6 sem.",tips:"Salle du circuit parisien des émergents.",color:"#845EF7",desc:"Salle jumelle de la Cigale, idéale pour les artistes en développement."},
  {id:7,nom:"Centre Senghor",ville:"Paris",region:"idf",type:"cult",jauge:300,cachet_min:400,cachet_max:1800,genres:["afro","world","jazz","rnb","spoken word"],subv:true,smac:false,res:true,contact:"programmation@senghor.fr",site:"#",adresse:"Paris 12e",delai:"3-4 sem.",tips:"Très réceptif aux projets à dimension culturelle africaine.",color:"#C8A96E",desc:"Espace culturel dédié aux cultures africaines et de la diaspora."},
  {id:8,nom:"L'Espace Michel Simon",ville:"Noisy-le-Grand",region:"idf",type:"smac",jauge:600,cachet_min:600,cachet_max:2500,genres:["pop","rnb","jazz","world","afro"],subv:true,smac:true,res:true,contact:"prog@espacemichelsimon.fr",site:"https://espacemichelsimon.fr",adresse:"Noisy-le-Grand, 93160",delai:"4-6 sem.",tips:"SMAC de Seine-Saint-Denis, très ouvert aux cultures urbaines.",color:"#FF6B35",desc:"SMAC de référence en Seine-Saint-Denis."},
  {id:9,nom:"Le Molotov",ville:"Marseille",region:"paca",type:"smac",jauge:200,cachet_min:400,cachet_max:1500,genres:["rock","electro","hip-hop","afro","metal"],subv:true,smac:true,res:false,contact:"contact@lemolotov.fr",site:"https://lemolotov.fr",adresse:"3 Pl. Paul Cézanne, 13006",delai:"3-4 sem.",tips:"Très accessible pour les premiers concerts.",color:"#00C9A7",desc:"Salle de référence marseillaise, ancrage local fort."},
  {id:10,nom:"Espace Julien",ville:"Marseille",region:"paca",type:"smac",jauge:1500,cachet_min:1000,cachet_max:6000,genres:["rock","pop","hip-hop","electro","world"],subv:true,smac:true,res:true,contact:"prog@espace-julien.com",site:"https://espace-julien.com",adresse:"39 Cours Julien, 13006",delai:"5-7 sem.",tips:"Grande SMAC marseillaise, programmation éclectique.",color:"#845EF7",desc:"Grande salle du Cours Julien, cœur culturel de Marseille."},
  {id:11,nom:"L'Embobineuse",ville:"Marseille",region:"paca",type:"smac",jauge:150,cachet_min:200,cachet_max:800,genres:["punk","rock","métal","noise","electro"],subv:true,smac:true,res:false,contact:"contact@lembobineuse.net",site:"https://lembobineuse.net",adresse:"11 Bd Bourdet, 13004",delai:"2-3 sem.",tips:"Salle underground marseillaise très engagée.",color:"#F03E3E",desc:"Salle underground de référence à Marseille."},
  {id:12,nom:"La Salle des Machines",ville:"Lyon",region:"aura",type:"smac",jauge:500,cachet_min:600,cachet_max:2500,genres:["electro","hip-hop","afro","rnb","pop"],subv:true,smac:true,res:true,contact:"prog@lasalledesmachines.com",site:"https://lasalledesmachines.com",adresse:"60 Rue Dr Bouchut, 69007",delai:"4-5 sem.",tips:"Résidences priorité régionale.",color:"#FFD43B",desc:"Ancienne usine reconvertie, programmation émergente à Lyon."},
  {id:13,nom:"Transbordeur",ville:"Villeurbanne",region:"aura",type:"prive",jauge:1500,cachet_min:1200,cachet_max:8000,genres:["rock","pop","hip-hop","electro","metal"],subv:false,smac:false,res:false,contact:"booking@transbordeur.fr",site:"https://transbordeur.fr",adresse:"3 Bd Stalingrad, 69100",delai:"6-8 sem.",tips:"Salle nationale à Villeurbanne, forte programmation.",color:"#845EF7",desc:"Grande salle de l'agglomération lyonnaise."},
  {id:14,nom:"Le Sonic",ville:"Lyon",region:"aura",type:"smac",jauge:200,cachet_min:300,cachet_max:1200,genres:["rock","punk","métal","electro","noise"],subv:true,smac:true,res:false,contact:"contact@lesonic.fr",site:"https://lesonic.fr",adresse:"5 Rue Domer, 69007",delai:"3-4 sem.",tips:"Salle alternative lyonnaise.",color:"#F03E3E",desc:"Salle rock et alternative de Lyon."},
  {id:15,nom:"Le Bikini",ville:"Toulouse",region:"occitanie",type:"smac",jauge:1500,cachet_min:1000,cachet_max:6000,genres:["rock","metal","electro","hip-hop","afro"],subv:true,smac:true,res:false,contact:"programmation@lebikini.com",site:"https://lebikini.com",adresse:"Rue Jacqueline Auriol, 31400",delai:"6-8 sem.",tips:"Formulaire en ligne obligatoire.",color:"#F03E3E",desc:"SMAC historique du Sud-Ouest, programmation nationale."},
  {id:16,nom:"Le Metronum",ville:"Toulouse",region:"occitanie",type:"smac",jauge:800,cachet_min:600,cachet_max:3000,genres:["pop","rock","hip-hop","electro","world"],subv:true,smac:true,res:true,contact:"contact@metronum.fr",site:"https://metronum.fr",adresse:"2 Rond-Point Ramonville, 31400",delai:"4-6 sem.",tips:"Structure de développement artistique à Toulouse.",color:"#00C9A7",desc:"Lieu dédié aux musiques actuelles et à l'émergence à Toulouse."},
  {id:17,nom:"L'Ubu",ville:"Rennes",region:"bretagne",type:"smac",jauge:400,cachet_min:500,cachet_max:2000,genres:["rock","electro","pop","hip-hop","world"],subv:true,smac:true,res:true,contact:"contact@ubu-rennes.com",site:"https://ubu-rennes.com",adresse:"1 Rue Saint-Hélier, 35000",delai:"4-6 sem.",tips:"Résidences prioritaires pour artistes bretons.",color:"#20C997",desc:"Salle incontournable de Bretagne, programmation exigeante."},
  {id:18,nom:"La Laiterie",ville:"Strasbourg",region:"alsace",type:"smac",jauge:900,cachet_min:800,cachet_max:4000,genres:["rock","electro","pop","metal","hip-hop"],subv:true,smac:true,res:true,contact:"bookings@artefact.org",site:"https://artefact.org",adresse:"13 Rue du Hohwald, 67000",delai:"5-6 sem.",tips:"Structure Artefact gère plusieurs salles.",color:"#74C0FC",desc:"SMAC alsacienne de référence, programmation internationale."},
  {id:19,nom:"Le Splendid",ville:"Lille",region:"nord",type:"smac",jauge:800,cachet_min:600,cachet_max:3000,genres:["rock","pop","hip-hop","electro","world"],subv:true,smac:true,res:true,contact:"prog@splendid-lille.fr",site:"https://splendid-lille.fr",adresse:"1 Pl. du Mont de Terre, 59000",delai:"4-6 sem.",tips:"SMAC lilloise de référence.",color:"#F783AC",desc:"SMAC majeure de Lille et de la métropole nordiste."},
  {id:20,nom:"L'Aéronef",ville:"Lille",region:"nord",type:"smac",jauge:1000,cachet_min:700,cachet_max:4000,genres:["rock","electro","pop","hip-hop","metal"],subv:true,smac:true,res:false,contact:"booking@aeronef-spectacles.com",site:"https://aeronef-spectacles.com",adresse:"168 Bd de Metz, 59000",delai:"4-6 sem.",tips:"Salle lilloise très active.",color:"#FF6B35",desc:"Salle de concerts de référence à Lille."},
  {id:21,nom:"I.Boat",ville:"Bordeaux",region:"bordeaux",type:"smac",jauge:400,cachet_min:400,cachet_max:1800,genres:["electro","hip-hop","afro","rnb","techno"],subv:true,smac:true,res:false,contact:"contact@iboat.eu",site:"https://iboat.eu",adresse:"Hangar H, Quai Armand Lalande",delai:"3-5 sem.",tips:"Péniche culturelle bordelaise, très branchée.",color:"#20C997",desc:"Club et salle sur les quais de Bordeaux."},
  {id:22,nom:"Rock School Barbey",ville:"Bordeaux",region:"bordeaux",type:"smac",jauge:600,cachet_min:500,cachet_max:2500,genres:["rock","pop","hip-hop","electro","folk"],subv:true,smac:true,res:true,contact:"prog@rockschool-barbey.com",site:"https://rockschool-barbey.com",adresse:"18 Cours Barbey, 33000",delai:"4-6 sem.",tips:"Structure majeure bordelaise, résidences disponibles.",color:"#F03E3E",desc:"Structure culturelle de référence à Bordeaux."},
  {id:23,nom:"Le Rocher de Palmer",ville:"Cenon",region:"bordeaux",type:"smac",jauge:1200,cachet_min:800,cachet_max:5000,genres:["world","afro","jazz","pop","hip-hop"],subv:true,smac:true,res:true,contact:"prog@rocher-de-palmer.fr",site:"https://rocher-de-palmer.fr",adresse:"1 Rue Aristide Briand, 33150",delai:"4-6 sem.",tips:"Très forte programmation world et afro.",color:"#C8A96E",desc:"SMAC de la métropole bordelaise, fort ancrage world music."},
];

const OPPOS = [
  {id:1,salle:"Le Trabendo",ville:"Paris",date:"2025-07-12",genre:"Afro / R&B",jauge:350,cachet:"1 200€",deadline:"2025-05-20",type:"premiere_partie",desc:"Première partie d'un artiste africain en tournée. Cherche artiste afro-pop FR avec EP sorti.",color:"#FF6B35"},
  {id:2,salle:"La Salle des Machines",ville:"Lyon",date:"2025-09-05",genre:"Tout genres",jauge:200,cachet:"Résidence gratuite",deadline:"2025-06-01",type:"residence",desc:"Résidence de création 5 jours + concert de restitution. Dossier artistique requis.",color:"#FFD43B"},
  {id:3,salle:"Le Molotov",ville:"Marseille",date:"2025-06-28",genre:"Hip-hop / Afro",jauge:200,cachet:"600€",deadline:"2025-05-10",type:"concert",desc:"Soirée thématique Afro/Hip-hop. Cherche 2 artistes. Démo obligatoire.",color:"#00C9A7"},
  {id:4,salle:"Le Flow",ville:"Paris",date:"2025-06-14",genre:"Afrobeats / Dancehall",jauge:400,cachet:"800€",deadline:"2025-05-25",type:"concert",desc:"Soirée AFROWAVE. 3 artistes · 30min/artiste. Réponse sous 72h.",color:"#845EF7"},
  {id:5,salle:"L'Ubu",ville:"Rennes",date:"2025-10-18",genre:"Émergence tout genres",jauge:200,cachet:"500€",deadline:"2025-07-01",type:"tremplin",desc:"Concours annuel. Prix : tournée 5 dates + enregistrement studio.",color:"#20C997"},
];

// --- ANNUAIRE DATA ------------------------------------------------------------
const STUDIOS_ENREG = [
  {nom:"Studio Gang",ville:"Paris 10e",prix:"80€/h",contact:"studiogangparis@gmail.com",desc:"Studio pro certifié, ingé son inclus, cabine vocale isolée, Pro Tools + Logic.",tags:["Pro Tools","Mix","Cabine"]},
  {nom:"Black Box Studio",ville:"Paris 18e",prix:"90€/h",contact:"blackboxparis.fr",desc:"Spécialisé hip-hop et musiques urbaines. Booth vocal haut de gamme.",tags:["Hip-Hop","Urbain","Booth"]},
  {nom:"Volta Studio",ville:"Paris 18e",prix:"70€/h",contact:"voltastudio.fr",desc:"Studio polyvalent, acoustique optimale, Pro Tools + Logic Pro.",tags:["Pop","R&B","Pro Tools"]},
  {nom:"Studio des Dames",ville:"Paris 9e",prix:"65€/h",contact:"studiodesdames.fr",desc:"Ambiance cosy, spécialité chanson et voix.",tags:["Chanson","Voix","Intimiste"]},
  {nom:"Studio Ferber",ville:"Paris 16e",prix:"120€/h",contact:"studioferber.com",desc:"Studio légendaire. Haut de gamme.",tags:["Légendaire","Rock","Prestige"]},
  {nom:"Sun Studio Marseille",ville:"Marseille",prix:"55€/h",contact:"sunstudio13.com",desc:"Spécialité reggae, world et afro. Ambiance chaleureuse.",tags:["Reggae","World","Marseille"]},
  {nom:"Studio La Friche",ville:"Marseille",prix:"50€/h",contact:"lafriche.org",desc:"Dans la friche Belle de Mai, tarifs solidaires pour artistes émergents.",tags:["Solidaire","Émergent","Friche"]},
  {nom:"Studio Aquarium",ville:"Lyon",prix:"60€/h",contact:"studioaquarium.fr",desc:"Studio avec vue sur le Rhône, ambiance unique.",tags:["Lyon","Vue","Pro Tools"]},
  {nom:"Studio Davout",ville:"Paris 20e",prix:"55€/h",contact:"studiodavout.fr",desc:"Studio abordable dans le 20e, idéal pour les indépendants.",tags:["Abordable","Indé","Paris"]},
  {nom:"Studio Midlands",ville:"Toulouse",prix:"50€/h",contact:"studiomidlands.fr",desc:"Studio rock et pop à Toulouse.",tags:["Rock","Pop","Toulouse"]},
  {nom:"Studio Nemo",ville:"Bordeaux",prix:"55€/h",contact:"studionemo33.fr",desc:"Studio bordelais, spécialité hip-hop et electro.",tags:["Hip-Hop","Electro","Bordeaux"]},
  {nom:"Studio Barbey",ville:"Bordeaux",prix:"45€/h",contact:"rockschool-barbey.com",desc:"Studio de la Rock School Barbey, tarifs abordables.",tags:["Abordable","Rock","Bordeaux"]},
  {nom:"ICP Studios",ville:"Bruxelles",prix:"85€/h",contact:"icpstudios.be",desc:"Un des meilleurs studios de Belgique, très prisé des artistes français.",tags:["Belgique","International","Pro"]},
  {nom:"MixMaster FR",ville:"En ligne",prix:"Dès 80€/titre",contact:"mixmasterfr.com",desc:"Mix & mastering en ligne, délai 48h, 3 retouches incluses.",tags:["Mix","Master","En ligne"]},
];
const STUDIOS_REPET = [
  {nom:"Répèt Nation",ville:"Paris 11e",prix:"15€/h",contact:"repetnation.fr",desc:"20 salles équipées, sono complète, location instruments.",tags:["Paris","Sono","Location"]},
  {nom:"My Music",ville:"Paris 18e",prix:"12€/h",contact:"mymusicrepet.fr",desc:"Réseau de salles de répétition pas chères à Paris.",tags:["Pas cher","Réseau","Paris"]},
  {nom:"Studio Répète",ville:"Paris 13e",prix:"14€/h",contact:"studiorepete.fr",desc:"Salles climatisées, sono Yamaha, batteries DW.",tags:["Climatisé","Batterie","Paris"]},
  {nom:"Studio Glaz'Art",ville:"Paris 19e",prix:"13€/h",contact:"glazart.com",desc:"Répèt + scène + salle de concert dans le même lieu.",tags:["Scène","Polyvalent","Paris"]},
  {nom:"La Halle Tropisme",ville:"Montpellier",prix:"10€/h",contact:"tropisme.org",desc:"Lieu culturel avec studios de répète à tarif solidaire.",tags:["Solidaire","Culturel","Montpellier"]},
  {nom:"La Cave",ville:"Bordeaux",prix:"12€/h",contact:"lacavebdx.fr",desc:"Salles de répète en sous-sol, idéal rock et métal.",tags:["Rock","Métal","Bordeaux"]},
  {nom:"Studio Tempo",ville:"Toulouse",prix:"10€/h",contact:"studiotempo31.com",desc:"Réseau de salles à Toulouse, booking en ligne.",tags:["En ligne","Toulouse","Réseau"]},
  {nom:"Répète à Gogo",ville:"Lyon",prix:"11€/h",contact:"repeteagogo.fr",desc:"Réseau lyonnais de salles de répétition.",tags:["Lyon","Réseau","Abordable"]},
  {nom:"La Cartoucherie",ville:"Toulouse",prix:"9€/h",contact:"lacartoucherietoulouse.fr",desc:"Friche industrielle reconvertie, très grande salle.",tags:["Friche","Grande salle","Toulouse"]},
  {nom:"Studio Rock Academy",ville:"Lille",prix:"10€/h",contact:"rockacademylille.fr",desc:"Répète + cours de musique dans le même lieu.",tags:["Lille","Formation","Rock"]},
  {nom:"Espace Son",ville:"Marseille",prix:"11€/h",contact:"espaceson13.fr",desc:"Studios de répète dans le 13e, sono Dynacord.",tags:["Marseille","Sono","Abordable"]},
];
const RESIDENCES = [
  {nom:"La Villette  -  Résidences",ville:"Paris",prix:"Gratuit (dossier)",contact:"lavillette.com/residences",desc:"Résidences artistiques subventionnées au cœur de Paris.",tags:["Subventionné","Studio","Paris"]},
  {nom:"Château de Goutelas",ville:"Loire",prix:"Hébergement inclus",contact:"chateaugoutelas.fr",desc:"Résidences immersives en milieu rural, hébergement inclus.",tags:["Hébergement","Rural","Immersive"]},
  {nom:"Le 6b",ville:"Saint-Denis",prix:"Dossier",contact:"le6b.fr",desc:"Tiers-lieu artistique avec résidences de création.",tags:["Tiers-lieu","Saint-Denis","Création"]},
  {nom:"Cité de la Musique",ville:"Paris",prix:"Sur dossier",contact:"philharmoniedeparis.fr",desc:"Résidences musicales à la Philharmonie de Paris.",tags:["Philharmonie","Prestige","Paris"]},
  {nom:"Le Quartz",ville:"Brest",prix:"Hébergement inclus",contact:"lequartz.com",desc:"Scène nationale bretonne, résidences et coproductions.",tags:["Bretagne","Scène nationale","Coproduction"]},
  {nom:"La Condition Publique",ville:"Roubaix",prix:"Variable",contact:"laconditionpublique.com",desc:"Friche culturelle du Nord, résidences multidisciplinaires.",tags:["Nord","Friche","Multidisciplinaire"]},
  {nom:"Le Lieu Unique",ville:"Nantes",prix:"Sur dossier",contact:"lelieuunique.com",desc:"Scène nationale de Nantes, résidences ouvertes.",tags:["Nantes","Scène nationale","Ouvert"]},
  {nom:"Récréâtrales",ville:"Bordeaux",prix:"Hébergement inclus",contact:"recreartrales.fr",desc:"Résidences culturelles franco-africaines à Bordeaux.",tags:["Afrique","Bordeaux","Culturel"]},
  {nom:"IRCAM",ville:"Paris",prix:"Sur concours",contact:"ircam.fr",desc:"Institut de création musicale et acoustique, résidences spécialisées.",tags:["Électronique","Contemporain","Paris"]},
  {nom:"L'Astrobale",ville:"Lyon",prix:"Variable",contact:"lastrobale.fr",desc:"Résidences de création sonore et musicale à Lyon.",tags:["Sonore","Lyon","Création"]},
];
const TREMPLINS = [
  {nom:"Les Inrocks Lab",ville:"Paris",deadline:"Annuel · Oct.",prix:"Tournée + accompagnement",contact:"lesinrocks.com/lab",desc:"Le tremplin des Inrockuptibles, le plus prestigieux de France.",tags:["Prestige","National","Médias"]},
  {nom:"Découvertes RFI",ville:"Paris",deadline:"Annuel · Janv.",prix:"Diffusion internationale",contact:"rfi.fr/decouvertes",desc:"Tremplin radio international pour artistes francophones.",tags:["Radio","International","Francophone"]},
  {nom:"Printemps de Bourges",ville:"Bourges",deadline:"Annuel · Nov.",prix:"Date au festival",contact:"printemps-bourges.com",desc:"Plateau déjeuner du festival, très médiatisé.",tags:["Festival","Médias","National"]},
  {nom:"Trans Musicales  -  OFF",ville:"Rennes",deadline:"Annuel · Sept.",prix:"Date au festival",contact:"lestrans.com",desc:"Tremplin des Transmusicales, découverte internationale.",tags:["International","Rennes","Découverte"]},
  {nom:"Francofolies  -  Tremplin",ville:"La Rochelle",deadline:"Annuel · Mars",prix:"Date au festival",contact:"francofolies.fr",desc:"Tremplin des Francofolies de La Rochelle.",tags:["Chanson FR","Festival","National"]},
  {nom:"Lyon Tremplin",ville:"Lyon",deadline:"Annuel · Fév.",prix:"Tournée 5 dates + studio",contact:"lyontremplin.com",desc:"Tremplin annuel avec premier prix tournée.",tags:["Lyon","Tournée","Studio"]},
  {nom:"Scène Émergence",ville:"Bordeaux",deadline:"Mensuel",prix:"Date + EPK",contact:"sceneemergence.fr",desc:"Scène ouverte mensuelle pour artistes en développement.",tags:["Mensuel","Bordeaux","Accessible"]},
  {nom:"Jams de Paris",ville:"Paris",deadline:"Hebdo",prix:"Scène + réseau",contact:"jamseparis.fr",desc:"Sessions de jams professionnelles chaque semaine à Paris.",tags:["Jam","Hebdo","Réseau"]},
  {nom:"Chérie FM Révélation",ville:"National",deadline:"Annuel",prix:"Diffusion radio",contact:"cheriefm.fr/revelation",desc:"Concours radio Chérie FM, diffusion nationale.",tags:["Radio","National","Pop"]},
  {nom:"Victoires  -  Révélation",ville:"Paris",deadline:"Annuel · Oct.",prix:"Nomination TV",contact:"victoires.com",desc:"Nomination Révélation de l'année aux Victoires de la Musique.",tags:["Prestige","TV","National"]},
];

// --- AIDES & DÉMARCHES --------------------------------------------------------
const AIDES = [
  {id:"cnm_prod",nom:"CNM  -  Production phonographique",org:"Centre National de la Musique",icon:"🏛️",color:"#FF6B35",montant:"Jusqu'à 50 000 €",delai:"4-6 mois",diff:3,desc:"Aide à la production d'un album ou EP pour les producteurs indépendants.",statuts:["auto","intermittent","association"],projets:["album","studio"],budgets:["moyen","grand","xl"],sacem:false,lien:AFF.cnm,etapes:["Créer un compte CNM","Dossier artistique complet","Déposer avant date limite trimestrielle"]},
  {id:"cnm_clip",nom:"CNM  -  Aide au clip vidéo",org:"Centre National de la Musique",icon:"🏛️",color:"#FF6B35",montant:"Jusqu'à 15 000 €",delai:"2-3 mois",diff:2,desc:"Soutien à la réalisation de clips pour artistes et labels indépendants.",statuts:["auto","intermittent","association"],projets:["clip"],budgets:["petit","moyen","grand"],sacem:false,lien:AFF.cnm,etapes:["Compte CNM actif","Devis réalisateur","Dépôt du dossier"]},
  {id:"cnm_tournee",nom:"CNM  -  Aide aux tournées",org:"Centre National de la Musique",icon:"🏛️",color:"#FF6B35",montant:"Variable",delai:"3-4 mois",diff:3,desc:"Soutien aux tournées nationales.",statuts:["intermittent","association"],projets:["tournee"],budgets:["moyen","grand","xl"],sacem:false,lien:AFF.cnm,etapes:["Planning confirmé","Contrats de cession","Dossier CNM"]},
  {id:"sacem_bourse",nom:"SACEM  -  Bourse à la création",org:"SACEM",icon:"🎵",color:"#845EF7",montant:"1 500 - 10 000 €",delai:"2-3 mois",diff:2,desc:"Aide directe aux compositeurs membres pour financer un projet de création.",statuts:["auto","intermittent","association","aucun"],projets:["album","studio","clip"],budgets:["petit","moyen"],sacem:true,lien:AFF.sacem,etapes:["Être membre SACEM actif","Dossier artistique","Vote du comité"]},
  {id:"adami",nom:"ADAMI  -  Aides aux artistes",org:"ADAMI",icon:"🎤",color:"#F03E3E",montant:"1 000 - 15 000 €",delai:"2-4 mois",diff:2,desc:"L'ADAMI gère les droits des artistes-interprètes et finance des projets.",statuts:["intermittent","auto"],projets:["album","tournee","clip"],budgets:["petit","moyen"],sacem:false,lien:AFF.adami,etapes:["Être artiste-interprète","Dossier projet","Soumission en ligne"]},
  {id:"spedidam",nom:"SPEDIDAM  -  Soutien musiciens",org:"SPEDIDAM",icon:"🥁",color:"#FFD43B",montant:"500 - 8 000 €",delai:"2-3 mois",diff:2,desc:"La SPEDIDAM soutient les projets des musiciens interprètes.",statuts:["intermittent","auto"],projets:["album","studio","tournee"],budgets:["petit","moyen"],sacem:false,lien:AFF.spedidam,etapes:["Être musicien interprète","Dossier artistique","Dépôt en ligne"]},
  {id:"drac",nom:"DRAC  -  Aide régionale",org:"Min. de la Culture",icon:"🗺️",color:"#20C997",montant:"1 000 - 20 000 €",delai:"3-5 mois",diff:3,desc:"Financements locaux pour projets culturels ancrés dans la région.",statuts:["association","intermittent"],projets:["album","tournee","clip","studio"],budgets:["petit","moyen","grand"],sacem:false,lien:AFF.drac,etapes:["Contacter ta DRAC régionale","Dossier artistique","Ancrage territorial requis"]},
  {id:"residence",nom:"Résidences artistiques",org:"Scènes nationales",icon:"🏠",color:"#C8A96E",montant:"Studio + cachet 500-3 000 €",delai:"Appels annuels",diff:2,desc:"Studio gratuit, parfois logement.",statuts:["auto","intermittent","association","aucun"],projets:["album","studio","tournee"],budgets:["petit","moyen"],sacem:false,lien:AFF.irma,etapes:["Veille sur IRMA","Dossier + démo","Lettre de motivation"]},
  {id:"kkbb",nom:"Crowdfunding  -  KissKissBankBank",org:"Financement participatif",icon:"🤝",color:"#F03E3E",montant:"Selon campagne",delai:"30-60 jours",diff:2,desc:"Ta communauté finance ET promeut ton projet.",statuts:["auto","intermittent","association","aucun"],projets:["album","clip","studio"],budgets:["petit","moyen"],sacem:false,lien:AFF.kkbb,etapes:["Définir contreparties","Vidéo de présentation","Activer ta communauté"]},
];
const DEMARCHES = [
  {id:"sacem",icon:"🎵",titre:"Adhésion SACEM",color:"#845EF7",desc:"Dépose tes œuvres et perçois tes droits d'auteur sur toutes les diffusions.",lien:AFF.sacem,lienLabel:"Rejoindre la SACEM →",delai:"2-4 semaines",cout:"Gratuit (commission sur droits)",docs:["2 titres déposés minimum","Co-auteurs identifiés","Formulaire en ligne"],formats:["Titre de l'œuvre + durée exacte","Nom et part de chaque auteur/compositeur","ISRC si disponible","Éditeur (optionnel)"],tips:"Dépose AVANT toute diffusion publique ou distribution."},
  {id:"isrc",icon:"🔢",titre:"Obtenir un code ISRC",color:"#FF6B35",desc:"Code unique international pour chaque enregistrement. Obligatoire pour la distribution streaming.",lien:AFF.isrc,lienLabel:"Demander via la SCPP →",delai:"Immédiat (via distributeur)",cout:"Gratuit",docs:["Être producteur phonographique","Ou passer par ton distributeur"],formats:["Artiste principal","Titre exact","Année d'enregistrement","Pays de production","Genre musical"],tips:"DistroKid et TuneCore attribuent automatiquement un ISRC."},
  {id:"distribution",icon:"🚀",titre:"Formats de dépôt streaming",color:"#1DB954",desc:"Les specs techniques exactes pour que ton titre soit accepté par toutes les plateformes.",lien:AFF.distrokid,lienLabel:"Distribuer avec DistroKid →",delai:"24-72h après dépôt",cout:"Selon distributeur",docs:["Fichier audio","Artwork","Metadata complètes"],formats:["🎵 WAV 44.1kHz / 24-bit minimum · MP3 320kbps accepté","🖼️ Artwork 3000×3000px · JPG ou PNG · RVB · Pas de texte aux bords","📊 -14 LUFS intégrés (normalisation Spotify/Apple Music)","🔢 ISRC obligatoire","📅 Date de sortie : min. 3 semaines (7 sem. pour pitch Spotify)","🏷️ Genre principal + sous-genre · ©️ Année de copyright"],tips:"Un fichier WAV 24-bit est toujours préférable à un MP3."},
  {id:"autoentrepreneur",icon:"📋",titre:"Devenir Auto-Entrepreneur",color:"#00C9A7",desc:"Statut simple pour exercer une activité musicale légalement et facturer.",lien:"https://www.autoentrepreneur.urssaf.fr/portail/accueil/creer-mon-auto-entreprise.html",lienLabel:"Créer sur urssaf.fr →",delai:"48-72h",cout:"Gratuit",docs:["Pièce d'identité","Adresse","Activité principale"],formats:["Code APE 9001Z (arts du spectacle)","ou 5920Z (enregistrement sonore)","SIRET attribué automatiquement","Déclaration mensuelle ou trimestrielle"],tips:"Commence par l'auto-entrepreneur. Crée une société seulement quand le volume le justifie."},
  {id:"label",icon:"🏷️",titre:"Créer son Label",color:"#C8A96E",desc:"Créer une structure pour produire et distribuer ta musique professionnellement.",lien:"https://www.inpi.fr/",lienLabel:"Déposer la marque INPI →",delai:"1-3 mois",cout:"290€ (marque INPI) + frais création",docs:["Nom du label","Statuts juridiques","SIRET","Compte bancaire pro"],formats:["Dépôt marque INPI : 290€ / 10 ans","SAS : ~1500€ avec accompagnement","Auto-entrepreneur : gratuit mais limité","Adhésion SCPP pour codes ISRC"],tips:"Dépose d'abord la marque à l'INPI avant d'en parler publiquement."},
];
const FINANCEMENT_QS = [
  {id:"statut",q:"Ton statut ?",opts:[{v:"auto",l:"Auto-entrepreneur"},{v:"intermittent",l:"Intermittent"},{v:"association",l:"Association"},{v:"aucun",l:"Pas de statut"}]},
  {id:"sacem",q:"Membre SACEM ?",opts:[{v:"oui",l:"Oui"},{v:"non",l:"Non"},{v:"process",l:"En cours"}]},
  {id:"projet",q:"Ton projet ?",opts:[{v:"album",l:"Album / EP"},{v:"clip",l:"Clip vidéo"},{v:"tournee",l:"Tournée"},{v:"studio",l:"Studio"}]},
  {id:"budget",q:"Budget estimé ?",opts:[{v:"petit",l:"< 3 000 €"},{v:"moyen",l:"3k-15k €"},{v:"grand",l:"15k-50k €"},{v:"xl",l:"> 50 000 €"}]},
];
function scoreAide(a,ans){let s=0,m=0;m+=3;if(ans.statut&&a.statuts.includes(ans.statut))s+=3;m+=4;if(ans.projet&&a.projets.includes(ans.projet))s+=4;m+=2;if(a.sacem){if(ans.sacem==="oui")s+=2;}else s+=2;m+=2;if(ans.budget&&a.budgets.includes(ans.budget))s+=2;return Math.round(s/m*100);}


// --- BIBLIOTHÈQUE DOCS -------------------------------------------------------
const BIBLIO_CATS = [
  {id:"contrats",   label:"Contrats & Accords",     icon:"📜", color:"#FF6B35"},
  {id:"sacem",      label:"SACEM & Droits",           icon:"🎵", color:"#845EF7"},
  {id:"distrib",    label:"Distribution & Promotion", icon:"🚀", color:"#1DB954"},
  {id:"finance",    label:"Financements & Aides",     icon:"💰", color:"#F03E3E"},
  {id:"statuts",    label:"Statuts Juridiques",        icon:"📋", color:"#00C9A7"},
  {id:"live",       label:"Live & Technique",          icon:"🎤", color:"#FFD43B"},
];
// access: "all"=artiste+label | "label"=label seulement
const BIBLIO_DOCS = [
  // ── CONTRATS ──
  {id:"feat",cat:"contrats",icon:"🤝",titre:"Contrat de Featuring",access:"all",
   resume:"Encadre la participation d'un artiste invité  -  droits, rémunération, crédits.",
   contenu:`CONTRAT DE FEATURING

Entre :
L'ARTISTE PRINCIPAL : [Nom / Scène], né(e) le [date], demeurant [adresse]
L'ARTISTE INVITÉ : [Nom / Scène], né(e) le [date], demeurant [adresse]

ARTICLE 1 - OBJET
L'Artiste Invité participe en qualité d'interprète au titre "[Titre]", d'une durée de [XX:XX], produit par [Producteur].

ARTICLE 2 - DROITS D'AUTEUR
Répartition des droits :
• Composition : Principal [XX]% / Invité [XX]%
• Paroles : Principal [XX]% / Invité [XX]%
Chaque partie s'engage à déclarer sa part à la SACEM.

ARTICLE 3 - DROITS VOISINS
• Artiste Principal : [XX]%
• Artiste Invité : [XX]%

ARTICLE 4 - RÉMUNÉRATION
[ ] Cachet fixe : [XX] € à la signature
[ ] Partage recettes : [XX]% des recettes nettes
[ ] Gratuité convenue entre les parties

ARTICLE 5 - EXPLOITATION
L'Artiste Principal peut exploiter l'enregistrement sous toutes formes (streaming, téléchargement, sync, physique) pour [X] ans / durée légale, sur le territoire [France / Monde].

ARTICLE 6 - CRÉDITS
L'Artiste Invité sera crédité sous le nom "[Nom de scène]" sur tous supports.

ARTICLE 7 - DROIT APPLICABLE
Droit français. Tout litige devant les tribunaux de [Ville].

Fait à [Ville], le [Date]

Signature Artiste Principal :          Signature Artiste Invité :`},

  {id:"split",cat:"contrats",icon:"📊",titre:"Split Sheet  -  Répartition des droits",access:"all",
   resume:"Document de référence pour fixer la répartition entre co-auteurs. À signer avant toute diffusion.",
   contenu:`SPLIT SHEET  -  RÉPARTITION DES DROITS

Titre : [Nom du titre]
Date de création : [Date]
ISRC (si dispo) : [Code]
Durée : [XX:XX]

DROITS D'AUTEUR
────────────────────────────────────────
Nom / Scène       | Rôle         | Compo | Paroles | SACEM
[Nom 1]           | Compositeur  | [XX]% | [XX]%   | Oui/Non
[Nom 2]           | Parolier     | [XX]% | [XX]%   | Oui/Non
[Nom 3]           | Co-prod      | [XX]% | [XX]%   | Oui/Non
TOTAL             |              | 100%  | 100%    |

DROITS VOISINS (Interprètes)
────────────────────────────────────────
Nom / Scène       | Rôle         | Part
[Nom 1]           | Artiste ppal | [XX]%
[Nom 2]           | Featuring    | [XX]%
TOTAL             |              | 100%

⚠️ Ce document vaut accord entre les parties.
Chacun s'engage à déclarer sa part à la SACEM avant diffusion.

Signatures :
[Nom 1]  -  Date  -  Signature :
[Nom 2]  -  Date  -  Signature :`},

  {id:"cession",cat:"contrats",icon:"📜",titre:"Contrat de Cession de Droits Voisins",access:"label",
   resume:"Cède les droits d'interprétation à un producteur/label en échange d'un cachet ou royalties.",
   contenu:`CONTRAT DE CESSION DE DROITS VOISINS

Entre :
LE PRODUCTEUR : [Raison sociale], SIRET [XXXXXXX], représenté par [Nom]
L'ARTISTE : [Nom / Scène], né(e) le [date], demeurant [adresse]

ARTICLE 1 - OBJET
L'Artiste cède au Producteur, à titre exclusif, ses droits voisins sur l'enregistrement du titre "[Titre]".

ARTICLE 2 - DROITS CÉDÉS
• Droit de reproduction (streaming, téléchargement, pressage physique)
• Droit de communication au public (radio, TV, sync)
• Droit de distribution sous toutes formes
• Droit d'adaptation/remix (avec accord préalable écrit)

ARTICLE 3 - DURÉE ET TERRITOIRE
[X] ans / durée légale, sur le territoire [France / UE / Monde].

ARTICLE 4 - RÉMUNÉRATION
[ ] Cachet forfaitaire : [XX] € à la signature
[ ] Royalties : [XX]% des recettes nettes, versées semestriellement
[ ] Avance : [XX] € récupérable sur premières recettes

ARTICLE 5 - DROITS MORAUX
L'Artiste conserve ses droits moraux. Crédité sous "[Nom de scène]".

Fait à [Ville], le [Date]
Producteur :                    Artiste :`},

  {id:"coprod",cat:"contrats",icon:"🎛️",titre:"Contrat de Co-production Musicale",access:"label",
   resume:"Définit droits et obligations de deux producteurs qui co-financent un enregistrement.",
   contenu:`CONTRAT DE CO-PRODUCTION MUSICALE

Entre :
PRODUCTEUR A : [Raison sociale], SIRET [XXXXXXX], représenté par [Nom]
PRODUCTEUR B : [Raison sociale], SIRET [XXXXXXX], représenté par [Nom]

ARTICLE 1 - OBJET
Co-production de l'enregistrement "[Titre]" interprété par [Artiste].

ARTICLE 2 - APPORTS
Producteur A : [Budget XX€ / Studios / Promotion]
Producteur B : [Budget XX€ / Distribution / Marketing]

ARTICLE 3 - RÉPARTITION
Droits de producteur phonographique :
• Producteur A : [XX]%
• Producteur B : [XX]%
Applicable à toutes les recettes d'exploitation.

ARTICLE 4 - EXPLOITATION
Décisions conjointes. En cas de désaccord : voix prépondérante du Producteur A.

ARTICLE 5 - REVERSEMENTS
Compte de gestion tenu par [A/B]. Reversements trimestriels après déduction des frais justifiés.

Fait à [Ville], le [Date]
Producteur A :                  Producteur B :`},

  {id:"licence_excl",cat:"contrats",icon:"🔐",titre:"Contrat de Licence Exclusive",access:"label",
   resume:"Accorde à un tiers le droit exclusif d'exploiter un enregistrement sur un territoire donné.",
   contenu:`CONTRAT DE LICENCE EXCLUSIVE

Entre :
LE CONCÉDANT : [Nom], titulaire des droits
LE LICENCIÉ : [Nom / Raison sociale]

ARTICLE 1 - EXCLUSIVITÉ ET TERRITOIRE
Licence exclusive sur : [France / Europe / Monde]
Durée : [X] ans. Le Concédant s'interdit tout droit similaire à un tiers sur ce territoire.

ARTICLE 2 - DROITS ACCORDÉS
• Streaming et téléchargement
• Diffusion radio et TV
• Synchronisation (accord écrit préalable requis)
• Distribution physique

ARTICLE 3 - RÉMUNÉRATION
Avance non récupérable : [XX] €
Royalties : [XX]% des recettes nettes, semestriellement avec relevé détaillé.

ARTICLE 4 - FIN
À l'expiration, tous droits retournent au Concédant. Stocks physiques écoulables sous 6 mois.

Fait à [Ville], le [Date]
Concédant :                     Licencié :`},

  {id:"licence_ne",cat:"contrats",icon:"🔓",titre:"Contrat de Licence Non-Exclusive",access:"label",
   resume:"Autorise plusieurs licenciés à exploiter simultanément le même enregistrement.",
   contenu:`CONTRAT DE LICENCE NON-EXCLUSIVE

Entre :
LE CONCÉDANT : [Nom], titulaire des droits
LE LICENCIÉ : [Nom / Raison sociale]

ARTICLE 1 - NON-EXCLUSIVITÉ
Le Concédant peut concéder des licences similaires à d'autres tiers simultanément.

ARTICLE 2 - DROITS ET TERRITOIRE
Droits : [Streaming / Téléchargement / Sync / Radio  -  préciser]
Territoire : [France / Europe / Monde]
Durée : [X] ans

ARTICLE 3 - RÉMUNÉRATION
[ ] Redevance forfaitaire : [XX] €
[ ] Royalties : [XX]% des recettes nettes

ARTICLE 4 - CRÉDITS
"[Titre]  -  © [Année] [Nom Concédant]"

Fait à [Ville], le [Date]
Concédant :                     Licencié :`},

  {id:"management",cat:"contrats",icon:"👔",titre:"Contrat de Management Artiste",access:"label",
   resume:"Définit la mission et la rémunération du manager qui développe la carrière d'un artiste.",
   contenu:`CONTRAT DE MANAGEMENT ARTISTE

Entre :
L'ARTISTE : [Nom / Scène]
LE MANAGER : [Nom / Raison sociale], SIRET [XXXXXXX]

ARTICLE 1 - MISSION
• Conseil stratégique et orientation de carrière
• Négociation et suivi des contrats (disque, booking, partenariats)
• Coordination des équipes (label, agent, attaché de presse)
• Développement des partenariats et opportunités

ARTICLE 2 - EXCLUSIVITÉ
Contrat exclusif. L'Artiste s'interdit tout autre manager pendant la durée.

ARTICLE 3 - DURÉE
[X] an(s), renouvelable par accord exprès.

ARTICLE 4 - COMMISSION
[15-20]% sur : cachets concerts, avances & royalties disque, sync, revenus publicitaires.
Exclus : remboursements frais techniques, aides publiques (CNM, ADAMI).

ARTICLE 5 - RÉSILIATION
Préavis [3] mois. Résiliation anticipée par l'Artiste : le Manager conserve ses commissions sur contrats signés pendant 12 mois post-résiliation.

Fait à [Ville], le [Date]
L'Artiste :                     Le Manager :`},

  {id:"booking_contrat",cat:"contrats",icon:"🎤",titre:"Contrat de Cession de Spectacle",access:"label",
   resume:"Encadre la relation producteur / salle pour un concert  -  cachet, conditions techniques, annulation.",
   contenu:`CONTRAT DE CESSION DE SPECTACLE

Entre :
LE PRODUCTEUR : [Nom], licence entrepreneur de spectacle n° [XXXXXX]
L'ACHETEUR : [Salle / Association], SIRET [XXXXXXX]

ARTICLE 1 - SPECTACLE
Date : [Jour, Date]  -  Heure : [HH:MM]
Lieu : [Salle, Adresse]
Durée : [XX minutes]

ARTICLE 2 - RÉMUNÉRATION
[ ] Cachet fixe : [XXXX] € HT
[ ] Minimum garanti [XXXX] € + [XX]% recettes nettes billetterie au-delà de [XXXX] €
Paiement : [50]% à la signature, [50]% le soir de la représentation.

ARTICLE 3 - CONDITIONS TECHNIQUES
L'Acheteur fournit les équipements de la fiche technique annexée.
Hébergement et restauration de [X] personnes pris en charge.

ARTICLE 4 - DROITS SACEM/SPRE
L'Acheteur s'acquitte directement de tous droits SACEM, SPRE et taxes.

ARTICLE 5 - ANNULATION
Par l'Acheteur à moins de 30 jours : [XX]% du cachet dû.
Par le Producteur (hors force majeure) : remboursement intégral des acomptes.

Fait à [Ville], le [Date]
Producteur :                    Acheteur :`},

  // ── SACEM & DROITS ──
  {id:"decla_sacem",cat:"sacem",icon:"🎵",titre:"Fiche déclaration d'œuvre SACEM",access:"all",
   resume:"Tout ce qu'il faut renseigner pour déclarer correctement une œuvre à la SACEM avant diffusion.",
   contenu:`FICHE DÉCLARATION D'ŒUVRE SACEM

⚠️ À déposer AVANT toute diffusion ou distribution.

━━━ INFOS SUR L'ŒUVRE ━━━
Titre exact : ________________________________
Durée (mm:ss) : ______________
Type : [ ] Originale  [ ] Arrangement  [ ] Adaptation
Genre : ________________________________
ISRC (si dispo) : ________________________________

━━━ AUTEURS & COMPOSITEURS ━━━
Pour chaque contributeur :
→ Nom civil complet
→ Pseudonyme
→ N° sociétaire SACEM
→ Rôle : Compositeur / Auteur / Auteur-Compositeur / Arrangeur
→ Part composition (%) | Part texte (%)

Exemple :
DUPONT Marie | SAYA | N°123456 | Auteur-Compositeur | 50% | 100%

TOTAL COMPOSITION : 100%
TOTAL TEXTE : 100%

━━━ ÉDITEUR (si applicable) ━━━
Raison sociale : ________________
N° SACEM : ________________
Part : _______%

━━━ CHECKLIST ━━━
[ ] Membre SACEM (ou démarche simultanée)
[ ] Split sheet signé par tous les co-auteurs
[ ] Parts = 100% en compo ET en texte
[ ] Dépôt AVANT mise en ligne
[ ] ISRC noté si titre déjà distribué

💡 Dépôt via espaceclient.sacem.fr > Mes œuvres > Déclarer une œuvre`},

  {id:"isrc",cat:"sacem",icon:"🔢",titre:"Guide obtention code ISRC",access:"all",
   resume:"L'ISRC identifie chaque enregistrement de façon unique. Obligatoire pour le streaming et les droits voisins.",
   contenu:`GUIDE OBTENTION CODE ISRC

Format : [Pays][Propriétaire][Année][ID]  -  ex: FR-Z03-25-00001

Pourquoi c'est indispensable :
✓ Distribution Spotify, Apple Music, Deezer...
✓ Perception droits voisins (SCPP / SPPF)
✓ Suivi diffusions radio et TV
✓ Identification bases internationales

━━━ 3 FAÇONS D'OBTENIR UN ISRC ━━━

1. Via ton distributeur (le plus simple)
DistroKid, TuneCore, Believe, CD Baby attribuent automatiquement. GRATUIT.
→ Récupère-le dans ton dashboard après soumission.

2. Via la SCPP (si tu es producteur avec SIRET)
Préfixe propre à ton label.
→ scpp.fr > Espace membres > Codes ISRC
→ Gratuit pour les membres

3. Via la SPPF
→ sppf.com | Réservé aux membres

━━━ BONNES PRATIQUES ━━━
→ 1 ISRC = 1 enregistrement unique
→ Remix ou live = nouvel ISRC
→ Ne jamais réutiliser un ISRC
→ Tiens un fichier : artiste / titre / ISRC / date
→ Déclare l'ISRC dans ta fiche SACEM

💡 Utilise DistroKid : il attribue l'ISRC auto et tu le récupères avant la mise en ligne.`},

  {id:"guide_sacem",cat:"sacem",icon:"📖",titre:"Guide adhésion SACEM pas à pas",access:"all",
   resume:"Comment devenir membre SACEM et commencer à percevoir tes droits d'auteur.",
   contenu:`GUIDE ADHÉSION SACEM

━━━ PRÉREQUIS ━━━
→ Avoir composé ou écrit au moins 2 titres
→ Ces titres doivent être diffusés ou diffusables

━━━ ÉTAPES ━━━

1. Crée ton compte sur espaceclient.sacem.fr
   → Rubrique "Rejoindre la SACEM"

2. Remplis le dossier d'adhésion
   → Identité civile complète
   → Nom de scène (si différent)
   → Coordonnées bancaires (IBAN)

3. Déclare tes 2 premières œuvres
   → Titre exact, durée, co-auteurs et leurs parts
   → ISRC si disponible

4. Règle les frais d'adhésion
   → ~50€ remboursés dès les premiers droits perçus

5. Validation par le comité
   → Délai : 2 à 4 semaines

━━━ APRÈS L'ADHÉSION ━━━
→ Déclare chaque nouvelle œuvre AVANT sa diffusion
→ Droits versés 2x/an (printemps + automne)
→ Accès à des aides : Bourse Création, aide numérique, résidences

💡 Plus tu déclares tôt, plus tu perçois. La SACEM perçoit sur toutes les diffusions  -  radio, streaming, concerts, TV, restaurants...`},

  // ── DISTRIBUTION & PROMOTION ──
  {id:"presskit",cat:"distrib",icon:"✍️",titre:"Template Press Kit Complet",access:"all",
   resume:"Structure complète pour rédiger un press kit pro : bio courte, bio longue, éléments visuels.",
   contenu:`TEMPLATE PRESS KIT  -  [NOM D'ARTISTE]

━━━ BIO COURTE (~100 mots  -  réseaux, playlists, booking) ━━━
[NOM] est un(e) artiste [genre] basé(e) à [ville]. Avec [X] titres en [période], il/elle s'impose comme une voix incontournable de la scène [genre] française. Son univers mêle [influence 1], [influence 2] et [influence 3], pour une musique [adj 1] et [adj 2]. [Titre phare] a cumulé [XX]K streams et a été diffusé sur [radio/playlist]. Représenté(e) par [Manager/Label si applicable].

━━━ BIO LONGUE (~300 mots  -  presse, financements) ━━━
ORIGINES & INFLUENCES
[Ville d'origine, comment la musique est arrivée, 2-3 influences avec anecdote personnelle]

TRAJECTOIRE
[Premiers pas, première sortie, évolution du son, moments clés]

PROJET ACTUEL
[EP/Album/Tournée  -  concept, différenciation, ambitions]

CHIFFRES CLÉS
• [X]K streams cumulés
• [X] dates en [année]
• Diffusé sur [radio/playlist Spotify]
• [Autre accomplissement]

━━━ ÉLÉMENTS VISUELS ━━━
Photos HD : [Lien Dropbox/Drive]
Format : JPG, 300 DPI min, 3000px côté court
Légende : [Nom artiste]  -  Photo © [Photographe]  -  [Année]

Logo : [Lien] | Couleurs : [Hex] | Typo : [Police]

━━━ LIENS ━━━
Spotify : [URL] | Instagram : [URL]
Smart Link : [URL] | EPK en ligne : [URL]

━━━ REVUE DE PRESSE ━━━
"[Citation courte]"  -  [Source], [Date]`},

  {id:"checklist",cat:"distrib",icon:"📋",titre:"Checklist Sortie J-60 à J+30",access:"all",
   resume:"Planning complet pour préparer et maximiser une sortie musicale.",
   contenu:`CHECKLIST SORTIE MUSICALE

━━━ J-60 : FONDATIONS ━━━
[ ] Master finalisé (-14 LUFS intégrés)
[ ] Artwork 3000x3000px validé (JPG/PNG, RVB)
[ ] ISRC attribué
[ ] Œuvre déposée SACEM
[ ] Split sheet signé
[ ] Contrat featuring signé (si applicable)
[ ] Budget promo défini

━━━ J-45 : DISTRIBUTION ━━━
[ ] Titre soumis au distributeur
[ ] Metadata complètes (titre, artiste, genre, copyright, ISRC)
[ ] Date de sortie confirmée
[ ] Pitch éditorial Spotify envoyé (Spotify for Artists > Pitcher un titre)
[ ] Smart link créé (Linktree, Linkfire, Beacons)

━━━ J-30 : PROMOTION ━━━
[ ] Press kit mis à jour et envoyé
[ ] Blogs musicaux contactés (15-20 contacts)
[ ] Playlists indépendantes démarchées (Groover ou direct)
[ ] Radios ciblées contactées
[ ] Contenu TikTok/Reels prêt (3-5 vidéos)
[ ] Teaser visuel monté

━━━ J-7 : DERNIÈRE LIGNE ━━━
[ ] Pré-saves activés
[ ] Relance presse + playlists avec smart link
[ ] Plan de posts semaine 1 validé
[ ] Communauté prévenue (newsletter, story)

━━━ J-0 : SORTIE ━━━
[ ] Post sur tous les réseaux
[ ] Story Instagram avec lien
[ ] TikTok/Reels publié
[ ] Partage communautés musicales

━━━ J+7 À J+30 : AFTER ━━━
[ ] J+3 : Relance presse
[ ] J+7 : Bilan streaming (Spotify for Artists)
[ ] J+14 : Relance playlists avec stats
[ ] J+30 : Bilan global
[ ] Planifier prochaine sortie`},

  {id:"pitch_spotify",cat:"distrib",icon:"🎧",titre:"Template Pitch Éditorial Spotify",access:"all",
   resume:"Comment remplir le pitch Spotify for Artists pour maximiser tes chances de playlist éditoriale.",
   contenu:`TEMPLATE PITCH ÉDITORIAL SPOTIFY

⚠️ Disponible via Spotify for Artists, minimum 7 semaines avant sortie. Une seule chance par titre.

━━━ CHAMPS À REMPLIR ━━━
GENRE PRINCIPAL : [Afro Pop / R&B / Rap FR...]
SOUS-GENRE : [Afrobeats / Soul / Trap...]
CULTURE : [Francophone / Afrodiaspora...]
MOOD : [Festif / Mélancolique / Motivant...]
STYLE : [Dansant / Intimiste / Énergique...]
INSTRUMENT CLEF : [808 / Guitare / Piano / Voix...]

━━━ DESCRIPTION (500 caractères max) ━━━
Structure conseillée :
"[Nom artiste] revient avec [Titre], un titre [adjectif] qui [concept en 1 phrase]. Produit par [Producteur], ce son mêle [élément 1] et [élément 2] pour une ambiance [mood]. Parfait pour [contexte d'écoute : gym, soirée, route...]. [X]ème sortie de [Nom], après [Titre précédent] qui a cumulé [X]K streams."

━━━ CONSEILS CLÉS ━━━
→ Précis sur le mood et contexte d'écoute
→ Cite des références si pertinent ("dans la veine de...")
→ Mentionne l'actu (tournée, clip, collab connue)
→ Pas de superlatifs vides ("banger absolu"...)
→ Pitch en anglais si tu vises l'international
→ Rappelle les stats si elles sont solides`},

  {id:"email_booking_tpl",cat:"distrib",icon:"📩",titre:"Template Email Démarchage Salle",access:"all",
   resume:"Structure d'un email de booking efficace pour démarcher une salle ou un festival.",
   contenu:`TEMPLATE EMAIL BOOKING

Objet : [NOM ARTISTE] - Demande de date - [Genre] - [Ville/Région]

---

Bonjour [Prénom programmateur si connu],

Je me permets de vous contacter au sujet d'une possible date à [Nom de la salle].

Je m'appelle [Nom d'artiste], artiste [genre] basé(e) à [ville]. Mon dernier projet "[Titre]" ([EP/Single], [mois année]) a [X]K streams sur Spotify et a été diffusé sur [radio / playlist]. [1 phrase sur l'univers artistique].

Votre programmation m'attire particulièrement car [raison précise liée à la salle  -  ne pas généraliser]. Je me vois bien proposer [format du spectacle] à votre public.

Mon EPK complet : [LIEN  -  jamais de pièce jointe]

Je serais ravi(e) d'échanger sur une possible collaboration. Disponible pour la période [mois-mois XXXX].

Bien cordialement,
[Nom d'artiste]
[Email] | [Tel] | [Lien Spotify]

---

💡 CONSEILS :
→ Envoie le mardi ou mercredi matin
→ Relance après 3 semaines sans réponse
→ Personnalise CHAQUE email  -  les programmateurs le voient
→ Le lien EPK en premier, jamais de pièce jointe`},

  // ── FINANCEMENTS ──
  {id:"fiche_cnm",cat:"finance",icon:"🏛️",titre:"Fiche Aides CNM",access:"all",
   resume:"Centre National de la Musique  -  les principales aides disponibles pour artistes indépendants.",
   contenu:`FICHE AIDES CNM  -  Centre National de la Musique
Site : cnm.fr/aides

━━━ PRODUCTION PHONOGRAPHIQUE ━━━
Montant : jusqu'à 50 000 €
Pour : production album/EP
Eligible : producteurs indépendants avec SIRET
Délai dossier : 4-6 mois
Étapes : compte CNM + dossier artistique + dépôt avant date limite trimestrielle

━━━ AIDE AU CLIP VIDÉO ━━━
Montant : jusqu'à 15 000 €
Pour : réalisation de clips
Eligible : artistes et labels indépendants
Délai : 2-3 mois
Étapes : compte CNM + devis réalisateur + dépôt dossier

━━━ AIDE AUX TOURNÉES ━━━
Montant : variable
Pour : tournées nationales
Eligible : intermittents, associations
Délai : 3-4 mois
Étapes : planning confirmé + contrats de cession + dossier CNM

━━━ AIDE AU DÉVELOPPEMENT EXPORT ━━━
Pour : artistes visant les marchés internationaux
Contact : Bureau Export (french-music.org)

━━━ COMMENT POSTULER ━━━
1. Crée ton compte sur cnm.fr
2. Vérifie ton éligibilité (statut, type de projet)
3. Prépare : dossier artistique, devis, planning, CV artistique
4. Dépose avant la date limite trimestrielle (publiée sur le site)

💡 Les aides CNM sont cumulables avec SACEM, ADAMI, DRAC.`},

  {id:"fiche_adami",cat:"finance",icon:"🎤",titre:"Fiche ADAMI / SPEDIDAM",access:"all",
   resume:"Aides pour artistes-interprètes : ADAMI (solistes) et SPEDIDAM (musiciens).",
   contenu:`FICHE ADAMI & SPEDIDAM

━━━ ADAMI (artistes-interprètes solistes) ━━━
Site : adami.fr/artiste/aides-et-bourses
Montant : 1 000 - 15 000 €
Pour : album, tournée, clip
Eligible : artistes-interprètes (chanteurs, comédiens...)
Délai : 2-4 mois

Aides disponibles :
• Bourse Démo : financer un enregistrement démo
• Aide à la production : album ou EP
• Aide au spectacle vivant : soutien à la création scénique
• Aide à la mobilité : frais de déplacement international

Étapes : être artiste-interprète + dossier projet + soumission en ligne

━━━ SPEDIDAM (musiciens interprètes) ━━━
Site : spedidam.fr/aides
Montant : 500 - 8 000 €
Pour : album, studio, tournée
Eligible : musiciens interprètes (instrumentistes...)
Délai : 2-3 mois

Aides disponibles :
• Aide à l'enregistrement
• Aide à la diffusion live
• Aide à la formation

Étapes : être musicien interprète + dossier artistique + dépôt en ligne

💡 ADAMI et SPEDIDAM sont complémentaires  -  tu peux postuler aux deux si tu es à la fois chanteur et instrumentiste.`},

  {id:"fiche_drac",cat:"finance",icon:"🗺️",titre:"Fiche Résidences & DRAC",access:"all",
   resume:"Financements régionaux DRAC et résidences artistiques  -  studio gratuit et accompagnement.",
   contenu:`FICHE DRAC & RÉSIDENCES ARTISTIQUES

━━━ DRAC  -  Directions Régionales des Affaires Culturelles ━━━
Site : culture.gouv.fr/Regions
Montant : 1 000 - 20 000 €
Pour : projets culturels ancrés régionalement
Eligible : associations, intermittents avec ancrage territorial
Délai : 3-5 mois

Comment postuler :
1. Contacte ta DRAC régionale (trouvable sur le site)
2. Présente ton projet avec ancrage local fort
3. Dossier artistique complet + budget prévisionnel
4. Réponse sous 3-5 mois

━━━ RÉSIDENCES ARTISTIQUES ━━━
Site de référence : irma.asso.fr
Montant : Studio gratuit + cachet 500-3 000 €
Pour : création et développement artistique
Eligible : tous statuts
Appels : annuels (veille régulière nécessaire)

Types de résidences :
• Résidences de création : studio + temps pour créer
• Résidences de diffusion : accompagnement de la tournée
• Résidences pédagogiques : transmission + création

Comment postuler :
1. Veille sur irma.asso.fr et les scènes nationales
2. Dossier artistique + démo + lettre de motivation personnalisée
3. Délai de réponse : 1-3 mois

💡 Les résidences offrent souvent hébergement + repas en plus du studio. Très précieux pour les émergents.`},

  {id:"tpl_dossier",cat:"finance",icon:"📄",titre:"Template Dossier Subvention",access:"all",
   resume:"Structure type d'un dossier de demande de subvention pour CNM, DRAC, SACEM.",
   contenu:`TEMPLATE DOSSIER SUBVENTION

━━━ PAGE DE GARDE ━━━
Nom du porteur de projet : [Nom / Raison sociale]
SIRET (si applicable) : [XXXXXXXXXXXXXXX]
Contact : [Email] | [Tel]
Nom du projet : [Titre du projet]
Type de demande : [Production / Clip / Tournée / Résidence]
Montant demandé : [XXXX] €
Date de dépôt : [Date]

━━━ 1. PRÉSENTATION ARTISTIQUE ━━━
Biographie courte de l'artiste (150 mots max)
Discographie / Historique de dates
Éléments de presse (si disponibles)
Liens : Spotify, site, EPK

━━━ 2. DESCRIPTION DU PROJET ━━━
Contexte : pourquoi ce projet, pourquoi maintenant
Objectifs artistiques : ce que le projet va produire
Objectifs de diffusion : public visé, territoire
Calendrier prévisionnel : étape par étape

━━━ 3. BUDGET PRÉVISIONNEL ━━━
DÉPENSES
• Studio / Production : [XX] €
• Promotion / Vidéo : [XX] €
• Logistique / Transport : [XX] €
• Autres frais : [XX] €
TOTAL DÉPENSES : [XX] €

RECETTES
• Autofinancement : [XX] €
• Autres subventions demandées : [XX] €
• Subvention [Organisme] demandée : [XX] €
TOTAL RECETTES : [XX] €

━━━ 4. ANNEXES ━━━
[ ] Devis studio / prestataires
[ ] Contrats signés (cession, booking)
[ ] Extrait Kbis ou attestation URSSAF
[ ] Relevé SACEM ou attestation adhésion

💡 Sois précis sur les chiffres. Les comités vérifient la cohérence budget/projet.`},

  // ── STATUTS ──
  {id:"guide_ae",cat:"statuts",icon:"📋",titre:"Guide Auto-Entrepreneur Artiste",access:"all",
   resume:"Tout pour créer ton statut auto-entrepreneur et facturer ton activité musicale légalement.",
   contenu:`GUIDE AUTO-ENTREPRENEUR ARTISTE

Site : autoentrepreneur.urssaf.fr
Délai création : 48-72h | Gratuit

━━━ POURQUOI CE STATUT ? ━━━
→ Simple à créer, pas de comptable obligatoire
→ Permet de facturer (concerts, cours, sessions studio)
→ Protection sociale dès le premier euro déclaré
→ Idéal pour démarrer avant de créer une société

━━━ CODES APE POUR ARTISTES ━━━
• 9001Z : Arts du spectacle vivant (concerts, live)
• 5920Z : Enregistrement sonore et édition musicale (studio, production)
Tu peux avoir les deux activités sous un même statut.

━━━ ÉTAPES DE CRÉATION ━━━
1. Va sur autoentrepreneur.urssaf.fr
2. Clique "Créer mon auto-entreprise"
3. Remplis : identité, activité (code APE), adresse
4. Reçois ton SIRET sous 48-72h par email
5. Commence à facturer !

━━━ DÉCLARATIONS & COTISATIONS ━━━
→ Déclare ton chiffre d'affaires mensuellement ou trimestriellement
→ Taux de cotisation : ~22% du CA pour les services
→ Si CA = 0 → cotisations = 0

━━━ LIMITES DU STATUT ━━━
→ Plafond CA : 77 700€/an (au-delà → autre statut)
→ Pas de TVA récupérable en dessous du seuil
→ Droits chômage limités (sauf si tu es aussi salarié)

💡 Cumul possible avec l'intermittence si tu es éligible.`},

  {id:"guide_intermittent",cat:"statuts",icon:"🎭",titre:"Guide Intermittent du Spectacle",access:"all",
   resume:"Comment accéder au statut d'intermittent, conditions, droits et pièges à éviter.",
   contenu:`GUIDE INTERMITTENT DU SPECTACLE

━━━ C'EST QUOI ? ━━━
Régime d'assurance chômage spécifique pour les artistes et techniciens du spectacle, permettant de percevoir des allocations entre les contrats.

━━━ CONDITIONS D'ACCÈS ━━━
→ 507 heures de travail salarié dans le spectacle en 12 mois (artiste)
→ Contrats en CDD d'usage (CDDU) obligatoires
→ Employeurs déclarant à Pôle Emploi Spectacle

━━━ DROITS ━━━
→ Allocations journalières entre les contrats
→ Mutuelle pro (CMB  -  Caisse des Médias)
→ Accès formation (AFDAS)
→ Droits retraite spécifiques

━━━ DOCUMENTS NÉCESSAIRES ━━━
[ ] Bulletins de salaire (justifiant les 507h)
[ ] Attestations employeurs
[ ] Fiche d'état civil
[ ] RIB

━━━ PIÈGES À ÉVITER ━━━
→ Ne pas confondre auto-entrepreneur et intermittent (incompatibles sur la même activité)
→ Les cachets en association peuvent valider des heures
→ Attention aux "faux cachets"  -  risque de redressement
→ Renouveler ses droits avant la date d'anniversary

━━━ RESSOURCES ━━━
→ Pôle Emploi Spectacle : pole-emploi.fr
→ Fédération des employeurs : fe-sps.fr
→ CMB Mutuelle : cmb-sante.fr

💡 Tu peux cumuler auto-entrepreneur ET intermittent si les activités sont bien séparées. Consulte un conseiller Pôle Emploi Spectacle.`},

  {id:"guide_label",cat:"statuts",icon:"🏷️",titre:"Guide Création Label Indépendant",access:"all",
   resume:"Créer une structure pour produire et distribuer ta musique professionnellement.",
   contenu:`GUIDE CRÉATION LABEL INDÉPENDANT

━━━ POURQUOI CRÉER UN LABEL ? ━━━
→ Être propriétaire de tes masters (droits producteur)
→ Obtenir un préfixe ISRC propre
→ Signer d'autres artistes
→ Accéder aux aides CNM réservées aux producteurs
→ Crédibilité professionnelle

━━━ ÉTAPE 1 : CHOISIR SON STATUT JURIDIQUE ━━━
• Auto-entrepreneur : gratuit, rapide, mais limité (pas de TVA, plafond CA)
• SASU / SAS : ~1500€ avec accompagnement, TVA récupérable, associés possibles
• SARL : similaire, more adapté si plusieurs associés dès le départ
→ Recommandation pour débuter : SASU

━━━ ÉTAPE 2 : DÉPOSER LA MARQUE (INPI) ━━━
Site : inpi.fr
Coût : 290€ pour 10 ans et 1 classe
Délai : 3-6 mois pour l'enregistrement définitif
⚠️ Dépose AVANT d'en parler publiquement

━━━ ÉTAPE 3 : CRÉER LA SOCIÉTÉ ━━━
1. Rédiger les statuts (notaire ou en ligne via Legalstart)
2. Déposer le capital (1€ minimum pour SAS)
3. Publier une annonce légale (~150€)
4. Déposer au greffe du tribunal de commerce
5. Recevoir le Kbis

━━━ ÉTAPE 4 : ADHÉRER À LA SCPP ━━━
→ Pour obtenir ton préfixe ISRC de label
→ Pour percevoir les droits voisins producteur
→ Site : scpp.fr

━━━ ÉTAPE 5 : OUVRIR UN COMPTE PRO ━━━
→ Compte bancaire dédié obligatoire
→ Options : Shine, Qonto, N26 Business (moins chers que les banques traditionnelles)

💡 Budget total pour créer une SAS proprement : 2 000-3 000€ avec accompagnement.`},

  // ── LIVE & TECHNIQUE ──
  {id:"rider",cat:"live",icon:"🎛️",titre:"Template Rider Technique",access:"label",
   resume:"Document technique à fournir aux salles : matériel requis, implantation scène, besoins son/lumière.",
   contenu:`RIDER TECHNIQUE  -  [NOM D'ARTISTE / GROUPE]

Contact technique : [Nom] | [Email] | [Tel]
Mise à jour : [Date]

━━━ CONFIGURATION SCÈNE ━━━
Formation : [Solo / Duo / Trio / Groupe X personnes]
Durée du set : [XX minutes]

━━━ BESOINS SON ━━━
SYSTÈME : Console numérique de préférence (Yamaha CL / Allen & Heath Avantis / Midas M32)
MICROPHONES :
• 1x micro chant (Shure SM58 ou equivalent)
• [X]x micros instruments (préciser)
DI BOXES : [X]x DI passives
IN-EAR / RETOURS : [préciser préférence]

LISTE DE CANAUX CONSOLE :
1. Chant principal  -  Shure SM58
2. Chant BV  -  [si applicable]
3. Guitare  -  DI ou ampli micro
4. Basse  -  DI
5. Kick
6. Caisse claire
7. Overhead
8. Clavier  -  DI stéréo
[Adapter selon formation]

━━━ BESOINS LUMIÈRE ━━━
• Éclairage général de scène suffisant
• [Effets spécifiques si applicable]
• Contact lumière : [Oui/Non  -  rider lumière disponible sur demande]

━━━ BACKLINE ━━━
Fourni par l'artiste : [liste]
Demandé à la salle : [liste  -  ampli guitare, batterie...]

━━━ LOGES & ACCUEIL ━━━
Nombre de personnes : [X]
Riders hospitality : [eau, repas chaud, boissons  -  à négocier]

━━━ SOUNDCHECK ━━━
Durée souhaitée : [X] minutes
Heure souhaitée : [X]h avant le concert

Merci de confirmer réception et disponibilité du matériel.
[Nom] | [Contact]`},

  {id:"fiche_tech",cat:"live",icon:"📐",titre:"Template Fiche Technique Salle",access:"label",
   resume:"Fiche à remplir pour chaque salle contactée : capacité, équipement, contacts.",
   contenu:`TEMPLATE FICHE TECHNIQUE SALLE

━━━ INFORMATIONS GÉNÉRALES ━━━
Nom de la salle : ________________________________
Adresse : ________________________________
Ville : ________________________________
Capacité (jauge) : _______ personnes
Type : [ ] SMAC  [ ] Club  [ ] Salle privée  [ ] Festival

━━━ CONTACTS ━━━
Directeur / Directrice : ________________________________
Programmateur(trice) : ________________________________
Email programmation : ________________________________
Téléphone : ________________________________
Site web : ________________________________

━━━ ÉQUIPEMENT TECHNIQUE ━━━
Console son : ________________________________
Système de diffusion : ________________________________
Nombre de retours scène : ________
In-ear monitoring disponible : [ ] Oui  [ ] Non
Console lumières : ________________________________
Backline disponible : [ ] Batterie  [ ] Ampli guitare  [ ] Ampli basse  [ ] Autre

━━━ DIMENSIONS SCÈNE ━━━
Largeur : _______ m | Profondeur : _______ m | Hauteur : _______ m

━━━ CONDITIONS BOOKING ━━━
Cachet minimum : _______ € | Cachet maximum : _______ €
Type de contrat habituel : [ ] Cession  [ ] Coréalisation  [ ] Résidence
Délai de réponse habituel : _______
Meilleure période pour postuler : _______

━━━ NOTES ━━━
[Spécificités, conseils, historique de la relation avec la salle]`},
];

// --- LIENS ANNUAIRES EXTERNES -----------------------------------------------
const ANNUAIRES_EXT = [
  {id:"distrokid",   label:"DistroKid",        icon:"🎵", cat:"Distribution", desc:"Distribution streaming mondiale", url:AFF.distrokid,   color:"#1DB954"},
  {id:"tunecore",    label:"TuneCore",          icon:"🎵", cat:"Distribution", desc:"Distribution avec contrôle total des droits", url:AFF.tunecore,    color:"#FF6B35"},
  {id:"groover",     label:"Groover",            icon:"📻", cat:"Promotion",    desc:"Pitcher ta musique à des médias et playlists", url:AFF.groover,     color:"#845EF7"},
  {id:"spotify_art", label:"Spotify for Artists",icon:"🟢", cat:"Promotion",    desc:"Stats, pitch éditorial, profil artiste", url:AFF.spotify,     color:"#1DB954"},
  {id:"bandsintown", label:"Bandsintown",        icon:"📅", cat:"Booking",      desc:"Annonce tes concerts et contacte des bookers", url:AFF.bandsintown, color:"#00C9A7"},
  {id:"sacem_site",  label:"SACEM",              icon:"🎼", cat:"Droits",       desc:"Déposer tes œuvres, percevoir tes droits", url:AFF.sacem,       color:"#845EF7"},
  {id:"scpp_site",   label:"SCPP  -  ISRC",        icon:"🔢", cat:"Droits",       desc:"Obtenir tes codes ISRC", url:"https://www.scpp.fr", color:"#FFD43B"},
  {id:"cnm_site",    label:"CNM",                icon:"🏛️", cat:"Financement",  desc:"Aides à la production, clip, tournée", url:AFF.cnm,         color:"#FF6B35"},
  {id:"adami_site",  label:"ADAMI",              icon:"🎤", cat:"Financement",  desc:"Aides pour artistes-interprètes", url:AFF.adami,       color:"#F03E3E"},
  {id:"spedidam_site",label:"SPEDIDAM",          icon:"🥁", cat:"Financement",  desc:"Aides pour musiciens interprètes", url:AFF.spedidam,    color:"#FFD43B"},
  {id:"irma_site",   label:"IRMA",               icon:"🏠", cat:"Financement",  desc:"Résidences artistiques et ressources", url:AFF.irma,        color:"#C8A96E"},
  {id:"kkbb_site",   label:"KissKissBankBank",   icon:"🤝", cat:"Financement",  desc:"Crowdfunding pour projets musicaux", url:AFF.kkbb,        color:"#F03E3E"},
  {id:"inpi_site",   label:"INPI",               icon:"⚖️", cat:"Juridique",    desc:"Déposer ta marque / nom de label", url:"https://www.inpi.fr", color:"#00C9A7"},
  {id:"urssaf_ae",   label:"URSSAF Auto-Entrepreneur",icon:"📋",cat:"Juridique", desc:"Créer ton statut auto-entrepreneur", url:"https://www.autoentrepreneur.urssaf.fr", color:"#00C9A7"},
  {id:"ifcic_site",  label:"IFCIC",              icon:"🏦", cat:"Financement",  desc:"Garanties bancaires pour le secteur culturel", url:AFF.ifcic,       color:"#74C0FC"},
];

// --- RÉSEAU DATA --------------------------------------------------------------
const ANNONCES_INIT = [
  {id:1,type:"cherche",role:"Chanteuse",genre:"R&B / Soul",ville:"Paris",nom:"Melodia S.",avatar:"🎤",desc:"Chanteuse R&B cherche beatmaker pour EP 6 titres. Style SZA, Summer Walker.",date:"Il y a 2h",tags:["R&B","Soul","EP"],color:"#FF6B35"},
  {id:2,type:"propose",role:"Beatmaker",genre:"Afrobeats / Trap",ville:"Lyon",nom:"BeatsByKing",avatar:"🎛️",desc:"Beatmaker propose collabs gratuites pour artistes sérieux. 50+ instrus dispo.",date:"Il y a 5h",tags:["Afrobeats","Trap","Gratuit"],color:"#845EF7"},
  {id:3,type:"cherche",role:"Guitariste",genre:"Pop / Folk",ville:"Marseille",nom:"Emma B.",avatar:"🎸",desc:"Artiste pop cherche guitariste pour tournée 10 dates cet été. Cachet + frais.",date:"Il y a 1j",tags:["Pop","Tournée","Cachet"],color:"#00C9A7"},
  {id:4,type:"propose",role:"Studio d'enregistrement",genre:"Tous genres",ville:"Paris 10e",nom:"Studio Volta",avatar:"🎙️",desc:"Studio pro tarif réduit pour membres INDY. 80€/h au lieu de 150€. Ingé son inclus.",date:"Il y a 2j",tags:["Studio","Réduction","Paris"],color:"#C8A96E"},
  {id:5,type:"cherche",role:"Ingénieur du son",genre:"Hip-Hop / Afro",ville:"Bordeaux",nom:"Lil Pharao",avatar:"🎚️",desc:"Cherche ingé son pour mix/master d'un album 12 titres. Budget 800€.",date:"Il y a 3j",tags:["Mix","Master","Budget"],color:"#FFD43B"},
  {id:6,type:"propose",role:"Label indépendant",genre:"Tous genres",ville:"Paris",nom:"Wake Up Music",avatar:"🏷️",desc:"Label indépendant cherche artistes à signer. Spécialisé Afro, R&B, Pop.",date:"Il y a 4j",tags:["Label","Signing","Développement"],color:"#F03E3E"},
];

// --- HELPERS -----------------------------------------------------------------
const gp = p => Math.round(Object.values(p).reduce((a,b)=>a+b,0)/Object.values(p).length);
const daysUntil = d => { if(!d) return null; return Math.ceil((new Date(d)-new Date())/86400000); };
const COLORS = ["#FF6B35","#00C9A7","#845EF7","#FFD43B","#F03E3E","#20C997","#74C0FC","#F783AC"];
const AI_SYSTEM = "Tu es un expert musical dans la scène indépendante française. Rédige des textes professionnels, authentiques, percutants. Style direct, vivant, sans clichés. Réponds UNIQUEMENT avec le texte demandé.";

// --- STYLES ------------------------------------------------------------------
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-thumb{background:#1A1A1A;border-radius:2px}
  input,textarea,select{width:100%;background:#111;border:1px solid #1E1E1E;color:#F0EDE8;font-family:'Inter',sans-serif;font-size:12px;padding:11px 13px;border-radius:6px;outline:none;-webkit-appearance:none;transition:border-color 0.2s}
  input:focus,textarea:focus{border-color:#FF6B3555}
  input::placeholder,textarea::placeholder{color:#555}
  input[type=date]{color-scheme:dark}
  textarea{resize:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px #FF6B3515}50%{box-shadow:0 0 35px #FF6B3530}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fu{animation:fadeUp 0.3s ease forwards}
  .fi{animation:fadeIn 0.25s ease forwards}
  .btn{background:linear-gradient(135deg,#FF6B35 0%,#FF8550 100%);border:none;color:#000;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:13px 20px;border-radius:8px;cursor:pointer;font-weight:500;transition:all 0.25s;width:100%;box-shadow:0 4px 14px #FF6B3530}
  .btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px #FF6B3555}
  .btn:disabled{background:#1A1A1A;color:#333;box-shadow:none;transform:none;cursor:not-allowed}
  .btn-o{background:none;border:1px solid #1E1E1E;color:#555;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:11px 18px;border-radius:5px;cursor:pointer;transition:all 0.2s}
  .btn-o:hover{border-color:#333;color:#888}
  .pill{font-size:9px;letter-spacing:1px;padding:2px 8px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;text-transform:uppercase}
  .chip{display:inline-flex;font-size:9px;color:#555;background:#111;padding:2px 8px;border-radius:20px}
  .card{background:linear-gradient(180deg,#0F0F0F 0%,#0B0B0B 100%);border-radius:12px;border:1px solid #1A1A1A;transition:all 0.25s;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
  .card:hover{border-color:#2A2A2A;box-shadow:0 4px 16px rgba(0,0,0,0.5)}
  .panel{position:fixed;inset:0;background:#000000EE;z-index:200;display:flex;flex-direction:column;animation:fadeIn 0.2s ease}
  .pin{background:#080808;flex:1;overflow-y:auto;animation:fadeUp 0.25s ease;border-top:2px solid}
  .tab{flex:1;background:none;border:none;border-bottom:2px solid transparent;color:#444;font-family:'Inter',sans-serif;font-size:9px;letter-spacing:1px;padding:10px 0;cursor:pointer;transition:all 0.2s;text-transform:uppercase}
  .tab.on{color:#FF6B35;border-bottom-color:#FF6B35}
  .nav{display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 0;cursor:pointer;flex:1;background:none;border:none;font-family:'Inter',sans-serif;transition:all 0.2s}
  a.lnk{display:block;text-align:center;padding:12px;border-radius:5px;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;transition:all 0.2s}
`;

// --- LOGO ---------------------------------------------------------------------
function Logo({size=70,anim=false}){
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={anim?{animation:"float 3s ease-in-out infinite"}:{}}>
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35"/><stop offset="100%" stopColor="#F03E3E"/></linearGradient>
        <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#845EF7"/><stop offset="100%" stopColor="#FF6B35"/></linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" stroke="url(#lg1)" strokeWidth="1.5" fill="none" opacity="0.35"/>
      <circle cx="50" cy="50" r="36" fill="#0D0D0D" stroke="#FF6B3322" strokeWidth="1"/>
      <rect x="46" y="27" width="8" height="46" fill="url(#lg1)" rx="2"/>
      <rect x="37" y="27" width="26" height="7" fill="url(#lg1)" rx="2"/>
      <rect x="37" y="66" width="26" height="7" fill="url(#lg1)" rx="2"/>
      <circle cx="69" cy="31" r="5" fill="#FF6B35"/><circle cx="69" cy="31" r="2.5" fill="#FF9F7A"/>
      <path d="M27 41 Q21 50 27 59" stroke="#FF6B35" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M21 36 Q11 50 21 64" stroke="#FF6B35" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3"/>
      <path d="M73 41 Q79 50 73 59" stroke="#845EF7" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M79 36 Q89 50 79 64" stroke="#845EF7" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

// --- HEADER -------------------------------------------------------------------
function Hdr({sub,accent="#FF6B35",right,onBack}){
  return(
    <div style={{padding:"16px 20px 13px",borderBottom:"1px solid #0F0F0F",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
        {onBack&&<button onClick={onBack} style={{background:"none",border:"1px solid #1E1E1E",color:"#888",fontSize:16,width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}>←</button>}
        <div style={{minWidth:0,flex:1}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:4,color:accent}}>INDY</div>
          <div style={{fontSize:9,color:"#888",letterSpacing:2.5,marginTop:1}}>{sub}</div>
        </div>
      </div>
      {right}
    </div>
  );
}

// --- LANDING ------------------------------------------------------------------
function Landing({onEnter}){
  return(
    <div style={{minHeight:"100vh",background:"#060606",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%,#FF6B3508,transparent 50%),radial-gradient(ellipse at 70% 80%,#845EF708,transparent 50%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"15%",left:"8%",width:180,height:180,borderRadius:"50%",background:"#FF6B3506",filter:"blur(40px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"20%",right:"5%",width:150,height:150,borderRadius:"50%",background:"#845EF706",filter:"blur(40px)",pointerEvents:"none"}}/>
      <div style={{padding:"20px 24px",display:"flex",justifyContent:"space-between",position:"relative",zIndex:1}}>
        <div style={{fontSize:9,color:"#888",letterSpacing:3}}>BETA</div>
        <div style={{fontSize:9,color:"#888",letterSpacing:2}}>FR · INDÉ · LIBRE</div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 28px",textAlign:"center",position:"relative",zIndex:1}}>
        <Logo size={130} anim/>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:84,letterSpacing:20,lineHeight:1,marginTop:32,marginBottom:12,background:"linear-gradient(135deg,#F0EDE8 0%,#999 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>INDY</div>
        <div style={{fontSize:11,color:"#FF6B35",letterSpacing:7,marginBottom:26,fontWeight:600}}>TON LABEL EN POCHE</div>
        <div style={{width:40,height:1,background:"#1F1F1F",marginBottom:22}}/>
        <div style={{fontSize:28,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:5,color:"#F0EDE8",marginBottom:14}}>DEVIENS TA MAJOR</div>
        <div style={{fontSize:14,color:"#777",lineHeight:1.6,maxWidth:280,marginBottom:40,fontWeight:400,fontStyle:"italic"}}>Tout devient simple.</div>
        <button className="btn" style={{width:"auto",padding:"18px 56px",fontSize:14,letterSpacing:3,borderRadius:30,boxShadow:"0 0 40px #FF6B3355"}} onClick={onEnter}>SOIS INDY →</button>
        <div style={{fontSize:11,color:"#999",marginTop:18,letterSpacing:1,fontWeight:500}}>3 jours d'essai · Sans carte bancaire</div>
        <div style={{fontSize:10,color:"#777",marginTop:32,letterSpacing:2,fontWeight:400,lineHeight:1.8,maxWidth:260}}>Coach · Booking · Aides · Press Kit · Annuaire · Distribution · Actualités</div>
      </div>
      <div style={{padding:"14px 24px",textAlign:"center",fontSize:9,color:"#111",letterSpacing:2}}>WAKE UP MUSIC × INDY · 2025</div>
    </div>
  );
}

// --- ONBOARDING ---------------------------------------------------------------
function Onboarding({onDone}){
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [genre,setGenre]=useState("");
  const steps=[
    {e:"🎵",t:"BIENVENUE\nCHEZ INDY",s:"Le coach de poche de l'artiste indépendant",c:null},
    {e:"🎤",t:"TON NOM\nD'ARTISTE",s:"Comment tu t'appelles ?",c:<input value={name} onChange={e=>setName(e.target.value)} placeholder="Saya, TiF, Mon Artiste..." style={{fontSize:15,padding:16,textAlign:"center"}}/>},
    {e:"🎛️",t:"TON GENRE\nMUSICAL",s:"Afro Pop, R&B, Trap FR...",c:<input value={genre} onChange={e=>setGenre(e.target.value)} placeholder="Afro Pop, R&B FR, Drill..." style={{fontSize:15,padding:16,textAlign:"center"}}/>},
    {e:"🚀",t:"TOUT EST\nPRÊT",s:`Bienvenue ${name||"artiste"}  -  c'est parti.`,c:null},
  ];
  const s=steps[step];
  const ok=step===0||step===3||(step===1&&name.trim())||(step===2&&genre.trim());
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",gap:4,padding:"20px 24px 0"}}>
        {steps.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=step?"#FF6B35":"#111",transition:"background 0.3s"}}/>)}
      </div>
      <div className="fu" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",gap:24}}>
        <div style={{fontSize:52}}>{s.e}</div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,letterSpacing:4,lineHeight:1.1,whiteSpace:"pre-line"}}>{s.t}</div>
          <div style={{fontSize:12,color:"#555",marginTop:10,lineHeight:1.6}}>{s.s}</div>
        </div>
        {s.c&&<div style={{width:"100%"}}>{s.c}</div>}
      </div>
      <div style={{padding:"0 24px 40px",display:"flex",flexDirection:"column",gap:10}}>
        <button className="btn" disabled={!ok} onClick={()=>step<steps.length-1?setStep(step+1):onDone({name,genre})}>{step===steps.length-1?"Sois INDY →":"Continuer →"}</button>
        {step>0&&<button className="btn-o" style={{width:"100%"}} onClick={()=>setStep(step-1)}>← Retour</button>}
      </div>
    </div>
  );
}

// --- PAYWALL -----------------------------------------------------------------
function Paywall({onSelect,current}){
  const [loading,setLoading]=useState(null);
  const [showTest,setShowTest]=useState(false);
  const choose=async(plan)=>{
    if(plan.id==="free"){onSelect("free");return;}
    setLoading(plan.id);await new Promise(r=>setTimeout(r,1600));setLoading(null);onSelect(plan.id);
  };
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif"}}>
      <div style={{padding:"36px 24px 24px",textAlign:"center",borderBottom:"1px solid #111",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,#FF6B3510,transparent 65%)",pointerEvents:"none"}}/>
        <Logo size={60} anim/>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:46,letterSpacing:8,lineHeight:1,marginTop:14,color:"#FF6B35"}}>INDY</div>
        <div style={{fontSize:9,color:"#555",letterSpacing:3,marginTop:4,marginBottom:14}}>SOIS INDY</div>
        <div style={{fontSize:12,color:"#666",lineHeight:1.7,maxWidth:280,margin:"0 auto"}}>Le coach de poche de l'artiste indépendant. De la création à la scène.</div>
      </div>
      <div style={{padding:"18px 18px 100px",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"#0D0D0D",border:"1px solid #FFD43B22",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:14}}>🧪</span>
          <div><div style={{fontSize:9,color:"#FFD43B",letterSpacing:2}}>MODE TEST</div><div style={{fontSize:10,color:"#999"}}>Simulation · Aucun vrai paiement</div></div>
          <button onClick={()=>setShowTest(!showTest)} style={{marginLeft:"auto",background:"none",border:"1px solid #333",color:"#555",fontFamily:"'Inter',sans-serif",fontSize:9,padding:"4px 8px",borderRadius:4,cursor:"pointer"}}>{showTest?"MASQUER":"CB TEST"}</button>
        </div>
        {showTest&&<div className="fi" style={{background:"#0A1A0A",border:"1px solid #00C9A722",borderRadius:8,padding:"12px 14px",fontSize:11,color:"#00C9A7",lineHeight:1.8}}><div style={{fontSize:9,letterSpacing:2,marginBottom:6}}>CARTE DE TEST STRIPE</div>N° : <strong>4242 4242 4242 4242</strong><br/>Date : <strong>12/26</strong> · CVC : <strong>123</strong></div>}
        {PLANS.map((plan,i)=>(
          <div key={plan.id} className={`card fu`} style={{padding:20,animationDelay:`${i*0.07}s`,borderColor:plan.id===current?`${plan.color}55`:plan.id==="artiste"?"#FF6B3522":"#141414",animation:plan.id==="artiste"?"glow 3s ease-in-out infinite":undefined,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:plan.color,opacity:plan.id==="artiste"?1:0.3}}/>
            {plan.badge&&<span className="pill" style={{position:"absolute",top:12,right:14,background:"#FF6B3518",color:"#FF6B35",border:"1px solid #FF6B3333"}}>{plan.badge}</span>}
            {plan.id===current&&<span className="pill" style={{position:"absolute",top:12,right:14,background:"#00C9A718",color:"#00C9A7",border:"1px solid #00C9A733"}}>ACTUEL</span>}
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:3,color:plan.color,marginBottom:4}}>{plan.name}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:6}}>
              <span style={{fontSize:26,fontFamily:"'Bebas Neue',sans-serif"}}>{plan.price}</span>
              <span style={{fontSize:11,color:"#999"}}>{plan.period}</span>
              {plan.priceFutur&&<span style={{fontSize:10,color:"#888",textDecoration:"line-through",marginLeft:6}}>puis {plan.priceFutur}</span>}
            </div>
            {plan.priceFutur&&<div style={{fontSize:10,color:"#555",marginBottom:10,fontWeight:500}}>Tarif fondateur à vie · 3 jours gratuits</div>}
            {plan.labelInfo&&<div style={{background:`${plan.color}15`,border:`1px solid ${plan.color}33`,borderRadius:6,padding:"6px 10px",marginBottom:10,fontSize:10,color:plan.color,fontWeight:600}}>{plan.labelInfo}</div>}
            {plan.features.map((f,fi)=><div key={fi} style={{display:"flex",gap:8,fontSize:11,color:"#888",padding:"4px 0"}}><span style={{color:plan.color,flexShrink:0}}>✓</span>{f}</div>)}
            {plan.locked?.map((f,fi)=><div key={fi} style={{display:"flex",gap:8,fontSize:11,color:"#222",padding:"4px 0",textDecoration:"line-through"}}><span style={{flexShrink:0}}>✗</span>{f}</div>)}
            <button className="btn" disabled={loading!==null||plan.id===current} style={{marginTop:14,background:plan.id===current?"#1A1A1A":plan.color,color:plan.id===current?"#333":"#000"}} onClick={()=>choose(plan)}>
              {loading===plan.id?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{width:11,height:11,border:"2px solid #00000044",borderTopColor:"#000",borderRadius:"50%",display:"inline-block",animation:"spin 0.8s linear infinite"}}/> Traitement...</span>:plan.id===current?"✓ Plan actuel":plan.cta}
            </button>
          </div>
        ))}
        <div style={{fontSize:10,color:"#1A1A1A",textAlign:"center",letterSpacing:1}}>Résiliation possible à tout moment · Paiement sécurisé Stripe</div>
      </div>
    </div>
  );
}

// --- DASHBOARD ---------------------------------------------------------------
function Dashboard({projects,setProjects,goCoach,goPlan,plan,user}){
  const [edit,setEdit]=useState(null);const [isNew,setIsNew]=useState(false);
  const urgent=projects.filter(p=>{const d=daysUntil(p.sortie);return d!==null&&d<=14&&d>=0;});
  const total=projects.length?Math.round(projects.reduce((a,p)=>a+gp(p.progress),0)/projects.length):0;
  const maxP=plan==="free"?2:Infinity;
  const save=(u)=>{if(isNew)setProjects(ps=>[...ps,{...u,id:Date.now(),checks:{}}]);else setProjects(ps=>ps.map(p=>p.id===u.id?u:p));setEdit(null);setIsNew(false);};
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub={user?.name?`BONJOUR ${user.name.toUpperCase()}`:"TABLEAU DE BORD"} right={<div style={{textAlign:"right"}}><div style={{fontSize:22,fontFamily:"'Bebas Neue',sans-serif"}}>{total}<span style={{color:"#222",fontSize:12}}>%</span></div><div style={{fontSize:9,color:"#555",letterSpacing:1}}>GLOBAL</div></div>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:"1px solid #111"}}>
        {[{l:"Titres",v:projects.length},{l:"En cours",v:projects.filter(p=>{const g=gp(p.progress);return g>0&&g<100;}).length},{l:"Prêts",v:projects.filter(p=>gp(p.progress)===100).length},{l:"Urgents",v:urgent.length,red:true}].map((s,i)=>(
          <div key={i} style={{padding:"11px 0",textAlign:"center",borderRight:i<3?"1px solid #111":"none"}}>
            <div style={{fontSize:19,fontFamily:"'Bebas Neue',sans-serif",color:s.red&&s.v>0?"#F03E3E":"#F0EDE8"}}>{s.v}</div>
            <div style={{fontSize:9,color:"#555",letterSpacing:1}}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      {urgent.length>0&&<div style={{margin:"14px 18px 0",background:"#0E0808",border:"1px solid #F03E3E22",borderRadius:8,padding:"11px 14px"}}><div style={{fontSize:9,color:"#F03E3E",letterSpacing:2,marginBottom:7}}>⚡ SORTIES IMMINENTES</div>{urgent.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#666",padding:"3px 0"}}><span>{p.titre} <span style={{color:"#888"}}>· {p.artiste}</span></span><span style={{color:"#F03E3E"}}>J-{daysUntil(p.sortie)}</span></div>)}</div>}
      <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
        {projects.map((p,i)=>{
          const g=gp(p.progress);const d=daysUntil(p.sortie);const st=STAGES.find(s=>s.id===p.stage);
          return(
            <div key={p.id} className="fu" style={{animationDelay:`${i*0.04}s`,background:"#0D0D0D",borderRadius:10,padding:15,cursor:"pointer",border:`1px solid ${p.color}15`,position:"relative",overflow:"hidden"}} onClick={()=>goCoach(p.id)}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:p.color,opacity:0.5}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div><div style={{fontSize:14,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{p.titre}</div><div style={{fontSize:10,color:"#999",marginTop:1}}>{p.artiste} · {p.genre}</div></div>
                <div style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",color:g===100?"#00C9A7":p.color}}>{g}%</div>
              </div>
              <div style={{display:"flex",gap:4,marginBottom:6}}>{STAGES.map(s=><div key={s.id} style={{flex:1,height:7,borderRadius:3,background:p.progress[s.id]===100?s.color:p.progress[s.id]>0?`${s.color}88`:"#181818",transition:"all 0.3s",boxShadow:p.progress[s.id]>0?`0 0 6px ${s.color}44`:"none"}}/>)}</div>
              <div style={{display:"flex",gap:2,marginBottom:10}}>{STAGES.map(s=><div key={s.id} style={{flex:1,textAlign:"center",fontSize:9,color:p.progress[s.id]===100?s.color:p.progress[s.id]>0?`${s.color}AA`:"#333",fontWeight:600,letterSpacing:0.5}}>{s.icon}</div>)}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span className="pill" style={{background:`${st?.color}15`,color:st?.color}}>{st?.icon} {st?.label.toUpperCase()}</span>
                {d!==null&&<span style={{fontSize:10,color:d<=7?"#F03E3E":d<=21?"#FFD43B":"#333"}}>{d>0?`J-${d}`:d===0?"AUJOURD'HUI":"SORTI"}</span>}
              </div>
              {p.urgent&&<div style={{marginTop:9,fontSize:10,color:"#777",background:"#0A0A0A",borderRadius:4,padding:"6px 10px",borderLeft:`2px solid ${p.color}`}}>⚡ {p.urgent}</div>}
              <button onClick={e=>{e.stopPropagation();setEdit(p);setIsNew(false);}} style={{background:"none",border:"none",color:"#555",fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:1,cursor:"pointer",marginTop:8,padding:0}}>ÉDITER →</button>
            </div>
          );
        })}
        {projects.length<maxP?(
          <button onClick={()=>{setEdit({titre:"",artiste:user?.name||"",genre:user?.genre||"",stage:"creation",sortie:"",urgent:"",color:"#FF6B35",progress:{creation:0,protection:0,distribution:0,promotion:0,financement:0,live:0}});setIsNew(true);}} style={{background:"none",border:"1.5px dashed #1A1A1A",color:"#555",fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",padding:18,borderRadius:10,cursor:"pointer",transition:"all 0.2s",width:"100%"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#FF6B35";e.currentTarget.style.color="#FF6B35";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#1A1A1A";e.currentTarget.style.color="#2A2A2A";}}>+ Ajouter un titre</button>
        ):(
          <div style={{background:"#0D0D0D",border:"1px solid #FF6B3522",borderRadius:10,padding:18,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#FF6B35",marginBottom:6}}>🔒 Limite gratuite atteinte</div>
            <div style={{fontSize:10,color:"#999",marginBottom:12}}>Passe à INDY Artiste pour des titres illimités</div>
            <button className="btn" style={{width:"auto",padding:"10px 20px"}} onClick={goPlan}>Débloquer →</button>
          </div>
        )}
      </div>
      {edit&&<EditPanel project={edit} isNew={isNew} onClose={()=>{setEdit(null);setIsNew(false);}} onSave={save} onDelete={id=>{setProjects(ps=>ps.filter(p=>p.id!==id));setEdit(null);}}/>}
    </div>
  );
}
function EditPanel({project,isNew,onClose,onSave,onDelete}){
  const [d,setD]=useState({...project});const u=(k,v)=>setD(p=>({...p,[k]:v}));
  return(
    <div className="panel"><div className="pin" style={{borderTopColor:d.color}}>
      <div style={{padding:"16px 20px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:d.color,letterSpacing:2}}>{isNew?"NOUVEAU TITRE":"ÉDITION"}</div><div style={{fontSize:16,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{d.titre||"..."}</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{padding:"18px 20px 40px",display:"flex",flexDirection:"column",gap:12,fontFamily:"'Inter',sans-serif"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:"#888",letterSpacing:1.5,display:"block",marginBottom:7,fontWeight:600}}>TITRE *</label><input value={d.titre} onChange={e=>u("titre",e.target.value)} placeholder="Nom du son"/></div>
          <div><label style={{fontSize:11,color:"#888",letterSpacing:1.5,display:"block",marginBottom:7,fontWeight:600}}>ARTISTE</label><input value={d.artiste} onChange={e=>u("artiste",e.target.value)} placeholder="Nom d'artiste"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,color:"#888",letterSpacing:1.5,display:"block",marginBottom:7,fontWeight:600}}>GENRE</label><input value={d.genre} onChange={e=>u("genre",e.target.value)} placeholder="Afro Pop..."/></div>
          <div><label style={{fontSize:11,color:"#888",letterSpacing:1.5,display:"block",marginBottom:7,fontWeight:600}}>DATE SORTIE</label><input type="date" value={d.sortie} onChange={e=>u("sortie",e.target.value)}/></div>
        </div>
        <div><label style={{fontSize:11,color:"#888",letterSpacing:1.5,display:"block",marginBottom:7,fontWeight:600}}>ACTION URGENTE</label><input value={d.urgent} onChange={e=>u("urgent",e.target.value)} placeholder="Prochaine priorité..."/></div>
        <div><label style={{fontSize:11,color:"#AAA",letterSpacing:1,fontWeight:600,display:"block",marginBottom:8}}>COULEUR</label><div style={{display:"flex",gap:8}}>{COLORS.map(c=><div key={c} onClick={()=>u("color",c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:d.color===c?"2px solid #FFF":"2px solid transparent",transform:d.color===c?"scale(1.25)":"scale(1)",transition:"transform 0.15s"}}/>)}</div></div>
        <div><label style={{fontSize:11,color:"#AAA",letterSpacing:1,fontWeight:600,display:"block",marginBottom:8}}>ÉTAPE EN COURS</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{STAGES.map(s=><button key={s.id} onClick={()=>u("stage",s.id)} style={{background:d.stage===s.id?`${s.color}18`:"#0F0F0F",border:`1px solid ${d.stage===s.id?s.color:"#1A1A1A"}`,color:d.stage===s.id?s.color:"#555",fontFamily:"'Inter',sans-serif",fontSize:10,padding:"6px 11px",borderRadius:20,cursor:"pointer"}}>{s.icon} {s.label}</button>)}</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:6}}>
          <button className="btn" disabled={!d.titre} onClick={()=>onSave(d)} style={{background:d.color}}>{isNew?"Créer le titre":"Enregistrer"}</button>
          {!isNew&&<button className="btn-o" style={{width:"100%",color:"#F03E3E44",borderColor:"#F03E3E22"}} onClick={()=>{if(window.confirm("Supprimer ?"))onDelete(project.id);}}>Supprimer</button>}
          <button className="btn-o" style={{width:"100%"}} onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div></div>
  );
}

// --- COACH --------------------------------------------------------------------
function Coach({projects,setProjects,activeId,setActiveId,plan,goBack}){
  const [si,setSi]=useState(0);const [tip,setTip]=useState(null);
  const proj=projects.find(p=>p.id===activeId)||projects[0];
  if(!proj)return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:"#999",fontFamily:"'Inter',sans-serif",flexDirection:"column",gap:16,background:"#080808"}}><div style={{fontSize:32}}>🎵</div><div style={{fontSize:12}}>Aucun titre en cours.</div></div>;
  const stage=STAGES[si];const tasks=TASKS[stage.id]||[];const checks=proj.checks||{};
  const done=tasks.filter(t=>checks[t.id]).length;const pct=tasks.length?done/tasks.length:0;
  const toggle=(tid)=>{const nc={...checks,[tid]:!checks[tid]};const np={};STAGES.forEach(s=>{const ts=TASKS[s.id]||[];np[s.id]=ts.length?Math.round(ts.filter(t=>nc[t.id]).length/ts.length*100):0;});setProjects(ps=>ps.map(p=>p.id===proj.id?{...p,checks:nc,progress:np}:p));};
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="COACH PARCOURS" onBack={goBack} right={<select value={proj.id} onChange={e=>setActiveId(Number(e.target.value))} style={{background:"#111",border:"1px solid #1A1A1A",color:"#888",fontSize:11,padding:"6px 10px",borderRadius:6,width:"auto"}}>{projects.map(p=><option key={p.id} value={p.id}>{p.titre}</option>)}</select>}/>
      <div style={{padding:"10px 18px",borderBottom:"1px solid #111",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:proj.color}}/><span style={{fontSize:11,color:"#888"}}>{proj.titre}</span><span style={{fontSize:10,color:"#888"}}>· {proj.artiste}</span>
        {proj.urgent&&<span className="pill" style={{background:`${proj.color}15`,color:proj.color,marginLeft:"auto"}}>⚡ {proj.urgent}</span>}
      </div>
      <div style={{display:"flex",overflowX:"auto",padding:"10px 14px",gap:6,borderBottom:"1px solid #0F0F0F",scrollbarWidth:"none"}}>
        {STAGES.map((s,i)=>{const ts=TASKS[s.id]||[];const act=i===si;return(
          <button key={s.id} onClick={()=>{setSi(i);setTip(null);}} style={{background:act?`${s.color}15`:"none",border:`1px solid ${act?s.color:"#1A1A1A"}`,color:act?s.color:"#999",fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:1,padding:"7px 12px",borderRadius:20,cursor:"pointer",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:14}}>{s.icon}</span><span>{s.label.toUpperCase()}</span>
            <div style={{display:"flex",gap:2}}>{ts.map((t,ti)=><div key={ti} style={{width:4,height:4,borderRadius:"50%",background:checks[t.id]?s.color:"#222"}}/>)}</div>
          </button>
        );})}
      </div>
      <div style={{padding:"18px 18px 0"}}>
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:38,color:stage.color,opacity:0.2}}>0{si+1}</span><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3}}>{stage.label.toUpperCase()}</span></div>
          <div style={{height:2,background:"#111",borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",width:`${pct*100}%`,background:stage.color,transition:"width 0.4s ease"}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{fontSize:10,color:"#888"}}>Progression</span><span style={{fontSize:10,color:stage.color}}>{done}/{tasks.length}</span></div>
        </div>
        <div style={{background:"#0C0C0C",border:`1px solid ${stage.color}15`,borderRadius:7,padding:"11px 14px",marginBottom:18}}>
          <div style={{fontSize:9,color:stage.color,letterSpacing:2,marginBottom:5}}>◆ COACH</div>
          <div style={{fontSize:12,color:"#666",lineHeight:1.7}}>
            {pct===0&&"Coche les éléments déjà validés pour évaluer où tu en es."}{pct>0&&pct<0.5&&"Bon début  -  chaque point coché réduit les risques."}{pct>=0.5&&pct<1&&"Presque prêt. Quelques points restants."}{pct===1&&<span style={{color:stage.color}}>✓ Étape complète. Passe à la suivante.</span>}
          </div>
        </div>
        <div style={{background:"#0D0D0D",borderRadius:8,padding:"0 14px"}}>
          {tasks.map(task=>{const chk=!!checks[task.id];const showTip=tip===task.id;return(
            <div key={task.id}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 0",borderBottom:"1px solid #111",cursor:"pointer"}} onClick={()=>toggle(task.id)}>
                <div style={{width:19,height:19,borderRadius:4,border:`1.5px solid ${chk?stage.color:"#222"}`,background:chk?stage.color:"none",color:"#000",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,transition:"all 0.2s"}}>{chk&&"✓"}</div>
                <div style={{flex:1,fontSize:12,color:chk?"#444":"#CCC",textDecoration:chk?"line-through":"none",lineHeight:1.5}}>{task.text}</div>
                <button onClick={e=>{e.stopPropagation();setTip(showTip?null:task.id);}} style={{background:"none",border:`1px solid ${showTip?stage.color:"#1E1E1E"}`,color:showTip?stage.color:"#888",fontFamily:"'Inter',sans-serif",fontSize:9,padding:"2px 8px",borderRadius:20,cursor:"pointer",flexShrink:0}}>{showTip?"✕":"tip"}</button>
              </div>
              {showTip&&<div style={{background:"#111",borderLeft:`2px solid ${stage.color}`,padding:"9px 13px",marginTop:6,borderRadius:"0 5px 5px 0",fontSize:11,color:"#888",lineHeight:1.6,animation:"fadeIn 0.2s ease"}}>💡 {task.tip}</div>}
            </div>
          );})}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:22,gap:10}}>
          {si>0&&<button className="btn-o" onClick={()=>{setSi(si-1);setTip(null);}}>← Retour</button>}
          {si<STAGES.length-1&&<button className="btn-o" style={{marginLeft:"auto",borderColor:stage.color,color:stage.color}} onClick={()=>{setSi(si+1);setTip(null);}}>Suivant →</button>}
        </div>
      </div>
    </div>
  );
}

// --- PRESS KIT ----------------------------------------------------------------
// --- GATE  -  Bridage essai gratuit ---------------------------------------------
function Gate({onUpgrade,label,features}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 28px 80px",textAlign:"center",gap:18}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"#FF6B3515",border:"2px solid #FF6B3533",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🔒</div>
      <div>
        <div style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,marginBottom:8}}>FONCTIONNALITÉ ABONNÉE</div>
        <div style={{fontSize:12,color:"#555",lineHeight:1.7}}>{label}</div>
      </div>
      <div style={{background:"#0D0D0D",border:"1px solid #FF6B3522",borderRadius:10,padding:"14px 16px",width:"100%",textAlign:"left"}}>
        <div style={{fontSize:9,color:"#FF6B35",letterSpacing:2,marginBottom:10}}>CE QUE TU DÉBLOQUES</div>
        {(features||["Press Kit IA illimité","Email booking IA","Contacts salles directs","12+ documents téléchargeables","Matching subventions complet","💬 Chatbot IA coach personnel"]).map((f,i)=>(
          <div key={i} style={{display:"flex",gap:8,fontSize:11,color:"#888",padding:"4px 0"}}>
            <span style={{color:"#FF6B35",flexShrink:0}}>✓</span>{f}
          </div>
        ))}
      </div>
      <button className="btn" style={{maxWidth:320}} onClick={onUpgrade}>S'abonner dès 9,90€/mois →</button>
      <div style={{fontSize:10,color:"#888",letterSpacing:1}}>3 jours d'essai · Sans engagement · Résiliation en 1 clic</div>
    </div>
  );
}

// --- PRESS KIT ----------------------------------------------------------------
function PressKit({projects,plan,goPlan}){
  const FMTS=[{id:"court",l:"Bio courte",i:"⚡",d:"~100 mots"},{id:"long",l:"Bio longue",i:"📰",d:"~300 mots"},{id:"email",l:"Email booking",i:"📩",d:"Prêt à envoyer"},{id:"spotify",l:"Pitch Spotify",i:"🎧",d:"Éditorial"}];
  const [data,setData]=useState({});const [fmt,setFmt]=useState("court");const [phase,setPhase]=useState("form");const [result,setResult]=useState("");const [copied,setCopied]=useState(false);const [left,setLeft]=useState(plan==="free"?0:99);
  const sf=FMTS.find(f=>f.id===fmt);
  if(plan==="free"){
    return(
      <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
        <Hdr sub="PRESS KIT GENERATOR" onBack={goBack}/>
        <Gate onUpgrade={goPlan} label="Génère bio, email booking et pitch Spotify en quelques secondes avec l'IA."/>
      </div>
    );
  }
  const gen=async()=>{
    if(plan==="free"){goPlan();return;}
    if(left<=0){goPlan();return;}setPhase("loading");
    const d=data;const P={court:`Bio courte ~100 mots, accrocheur, réseaux. FR.\nArtiste:${d.nom}\nGenre:${d.genre}\nVille:${d.ville||"France"}\nInfluences:${d.influences||""}\nProjet:${d.titre||""}\nPoints forts:${d.acc||""}`,long:`Bio longue ~300 mots, journalistique, médias/booking. FR.\nArtiste:${d.nom}\nGenre:${d.genre}\nInfluences:${d.influences||""}\nProjet:${d.titre||""}\nPoints forts:${d.acc||""}`,email:`Email booking 150-200 mots, direct, pro. FR.\nArtiste:${d.nom}\nGenre:${d.genre}\nPoints forts:${d.acc||""}\nContact:${d.contact||""}`,spotify:`Pitch Spotify éditorial ~150 mots. FR.\nArtiste:${d.nom}\nGenre:${d.genre}\nProjet:${d.titre||""}\nPoints forts:${d.acc||""}`};
    try{const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1000,system:AI_SYSTEM,messages:[{role:"user",content:P[fmt]}]})});const json=await res.json();setResult(json.content?.map(b=>b.text||"").join("")||"Erreur.");setLeft(l=>l-1);}catch{setResult("Erreur de connexion.");}setPhase("result");
  };
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="PRESS KIT GENERATOR" onBack={goBack} right={plan==="free"&&<div className="pill" style={{background:"#111",border:"1px solid #222",color:left>0?"#FFD43B":"#F03E3E"}}>{left>0?`${left} restant`:"Limite"}</div>}/>
      {phase==="form"&&(
        <div style={{padding:"18px 18px 0"}}>
          {projects.length>0&&<div style={{marginBottom:16}}><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:8}}>REMPLIR DEPUIS UN TITRE</div><div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>{projects.map(p=><button key={p.id} onClick={()=>setData({nom:p.artiste,genre:p.genre,titre:p.titre})} style={{background:"#0D0D0D",border:`1px solid ${p.color}33`,color:"#777",fontFamily:"'Inter',sans-serif",fontSize:10,padding:"5px 11px",borderRadius:20,cursor:"pointer",flexShrink:0}}>{p.artiste}</button>)}</div></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {FMTS.map(f=><button key={f.id} onClick={()=>setFmt(f.id)} style={{background:fmt===f.id?"#150E08":"#0D0D0D",border:`1px solid ${fmt===f.id?"#FF6B35":"#1A1A1A"}`,color:fmt===f.id?"#FF6B35":"#666",fontFamily:"'Inter',sans-serif",padding:"12px",borderRadius:8,cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:18,marginBottom:4}}>{f.i}</div><div style={{fontSize:11}}>{f.l}</div><div style={{fontSize:9,color:fmt===f.id?"#FF6B3566":"#2A2A2A",marginTop:2}}>{f.d}</div>
            </button>)}
          </div>
          {[{k:"nom",l:"NOM D'ARTISTE *",p:"Saya..."},{k:"genre",l:"GENRE *",p:"Afro Pop..."},{k:"ville",l:"VILLE",p:"Paris, France"},{k:"influences",l:"3 INFLUENCES",p:"Aya Nakamura, Burna Boy..."},{k:"titre",l:"DERNIER PROJET",p:"Analyse Dérapée (2025)"},{k:"acc",l:"POINTS FORTS",p:"50K streams, Skyrock..."},{k:"contact",l:"EMAIL CONTACT",p:"booking@label.com"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}><label style={{fontSize:11,color:"#888",letterSpacing:1.5,display:"block",marginBottom:7,fontWeight:600}}>{f.l}</label><input value={data[f.k]||""} onChange={e=>setData(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}/></div>
          ))}
          <div style={{marginTop:16,paddingBottom:20}}><button className="btn" disabled={!data.nom?.trim()||!data.genre?.trim()||(plan==="free"&&left<=0)} onClick={gen}>✦ Générer  -  {sf?.l}</button></div>
        </div>
      )}
      {phase==="loading"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:16}}><div style={{fontSize:28}}>{sf?.i}</div><div style={{fontSize:13,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#FF6B35"}}>RÉDACTION EN COURS</div><div style={{display:"flex",gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#FF6B35",animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div>}
      {phase==="result"&&(
        <div style={{padding:"18px 18px 20px"}}>
          <div style={{background:"#0D0D0D",border:"1px solid #FF6B3522",borderRadius:8,padding:"11px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>{sf?.i}</span><div><div style={{fontSize:11,color:"#FF6B35"}}>{sf?.l}</div><div style={{fontSize:10,color:"#888"}}>{data.nom}</div></div><span style={{marginLeft:"auto",fontSize:10,color:"#888"}}>{result.split(/\s+/).filter(Boolean).length} mots</span></div>
          <div style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:8,padding:18,fontSize:12,lineHeight:1.9,color:"#BBB",whiteSpace:"pre-wrap"}}>{result}</div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button style={{flex:1,background:"none",border:`1px solid ${copied?"#00C9A7":"#FF6B3544"}`,color:copied?"#00C9A7":"#FF6B35",fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:2,padding:12,borderRadius:5,cursor:"pointer"}} onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>{copied?"✓ Copié !":"Copier"}</button>
            <button className="btn-o" onClick={()=>setPhase("form")}>Modifier</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- BOOKING -----------------------------------------------------------------
function Booking({plan,goPlan}){
  const [tab,setTab]=useState("salles");const [sel,setSel]=useState(null);const [emailSalle,setEmailSalle]=useState(null);const [search,setSearch]=useState("");const [filters,setFilters]=useState({smac:false,sub:false,res:false,regions:[],genres:[]});
  const tf=(k,v)=>typeof v==="boolean"?setFilters(f=>({...f,[k]:!f[k]})):setFilters(f=>({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]}));
  const filtered=SALLES.filter(s=>{const q=search.toLowerCase();if(q&&!s.nom.toLowerCase().includes(q)&&!s.ville.toLowerCase().includes(q)&&!s.genres.some(g=>g.includes(q)))return false;if(filters.smac&&!s.smac)return false;if(filters.sub&&!s.subv)return false;if(filters.res&&!s.res)return false;if(filters.regions.length&&!filters.regions.includes(s.region))return false;if(filters.genres.length&&!filters.genres.some(g=>s.genres.includes(g)))return false;return true;});
  if(plan==="free")return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="MODULE BOOKING" accent="#20C997" onBack={goBack}/>
      <div style={{padding:"40px 24px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{fontSize:44}}>🎤</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3}}>MODULE BOOKING</div>
        <div style={{fontSize:12,color:"#666",lineHeight:1.8,maxWidth:280}}>Trouve des salles, postule aux opportunités, génère tes emails de booking avec l'IA.</div>
        <div style={{background:"#0D0D0D",border:"1px solid #20C99722",borderRadius:10,padding:"16px 20px",width:"100%",textAlign:"left"}}>
          <div style={{fontSize:9,color:"#20C997",letterSpacing:2,marginBottom:10}}>INCLUS DANS ARTISTE</div>
          {["23 salles avec contacts directs","Opportunités en temps réel","Email booking IA personnalisé","Guide contrats SMAC & résidences","Filtres par genre, région, cachet"].map((f,i)=><div key={i} style={{fontSize:11,color:"#888",padding:"5px 0",borderBottom:i<4?"1px solid #111":"none",display:"flex",gap:8}}><span style={{color:"#20C997"}}>✓</span>{f}</div>)}
        </div>
        <button className="btn" style={{background:"#20C997",color:"#000"}} onClick={goPlan}>Débloquer le Booking →</button>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="MODULE BOOKING" accent="#20C997" onBack={goBack}/>
      <div style={{display:"flex",borderBottom:"1px solid #111"}}>
        <button className={`tab ${tab==="salles"?"on":""}`} onClick={()=>setTab("salles")}>🏛️ Salles ({SALLES.length})</button>
        <button className={`tab ${tab==="oppos"?"on":""}`} onClick={()=>setTab("oppos")}>⚡ Opportunités ({OPPOS.length})</button>
        <button className={`tab ${tab==="guide"?"on":""}`} onClick={()=>setTab("guide")}>📋 Guide</button>
      </div>
      {tab==="salles"&&(
        <div>
          <div style={{padding:"12px 18px 0"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher salle, ville, genre..."/></div>
          <div style={{padding:"8px 18px 0",display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",flexWrap:"wrap"}}>
            {[{k:"smac",l:"SMAC"},{k:"sub",l:"Subventionné"},{k:"res",l:"Résidence"}].map(f=><button key={f.k} onClick={()=>tf(f.k,true)} style={{background:filters[f.k]?"#20C99715":"none",border:`1px solid ${filters[f.k]?"#20C997":"#1A1A1A"}`,color:filters[f.k]?"#20C997":"#444",fontFamily:"'Inter',sans-serif",fontSize:9,padding:"4px 10px",borderRadius:20,cursor:"pointer",flexShrink:0,textTransform:"uppercase"}}>{f.l}</button>)}
            {["idf","paca","aura","occitanie","bretagne","nord","bordeaux","alsace"].map(r=><button key={r} onClick={()=>tf("regions",r)} style={{background:filters.regions.includes(r)?"#20C99715":"none",border:`1px solid ${filters.regions.includes(r)?"#20C997":"#1A1A1A"}`,color:filters.regions.includes(r)?"#20C997":"#444",fontFamily:"'Inter',sans-serif",fontSize:9,padding:"4px 10px",borderRadius:20,cursor:"pointer",flexShrink:0,textTransform:"uppercase"}}>{r.toUpperCase()}</button>)}
            {["afro","hip-hop","rnb","electro","pop","rock","world"].map(g=><button key={g} onClick={()=>tf("genres",g)} style={{background:filters.genres.includes(g)?"#20C99715":"none",border:`1px solid ${filters.genres.includes(g)?"#20C997":"#1A1A1A"}`,color:filters.genres.includes(g)?"#20C997":"#444",fontFamily:"'Inter',sans-serif",fontSize:9,padding:"4px 10px",borderRadius:20,cursor:"pointer",flexShrink:0}}>{g}</button>)}
          </div>
          <div style={{padding:"10px 18px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:10,color:"#888",letterSpacing:1.5,fontWeight:600}}>{filtered.length} SALLE{filtered.length>1?"S":""}</div>
            {filtered.map((s,i)=>(
              <div key={s.id} className="card fu" style={{padding:0,overflow:"hidden",cursor:"pointer",animationDelay:`${i*0.03}s`}} onClick={()=>setSel(s)}>
                <div style={{height:2,background:s.color}}/>
                <div style={{padding:"13px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                    <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:2}}>{s.nom}</div><div style={{fontSize:10,color:"#999",marginTop:1}}>{s.ville} · {s.jauge} pers.</div></div>
                    <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
                      {s.smac&&<span className="pill" style={{background:"#20C99715",color:"#20C997"}}>SMAC</span>}
                      {s.subv&&<span className="pill" style={{background:"#FFD43B15",color:"#FFD43B"}}>SUBV.</span>}
                      {s.res&&<span className="pill" style={{background:"#845EF715",color:"#845EF7"}}>RÉSID.</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>{s.genres.slice(0,4).map(g=><span key={g} className="chip">{g}</span>)}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:10,color:"#555"}}>Cachet : <span style={{color:"#888"}}>{s.cachet_min}-{s.cachet_max}€</span></span><span style={{fontSize:9,color:"#999"}}>{s.delai}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="oppos"&&(
        <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
          {OPPOS.map((o,i)=>{
            const d=Math.ceil((new Date(o.deadline)-new Date())/86400000);
            const types={premiere_partie:"1ÈRE PARTIE",residence:"RÉSIDENCE",concert:"CONCERT",tremplin:"TREMPLIN"};
            return(
              <div key={o.id} className="card fu" style={{padding:16,borderColor:`${o.color}18`,animationDelay:`${i*0.05}s`}}>
                <div style={{position:"relative",paddingLeft:12}}>
                  <div style={{position:"absolute",top:0,left:0,bottom:0,width:2,background:o.color,borderRadius:2}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <span className="pill" style={{background:`${o.color}15`,color:o.color,marginBottom:6,display:"inline-flex"}}>{types[o.type]}</span>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:2,marginTop:4}}>{o.salle}</div>
                      <div style={{fontSize:10,color:"#999"}}>{o.ville} · {new Date(o.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:14,fontFamily:"'Bebas Neue',sans-serif",color:o.color}}>{o.cachet}</div><div style={{fontSize:9,color:d<=7?"#F03E3E":"#444",letterSpacing:1,marginTop:2}}>deadline J-{d}</div></div>
                  </div>
                  <div style={{fontSize:11,color:"#666",lineHeight:1.6,marginBottom:8}}>{o.desc}</div>
                  <button onClick={()=>setEmailSalle(SALLES.find(s=>s.nom===o.salle)||SALLES[0])} style={{background:"none",border:`1px solid ${o.color}44`,color:o.color,fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:1,padding:"5px 12px",borderRadius:20,cursor:"pointer"}}>Postuler →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab==="guide"&&(
        <div style={{padding:"16px 18px 40px"}}>
          {[{n:"01",t:"Prépare ton EPK",c:"#FF6B35",items:["Bio courte + longue + photo HD","Vidéo live ou clip","Lien Spotify + stats","Rider technique (si tu en as un)"]},{n:"02",t:"Cible les bonnes salles",c:"#20C997",items:["Commence par les jauges 100-300 pers.","Priorise les SMAC (subventionnées = + accessibles)","Vérifie que ta musique correspond à leur prog."]},{n:"03",t:"L'email parfait",c:"#845EF7",items:["Objet : [Artiste] - Demande de date - [Genre]","3 paragraphes max : qui · pourquoi cette salle · proposition","Lien EPK en premier  -  jamais de pièce jointe"]},{n:"04",t:"Les contrats",c:"#FFD43B",items:["Cession : cachet fixe contre droit de représentation","Coréalisation : tu partages les recettes","Résidence : création + concert de restitution"]}].map((s,i)=>(
            <div key={i} style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,color:s.c,opacity:0.3}}>{s.n}</span><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:2}}>{s.t.toUpperCase()}</span></div>
              <div style={{background:"#0D0D0D",borderRadius:8,padding:"12px 14px"}}>{s.items.map((item,ii)=><div key={ii} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:ii<s.items.length-1?"1px solid #111":"none"}}><span style={{color:s.c,fontSize:10,flexShrink:0,marginTop:2}}>→</span><span style={{fontSize:11,color:"#777",lineHeight:1.5}}>{item}</span></div>)}</div>
            </div>
          ))}
        </div>
      )}
      {sel&&(
        <div className="panel"><div className="pin" style={{borderTopColor:sel.color}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:9,color:sel.color,letterSpacing:2}}>FICHE SALLE</div><div style={{fontSize:17,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{sel.nom}</div></div>
            <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button>
          </div>
          <div style={{padding:"18px 20px 40px",fontFamily:"'Inter',sans-serif"}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>{sel.smac&&<span className="pill" style={{background:"#20C99718",color:"#20C997",border:"1px solid #20C99733"}}>SMAC</span>}{sel.subv&&<span className="pill" style={{background:"#FFD43B18",color:"#FFD43B",border:"1px solid #FFD43B33"}}>SUBVENTIONNÉ</span>}{sel.res&&<span className="pill" style={{background:"#845EF718",color:"#845EF7",border:"1px solid #845EF733"}}>RÉSIDENCES</span>}</div>
            <p style={{fontSize:12,color:"#888",lineHeight:1.8,marginBottom:14}}>{sel.desc}</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>{[{l:"Cachet",v:`${sel.cachet_min}-${sel.cachet_max}€`},{l:"Réponse",v:sel.delai},{l:"Ville",v:sel.ville},{l:"Jauge",v:`${sel.jauge} pers.`}].map((x,i)=><div key={i} style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:7,padding:"10px 12px"}}><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:3}}>{x.l.toUpperCase()}</div><div style={{fontSize:12,color:"#CCC"}}>{x.v}</div></div>)}</div>
            <div style={{marginBottom:14}}><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:8}}>GENRES PROGRAMMÉS</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{sel.genres.map(g=><span key={g} style={{fontSize:10,color:sel.color,background:`${sel.color}12`,padding:"3px 10px",borderRadius:20}}>{g}</span>)}</div></div>
            <div style={{background:"#0D0D0D",borderLeft:`2px solid ${sel.color}`,borderRadius:"0 7px 7px 0",padding:"11px 14px",marginBottom:14}}><div style={{fontSize:9,color:sel.color,letterSpacing:2,marginBottom:4}}>💡 CONSEIL</div><div style={{fontSize:11,color:"#888",lineHeight:1.7}}>{sel.tips}</div></div>
            <div style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:7,padding:"11px 14px",marginBottom:16}}><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:4}}>CONTACT</div><div style={{fontSize:12,color:"#888"}}>{sel.contact}</div><div style={{fontSize:10,color:"#999",marginTop:3}}>{sel.adresse}</div></div>
            <button className="btn" style={{background:"#20C997",color:"#000"}} onClick={()=>{setSel(null);setEmailSalle(sel);}}>✍️ Générer l'email de booking →</button>
          </div>
        </div></div>
      )}
      {emailSalle&&<EmailGen salle={emailSalle} onClose={()=>setEmailSalle(null)}/>}
    </div>
  );
}

function EmailGen({salle,onClose}){
  const [d,setD]=useState({nom:"",genre:"",ville:"",streams:"",projet:"",dates:""});const [contrat,setContrat]=useState(salle.contrats?.[0]||"cession");const [result,setResult]=useState("");const [phase,setPhase]=useState("form");const [copied,setCopied]=useState(false);
  const gen=async()=>{
    setPhase("loading");
    const prompt=`Email booking professionnel et percutant (150-200 mots) pour démarcher ${salle.nom} à ${salle.ville}.\nArtiste:${d.nom||"l'artiste"}\nGenre:${d.genre||salle.genres[0]}\nStats:${d.streams||"artiste émergent"}\nProjet:${d.projet||"EP récent"}\nDates passées:${d.dates||"premières dates"}\nContrat:${contrat}\nContact:${salle.contact}\nJauge:${salle.jauge} · Cachet:${salle.cachet_min}-${salle.cachet_max}€\nAccroche forte, présentation courte, pourquoi cette salle, proposition concrète. Ton professionnel mais humain. En français.`;
    try{const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:800,system:AI_SYSTEM,messages:[{role:"user",content:prompt}]})});const json=await res.json();setResult(json.content?.map(b=>b.text||"").join("")||"Erreur.");}catch{setResult("Erreur de connexion.");}setPhase("result");
  };
  return(
    <div className="panel"><div className="pin" style={{borderTopColor:salle.color}}>
      <div style={{padding:"16px 20px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:9,color:salle.color,letterSpacing:2}}>EMAIL BOOKING</div><div style={{fontSize:16,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{salle.nom}</div></div><button onClick={onClose} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button></div>
      {phase==="form"&&(
        <div style={{padding:"18px 20px 40px",display:"flex",flexDirection:"column",gap:12,fontFamily:"'Inter',sans-serif"}}>
          <div style={{background:"#0D0D0D",border:`1px solid ${salle.color}18`,borderRadius:7,padding:"11px 14px",fontSize:11,color:"#666",lineHeight:1.6}}><span style={{color:salle.color,fontSize:9,letterSpacing:2,display:"block",marginBottom:4}}>💡 CONSEIL</span>{salle.tips}</div>
          {[{k:"nom",l:"NOM D'ARTISTE *",p:"Saya..."},{k:"genre",l:"GENRE *",p:salle.genres[0]},{k:"ville",l:"TA VILLE",p:"Paris..."},{k:"streams",l:"STATS",p:"50K Spotify..."},{k:"projet",l:"DERNIER PROJET",p:"EP Analyse Dérapée"},{k:"dates",l:"DATES PASSÉES",p:"Trabendo, Fête de la Musique..."}].map(f=><div key={f.k}><label style={{fontSize:11,color:"#AAA",letterSpacing:1,display:"block",marginBottom:7,fontWeight:600}}>{f.l}</label><input value={d[f.k]} onChange={e=>setD(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}/></div>)}
          <button className="btn" style={{background:"#20C997",color:"#000",marginTop:8}} disabled={!d.nom||!d.genre} onClick={gen}>✦ Générer l'email</button>
        </div>
      )}
      {phase==="loading"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"50vh",gap:16}}><div style={{fontSize:28}}>📩</div><div style={{fontSize:13,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#20C997"}}>RÉDACTION EN COURS</div><div style={{display:"flex",gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#20C997",animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div>}
      {phase==="result"&&(
        <div style={{padding:"18px 20px 40px",fontFamily:"'Inter',sans-serif"}}>
          <div style={{background:"#0D0D0D",border:`1px solid ${salle.color}22`,borderRadius:8,padding:"11px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>📩</span><div><div style={{fontSize:11,color:salle.color}}>Email prêt</div><div style={{fontSize:10,color:"#888"}}>À : {salle.contact}</div></div></div>
          <div style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:8,padding:16,fontSize:12,lineHeight:1.9,color:"#BBB",whiteSpace:"pre-wrap",marginBottom:14}}>{result}</div>
          <div style={{display:"flex",gap:10}}>
            <button style={{flex:1,background:"none",border:`1px solid ${copied?"#00C9A7":`${salle.color}44`}`,color:copied?"#00C9A7":salle.color,fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:2,padding:12,borderRadius:5,cursor:"pointer"}} onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2500);}}>{copied?"✓ Copié !":"Copier"}</button>
            <button className="btn-o" onClick={()=>setPhase("form")}>Modifier</button>
          </div>
        </div>
      )}
    </div></div>
  );
}

// --- ANNUAIRE -----------------------------------------------------------------
function Annuaire({goBack}){
  const [section,setSection]=useState(null);const [search,setSearch]=useState("");const [detail,setDetail]=useState(null);
  const SECS=[
    {id:"salles",icon:"🎤",label:"Salles de concert",color:"#FF6B35",data:SALLES,count:SALLES.length,desc:"SMAC, salles privées, clubs"},
    {id:"enreg",icon:"🎙️",label:"Studios d'enregistrement",color:"#845EF7",data:STUDIOS_ENREG,count:STUDIOS_ENREG.length,desc:"Studios pro avec ingé son"},
    {id:"repet",icon:"🔊",label:"Studios de répétition",color:"#00C9A7",data:STUDIOS_REPET,count:STUDIOS_REPET.length,desc:"Salles de répète équipées"},
    {id:"residences",icon:"🏠",label:"Résidences artistiques",color:"#C8A96E",data:RESIDENCES,count:RESIDENCES.length,desc:"Résidences de création"},
    {id:"tremplins",icon:"🏆",label:"Tremplins & Scènes",color:"#FFD43B",data:TREMPLINS,count:TREMPLINS.length,desc:"Concours, jams, scènes ouvertes"},
  ];
  const sec=SECS.find(s=>s.id===section?.id);
  const getItems=()=>{if(!sec)return[];const q=search.toLowerCase();return sec.data.filter(i=>{if(!q)return true;return(i.nom||"").toLowerCase().includes(q)||(i.ville||"").toLowerCase().includes(q)||((i.tags||i.genres||[]).some(t=>(t||"").toLowerCase().includes(q)));});};
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="ANNUAIRE" accent="#C8A96E" onBack={goBack} right={section&&<button className="btn-o" style={{width:"auto",padding:"6px 12px",fontSize:10}} onClick={()=>{setSection(null);setSearch("");}}>← Retour</button>}/>
      {!section&&(
        <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"#0D0D0D",border:"1px solid #C8A96E18",borderRadius:8,padding:"11px 14px",fontSize:11,color:"#555",lineHeight:1.6,marginBottom:4}}><span style={{color:"#C8A96E",fontSize:9,letterSpacing:2,display:"block",marginBottom:3}}>◆ ANNUAIRE INDY</span>Studios, salles, résidences, tremplins  -  toutes les ressources pour créer et te développer.</div>
          {SECS.map((s,i)=>(
            <div key={s.id} className="card fu" style={{padding:0,overflow:"hidden",cursor:"pointer",animationDelay:`${i*0.05}s`}} onClick={()=>setSection(s)}>
              <div style={{height:2,background:s.color}}/>
              <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:10,background:`${s.color}15`,border:`1px solid ${s.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
                <div style={{flex:1}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:2}}>{s.label}</div><div style={{fontSize:10,color:"#999",marginTop:2}}>{s.count} ressources · {s.desc}</div></div>
                <span style={{fontSize:20,color:"#222"}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {section&&(
        <div>
          <div style={{padding:"12px 18px"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Rechercher dans ${sec?.label}...`}/></div>
          <div style={{padding:"4px 18px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:10,color:"#888",letterSpacing:1.5,fontWeight:600}}>{getItems().length} RÉSULTAT{getItems().length>1?"S":""}</div>
            {getItems().map((item,i)=>{
              const isSalle=section.id==="salles";const color=isSalle?item.color:sec?.color||"#888";
              return(
                <div key={i} className="card fu" style={{padding:0,overflow:"hidden",cursor:"pointer",animationDelay:`${i*0.04}s`}} onClick={()=>setDetail({...item,_sec:section.id,_color:color})}>
                  <div style={{height:2,background:color}}/>
                  <div style={{padding:"13px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2}}>{item.nom}</div><div style={{fontSize:10,color:"#999",marginTop:1}}>{item.ville}{(item.prix||item.cachet_min)&&<span style={{color:color}}> · {item.prix||`${item.cachet_min}-${item.cachet_max}€`}</span>}</div></div>
                      <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
                        {isSalle&&item.smac&&<span className="pill" style={{background:"#20C99715",color:"#20C997"}}>SMAC</span>}
                        {isSalle&&item.subv&&<span className="pill" style={{background:"#FFD43B15",color:"#FFD43B"}}>SUBV.</span>}
                        {isSalle&&item.res&&<span className="pill" style={{background:"#845EF715",color:"#845EF7"}}>RÉSID.</span>}
                      </div>
                    </div>
                    <div style={{fontSize:11,color:"#666",lineHeight:1.5,marginBottom:7}}>{item.desc||item.description||""}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{(item.tags||item.genres||[]).slice(0,4).map(t=><span key={t} className="chip">{t}</span>)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {detail&&(
        <div className="panel"><div className="pin" style={{borderTopColor:detail._color}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:9,color:detail._color,letterSpacing:2}}>FICHE DÉTAIL</div><div style={{fontSize:16,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{detail.nom}</div></div><button onClick={()=>setDetail(null)} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button></div>
          <div style={{padding:"18px 20px 40px",fontFamily:"'Inter',sans-serif"}}>
            {detail.tips&&<div style={{background:"#0D0D0D",borderLeft:`2px solid ${detail._color}`,borderRadius:"0 7px 7px 0",padding:"11px 14px",marginBottom:14}}><div style={{fontSize:9,color:detail._color,letterSpacing:2,marginBottom:4}}>💡 CONSEIL</div><div style={{fontSize:11,color:"#888",lineHeight:1.7}}>{detail.tips}</div></div>}
            <p style={{fontSize:12,color:"#888",lineHeight:1.8,marginBottom:14}}>{detail.desc||detail.description}</p>
            {detail.contact&&<div style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:7,padding:"11px 14px",marginBottom:14}}><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:4}}>CONTACT</div><div style={{fontSize:12,color:"#888"}}>{detail.contact}</div>{detail.adresse&&<div style={{fontSize:10,color:"#999",marginTop:3}}>{detail.adresse}</div>}</div>}
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>{(detail.tags||detail.genres||[]).map(t=><span key={t} style={{fontSize:10,color:detail._color,background:`${detail._color}12`,padding:"3px 10px",borderRadius:20}}>{t}</span>)}</div>
            {detail.site&&detail.site!=="/#"&&detail.site!=="#"&&<a href={detail.site} target="_blank" rel="noopener noreferrer" className="lnk" style={{background:detail._color,color:"#000",fontWeight:500}}>Voir le site →</a>}
          </div>
        </div></div>
      )}
    </div>
  );
}


// --- BIBLIOTHÈQUE ------------------------------------------------------------
function Bibliotheque({plan,goPlan}){
  const [cat,setCat]=useState(null);
  const [doc,setDoc]=useState(null);
  const [copied,setCopied]=useState(false);
  const [tabAnn,setTabAnn]=useState(false);

  const canAccess=(d)=>plan==="label"||(plan==="artiste"&&d.access==="all");

  const docsForCat=(catId)=>BIBLIO_DOCS.filter(d=>d.cat===catId);

  if(plan==="free")return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="BIBLIOTHEQUE" accent="#C8A96E" onBack={goBack}/>
      <Gate onUpgrade={goPlan} label="Acces a 24 documents juridiques et pratiques rediges pour les artistes independants." features={["Contrats (featuring, split sheet)","Fiches SACEM & ISRC","Checklist sortie complete","Templates press kit & pitch Spotify","Fiches financement CNM, ADAMI","Guides statuts juridiques"]}/>
    </div>
  );

  if(doc){return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="BIBLIOTHÈQUE" accent="#C8A96E" onBack={()=>setDoc(null)} right={<button className="btn-o" style={{width:"auto",padding:"6px 12px",fontSize:10}} onClick={()=>setDoc(null)}>← Retour</button>}/>
      <div style={{padding:"16px 18px 40px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{fontSize:24}}>{doc.icon}</span>
          <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2}}>{doc.titre}</div>
          <span className="pill" style={{background:"#C8A96E15",color:"#C8A96E",border:"1px solid #C8A96E33",marginTop:4,display:"inline-flex"}}>{BIBLIO_CATS.find(c=>c.id===doc.cat)?.label}</span></div>
        </div>
        <div style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:8,padding:16,fontSize:11,lineHeight:1.9,color:"#BBB",whiteSpace:"pre-wrap",marginBottom:14,fontFamily:"monospace"}}>{doc.contenu}</div>
        <div style={{display:"flex",gap:10}}>
          <button style={{flex:1,background:"none",border:`1px solid ${copied?"#00C9A7":"#C8A96E44"}`,color:copied?"#00C9A7":"#C8A96E",fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:2,padding:12,borderRadius:5,cursor:"pointer"}} onClick={()=>{navigator.clipboard.writeText(doc.contenu);setCopied(true);setTimeout(()=>setCopied(false),2500);}}>{copied?"✓ Copié !":"📋 Copier"}</button>
        </div>
      </div>
    </div>
  );}

  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="BIBLIOTHÈQUE" accent="#C8A96E" onBack={goBack}/>
      <div style={{display:"flex",borderBottom:"1px solid #111"}}>
        <button className={`tab ${!tabAnn?"on":""}`} onClick={()=>setTabAnn(false)}>📚 Documents ({BIBLIO_DOCS.length})</button>
        <button className={`tab ${tabAnn?"on":""}`} onClick={()=>setTabAnn(true)}>🔗 Annuaires ({ANNUAIRES_EXT.length})</button>
      </div>

      {!tabAnn&&(
        <div style={{padding:"14px 18px"}}>
          {plan==="free"&&<div style={{background:"#0D0D0D",border:"1px solid #C8A96E22",borderRadius:8,padding:"12px 14px",marginBottom:14,fontSize:11,color:"#888",lineHeight:1.7}}><span style={{color:"#C8A96E",fontSize:9,letterSpacing:2,display:"block",marginBottom:4}}>🔒 ACCÈS ABONNÉ</span>24 documents juridiques et pratiques rédigés pour les artistes indépendants.<button className="btn" style={{marginTop:10,background:"#C8A96E",color:"#000"}} onClick={goPlan}>Débloquer dès 9,90€/mois →</button></div>}
          {plan==="artiste"&&<div style={{background:"#0D0D0D",border:"1px solid #FF6B3518",borderRadius:6,padding:"10px 12px",marginBottom:12,fontSize:10,color:"#888"}}><span style={{color:"#FF6B35"}}>✦ </span>Contrats avancés (cession, co-prod, licence, management, rider) réservés au plan Label  -  <button onClick={goPlan} style={{background:"none",border:"none",color:"#C8A96E",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:10,padding:0}}>Passer Label →</button></div>}
          {BIBLIO_CATS.map(cat=>{
            const docs=docsForCat(cat.id);
            if(!docs.length)return null;
            return(
              <div key={cat.id} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:16}}>{cat.icon}</span>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2,color:cat.color}}>{cat.label.toUpperCase()}</div>
                  <div style={{flex:1,height:1,background:"#111",marginLeft:8}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {docs.map(d=>{
                    const ok=canAccess(d);
                    return(
                      <div key={d.id} className="card" style={{padding:"12px 14px",opacity:ok?1:0.5,cursor:ok?"pointer":"not-allowed",borderColor:ok?`${cat.color}18`:"#111"}} onClick={()=>ok&&setDoc(d)}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:18,flexShrink:0}}>{d.icon}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,color:ok?"#DDD":"#555",fontWeight:500,marginBottom:3}}>{d.titre}</div>
                            <div style={{fontSize:10,color:"#888",lineHeight:1.5}}>{d.resume}</div>
                          </div>
                          {ok?<span style={{color:cat.color,fontSize:16,flexShrink:0}}>›</span>:<span style={{fontSize:12,flexShrink:0}}>🔒</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tabAnn&&(
        <div style={{padding:"14px 18px"}}>
          <div style={{background:"#0D0D0D",border:"1px solid #C8A96E18",borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:10,color:"#888"}}>Tous les liens utiles pour distribuer, promouvoir, financer et te structurer légalement.</div>
          {["Distribution","Promotion","Booking","Droits","Financement","Juridique"].map(grp=>{
            const items=ANNUAIRES_EXT.filter(a=>a.cat===grp);
            if(!items.length)return null;
            return(
              <div key={grp} style={{marginBottom:18}}>
                <div style={{fontSize:9,letterSpacing:2,color:"#555",marginBottom:8}}>{grp.toUpperCase()}</div>
                {items.map(a=>(
                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"#0D0D0D",border:`1px solid ${a.color}15`,borderRadius:8,marginBottom:6,textDecoration:"none",cursor:"pointer"}}>
                    <div style={{width:36,height:36,borderRadius:8,background:`${a.color}15`,border:`1px solid ${a.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{a.icon}</div>
                    <div style={{flex:1}}><div style={{fontSize:12,color:"#DDD",fontWeight:500}}>{a.label}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>{a.desc}</div></div>
                    <span style={{color:a.color,fontSize:14}}>↗</span>
                  </a>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- SUBVENTIONS --------------------------------------------------------------
function Subventions({plan,goPlan}){
  if(plan==="free"){
    return(
      <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
        <Hdr sub="FINANCEMENT & DÉMARCHES" accent="#F03E3E" onBack={goBack}/>
        <Gate onUpgrade={goPlan} label="Matching personnalisé avec les 9+ aides françaises (CNM, SACEM, ADAMI...) + liens directs vers les formulaires officiels."/>
      </div>
    );
  }
  const [ans,setAns]=useState({});const [qi,setQi]=useState(0);const [phase,setPhase]=useState("q");const [exp,setExp]=useState(null);const [showD,setShowD]=useState(false);const [selD,setSelD]=useState(null);
  const answer=(qid,val)=>{const n={...ans,[qid]:val};setAns(n);if(qi<FINANCEMENT_QS.length-1)setTimeout(()=>setQi(qi+1),280);};
  const allDone=Object.keys(ans).length===FINANCEMENT_QS.length;
  const results=AIDES.map(a=>({...a,score:scoreAide(a,ans)})).filter(a=>a.score>=40).sort((a,b)=>b.score-a.score);
  const top=results.filter(a=>a.score>=70);const possible=results.filter(a=>a.score>=40&&a.score<70);
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="FINANCEMENT & DÉMARCHES" accent="#F03E3E" onBack={goBack} right={<div style={{display:"flex",gap:8}}>
        {phase==="results"&&<button className="btn-o" style={{width:"auto",padding:"6px 12px",fontSize:10}} onClick={()=>{setPhase("q");setAns({});setQi(0);}}>↺</button>}
        <button className="btn-o" style={{width:"auto",padding:"6px 12px",fontSize:10,borderColor:showD?"#F03E3E":"#1E1E1E",color:showD?"#F03E3E":"#555"}} onClick={()=>setShowD(!showD)}>{showD?"Aides":"Démarches"}</button>
      </div>}/>
      {showD&&(
        <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"#0D0D0D",border:"1px solid #F03E3E18",borderRadius:8,padding:"11px 14px",fontSize:11,color:"#555",lineHeight:1.6,marginBottom:4}}><span style={{color:"#F03E3E",fontSize:9,letterSpacing:2,display:"block",marginBottom:3}}>◆ DÉMARCHES ADMIN</span>SACEM, ISRC, formats de dépôt, statuts  -  avec liens directs.</div>
          {DEMARCHES.map((d,i)=>(
            <div key={d.id} className="card fu" style={{padding:0,overflow:"hidden",cursor:"pointer",animationDelay:`${i*0.05}s`}} onClick={()=>setSelD(d)}>
              <div style={{height:2,background:d.color}}/>
              <div style={{padding:"13px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:`${d.color}15`,border:`1px solid ${d.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{d.icon}</div>
                <div style={{flex:1}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2}}>{d.titre}</div><div style={{fontSize:10,color:"#999",marginTop:2}}>{d.delai} · {d.cout}</div></div>
                <span style={{fontSize:18,color:"#222"}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {selD&&(
        <div className="panel"><div className="pin" style={{borderTopColor:selD.color}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:9,color:selD.color,letterSpacing:2}}>DÉMARCHE</div><div style={{fontSize:16,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{selD.titre}</div></div><button onClick={()=>setSelD(null)} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button></div>
          <div style={{padding:"18px 20px 40px",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column",gap:14}}>
            <p style={{fontSize:12,color:"#888",lineHeight:1.8}}>{selD.desc}</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[{l:"Délai",v:selD.delai},{l:"Coût",v:selD.cout}].map((x,i)=><div key={i} style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:7,padding:"10px 12px"}}><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:3}}>{x.l.toUpperCase()}</div><div style={{fontSize:11,color:"#CCC"}}>{x.v}</div></div>)}</div>
            <div><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:8}}>DOCUMENTS REQUIS</div>{selD.docs.map((d,i)=><div key={i} style={{display:"flex",gap:9,padding:"6px 0",borderBottom:i<selD.docs.length-1?"1px solid #0F0F0F":"none"}}><span style={{color:selD.color,flexShrink:0}}>→</span><span style={{fontSize:11,color:"#777"}}>{d}</span></div>)}</div>
            <div><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:8}}>FORMATS / INFOS CLÉS</div><div style={{background:"#0D0D0D",borderRadius:8,padding:"12px 14px"}}>{selD.formats.map((f,i)=><div key={i} style={{fontSize:11,color:"#777",padding:"4px 0",borderBottom:i<selD.formats.length-1?"1px solid #0F0F0F":"none",lineHeight:1.5}}>{f}</div>)}</div></div>
            {selD.tips&&<div style={{background:"#0D0D0D",borderLeft:`2px solid ${selD.color}`,padding:"11px 14px",borderRadius:"0 7px 7px 0"}}><div style={{fontSize:9,color:selD.color,letterSpacing:2,marginBottom:4}}>💡 CONSEIL</div><div style={{fontSize:11,color:"#888",lineHeight:1.7}}>{selD.tips}</div></div>}
            <a href={selD.lien} target="_blank" rel="noopener noreferrer" className="lnk" style={{background:selD.color,color:"#000",fontWeight:500}}>{selD.lienLabel}</a>
          </div>
        </div></div>
      )}
      {!showD&&phase==="q"&&(
        <div style={{padding:"20px 18px"}}>
          <div style={{display:"flex",gap:5,marginBottom:24}}>{FINANCEMENT_QS.map((q,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:ans[q.id]?"#F03E3E":i===qi?"#2A2A2A":"#111",transition:"background 0.3s"}}/>)}</div>
          {FINANCEMENT_QS.map((q,i)=>{if(i!==qi)return null;return(
            <div key={q.id} className="fu">
              <div style={{fontSize:11,color:"#AAA",letterSpacing:1,fontWeight:600,marginBottom:6}}>QUESTION {i+1}/{FINANCEMENT_QS.length}</div>
              <div style={{fontSize:18,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,marginBottom:18}}>{q.q.toUpperCase()}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>{q.opts.map(opt=><button key={opt.v} onClick={()=>answer(q.id,opt.v)} style={{background:ans[q.id]===opt.v?"#150808":"#0D0D0D",border:`1px solid ${ans[q.id]===opt.v?"#F03E3E":"#1A1A1A"}`,color:ans[q.id]===opt.v?"#F03E3E":"#777",fontFamily:"'Inter',sans-serif",fontSize:13,padding:"13px 15px",borderRadius:7,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10}}><span style={{width:16,height:16,borderRadius:"50%",border:`1.5px solid ${ans[q.id]===opt.v?"#F03E3E":"#333"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#F03E3E",flexShrink:0}}>{ans[q.id]===opt.v?"✓":""}</span>{opt.l}</button>)}</div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>{i>0?<button className="btn-o" onClick={()=>setQi(i-1)}>← Retour</button>:<div/>}{allDone&&<button className="btn" style={{width:"auto",padding:"10px 20px",background:"#F03E3E"}} onClick={()=>setPhase("results")}>Voir mes aides →</button>}</div>
            </div>
          );})}
        </div>
      )}
      {!showD&&phase==="results"&&(
        <div style={{padding:"18px 18px 20px"}}>
          <div style={{background:"#0D0D0D",border:"1px solid #F03E3E18",borderRadius:8,padding:"14px",marginBottom:18}}><div style={{fontSize:9,color:"#F03E3E",letterSpacing:2,marginBottom:5}}>◆ RÉSULTAT MATCHING</div><div style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{results.length} AIDE{results.length>1?"S":""} IDENTIFIÉE{results.length>1?"S":""}</div><div style={{fontSize:11,color:"#999",marginTop:3}}>{top.length} forte{top.length>1?"s":""} · {possible.length} possible{possible.length>1?"s":""}</div></div>
          {top.length>0&&<><div style={{fontSize:9,letterSpacing:3,color:"#F03E3E",marginBottom:10}}>✦ CORRESPONDANCES FORTES</div>{top.map(a=><AideCard key={a.id} aide={a} expanded={exp===a.id} onToggle={()=>setExp(exp===a.id?null:a.id)}/>)}</>}
          {possible.length>0&&<><div style={{fontSize:9,letterSpacing:3,color:"#999",marginTop:16,marginBottom:10}}>◦ AIDES POSSIBLES</div>{possible.map(a=><AideCard key={a.id} aide={a} expanded={exp===a.id} onToggle={()=>setExp(exp===a.id?null:a.id)}/>)}</>}
        </div>
      )}
    </div>
  );
}
function AideCard({aide,expanded,onToggle}){
  return(
    <div style={{background:"#0D0D0D",border:`1px solid ${expanded?aide.color+"44":"#1A1A1A"}`,borderRadius:9,overflow:"hidden",marginBottom:10}}>
      <div style={{padding:"13px 14px",cursor:"pointer",display:"flex",gap:10,alignItems:"flex-start"}} onClick={onToggle}>
        <span style={{fontSize:18,flexShrink:0}}>{aide.icon}</span>
        <div style={{flex:1}}><div style={{fontSize:12,color:expanded?aide.color:"#CCC",lineHeight:1.3,marginBottom:4}}>{aide.nom}</div><div style={{fontSize:9,color:"#888",letterSpacing:1,marginBottom:6}}>{aide.org.toUpperCase()}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}><span style={{fontSize:10,color:aide.color,background:`${aide.color}15`,padding:"2px 8px",borderRadius:20}}>{aide.montant}</span><span style={{fontSize:9,color:"#888"}}>{aide.delai}</span></div></div>
        <span style={{fontSize:10,color:aide.score>=70?aide.color:"#999",background:`${aide.score>=70?aide.color:"#1A1A1A"}18`,border:`1px solid ${aide.score>=70?aide.color+"44":"#1E1E1E"}`,padding:"3px 7px",borderRadius:20,flexShrink:0}}>{aide.score}%</span>
      </div>
      {expanded&&(
        <div style={{padding:"0 14px 14px",borderTop:"1px solid #111"}}>
          <p style={{fontSize:11,color:"#777",lineHeight:1.7,margin:"12px 0"}}>{aide.desc}</p>
          <div style={{fontSize:11,color:"#AAA",letterSpacing:1,fontWeight:600,marginBottom:8}}>ÉTAPES CLÉS</div>
          {aide.etapes.map((e,i)=><div key={i} style={{display:"flex",gap:9,padding:"7px 0",borderBottom:i<aide.etapes.length-1?"1px solid #0F0F0F":"none"}}><span style={{width:16,height:16,borderRadius:"50%",background:"#111",color:aide.color,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span><span style={{fontSize:11,color:"#666"}}>{e}</span></div>)}
          <a href={aide.lien} target="_blank" rel="noopener noreferrer" className="lnk" style={{marginTop:12,background:"none",border:`1.5px solid ${aide.color}`,color:aide.color}}>Accéder au dossier →</a>
        </div>
      )}
    </div>
  );
}

// --- RÉSEAU -------------------------------------------------------------------
function Reseau({user,plan,goPlan,goBack}){
  const [annonces,setAnnonces]=useState(ANNONCES_INIT);const [showForm,setShowForm]=useState(false);const [filter,setFilter]=useState("tous");const [newA,setNewA]=useState({type:"cherche",role:"",genre:"",ville:"",desc:"",tags:""});
  const filtered=annonces.filter(a=>filter==="tous"||a.type===filter);
  const publish=()=>{if(!newA.role||!newA.desc)return;setAnnonces(prev=>[{id:Date.now(),...newA,nom:user?.name||"Artiste INDY",avatar:"🎵",date:"À l'instant",tags:newA.tags.split(",").map(t=>t.trim()).filter(Boolean),color:"#FF6B35"},...prev]);setShowForm(false);setNewA({type:"cherche",role:"",genre:"",ville:"",desc:"",tags:""});};
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="RÉSEAU" accent="#00C9A7" onBack={goBack} right={<button onClick={()=>plan==="free"?goPlan():setShowForm(true)} style={{background:plan==="free"?"#1A1A1A":"#00C9A7",border:"none",color:"#000",fontFamily:"'Inter',sans-serif",fontSize:10,letterSpacing:2,padding:"8px 14px",borderRadius:20,cursor:"pointer",fontWeight:500}}>+ ANNONCE</button>}/>
      <div style={{padding:"10px 18px",display:"flex",gap:6,borderBottom:"1px solid #0F0F0F"}}>
        {[{k:"tous",l:"Tous"},{k:"cherche",l:"Cherche"},{k:"propose",l:"Propose"}].map(f=><button key={f.k} onClick={()=>setFilter(f.k)} style={{background:filter===f.k?"#00C9A715":"none",border:`1px solid ${filter===f.k?"#00C9A7":"#1A1A1A"}`,color:filter===f.k?"#00C9A7":"#444",fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:1,padding:"5px 12px",borderRadius:20,cursor:"pointer",textTransform:"uppercase"}}>{f.l}</button>)}
      </div>
      <div style={{padding:"12px 18px",display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map((a,i)=>(
          <div key={a.id} className="card fu" style={{padding:14,borderColor:`${a.color}15`,animationDelay:`${i*0.04}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:`${a.color}18`,border:`1px solid ${a.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{a.avatar}</div>
                <div><div style={{fontSize:11,color:"#CCC"}}>{a.nom}</div><div style={{fontSize:9,color:"#999"}}>{a.ville} · {a.date}</div></div>
              </div>
              <span className="pill" style={{background:a.type==="cherche"?"#FF6B3515":"#00C9A715",color:a.type==="cherche"?"#FF6B35":"#00C9A7",border:`1px solid ${a.type==="cherche"?"#FF6B3533":"#00C9A733"}`,flexShrink:0}}>{a.type==="cherche"?"CHERCHE":"PROPOSE"}</span>
            </div>
            <div style={{fontSize:13,color:a.color,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1.5,marginBottom:3}}>{a.role}</div>
            <div style={{fontSize:9,color:"#555",marginBottom:6}}>{a.genre}</div>
            <div style={{fontSize:11,color:"#888",lineHeight:1.6,marginBottom:8}}>{a.desc}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
              {a.tags.slice(0,3).map(t=><span key={t} className="chip">{t}</span>)}
              <button style={{marginLeft:"auto",background:"none",border:`1px solid ${a.color}44`,color:a.color,fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:1,padding:"4px 11px",borderRadius:20,cursor:"pointer"}}>Contacter →</button>
            </div>
          </div>
        ))}
      </div>
      {showForm&&(
        <div className="panel"><div className="pin" style={{borderTopColor:"#00C9A7"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:9,color:"#00C9A7",letterSpacing:2}}>NOUVELLE ANNONCE</div></div><button onClick={()=>setShowForm(false)} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button></div>
          <div style={{padding:"18px 20px 40px",display:"flex",flexDirection:"column",gap:12,fontFamily:"'Inter',sans-serif"}}>
            <div style={{display:"flex",gap:8}}>{[{v:"cherche",l:"Je cherche"},{v:"propose",l:"Je propose"}].map(t=><button key={t.v} onClick={()=>setNewA(p=>({...p,type:t.v}))} style={{flex:1,background:newA.type===t.v?"#00C9A718":"#0D0D0D",border:`1px solid ${newA.type===t.v?"#00C9A7":"#1A1A1A"}`,color:newA.type===t.v?"#00C9A7":"#555",fontFamily:"'Inter',sans-serif",fontSize:11,padding:"10px",borderRadius:6,cursor:"pointer"}}>{t.l}</button>)}</div>
            {[{k:"role",l:"RÔLE *",p:"Chanteuse, Beatmaker, Studio..."},{k:"genre",l:"GENRE",p:"Afro Pop, R&B..."},{k:"ville",l:"VILLE",p:"Paris..."},{k:"tags",l:"TAGS (virgules)",p:"R&B, Collab, Studio..."}].map(f=><div key={f.k}><label style={{fontSize:11,color:"#888",letterSpacing:1.5,display:"block",marginBottom:7,fontWeight:600}}>{f.l}</label><input value={newA[f.k]} onChange={e=>setNewA(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}/></div>)}
            <div><label style={{fontSize:11,color:"#888",letterSpacing:1.5,display:"block",marginBottom:7,fontWeight:600}}>DESCRIPTION *</label><textarea value={newA.desc} onChange={e=>setNewA(p=>({...p,desc:e.target.value}))} rows={4} placeholder="Décris ta recherche..."/></div>
            <button className="btn" style={{background:"#00C9A7",color:"#000",marginTop:8}} disabled={!newA.role||!newA.desc} onClick={publish}>Publier</button>
          </div>
        </div></div>
      )}
    </div>
  );
}

// --- ACTUALITÉS ---------------------------------------------------------------
function Actualites({plan,goPlan}){
  const [loading,setLoading]=useState(false);const [articles,setArticles]=useState(null);const [query,setQuery]=useState("");const [searched,setSearched]=useState(false);
  if(plan==="free")return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="ACTUALITES" accent="#74C0FC" onBack={goBack}/>
      <Gate onUpgrade={goPlan} label="Acces aux actualites musicales en temps reel  -  concours, festivals, appels a projets, jams." features={["Concours et appels a projets","Festivals independants","Jams sessions","Actualites subventions","Recherche personnalisee"]}/>
    </div>
  );
  const CATS=[{l:"Concours de chant",q:"concours chant France 2025"},{l:"Jams sessions",q:"jam session Paris Lyon Marseille 2025"},{l:"Festivals",q:"festival musique indépendant France 2025"},{l:"Appels à projets",q:"appel à projets musique culture 2025"},{l:"Actualité indé",q:"artiste indépendant musique France actualité"},{l:"Subventions",q:"subvention musique artiste 2025 CNM"}];
  const search=async(q)=>{
    setLoading(true);setSearched(true);setQuery(q);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1200,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Cherche les dernières actualités sur : "${q}" pour artistes musicaux indépendants en France. Retourne exactement 5 résultats en JSON valide, sans markdown ni backticks, format: [{"titre":"...","source":"...","date":"...","url":"...","resume":"...","categorie":"..."}]`}]})});
      const json=await res.json();const text=json.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"[]";const clean=text.replace(/```json|```/g,"").trim();
      try{setArticles(JSON.parse(clean));}catch{setArticles([]);}
    }catch{setArticles([]);}
    setLoading(false);
  };
  const catColors={"Concours":"#FF6B35","Festival":"#845EF7","Appel":"#00C9A7","Jam":"#FFD43B","Subvention":"#F03E3E","Actualité":"#74C0FC"};
  const getColor=(cat)=>Object.entries(catColors).find(([k])=>cat?.includes(k))?.[1]||"#444";
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="ACTUALITÉS" accent="#74C0FC" onBack={goBack}/>
      <div style={{padding:"12px 18px"}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher..." onKeyDown={e=>e.key==="Enter"&&search(query)} style={{flex:1}}/><button className="btn" style={{width:"auto",padding:"10px 16px",background:"#74C0FC",color:"#000",fontSize:10}} onClick={()=>search(query)}>↵</button></div>
        <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
          {CATS.map(c=><button key={c.l} onClick={()=>search(c.q)} style={{background:"#0D0D0D",border:"1px solid #1A1A1A",color:"#555",fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:1,padding:"5px 11px",borderRadius:20,cursor:"pointer",flexShrink:0,textTransform:"uppercase",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#74C0FC";e.currentTarget.style.color="#74C0FC";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#1A1A1A";e.currentTarget.style.color="#555";}}>{c.l}</button>)}
        </div>
      </div>
      {!searched&&<div style={{padding:"40px 24px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}><div style={{fontSize:40}}>📰</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:3,color:"#999"}}>ACTU MUSICALE</div><div style={{fontSize:12,color:"#888",lineHeight:1.8,maxWidth:260}}>Concours, jams, festivals, appels à projets  -  l'actualité musicale en temps réel.</div><button className="btn" style={{width:"auto",padding:"12px 24px",background:"#74C0FC",color:"#000"}} onClick={()=>search("actualité musique indépendante France 2025")}>Charger l'actu →</button></div>}
      {loading&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"40vh",gap:16}}><div style={{fontSize:28}}>📡</div><div style={{fontSize:12,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#74C0FC"}}>RECHERCHE EN COURS</div><div style={{display:"flex",gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#74C0FC",animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div>}
      {!loading&&articles&&(
        <div style={{padding:"12px 18px",display:"flex",flexDirection:"column",gap:10}}>
          {articles.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#888",fontSize:12}}>Aucun résultat. Essaie une autre recherche.</div>}
          {articles.map((a,i)=>(
            <div key={i} className="card fu" style={{padding:"15px",animationDelay:`${i*0.05}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><span className="pill" style={{background:`${getColor(a.categorie)}15`,color:getColor(a.categorie),border:`1px solid ${getColor(a.categorie)}33`}}>{a.categorie||"Actu"}</span><span style={{fontSize:9,color:"#888"}}>{a.date||"Récent"}</span></div>
              <div style={{fontSize:13,color:"#DDD",fontWeight:500,lineHeight:1.4,marginBottom:6}}>{a.titre}</div>
              <div style={{fontSize:11,color:"#777",lineHeight:1.6,marginBottom:8}}>{a.resume}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:9,color:"#999"}}>{a.source}</span>{a.url&&a.url!=="N/A"&&<a href={a.url} target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:"#74C0FC",textDecoration:"none",letterSpacing:1}}>Lire →</a>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- PROFIL -------------------------------------------------------------------
function Profil({plan,setPlan,user,goPlan,goBack}){
  const PI={free:{l:"GRATUIT",c:"#444"},artiste:{l:"ARTISTE",c:"#FF6B35"},label:{l:"LABEL",c:"#C8A96E"}};const cur=PI[plan];
  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"#F0EDE8",fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <Hdr sub="MON COMPTE" onBack={goBack}/>
      <div style={{padding:"20px 18px",display:"flex",flexDirection:"column",gap:14}}>
        <div className="card" style={{padding:18}}><div style={{fontSize:11,color:"#AAA",letterSpacing:1,fontWeight:600,marginBottom:10}}>PROFIL ARTISTE</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:3}}>{user?.name||"Artiste"}</div><div style={{fontSize:11,color:"#555",marginTop:2}}>{user?.genre||"Genre non défini"}</div></div>
        <div className="card" style={{padding:18,borderColor:`${cur.c}22`}}><div style={{fontSize:11,color:"#AAA",letterSpacing:1,fontWeight:600,marginBottom:10}}>PLAN ACTUEL</div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:3,color:cur.c}}>{cur.l}</div><div style={{fontSize:10,color:"#999",marginTop:2}}>{plan==="free"?"Essai 3 jours gratuits":plan==="artiste"?"9,90€ / mois  -  Fondateur":"29,90€ / mois  -  Fondateur"}</div></div><div style={{width:12,height:12,borderRadius:"50%",background:cur.c}}/></div>{plan!=="label"&&<button className="btn" style={{marginTop:14}} onClick={goPlan}>{plan==="free"?"Passer Pro →":"Passer Label →"}</button>}</div>
        <div style={{background:"#0A1A0A",border:"1px solid #00C9A722",borderRadius:8,padding:"12px 14px",fontSize:11,color:"#00C9A7",lineHeight:1.8}}><div style={{fontSize:9,letterSpacing:2,marginBottom:6}}>🧪 MODE TEST STRIPE</div><div style={{color:"#888",fontSize:11}}>Activez avec votre SIRET sur stripe.com.</div><div style={{marginTop:8,fontSize:10,color:"#00C9A755"}}>CB test : <strong>4242 4242 4242 4242</strong> · 12/26 · 123</div></div>

      </div>
    </div>
  );
}

// --- CHATBOT IA ---------------------------------------------------------------
const COACH_SYS=`Tu es INDY Coach, l'assistant IA de l'application INDY pour artistes indépendants français. Tu maîtrises parfaitement : SACEM, ISRC, distribution streaming (DistroKid, TuneCore), booking et SMAC, contrats de cession/featuring, financement (CNM, ADAMI, SPEDIDAM, DRAC, résidences), presse & promotion, statuts juridiques (auto-entrepreneur, intermittent, label). Tu réponds de façon concise (3-4 paragraphes max), pratique et bienveillante. Tu tutoies l'artiste. Si tu ne sais pas, tu dis honnêtement et orientes vers la ressource officielle.`;

function Chatbot({plan,onUpgrade,onClose}){
  const [msgs,setMsgs]=useState([{role:"assistant",content:"Salut ! Je suis INDY Coach 🎵\n\nJe suis là pour répondre à toutes tes questions sur la musique indépendante  -  SACEM, booking, subventions, distribution...\n\nC'est quoi ta question ?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);

  const send=async()=>{
    if(plan==="free"||!input.trim()||loading)return;
    const userMsg={role:"user",content:input.trim()};
    setMsgs(prev=>[...prev,userMsg]);setInput("");setLoading(true);
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:800,system:COACH_SYS,messages:[...msgs,userMsg].map(m=>({role:m.role,content:m.content}))})});
      const json=await res.json();
      setMsgs(prev=>[...prev,{role:"assistant",content:json.content?.map(b=>b.text||"").join("")||"Erreur."}]);
    }catch{setMsgs(prev=>[...prev,{role:"assistant",content:"Erreur de connexion. Réessaie."}]);}
    setLoading(false);
  };

  if(plan==="free"){
    return(
      <div className="panel"><div className="pin" style={{borderTopColor:"#FF6B35"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:9,color:"#FF6B35",letterSpacing:2}}>INDY COACH IA</div><div style={{fontSize:14,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,marginTop:2}}>ASSISTANT PERSONNEL</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <Gate onUpgrade={onUpgrade} label="Ton coach IA disponible 24h/24 pour répondre à toutes tes questions sur la musique indépendante  -  SACEM, booking, subventions, contrats, distribution." features={["Réponses instantanées 24h/24","Expertise SACEM, ISRC, CNM, ADAMI","Aide à la rédaction de dossiers","Conseils personnalisés selon ton stade","Réponses sur la distribution, les droits, les contrats"]}/>
      </div></div>
    );
  }

  return(
    <div className="panel"><div className="pin" style={{borderTopColor:"#FF6B35",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"14px 20px",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"#FF6B3518",border:"1px solid #FF6B3533",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🎵</div>
          <div>
            <div style={{fontSize:13,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>INDY COACH</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#00C9A7",animation:"pulse 2s infinite"}}/>
              <div style={{fontSize:9,color:"#00C9A7",letterSpacing:1}}>EN LIGNE</div>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:12,fontFamily:"'Inter',sans-serif"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"90%",padding:"11px 13px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?"#FF6B3520":"#111",border:`1px solid ${m.role==="user"?"#FF6B3533":"#1A1A1A"}`,fontSize:12,color:m.role==="user"?"#F0EDE8":"#CCC",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{padding:"11px 13px",borderRadius:"14px 14px 14px 4px",background:"#111",border:"1px solid #1A1A1A",display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#555",animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div>}
      </div>
      {msgs.length<=1&&(
        <div style={{padding:"0 18px 10px",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
          {["Déposer à la SACEM ?","C'est quoi un ISRC ?","Pitcher Spotify ?","Aides CNM ?","Trouver des dates ?"].map(s=>(
            <button key={s} onClick={()=>{setInput(s);}} style={{background:"#0D0D0D",border:"1px solid #1A1A1A",color:"#666",fontFamily:"'Inter',sans-serif",fontSize:10,padding:"5px 11px",borderRadius:20,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>{s}</button>
          ))}
        </div>
      )}
      <div style={{padding:"11px 18px 14px",borderTop:"1px solid #0F0F0F",flexShrink:0,position:"relative"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Pose ta question..." style={{paddingRight:44,borderRadius:24}}/>
        <button onClick={send} disabled={!input.trim()||loading} style={{position:"absolute",right:26,top:"50%",transform:"translateY(-50%)",background:input.trim()?"#FF6B35":"#1A1A1A",border:"none",color:input.trim()?"#000":"#333",width:30,height:30,borderRadius:"50%",cursor:input.trim()?"pointer":"not-allowed",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
      </div>
    </div></div>
  );
}

// --- APP ROOT -----------------------------------------------------------------
export default function INDYComplete() {
  const [screen,setScreen]=useState("landing");
  const [view,setView]=useState("dashboard");
  const [plan,setPlan]=useState("free");
  const [user,setUser]=useState(null);
  const [projects,setProjects]=useState(INIT_PROJECTS);
  const [activeId,setActiveId]=useState(null);

  const goPlan=()=>setScreen("paywall");
  const goCoach=(id)=>{setActiveId(id);setView("coach");};
  const goBack=()=>setView("dashboard");

  const NAV=[
    {id:"dashboard", l:"Board",    i:"⬛"},
    {id:"coach",     l:"Coach",    i:"🎯"},
    {id:"presskit",  l:"Press Kit",i:"✍️"},
    {id:"booking",   l:"Booking",  i:"🎤"},
    {id:"more",      l:"Plus",     i:"✦"},
  ];

  const [showMore,setShowMore]=useState(false);
  const [showChat,setShowChat]=useState(false);
  const MORE_MENU=[
    {id:"subventions", l:"Financement",i:"💰",c:"#F03E3E"},
    {id:"bibliotheque",l:"Biblio",    i:"📚",c:"#C8A96E"},
    {id:"annuaire",    l:"Annuaire",  i:"🗂️",c:"#FFD43B"},
    {id:"reseau",      l:"Réseau",    i:"🤝",c:"#00C9A7"},
    {id:"profil",      l:"Compte",    i:"👤",c:"#FF6B35"},
  ];

  if(screen==="landing")return(<div style={{background:"#060606",minHeight:"100vh"}}><style>{CSS}</style><Landing onEnter={()=>setScreen("onboarding")}/></div>);
  if(screen==="onboarding")return(<div style={{background:"#080808",minHeight:"100vh"}}><style>{CSS}</style><Onboarding onDone={u=>{setUser(u);setScreen("paywall");}}/></div>);
  if(screen==="paywall")return(<div style={{background:"#080808",minHeight:"100vh"}}><style>{CSS}</style><Paywall onSelect={p=>{setPlan(p);setScreen("app");}} current={plan}/></div>);

  return(
    <div style={{background:"#080808",minHeight:"100vh"}}>
      <style>{CSS}</style>
      <div style={{paddingBottom:64}}>
        {view==="dashboard"  &&<Dashboard projects={projects} setProjects={setProjects} goCoach={goCoach} goPlan={goPlan} plan={plan} user={user}/>}
        {view==="coach"      &&<Coach projects={projects} setProjects={setProjects} activeId={activeId} setActiveId={setActiveId} plan={plan} goBack={goBack}/>}
        {view==="presskit"   &&<PressKit projects={projects} plan={plan} goPlan={goPlan} goBack={goBack}/>}
        {view==="booking"    &&<Booking plan={plan} goPlan={goPlan} goBack={goBack}/>}
        {view==="subventions"&&<Subventions plan={plan} goPlan={goPlan} goBack={goBack}/>}
        {view==="bibliotheque"&&<Bibliotheque plan={plan} goPlan={goPlan} goBack={goBack}/>}
        {view==="annuaire"   &&<Annuaire goBack={goBack}/>}
        {view==="reseau"     &&<Reseau user={user} plan={plan} goPlan={goPlan} goBack={goBack}/>}
        {view==="actualites" &&<Actualites plan={plan} goPlan={goPlan} goBack={goBack}/>}
        {view==="profil"     &&<Profil plan={plan} setPlan={setPlan} user={user} goPlan={goPlan} goBack={goBack}/>}
      </div>

      {/* Menu Plus */}
      {showMore&&(
        <div style={{position:"fixed",inset:0,zIndex:100}} onClick={()=>setShowMore(false)}>
          <div style={{position:"absolute",bottom:64,left:0,right:0,background:"#0A0A0A",borderTop:"1px solid #141414",padding:"12px 18px",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}} onClick={e=>e.stopPropagation()}>
            {MORE_MENU.map(m=>(
              <button key={m.id} onClick={()=>{setView(m.id);setShowMore(false);}} style={{background:view===m.id?`${m.c}15`:"#0D0D0D",border:`1px solid ${view===m.id?m.c:"#1A1A1A"}`,borderRadius:10,padding:"12px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <span style={{fontSize:20}}>{m.i}</span>
                <span style={{fontSize:8,color:view===m.id?m.c:"#444",fontFamily:"'Inter',sans-serif",letterSpacing:0.5}}>{m.l}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chatbot bouton flottant */}
      {!showChat&&plan!=="free"&&(
        <button onClick={()=>setShowChat(true)} style={{position:"fixed",bottom:76,right:16,width:52,height:52,borderRadius:"50%",background:"#FF6B35",border:"none",color:"#000",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:49,boxShadow:"0 4px 20px #FF6B3544",transition:"all 0.3s"}}>
          💬
        </button>
      )}

      {/* Chatbot panel */}
      {showChat&&<Chatbot plan={plan} onUpgrade={()=>{setShowChat(false);goPlan();}} onClose={()=>setShowChat(false)}/>}

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#080808",borderTop:"1px solid #0F0F0F",display:"flex",padding:"4px 0 8px",zIndex:50}}>
        {NAV.map(n=>{
          const isMore=n.id==="more";const act=isMore?showMore:view===n.id;
          return(
            <button key={n.id} className="nav" onClick={()=>{if(isMore){setShowMore(!showMore);}else{setView(n.id);setShowMore(false);}}}>
              <span style={{fontSize:18,filter:act?"none":"grayscale(0.8)",opacity:act?1:0.35,transition:"all 0.2s"}}>{n.i}</span>
              <span style={{fontSize:10,letterSpacing:0.5,color:act?"#FF6B35":"#666",transition:"color 0.2s",fontWeight:act?700:500}}>{n.l}</span>
              {act&&<div style={{width:14,height:2,borderRadius:1,background:"#FF6B35",marginTop:1}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
