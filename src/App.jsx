import React, { useState, useEffect, useRef } from “react”;

// ─── SUPABASE CLIENT (lazy loaded, compatible preview + prod) ─────────────────
// En prod (Vercel/Vite) : variables d’env du build → exposées sur window.**INDY_ENV**
// En preview Claude : pas de Supabase → mode démo silencieux
const getEnv = (key) => {
if (typeof window !== “undefined” && window.**INDY_ENV**?.[key]) return window.**INDY_ENV**[key];
if (typeof globalThis !== “undefined” && globalThis[key]) return globalThis[key];
return “”;
};
const SUPABASE_URL = getEnv(“VITE_SUPABASE_URL”);
const SUPABASE_ANON_KEY = getEnv(“VITE_SUPABASE_ANON_KEY”);

let supabase = null;
const initSupabase = async () => {
if (supabase) return supabase;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
try {
const mod = await import(/* @vite-ignore */ “https://esm.sh/@supabase/supabase-js@2”);
supabase = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
return supabase;
} catch (e) {
console.warn(“Supabase non chargé (mode démo)”, e);
return null;
}
};

// ─── STRIPE PRICE IDs (fondateur) ────────────────────────────────────────────
const STRIPE = {
artiste: “https://buy.stripe.com/9B65kvajx2pAeS0a0C2Ji00”,
label:   “https://buy.stripe.com/6oU6ozajx8NYbFO1u62Ji01”,
};

// ─── PLANS ───────────────────────────────────────────────────────────────────
const PLANS = [
{
id:“free”, name:“DÉCOUVERTE”, price:“0€”, period:””, color:”#999”,
features:[“Dashboard + Coach parcours”,“Annuaire en lecture”,“Accès 3 jours”],
locked:[“Press Kit IA”,“Booking + email IA”,“Matching subventions”,“16 documents”,“💬 Chatbot coach”],
cta:“Commencer l’essai gratuit”,
},
{
id:“artiste”, name:“ARTISTE”, price:“9,90€”, priceFutur:“14,90€”, period:”/mois”,
color:”#FF6B35”, badge:“FONDATEUR”,
features:[“Titres illimités”,“Press Kit IA illimité”,“Booking + email IA”,“Matching subventions”,“16 documents téléchargeables”,“💬 Chatbot IA coach personnel”],
locked:[“Multi-artistes”,“Vue label globale”],
cta:“Devenir INDY Artiste”, link: STRIPE.artiste,
},
{
id:“label”, name:“STUDIO / LABEL”, price:“29,90€”, priceFutur:“34,90€”, period:”/mois”,
color:”#C8A96E”, badge:“FONDATEUR”,
labelInfo:“5 artistes inclus · +4,90€/artiste · max 20”,
features:[“Tout du plan Artiste”,“24 documents complets (contrats avancés)”,“5 artistes inclus”,”+4,90€/artiste supplémentaire”,“Vue globale label”,“💬 Chatbot IA coach”,“Support prioritaire”],
locked:[],
cta:“Passer en mode Label”, link: STRIPE.label,
},
];

// ─── DONNÉES COACH ───────────────────────────────────────────────────────────
const STAGES = [
{id:“creation”,label:“Créer”,icon:“🎛️”,color:”#FF6B35”},
{id:“protection”,label:“Protéger”,icon:“🔐”,color:”#00C9A7”},
{id:“distribution”,label:“Distribuer”,icon:“🚀”,color:”#845EF7”},
{id:“promotion”,label:“Promouvoir”,icon:“📣”,color:”#FFD43B”},
{id:“financement”,label:“Financer”,icon:“💰”,color:”#F03E3E”},
{id:“live”,label:“Performer”,icon:“🎤”,color:”#20C997”},
];
const TASKS = {
creation:[
{id:“c1”,text:“Composition & arrangement finalisés”,tip:“Fais écouter à 3 personnes extérieures avant de valider.”},
{id:“c2”,text:“Mix professionnel (niveaux, EQ, compression)”,tip:“Référence ton mix avec un titre commercial du même genre.”},
{id:“c3”,text:“Master aux normes streaming (-14 LUFS)”,tip:“DistroKid et Spotify normalisent à -14 LUFS.”},
{id:“c4”,text:“Titre et durée définis”,tip:“Entre 2:30 et 3:30 pour maximiser les écoutes complètes.”},
{id:“c5”,text:“Featuring / co-prod documentés”,tip:“Prévoir le partage de droits AVANT la sortie.”},
],
protection:[
{id:“p1”,text:“Œuvre déposée à la SACEM”,tip:“Déposer AVANT la distribution.”},
{id:“p2”,text:“Co-auteurs et répartitions définis”,tip:“Chaque part doit être convenue par écrit.”},
{id:“p3”,text:“ISRC généré ou demandé au distributeur”,tip:“DistroKid l’attribue automatiquement.”},
{id:“p4”,text:“Samples clearés ou libres de droits”,tip:“Un sample non clearé peut faire retirer ton titre.”},
{id:“p5”,text:“Contrat signé avec les featuring”,tip:“Un accord simple par email vaut mieux que rien.”},
],
distribution:[
{id:“d1”,text:“Distributeur choisi”,tip:“DistroKid = rapidité. TuneCore = contrôle total.”},
{id:“d2”,text:“Artwork 3000x3000px validé”,tip:“Spotify rejette les artworks flous.”},
{id:“d3”,text:“Metadata complètes”,tip:“Des metadata précises améliorent la découvrabilité.”},
{id:“d4”,text:“Date de sortie fixée (min. 3 semaines)”,tip:“7 semaines pour le pitch éditorial Spotify.”},
{id:“d5”,text:“Pitch éditorial Spotify envoyé”,tip:“Une seule chance par sortie.”},
],
promotion:[
{id:“pr1”,text:“Press kit artiste à jour”,tip:“Bio courte (100 mots) + longue (300 mots).”},
{id:“pr2”,text:“Contenu TikTok / Reels préparé”,tip:“3 à 5 vidéos prêtes le jour J.”},
{id:“pr3”,text:“Blogs & playlists contactés (J-14)”,tip:“Pitcher 2 semaines avant.”},
{id:“pr4”,text:“Smart link créé”,tip:“Un seul lien dans la bio.”},
{id:“pr5”,text:“Plan de posts semaine 1 défini”,tip:“Lundi teaser · Mercredi sortie · Vendredi réaction.”},
],
financement:[
{id:“f1”,text:“Dossier CNM vérifié”,tip:“Aides à la production, clip, tournée.”},
{id:“f2”,text:“Aides SACEM explorées”,tip:“Bourse Création, aide numérique.”},
{id:“f3”,text:“Dispositifs régionaux & DRAC identifiés”,tip:“Chaque région a ses propres fonds.”},
{id:“f4”,text:“Résidences artistiques consultées”,tip:“Studio gratuit + accompagnement.”},
{id:“f5”,text:“Crowdfunding envisagé”,tip:“Ta communauté finance ET promeut.”},
],
live:[
{id:“l1”,text:“EPK live créé”,tip:“Bio + vidéo live + rider technique.”},
{id:“l2”,text:“Liste de salles cibles établie”,tip:“Commence par 50-100 personnes.”},
{id:“l3”,text:“Mail de démarchage rédigé”,tip:“Court, direct, lien EN PREMIER.”},
{id:“l4”,text:“Plateformes de booking consultées”,tip:“Bandsintown Pro pour contacter des bookers.”},
{id:“l5”,text:“Première partie visée”,tip:“Souvent plus accessible que booker solo.”},
],
};

// ─── DONNÉES SALLES ──────────────────────────────────────────────────────────
const SALLES = [
{id:1,nom:“Le Trabendo”,ville:“Paris”,region:“idf”,jauge:350,cachet_min:800,cachet_max:3000,genres:[“hip-hop”,“afro”,“rnb”,“pop”,“electro”],subv:true,smac:true,res:true,contact:“programmation@letrabendo.net”,site:“https://letrabendo.net”,adresse:“211 Av. Jean Jaurès, 75019”,delai:“4–6 sem.”,tips:“Pitcher 6 mois à l’avance. EPK complet obligatoire.”,color:”#FF6B35”,desc:“Salle emblématique de la Villette. Programmation éclectique, forte en musiques actuelles.”},
{id:2,nom:“La Cigale”,ville:“Paris”,region:“idf”,jauge:1900,cachet_min:2000,cachet_max:15000,genres:[“pop”,“rock”,“afro”,“hip-hop”,“rnb”],subv:false,smac:false,res:false,contact:“booking@lacigale.fr”,site:“https://lacigale.fr”,adresse:“120 Bd Rochechouart, 75018”,delai:“6–8 sem.”,tips:“Nécessite historique de dates et communauté active.”,color:”#845EF7”,desc:“Grande salle parisienne mythique pour artistes en ascension.”},
{id:3,nom:“Le Flow”,ville:“Paris”,region:“idf”,jauge:600,cachet_min:500,cachet_max:2500,genres:[“afro”,“afrobeats”,“dancehall”,“rnb”,“hip-hop”],subv:false,smac:false,res:false,contact:“booking@leflow.fr”,site:“https://leflow.fr”,adresse:“Port de la Villette, 75019”,delai:“2–3 sem.”,tips:“Envoi mix + démo + photos. Réponse rapide.”,color:”#F783AC”,desc:“Club parisien spécialisé dans les musiques afro et diaspora.”},
{id:4,nom:“Point Éphémère”,ville:“Paris”,region:“idf”,jauge:300,cachet_min:400,cachet_max:1500,genres:[“electro”,“rock”,“hip-hop”,“world”,“jazz”],subv:true,smac:true,res:true,contact:“contact@pointephemere.org”,site:“https://pointephemere.org”,adresse:“200 Quai de Valmy, 75010”,delai:“3–5 sem.”,tips:“Résidences fréquentes. Très orienté création.”,color:”#20C997”,desc:“Lieu culturel sur le canal Saint-Martin, résidences et concerts.”},
{id:5,nom:“La Maroquinerie”,ville:“Paris”,region:“idf”,jauge:400,cachet_min:600,cachet_max:2500,genres:[“rock”,“pop”,“electro”,“indie”,“hip-hop”],subv:false,smac:false,res:false,contact:“booking@lamaroquinerie.fr”,site:“https://lamaroquinerie.fr”,adresse:“23 Rue Boyer, 75020”,delai:“4–5 sem.”,tips:“Salle alternative parisienne, très ouverte aux indés.”,color:”#74C0FC”,desc:“Salle de référence du 20e, programmation alternative et émergente.”},
{id:6,nom:“La Boule Noire”,ville:“Paris”,region:“idf”,jauge:350,cachet_min:500,cachet_max:2000,genres:[“rock”,“pop”,“hip-hop”,“electro”,“afro”],subv:false,smac:false,res:false,contact:“booking@laboulenoire.fr”,site:“https://laboulenoire.fr”,adresse:“120 Bd Rochechouart, 75018”,delai:“4–6 sem.”,tips:“Salle du circuit parisien des émergents.”,color:”#845EF7”,desc:“Salle jumelle de la Cigale, idéale pour les artistes en développement.”},
{id:7,nom:“Centre Senghor”,ville:“Paris”,region:“idf”,jauge:300,cachet_min:400,cachet_max:1800,genres:[“afro”,“world”,“jazz”,“rnb”,“spoken word”],subv:true,smac:false,res:true,contact:“programmation@senghor.fr”,site:”#”,adresse:“Paris 12e”,delai:“3–4 sem.”,tips:“Très réceptif aux projets à dimension culturelle africaine.”,color:”#C8A96E”,desc:“Espace culturel dédié aux cultures africaines et de la diaspora.”},
{id:8,nom:“L’Espace Michel Simon”,ville:“Noisy-le-Grand”,region:“idf”,jauge:600,cachet_min:600,cachet_max:2500,genres:[“pop”,“rnb”,“jazz”,“world”,“afro”],subv:true,smac:true,res:true,contact:“prog@espacemichelsimon.fr”,site:“https://espacemichelsimon.fr”,adresse:“Noisy-le-Grand, 93160”,delai:“4–6 sem.”,tips:“SMAC de Seine-Saint-Denis, très ouvert aux cultures urbaines.”,color:”#FF6B35”,desc:“SMAC de référence en Seine-Saint-Denis.”},
{id:9,nom:“Le Molotov”,ville:“Marseille”,region:“paca”,jauge:200,cachet_min:400,cachet_max:1500,genres:[“rock”,“electro”,“hip-hop”,“afro”,“metal”],subv:true,smac:true,res:false,contact:“contact@lemolotov.fr”,site:“https://lemolotov.fr”,adresse:“3 Pl. Paul Cézanne, 13006”,delai:“3–4 sem.”,tips:“Très accessible pour les premiers concerts.”,color:”#00C9A7”,desc:“Salle de référence marseillaise, ancrage local fort.”},
{id:10,nom:“Espace Julien”,ville:“Marseille”,region:“paca”,jauge:1500,cachet_min:1000,cachet_max:6000,genres:[“rock”,“pop”,“hip-hop”,“electro”,“world”],subv:true,smac:true,res:true,contact:“prog@espace-julien.com”,site:“https://espace-julien.com”,adresse:“39 Cours Julien, 13006”,delai:“5–7 sem.”,tips:“Grande SMAC marseillaise, programmation éclectique.”,color:”#845EF7”,desc:“Grande salle du Cours Julien, cœur culturel de Marseille.”},
{id:11,nom:“La Salle des Machines”,ville:“Lyon”,region:“aura”,jauge:500,cachet_min:600,cachet_max:2500,genres:[“electro”,“hip-hop”,“afro”,“rnb”,“pop”],subv:true,smac:true,res:true,contact:“prog@lasalledesmachines.com”,site:“https://lasalledesmachines.com”,adresse:“60 Rue Dr Bouchut, 69007”,delai:“4–5 sem.”,tips:“Résidences priorité régionale.”,color:”#FFD43B”,desc:“Ancienne usine reconvertie, programmation émergente à Lyon.”},
{id:12,nom:“Le Bikini”,ville:“Toulouse”,region:“occitanie”,jauge:1500,cachet_min:1000,cachet_max:6000,genres:[“rock”,“metal”,“electro”,“hip-hop”,“afro”],subv:true,smac:true,res:false,contact:“programmation@lebikini.com”,site:“https://lebikini.com”,adresse:“Rue Jacqueline Auriol, 31400”,delai:“6–8 sem.”,tips:“Formulaire en ligne obligatoire.”,color:”#F03E3E”,desc:“SMAC historique du Sud-Ouest, programmation nationale.”},
{id:13,nom:“L’Ubu”,ville:“Rennes”,region:“bretagne”,jauge:400,cachet_min:500,cachet_max:2000,genres:[“rock”,“electro”,“pop”,“hip-hop”,“world”],subv:true,smac:true,res:true,contact:“contact@ubu-rennes.com”,site:“https://ubu-rennes.com”,adresse:“1 Rue Saint-Hélier, 35000”,delai:“4–6 sem.”,tips:“Résidences prioritaires pour artistes bretons.”,color:”#20C997”,desc:“Salle incontournable de Bretagne, programmation exigeante.”},
{id:14,nom:“La Laiterie”,ville:“Strasbourg”,region:“alsace”,jauge:900,cachet_min:800,cachet_max:4000,genres:[“rock”,“electro”,“pop”,“metal”,“hip-hop”],subv:true,smac:true,res:true,contact:“bookings@artefact.org”,site:“https://artefact.org”,adresse:“13 Rue du Hohwald, 67000”,delai:“5–6 sem.”,tips:“Structure Artefact gère plusieurs salles.”,color:”#74C0FC”,desc:“SMAC alsacienne de référence, programmation internationale.”},
{id:15,nom:“Le Splendid”,ville:“Lille”,region:“nord”,jauge:800,cachet_min:600,cachet_max:3000,genres:[“rock”,“pop”,“hip-hop”,“electro”,“world”],subv:true,smac:true,res:true,contact:“prog@splendid-lille.fr”,site:“https://splendid-lille.fr”,adresse:“1 Pl. du Mont de Terre, 59000”,delai:“4–6 sem.”,tips:“SMAC lilloise de référence.”,color:”#F783AC”,desc:“SMAC majeure de Lille et de la métropole nordiste.”},
{id:16,nom:“I.Boat”,ville:“Bordeaux”,region:“bordeaux”,jauge:400,cachet_min:400,cachet_max:1800,genres:[“electro”,“hip-hop”,“afro”,“rnb”,“techno”],subv:true,smac:true,res:false,contact:“contact@iboat.eu”,site:“https://iboat.eu”,adresse:“Hangar H, Quai Armand Lalande”,delai:“3–5 sem.”,tips:“Péniche culturelle bordelaise, très branchée.”,color:”#20C997”,desc:“Club et salle sur les quais de Bordeaux.”},
{id:17,nom:“Rock School Barbey”,ville:“Bordeaux”,region:“bordeaux”,jauge:600,cachet_min:500,cachet_max:2500,genres:[“rock”,“pop”,“hip-hop”,“electro”,“folk”],subv:true,smac:true,res:true,contact:“prog@rockschool-barbey.com”,site:“https://rockschool-barbey.com”,adresse:“18 Cours Barbey, 33000”,delai:“4–6 sem.”,tips:“Structure majeure bordelaise, résidences disponibles.”,color:”#F03E3E”,desc:“Structure culturelle de référence à Bordeaux.”},
{id:18,nom:“Le Rocher de Palmer”,ville:“Cenon”,region:“bordeaux”,jauge:1200,cachet_min:800,cachet_max:5000,genres:[“world”,“afro”,“jazz”,“pop”,“hip-hop”],subv:true,smac:true,res:true,contact:“prog@rocher-de-palmer.fr”,site:“https://rocher-de-palmer.fr”,adresse:“1 Rue Aristide Briand, 33150”,delai:“4–6 sem.”,tips:“Très forte programmation world et afro.”,color:”#C8A96E”,desc:“SMAC de la métropole bordelaise, fort ancrage world music.”},
];

// ─── DONNÉES ANNUAIRE ────────────────────────────────────────────────────────
const STUDIOS_ENREG = [
{nom:“Studio Gang”,ville:“Paris 10e”,prix:“80€/h”,contact:“studiogangparis@gmail.com”,desc:“Studio pro certifié, ingé son inclus, cabine vocale isolée, Pro Tools + Logic.”,tags:[“Pro Tools”,“Mix”,“Cabine”]},
{nom:“Black Box Studio”,ville:“Paris 18e”,prix:“90€/h”,contact:“blackboxparis.fr”,desc:“Spécialisé hip-hop et musiques urbaines. Booth vocal haut de gamme.”,tags:[“Hip-Hop”,“Urbain”,“Booth”]},
{nom:“Volta Studio”,ville:“Paris 18e”,prix:“70€/h”,contact:“voltastudio.fr”,desc:“Studio polyvalent, acoustique optimale, Pro Tools + Logic Pro.”,tags:[“Pop”,“R&B”,“Pro Tools”]},
{nom:“Studio des Dames”,ville:“Paris 9e”,prix:“65€/h”,contact:“studiodesdames.fr”,desc:“Ambiance cosy, spécialité chanson et voix.”,tags:[“Chanson”,“Voix”,“Intimiste”]},
{nom:“Studio Ferber”,ville:“Paris 16e”,prix:“120€/h”,contact:“studioferber.com”,desc:“Studio légendaire. Haut de gamme.”,tags:[“Légendaire”,“Rock”,“Prestige”]},
{nom:“Sun Studio Marseille”,ville:“Marseille”,prix:“55€/h”,contact:“sunstudio13.com”,desc:“Spécialité reggae, world et afro. Ambiance chaleureuse.”,tags:[“Reggae”,“World”,“Marseille”]},
{nom:“Studio Aquarium”,ville:“Lyon”,prix:“60€/h”,contact:“studioaquarium.fr”,desc:“Studio avec vue sur le Rhône, ambiance unique.”,tags:[“Lyon”,“Vue”,“Pro Tools”]},
{nom:“Studio Midlands”,ville:“Toulouse”,prix:“50€/h”,contact:“studiomidlands.fr”,desc:“Studio rock et pop à Toulouse.”,tags:[“Rock”,“Pop”,“Toulouse”]},
{nom:“MixMaster FR”,ville:“En ligne”,prix:“Dès 80€/titre”,contact:“mixmasterfr.com”,desc:“Mix & mastering en ligne, délai 48h, 3 retouches incluses.”,tags:[“Mix”,“Master”,“En ligne”]},
];
const STUDIOS_REPET = [
{nom:“Répèt Nation”,ville:“Paris 11e”,prix:“15€/h”,contact:“repetnation.fr”,desc:“20 salles équipées, sono complète, location instruments.”,tags:[“Paris”,“Sono”,“Location”]},
{nom:“My Music”,ville:“Paris 18e”,prix:“12€/h”,contact:“mymusicrepet.fr”,desc:“Réseau de salles de répétition pas chères à Paris.”,tags:[“Pas cher”,“Réseau”,“Paris”]},
{nom:“Studio Glaz’Art”,ville:“Paris 19e”,prix:“13€/h”,contact:“glazart.com”,desc:“Répèt + scène + salle de concert dans le même lieu.”,tags:[“Scène”,“Polyvalent”,“Paris”]},
{nom:“La Halle Tropisme”,ville:“Montpellier”,prix:“10€/h”,contact:“tropisme.org”,desc:“Lieu culturel avec studios de répète à tarif solidaire.”,tags:[“Solidaire”,“Culturel”,“Montpellier”]},
{nom:“La Cave”,ville:“Bordeaux”,prix:“12€/h”,contact:“lacavebdx.fr”,desc:“Salles de répète en sous-sol, idéal rock et métal.”,tags:[“Rock”,“Métal”,“Bordeaux”]},
{nom:“Studio Tempo”,ville:“Toulouse”,prix:“10€/h”,contact:“studiotempo31.com”,desc:“Réseau de salles à Toulouse, booking en ligne.”,tags:[“En ligne”,“Toulouse”,“Réseau”]},
{nom:“Répète à Gogo”,ville:“Lyon”,prix:“11€/h”,contact:“repeteagogo.fr”,desc:“Réseau lyonnais de salles de répétition.”,tags:[“Lyon”,“Réseau”,“Abordable”]},
{nom:“Espace Son”,ville:“Marseille”,prix:“11€/h”,contact:“espaceson13.fr”,desc:“Studios de répète dans le 13e, sono Dynacord.”,tags:[“Marseille”,“Sono”,“Abordable”]},
];
const RESIDENCES = [
{nom:“La Villette — Résidences”,ville:“Paris”,prix:“Gratuit (dossier)”,contact:“lavillette.com/residences”,desc:“Résidences artistiques subventionnées au cœur de Paris.”,tags:[“Subventionné”,“Studio”,“Paris”]},
{nom:“Château de Goutelas”,ville:“Loire”,prix:“Hébergement inclus”,contact:“chateaugoutelas.fr”,desc:“Résidences immersives en milieu rural, hébergement inclus.”,tags:[“Hébergement”,“Rural”,“Immersive”]},
{nom:“Le 6b”,ville:“Saint-Denis”,prix:“Dossier”,contact:“le6b.fr”,desc:“Tiers-lieu artistique avec résidences de création.”,tags:[“Tiers-lieu”,“Saint-Denis”,“Création”]},
{nom:“Cité de la Musique”,ville:“Paris”,prix:“Sur dossier”,contact:“philharmoniedeparis.fr”,desc:“Résidences musicales à la Philharmonie de Paris.”,tags:[“Philharmonie”,“Prestige”,“Paris”]},
{nom:“Le Quartz”,ville:“Brest”,prix:“Hébergement inclus”,contact:“lequartz.com”,desc:“Scène nationale bretonne, résidences et coproductions.”,tags:[“Bretagne”,“Scène nationale”,“Coproduction”]},
{nom:“Le Lieu Unique”,ville:“Nantes”,prix:“Sur dossier”,contact:“lelieuunique.com”,desc:“Scène nationale de Nantes, résidences ouvertes.”,tags:[“Nantes”,“Scène nationale”,“Ouvert”]},
{nom:“L’Astrobale”,ville:“Lyon”,prix:“Variable”,contact:“lastrobale.fr”,desc:“Résidences de création sonore et musicale à Lyon.”,tags:[“Sonore”,“Lyon”,“Création”]},
];
const TREMPLINS = [
{nom:“Les Inrocks Lab”,ville:“Paris”,deadline:“Annuel · Oct.”,prix:“Tournée + accompagnement”,contact:“lesinrocks.com/lab”,desc:“Le tremplin des Inrockuptibles, le plus prestigieux de France.”,tags:[“Prestige”,“National”,“Médias”]},
{nom:“Découvertes RFI”,ville:“Paris”,deadline:“Annuel · Janv.”,prix:“Diffusion internationale”,contact:“rfi.fr/decouvertes”,desc:“Tremplin radio international pour artistes francophones.”,tags:[“Radio”,“International”,“Francophone”]},
{nom:“Printemps de Bourges”,ville:“Bourges”,deadline:“Annuel · Nov.”,prix:“Date au festival”,contact:“printemps-bourges.com”,desc:“Plateau déjeuner du festival, très médiatisé.”,tags:[“Festival”,“Médias”,“National”]},
{nom:“Trans Musicales — OFF”,ville:“Rennes”,deadline:“Annuel · Sept.”,prix:“Date au festival”,contact:“lestrans.com”,desc:“Tremplin des Transmusicales, découverte internationale.”,tags:[“International”,“Rennes”,“Découverte”]},
{nom:“Lyon Tremplin”,ville:“Lyon”,deadline:“Annuel · Fév.”,prix:“Tournée 5 dates + studio”,contact:“lyontremplin.com”,desc:“Tremplin annuel avec premier prix tournée.”,tags:[“Lyon”,“Tournée”,“Studio”]},
{nom:“Jams de Paris”,ville:“Paris”,deadline:“Hebdo”,prix:“Scène + réseau”,contact:“jamseparis.fr”,desc:“Sessions de jams professionnelles chaque semaine à Paris.”,tags:[“Jam”,“Hebdo”,“Réseau”]},
];

// ─── FÉDÉRATIONS & ANNUAIRES OFFICIELS ────────────────────────────────────────
const FEDERATIONS = [
{nom:“FEDELIMA”,ville:“National”,site:“https://www.fedelima.org”,desc:“Fédération nationale des lieux de musiques actuelles. Annuaire de 150+ salles SMAC.”,tags:[“SMAC”,“National”,“Fédération”]},
{nom:“SMA — Syndicat Musiques Actuelles”,ville:“National”,site:“https://www.sma-syndicat.org”,desc:“Syndicat des structures musicales : labels, festivals, salles, producteurs.”,tags:[“Syndicat”,“Labels”,“Pro”]},
{nom:“FELIN — Labels Indépendants”,ville:“National”,site:“https://federation-felin.fr”,desc:“Fédération nationale des labels indépendants en France.”,tags:[“Labels”,“Indé”,“Fédération”]},
{nom:“IRMA — Centre info musiques actuelles”,ville:“Paris”,site:“https://www.irma.asso.fr”,desc:“Centre d’information et de ressources sur les musiques actuelles. Annuaires complets.”,tags:[“Ressources”,“Annuaire”,“National”]},
{nom:“CNM — Centre National de la Musique”,ville:“National”,site:“https://cnm.fr”,desc:“Établissement public dédié à la musique. Aides, observatoire, annuaires.”,tags:[“Public”,“Aides”,“National”]},
{nom:“SACEM”,ville:“National”,site:“https://www.sacem.fr”,desc:“Société des auteurs, compositeurs et éditeurs de musique. Droits d’auteur.”,tags:[“Droits”,“Auteurs”]},
{nom:“ADAMI”,ville:“National”,site:“https://www.adami.fr”,desc:“Société civile pour les droits des artistes-interprètes.”,tags:[“Interprètes”,“Droits”,“Aides”]},
{nom:“SPEDIDAM”,ville:“National”,site:“https://www.spedidam.fr”,desc:“Société de perception et distribution des droits des artistes-interprètes.”,tags:[“Musiciens”,“Droits”,“Aides”]},
{nom:“SCPP”,ville:“National”,site:“https://www.scpp.fr”,desc:“Société Civile des Producteurs Phonographiques. Codes ISRC, droits voisins.”,tags:[“Producteurs”,“ISRC”,“Droits”]},
{nom:“SPPF”,ville:“National”,site:“https://www.sppf.com”,desc:“Société des Producteurs de Phonogrammes (labels indépendants).”,tags:[“Indé”,“Producteurs”]},
{nom:“PRODISS”,ville:“National”,site:“https://www.prodiss.org”,desc:“Syndicat national des producteurs, diffuseurs et salles de spectacles.”,tags:[“Spectacle”,“Syndicat”]},
{nom:“SNEP”,ville:“National”,site:“https://snepmusique.com”,desc:“Syndicat national de l’édition phonographique. Annuaires labels.”,tags:[“Labels”,“Distribution”]},
{nom:“GAM — Guilde des Artistes”,ville:“National”,site:“https://www.gam.fr”,desc:“Guilde des Artistes de la Musique. Défense des droits des artistes.”,tags:[“Artistes”,“Défense”]},
{nom:“Zone Franche”,ville:“National”,site:“https://zonefranche.com”,desc:“Réseau des musiques du monde en France. 200+ structures membres.”,tags:[“World”,“Réseau”]},
{nom:“Grands Formats”,ville:“National”,site:“https://grandsformats.com”,desc:“Fédération des grands ensembles musicaux (jazz, musiques improvisées).”,tags:[“Jazz”,“Ensemble”]},
{nom:“FAMDT — Musiques traditionnelles”,ville:“National”,site:“https://www.famdt.com”,desc:“Fédération des associations de musiques et danses traditionnelles.”,tags:[“Trad”,“Folk”]},
{nom:“RIF — Île-de-France”,ville:“IDF”,site:“https://www.lerif.org”,desc:“Réseau des musiques actuelles en Île-de-France. Annuaire IDF complet.”,tags:[“IDF”,“Régional”]},
{nom:“FÉMA — Sud / PACA”,ville:“PACA”,site:“https://www.fema-asso.com”,desc:“Fédération des musiques actuelles en région Sud.”,tags:[“PACA”,“Régional”]},
{nom:“LE POLE — Pays de la Loire”,ville:“Nantes”,site:“https://www.lepole.asso.fr”,desc:“Réseau des acteurs de la filière musicale en Pays de la Loire.”,tags:[“Loire”,“Régional”]},
{nom:“Haute Fidélité — Hauts-de-France”,ville:“Lille”,site:“https://www.hautefidelite.org”,desc:“Réseau des musiques actuelles des Hauts-de-France.”,tags:[“Nord”,“Régional”]},
];

// ─── DONNÉES AIDES ───────────────────────────────────────────────────────────
const AFF = {
sacem:“https://www.sacem.fr/cms/home/la-sacem/rejoindre-la-sacem”,
cnm:“https://cnm.fr/aides/”,
drac:“https://www.culture.gouv.fr/Regions”,
adami:“https://www.adami.fr/artiste/aides-et-bourses/”,
spedidam:“https://www.spedidam.fr/aides/”,
kkbb:“https://www.kisskissbankbank.com/”,
isrc:“https://www.scpp.fr/SCPP/fr/Les-Services/ISRC/L-ISRC.aspx”,
distrokid:“https://distrokid.com/vip/seven/TONCODE”,
irma:“https://www.irma.asso.fr”,
};
const AIDES = [
{id:“cnm_prod”,nom:“CNM — Production phonographique”,org:“Centre National de la Musique”,icon:“🏛️”,color:”#FF6B35”,montant:“Jusqu’à 50 000 €”,delai:“4–6 mois”,desc:“Aide à la production d’un album ou EP pour les producteurs indépendants.”,statuts:[“auto”,“intermittent”,“association”],projets:[“album”,“studio”],budgets:[“moyen”,“grand”,“xl”],sacem:false,lien:AFF.cnm,etapes:[“Créer un compte CNM”,“Dossier artistique complet”,“Déposer avant date limite trimestrielle”]},
{id:“cnm_clip”,nom:“CNM — Aide au clip vidéo”,org:“Centre National de la Musique”,icon:“🏛️”,color:”#FF6B35”,montant:“Jusqu’à 15 000 €”,delai:“2–3 mois”,desc:“Soutien à la réalisation de clips pour artistes et labels indépendants.”,statuts:[“auto”,“intermittent”,“association”],projets:[“clip”],budgets:[“petit”,“moyen”,“grand”],sacem:false,lien:AFF.cnm,etapes:[“Compte CNM actif”,“Devis réalisateur”,“Dépôt du dossier”]},
{id:“sacem_bourse”,nom:“SACEM — Bourse à la création”,org:“SACEM”,icon:“🎵”,color:”#845EF7”,montant:“1 500 – 10 000 €”,delai:“2–3 mois”,desc:“Aide directe aux compositeurs membres pour financer un projet de création.”,statuts:[“auto”,“intermittent”,“association”,“aucun”],projets:[“album”,“studio”,“clip”],budgets:[“petit”,“moyen”],sacem:true,lien:AFF.sacem,etapes:[“Être membre SACEM actif”,“Dossier artistique”,“Vote du comité”]},
{id:“adami”,nom:“ADAMI — Aides aux artistes”,org:“ADAMI”,icon:“🎤”,color:”#F03E3E”,montant:“1 000 – 15 000 €”,delai:“2–4 mois”,desc:“L’ADAMI gère les droits des artistes-interprètes et finance des projets.”,statuts:[“intermittent”,“auto”],projets:[“album”,“tournee”,“clip”],budgets:[“petit”,“moyen”],sacem:false,lien:AFF.adami,etapes:[“Être artiste-interprète”,“Dossier projet”,“Soumission en ligne”]},
{id:“spedidam”,nom:“SPEDIDAM — Soutien musiciens”,org:“SPEDIDAM”,icon:“🥁”,color:”#FFD43B”,montant:“500 – 8 000 €”,delai:“2–3 mois”,desc:“La SPEDIDAM soutient les projets des musiciens interprètes.”,statuts:[“intermittent”,“auto”],projets:[“album”,“studio”,“tournee”],budgets:[“petit”,“moyen”],sacem:false,lien:AFF.spedidam,etapes:[“Être musicien interprète”,“Dossier artistique”,“Dépôt en ligne”]},
{id:“drac”,nom:“DRAC — Aide régionale”,org:“Min. de la Culture”,icon:“🗺️”,color:”#20C997”,montant:“1 000 – 20 000 €”,delai:“3–5 mois”,desc:“Financements locaux pour projets culturels ancrés dans la région.”,statuts:[“association”,“intermittent”],projets:[“album”,“tournee”,“clip”,“studio”],budgets:[“petit”,“moyen”,“grand”],sacem:false,lien:AFF.drac,etapes:[“Contacter ta DRAC régionale”,“Dossier artistique”,“Ancrage territorial requis”]},
{id:“kkbb”,nom:“Crowdfunding — KissKissBankBank”,org:“Financement participatif”,icon:“🤝”,color:”#F03E3E”,montant:“Selon campagne”,delai:“30–60 jours”,desc:“Ta communauté finance ET promeut ton projet.”,statuts:[“auto”,“intermittent”,“association”,“aucun”],projets:[“album”,“clip”,“studio”],budgets:[“petit”,“moyen”],sacem:false,lien:AFF.kkbb,etapes:[“Définir contreparties”,“Vidéo de présentation”,“Activer ta communauté”]},
];
const FINANCEMENT_QS = [
{id:“statut”,q:“Ton statut ?”,opts:[{v:“auto”,l:“Auto-entrepreneur”},{v:“intermittent”,l:“Intermittent”},{v:“association”,l:“Association”},{v:“aucun”,l:“Pas de statut”}]},
{id:“sacem”,q:“Membre SACEM ?”,opts:[{v:“oui”,l:“Oui”},{v:“non”,l:“Non”},{v:“process”,l:“En cours”}]},
{id:“projet”,q:“Ton projet ?”,opts:[{v:“album”,l:“Album / EP”},{v:“clip”,l:“Clip vidéo”},{v:“tournee”,l:“Tournée”},{v:“studio”,l:“Studio”}]},
{id:“budget”,q:“Budget estimé ?”,opts:[{v:“petit”,l:”< 3 000 €”},{v:“moyen”,l:“3k–15k €”},{v:“grand”,l:“15k–50k €”},{v:“xl”,l:”> 50 000 €”}]},
];
function scoreAide(a,ans){let s=0,m=0;m+=3;if(ans.statut&&a.statuts.includes(ans.statut))s+=3;m+=4;if(ans.projet&&a.projets.includes(ans.projet))s+=4;m+=2;if(a.sacem){if(ans.sacem===“oui”)s+=2;}else s+=2;m+=2;if(ans.budget&&a.budgets.includes(ans.budget))s+=2;return Math.round(s/m*100);}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const gp = p => {const v=Object.values(p);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):0;};
const daysUntil = d => {if(!d)return null;return Math.ceil((new Date(d)-new Date())/86400000);};
const COLORS = [”#FF6B35”,”#00C9A7”,”#845EF7”,”#FFD43B”,”#F03E3E”,”#20C997”,”#74C0FC”,”#F783AC”];
const AI_SYSTEM = “Tu es un expert musical dans la scène indépendante française. Rédige des textes professionnels, authentiques, percutants. Style direct, vivant, sans clichés. Réponds UNIQUEMENT avec le texte demandé.”;
const COACH_SYS = “Tu es INDY Coach, l’assistant IA de l’application INDY pour artistes indépendants français. Tu maîtrises : SACEM, ISRC, distribution streaming, booking, contrats, financement (CNM, ADAMI, SPEDIDAM, DRAC), presse, statuts juridiques. Tu réponds de façon concise (3-4 paragraphes max), pratique et bienveillante. Tu tutoies l’artiste.”;

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Bebas+Neue&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:3px;height:3px} ::-webkit-scrollbar-thumb{background:#1A1A1A;border-radius:2px} input,textarea{width:100%;background:#111;border:1px solid #1E1E1E;color:#F0EDE8;font-family:'Inter',sans-serif;font-size:12px;padding:11px 13px;border-radius:6px;outline:none;-webkit-appearance:none;transition:border-color 0.2s} input:focus,textarea:focus{border-color:#FF6B3555} input::placeholder,textarea::placeholder{color:#555} input[type=date]{color-scheme:dark} textarea{resize:none} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}} @keyframes glow{0%,100%{box-shadow:0 0 20px #FF6B3515}50%{box-shadow:0 0 35px #FF6B3530}} @keyframes spin{to{transform:rotate(360deg)}} .fu{animation:fadeUp 0.3s ease forwards} .fi{animation:fadeIn 0.25s ease forwards} .btn{background:linear-gradient(135deg,#FF6B35 0%,#FF8550 100%);border:none;color:#000;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:13px 20px;border-radius:8px;cursor:pointer;font-weight:500;transition:all 0.25s;width:100%;box-shadow:0 4px 14px #FF6B3530} .btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px #FF6B3555} .btn:disabled{background:#1A1A1A;color:#333;box-shadow:none;transform:none;cursor:not-allowed} .btn-o{background:none;border:1px solid #1E1E1E;color:#555;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:11px 18px;border-radius:5px;cursor:pointer;transition:all 0.2s} .btn-o:hover{border-color:#333;color:#888} .pill{font-size:9px;letter-spacing:1px;padding:2px 8px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;text-transform:uppercase} .chip{display:inline-flex;font-size:9px;color:#555;background:#111;padding:2px 8px;border-radius:20px} .card{background:linear-gradient(180deg,#0F0F0F 0%,#0B0B0B 100%);border-radius:12px;border:1px solid #1A1A1A;transition:all 0.25s;box-shadow:0 2px 8px rgba(0,0,0,0.3)} .card:hover{border-color:#2A2A2A;box-shadow:0 4px 16px rgba(0,0,0,0.5)} .panel{position:fixed;inset:0;background:#000000EE;z-index:200;display:flex;flex-direction:column;animation:fadeIn 0.2s ease} .pin{background:#080808;flex:1;overflow-y:auto;animation:fadeUp 0.25s ease;border-top:2px solid} .tab{flex:1;background:none;border:none;border-bottom:2px solid transparent;color:#444;font-family:'Inter',sans-serif;font-size:9px;letter-spacing:1px;padding:10px 0;cursor:pointer;transition:all 0.2s;text-transform:uppercase} .tab.on{color:#FF6B35;border-bottom-color:#FF6B35} .nav{display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 0;cursor:pointer;flex:1;background:none;border:none;font-family:'Inter',sans-serif;transition:all 0.2s} a.lnk{display:block;text-align:center;padding:12px;border-radius:5px;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;transition:all 0.2s}`;

// ─── LOGO ────────────────────────────────────────────────────────────────────
function Logo({size=70,anim=false}){
return(
<svg width={size} height={size} viewBox=“0 0 100 100” fill=“none” style={anim?{animation:“float 3s ease-in-out infinite”}:{}}>
<defs>
<linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35"/><stop offset="100%" stopColor="#F03E3E"/></linearGradient>
</defs>
<circle cx="50" cy="50" r="46" stroke="url(#lg1)" strokeWidth="1.5" fill="none" opacity="0.35"/>
<circle cx="50" cy="50" r="36" fill="#0D0D0D" stroke="#FF6B3322" strokeWidth="1"/>
<rect x="46" y="27" width="8" height="46" fill="url(#lg1)" rx="2"/>
<rect x="37" y="27" width="26" height="7" fill="url(#lg1)" rx="2"/>
<rect x="37" y="66" width="26" height="7" fill="url(#lg1)" rx="2"/>
<circle cx="69" cy="31" r="5" fill="#FF6B35"/><circle cx="69" cy="31" r="2.5" fill="#FF9F7A"/>
<path d="M27 41 Q21 50 27 59" stroke="#FF6B35" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65"/>
<path d="M73 41 Q79 50 73 59" stroke="#845EF7" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65"/>
</svg>
);
}

// ─── HDR — header avec flèche retour orange ──────────────────────────────────
function Hdr({sub, accent=”#FF6B35”, right, onBack}){
return(
<div style={{padding:“16px 20px 13px”,borderBottom:“1px solid #0F0F0F”,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
{onBack&&(
<button onClick={onBack} style={{background:“none”,border:“none”,color:”#FF6B35”,fontSize:22,cursor:“pointer”,padding:“0 6px 0 0”,lineHeight:1,display:“flex”,alignItems:“center”}}>←</button>
)}
<div>
<div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:24,letterSpacing:4,color:accent}}>INDY</div>
<div style={{fontSize:9,color:”#888”,letterSpacing:2.5,marginTop:1}}>{sub}</div>
</div>
</div>
{right}
</div>
);
}

// ─── TOAST GATE ───────────────────────────────────────────────────────────────
function GateToast({onUpgrade}){
return(
<div className=“fi” style={{position:“fixed”,bottom:80,left:18,right:18,background:”#0D0D0D”,border:“1px solid #FF6B3544”,borderRadius:12,padding:“14px 16px”,zIndex:300,display:“flex”,alignItems:“center”,gap:12,boxShadow:“0 8px 32px #00000088”}}>
<span style={{fontSize:20}}>🔒</span>
<div style={{flex:1}}><div style={{fontSize:12,color:”#F0EDE8”,fontWeight:600}}>Réservé aux abonnés</div><div style={{fontSize:10,color:”#555”,marginTop:2}}>Débloque l’accès dès 9,90€/mois</div></div>
<button onClick={onUpgrade} style={{background:”#FF6B35”,border:“none”,color:”#000”,fontFamily:”‘Inter’,sans-serif”,fontSize:9,letterSpacing:2,padding:“8px 12px”,borderRadius:20,cursor:“pointer”,fontWeight:600,flexShrink:0}}>S’ABONNER</button>
</div>
);
}

// ─── AUTH — Login / Signup ────────────────────────────────────────────────────
function Auth({onSuccess, onBack}){
const [mode,setMode]=useState(“signin”); // “signin” | “signup”
const [email,setEmail]=useState(””);
const [password,setPassword]=useState(””);
const [name,setName]=useState(””);
const [err,setErr]=useState(””);
const [loading,setLoading]=useState(false);

const handle=async()=>{
setErr(””);
if(!email||!password){setErr(“Email et mot de passe requis”);return;}
if(mode===“signup”&&!name){setErr(“Ton nom d’artiste est requis”);return;}
if(password.length<6){setErr(“Mot de passe : 6 caractères min.”);return;}
setLoading(true);
try{
const sb = await initSupabase();
if(!sb){
// Fallback démo sans Supabase configuré
setTimeout(()=>{onSuccess({id:“demo-”+Date.now(),email,name:name||email.split(”@”)[0]});setLoading(false);},600);
return;
}
if(mode===“signup”){
const {data,error}=await sb.auth.signUp({email,password,options:{data:{name}}});
if(error){setErr(error.message);setLoading(false);return;}
if(data.user){
await sb.from(“profiles”).upsert({id:data.user.id,email:data.user.email,name,plan:“free”});
onSuccess({id:data.user.id,email:data.user.email,name});
}
} else {
const {data,error}=await sb.auth.signInWithPassword({email,password});
if(error){setErr(“Identifiants incorrects”);setLoading(false);return;}
const {data:profile}=await sb.from(“profiles”).select(”*”).eq(“id”,data.user.id).single();
onSuccess({id:data.user.id,email:data.user.email,name:profile?.name||email.split(”@”)[0],plan:profile?.plan||“free”});
}
}catch(e){setErr(“Erreur de connexion : “+e.message);}
setLoading(false);
};

return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,display:“flex”,flexDirection:“column”}}>
<div style={{padding:“16px 20px”,display:“flex”,alignItems:“center”,gap:12}}>
{onBack&&<button onClick={onBack} style={{background:“none”,border:“none”,color:”#FF6B35”,fontSize:22,cursor:“pointer”}}>←</button>}
<div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:22,letterSpacing:4,color:”#FF6B35”}}>INDY</div>
</div>
<div style={{flex:1,display:“flex”,flexDirection:“column”,padding:“20px 28px”,gap:18}}>
<div style={{textAlign:“center”,marginBottom:8}}>
<Logo size={60} anim/>
<div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:26,letterSpacing:3,marginTop:14}}>{mode===“signin”?“CONNEXION”:“CRÉER UN COMPTE”}</div>
<div style={{fontSize:11,color:”#666”,marginTop:6}}>{mode===“signin”?“Retrouve ton parcours artiste”:“Rejoins les 200 membres fondateurs”}</div>
</div>
<div style={{display:“flex”,flexDirection:“column”,gap:12}}>
{mode===“signup”&&<div><label style={{fontSize:11,color:”#AAA”,letterSpacing:1,fontWeight:600,display:“block”,marginBottom:7}}>NOM D’ARTISTE</label><input value={name} onChange={e=>setName(e.target.value)} placeholder=“Ton nom d’artiste…”/></div>}
<div><label style={{fontSize:11,color:”#AAA”,letterSpacing:1,fontWeight:600,display:“block”,marginBottom:7}}>EMAIL</label><input type=“email” value={email} onChange={e=>setEmail(e.target.value)} placeholder=“toi@email.com”/></div>
<div><label style={{fontSize:11,color:”#AAA”,letterSpacing:1,fontWeight:600,display:“block”,marginBottom:7}}>MOT DE PASSE</label><input type=“password” value={password} onChange={e=>setPassword(e.target.value)} placeholder=“Min. 6 caractères” onKeyDown={e=>e.key===“Enter”&&handle()}/></div>
{err&&<div style={{fontSize:11,color:”#F03E3E”,background:”#F03E3E12”,border:“1px solid #F03E3E33”,borderRadius:6,padding:“8px 12px”}}>{err}</div>}
<button className="btn" disabled={loading} onClick={handle}>{loading?“Connexion…”:mode===“signin”?“Se connecter →”:“Créer mon compte →”}</button>
<button className=“btn-o” style={{width:“100%”}} onClick={()=>{setMode(mode===“signin”?“signup”:“signin”);setErr(””);}}>{mode===“signin”?“Pas encore de compte ? S’inscrire”:“Déjà un compte ? Se connecter”}</button>
</div>
{!supabase&&<div style={{fontSize:10,color:”#555”,textAlign:“center”,marginTop:8,lineHeight:1.5}}>Mode démo · Supabase non configuré<br/>(en prod : session persistante + reconnexion)</div>}
</div>
</div>
);
}

// ─── PAYWALL — unique composant d’accès ──────────────────────────────────────
function Paywall({onSelect, current}){
const [confirming,setConfirming]=useState(null); // plan en attente de confirmation paiement

const choose=(plan)=>{
if(plan.id===“free”){onSelect(“free”);return;}
// Pour artiste/label : afficher modale de confirmation interne
setConfirming(plan);
};

const confirmPayment=()=>{
// Ouvre Stripe Checkout dans nouvel onglet
window.open(confirming.link,”_blank”,“noopener,noreferrer”);
// L’accès est débloqué après que l’utilisateur revient de Stripe
// (en prod : webhook Stripe → Supabase mettra à jour le plan)
setTimeout(()=>{onSelect(confirming.id);setConfirming(null);},800);
};

const cancelPayment=()=>setConfirming(null);
return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”}}>
<div style={{padding:“36px 24px 24px”,textAlign:“center”,borderBottom:“1px solid #111”,position:“relative”,overflow:“hidden”}}>
<div style={{position:“absolute”,inset:0,background:“radial-gradient(ellipse at 50% 0%,#FF6B3510,transparent 65%)”,pointerEvents:“none”}}/>
<Logo size={60} anim/>
<div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:46,letterSpacing:8,lineHeight:1,marginTop:14,color:”#FF6B35”}}>INDY</div>
<div style={{fontSize:9,color:”#555”,letterSpacing:3,marginTop:4,marginBottom:14}}>SOIS INDY</div>
<div style={{fontSize:12,color:”#666”,lineHeight:1.7,maxWidth:280,margin:“0 auto”}}>Le coach de poche de l’artiste indépendant. De la création à la scène.</div>
</div>
<div style={{padding:“18px 18px 100px”,display:“flex”,flexDirection:“column”,gap:12}}>
<div style={{background:“linear-gradient(135deg,#0D0D0D 0%,#150E08 100%)”,border:“1px solid #FF6B3533”,borderRadius:10,padding:“12px 16px”,display:“flex”,alignItems:“center”,gap:12,marginBottom:4}}>
<span style={{fontSize:18}}>🚀</span>
<div style={{flex:1}}>
<div style={{fontSize:9,color:”#FF6B35”,letterSpacing:2,fontWeight:600}}>BETA · 200 MEMBRES FONDATEURS</div>
<div style={{fontSize:10,color:”#999”,marginTop:2,lineHeight:1.4}}>Tarifs préférentiels à vie · Au-delà de 200 inscrits, prix standard appliqué</div>
</div>
</div>
{PLANS.map((plan,i)=>(
<div key={plan.id} className=“card fu” style={{padding:20,animationDelay:`${i*0.07}s`,borderColor:plan.id===current?`${plan.color}55`:plan.id===“artiste”?”#FF6B3522”:”#141414”,animation:plan.id===“artiste”?“glow 3s ease-in-out infinite”:undefined,position:“relative”,overflow:“hidden”}}>
<div style={{position:“absolute”,top:0,left:0,right:0,height:2,background:plan.color,opacity:plan.id===“artiste”?1:0.3}}/>
{plan.badge&&<span className=“pill” style={{position:“absolute”,top:12,right:14,background:”#FF6B3518”,color:”#FF6B35”,border:“1px solid #FF6B3333”}}>{plan.badge}</span>}
{plan.id===current&&<span className=“pill” style={{position:“absolute”,top:12,right:14,background:”#00C9A718”,color:”#00C9A7”,border:“1px solid #00C9A733”}}>ACTUEL</span>}
<div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:18,letterSpacing:3,color:plan.color,marginBottom:4}}>{plan.name}</div>
<div style={{display:“flex”,alignItems:“baseline”,gap:2,marginBottom:6}}>
<span style={{fontSize:26,fontFamily:”‘Bebas Neue’,sans-serif”}}>{plan.price}</span>
<span style={{fontSize:11,color:”#999”}}>{plan.period}</span>
{plan.priceFutur&&<span style={{fontSize:10,color:”#888”,textDecoration:“line-through”,marginLeft:6}}>puis {plan.priceFutur}</span>}
</div>
{plan.priceFutur&&<div style={{fontSize:10,color:”#FF6B35”,marginBottom:10,fontWeight:500}}>🔥 Tarif fondateur à vie (200 premiers membres) · 3 jours gratuits</div>}
{plan.labelInfo&&<div style={{background:`${plan.color}15`,border:`1px solid ${plan.color}33`,borderRadius:6,padding:“6px 10px”,marginBottom:10,fontSize:10,color:plan.color,fontWeight:600}}>{plan.labelInfo}</div>}
{plan.features.map((f,fi)=><div key={fi} style={{display:“flex”,gap:8,fontSize:11,color:”#888”,padding:“4px 0”}}><span style={{color:plan.color,flexShrink:0}}>✓</span>{f}</div>)}
{plan.locked?.map((f,fi)=><div key={fi} style={{display:“flex”,gap:8,fontSize:11,color:”#222”,padding:“4px 0”,textDecoration:“line-through”}}><span style={{flexShrink:0}}>✗</span>{f}</div>)}
<button className=“btn” style={{marginTop:14,background:plan.color,color:”#000”}} onClick={()=>choose(plan)}>
{plan.id===current&&plan.id!==“free”?“Gérer mon abonnement”:plan.cta}
</button>
</div>
))}
<div style={{fontSize:10,color:”#444”,textAlign:“center”,letterSpacing:1,marginTop:8}}>Résiliation possible à tout moment · Paiement sécurisé Stripe</div>
</div>

```
  {/* ── Modale de confirmation paiement ── */}
  {confirming&&(
    <div style={{position:"fixed",inset:0,background:"#000000DD",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",animation:"fadeIn 0.2s ease"}} onClick={cancelPayment}>
      <div className="fu" style={{background:"#0D0D0D",border:`1px solid ${confirming.color}44`,borderRadius:14,padding:"24px 22px",maxWidth:340,width:"100%",position:"relative"}} onClick={e=>e.stopPropagation()}>
        <div style={{height:3,background:confirming.color,borderRadius:2,marginBottom:16,opacity:0.6}}/>
        <div style={{fontSize:9,color:confirming.color,letterSpacing:2,marginBottom:6}}>CONFIRMER L'ABONNEMENT</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:3,marginBottom:14}}>{confirming.name}</div>
        <div style={{fontSize:13,color:"#888",lineHeight:1.7,marginBottom:18}}>
          Tu vas être redirigé(e) vers <strong style={{color:"#F0EDE8"}}>Stripe</strong> pour finaliser ton paiement.
        </div>
        <div style={{background:"#080808",border:"1px solid #141414",borderRadius:8,padding:"10px 12px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:"#888"}}>Montant</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:confirming.color}}>{confirming.price}<span style={{color:"#666",fontSize:11,marginLeft:3}}>{confirming.period}</span></span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-o" style={{flex:1}} onClick={cancelPayment}>Annuler</button>
          <button className="btn" style={{flex:2,background:confirming.color,color:"#000"}} onClick={confirmPayment}>Continuer →</button>
        </div>
        <div style={{fontSize:9,color:"#444",textAlign:"center",marginTop:12,letterSpacing:1}}>3 jours d'essai · Résiliable à tout moment</div>
      </div>
    </div>
  )}
</div>
```

);
}

// ─── LANDING ─────────────────────────────────────────────────────────────────
function Landing({onEnter}){
return(
<div style={{minHeight:“100vh”,background:”#060606”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,display:“flex”,flexDirection:“column”,position:“relative”,overflow:“hidden”}}>
<div style={{position:“absolute”,inset:0,background:“radial-gradient(ellipse at 30% 20%,#FF6B3508,transparent 50%),radial-gradient(ellipse at 70% 80%,#845EF708,transparent 50%)”,pointerEvents:“none”}}/>
<div style={{padding:“20px 24px”,display:“flex”,justifyContent:“space-between”,position:“relative”,zIndex:1}}>
<div style={{fontSize:9,color:”#888”,letterSpacing:3}}>BETA</div>
<div style={{fontSize:9,color:”#888”,letterSpacing:2}}>FR · INDÉ · LIBRE</div>
</div>
<div style={{flex:1,display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,padding:“20px 28px”,textAlign:“center”,position:“relative”,zIndex:1}}>
<Logo size={130} anim/>
<div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:84,letterSpacing:20,lineHeight:1,marginTop:32,marginBottom:12,background:“linear-gradient(135deg,#F0EDE8 0%,#999 100%)”,WebkitBackgroundClip:“text”,WebkitTextFillColor:“transparent”}}>INDY</div>
<div style={{fontSize:11,color:”#FF6B35”,letterSpacing:7,marginBottom:26,fontWeight:600}}>TON LABEL EN POCHE</div>
<div style={{width:40,height:1,background:”#1F1F1F”,marginBottom:22}}/>
<div style={{fontSize:28,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:5,color:”#F0EDE8”,marginBottom:14}}>DEVIENS TA MAJOR</div>
<div style={{fontSize:14,color:”#777”,lineHeight:1.6,maxWidth:280,marginBottom:40,fontStyle:“italic”}}>Tout devient simple.</div>
<button className=“btn” style={{width:“auto”,padding:“18px 56px”,fontSize:14,letterSpacing:3,borderRadius:30,boxShadow:“0 0 40px #FF6B3355”}} onClick={onEnter}>SOIS INDY →</button>
<div style={{fontSize:11,color:”#999”,marginTop:18,letterSpacing:1}}>3 jours d’essai · Sans carte bancaire</div>
</div>
<div style={{padding:“14px 24px”,textAlign:“center”,fontSize:9,color:”#111”,letterSpacing:2}}>WAKE UP MUSIC × INDY · 2025</div>
</div>
);
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({onDone}){
const [step,setStep]=useState(0);
const [name,setName]=useState(””);
const [genre,setGenre]=useState(””);
const steps=[
{e:“🎵”,t:“BIENVENUE\nCHEZ INDY”,s:“Le coach de poche de l’artiste indépendant”,c:null},
{e:“🎤”,t:“TON NOM\nD’ARTISTE”,s:“Comment tu t’appelles ?”,c:<input value={name} onChange={e=>setName(e.target.value)} placeholder=“Saya, TiF, Mon Artiste…” style={{fontSize:15,padding:16,textAlign:“center”}}/>},
{e:“🎛️”,t:“TON GENRE\nMUSICAL”,s:“Afro Pop, R&B, Trap FR…”,c:<input value={genre} onChange={e=>setGenre(e.target.value)} placeholder=“Afro Pop, R&B FR, Drill…” style={{fontSize:15,padding:16,textAlign:“center”}}/>},
{e:“🚀”,t:“TOUT EST\nPRÊT”,s:`Bienvenue ${name||"artiste"} — c'est parti.`,c:null},
];
const s=steps[step];
const ok=step===0||step===3||(step===1&&name.trim())||(step===2&&genre.trim());
return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,display:“flex”,flexDirection:“column”}}>
<div style={{display:“flex”,gap:4,padding:“20px 24px 0”}}>
{steps.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=step?”#FF6B35”:”#111”,transition:“background 0.3s”}}/>)}
</div>
<div className=“fu” style={{flex:1,display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,padding:“40px 28px”,gap:24}}>
<div style={{fontSize:52}}>{s.e}</div>
<div style={{textAlign:“center”}}>
<div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:34,letterSpacing:4,lineHeight:1.1,whiteSpace:“pre-line”}}>{s.t}</div>
<div style={{fontSize:12,color:”#555”,marginTop:10,lineHeight:1.6}}>{s.s}</div>
</div>
{s.c&&<div style={{width:“100%”}}>{s.c}</div>}
</div>
<div style={{padding:“0 24px 40px”,display:“flex”,flexDirection:“column”,gap:10}}>
<button className=“btn” disabled={!ok} onClick={()=>step<steps.length-1?setStep(step+1):onDone({name,genre})}>{step===steps.length-1?“Sois INDY →”:“Continuer →”}</button>
{step>0&&<button className=“btn-o” style={{width:“100%”}} onClick={()=>setStep(step-1)}>← Retour</button>}
</div>
</div>
);
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({projects,setProjects,onGoCoach,onGoPlan,plan,user}){
const [edit,setEdit]=useState(null);
const [isNew,setIsNew]=useState(false);
const urgent=projects.filter(p=>{const d=daysUntil(p.sortie);return d!==null&&d<=14&&d>=0;});
const total=projects.length?Math.round(projects.reduce((a,p)=>a+gp(p.progress),0)/projects.length):0;
const maxP=plan===“free”?2:Infinity;
const save=(u)=>{if(isNew)setProjects(ps=>[…ps,{…u,id:Date.now(),checks:{}}]);else setProjects(ps=>ps.map(p=>p.id===u.id?u:p));setEdit(null);setIsNew(false);};
const del=(id)=>{setProjects(ps=>ps.filter(p=>p.id!==id));setEdit(null);};
return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub={user?.name?`BONJOUR ${user.name.toUpperCase()}`:“TABLEAU DE BORD”} right={<div style={{textAlign:“right”}}><div style={{fontSize:22,fontFamily:”‘Bebas Neue’,sans-serif”}}>{total}<span style={{color:”#222”,fontSize:12}}>%</span></div><div style={{fontSize:9,color:”#555”,letterSpacing:1}}>GLOBAL</div></div>}/>
<div style={{display:“grid”,gridTemplateColumns:“repeat(4,1fr)”,borderBottom:“1px solid #111”}}>
{[{l:“Titres”,v:projects.length},{l:“En cours”,v:projects.filter(p=>{const g=gp(p.progress);return g>0&&g<100;}).length},{l:“Prêts”,v:projects.filter(p=>gp(p.progress)===100).length},{l:“Urgents”,v:urgent.length,red:true}].map((s,i)=>(
<div key={i} style={{padding:“11px 0”,textAlign:“center”,borderRight:i<3?“1px solid #111”:“none”}}>
<div style={{fontSize:19,fontFamily:”‘Bebas Neue’,sans-serif”,color:s.red&&s.v>0?”#F03E3E”:”#F0EDE8”}}>{s.v}</div>
<div style={{fontSize:9,color:”#555”,letterSpacing:1}}>{s.l.toUpperCase()}</div>
</div>
))}
</div>
{projects.length>0&&(
<div style={{padding:“12px 18px 0”}}>
<div style={{fontSize:9,color:”#555”,letterSpacing:2,marginBottom:8}}>◆ AVANCEMENT PAR ÉTAPE</div>
<div style={{display:“flex”,flexDirection:“column”,gap:5}}>
{STAGES.map(s=>{
const avgPct=projects.length?Math.round(projects.reduce((a,p)=>a+(p.progress?.[s.id]||0),0)/projects.length):0;
return(
<div key={s.id} style={{display:“flex”,alignItems:“center”,gap:8}}>
<span style={{fontSize:12,flexShrink:0}}>{s.icon}</span>
<span style={{fontSize:10,color:”#666”,width:80,flexShrink:0}}>{s.label}</span>
<div style={{flex:1,height:4,background:”#111”,borderRadius:2,overflow:“hidden”}}>
<div style={{height:“100%”,width:`${avgPct}%`,background:avgPct===100?”#00C9A7”:s.color,borderRadius:2,transition:“width 0.4s”}}/>
</div>
<span style={{fontSize:10,color:avgPct===100?”#00C9A7”:s.color,width:28,textAlign:“right”,flexShrink:0}}>{avgPct}%</span>
</div>
);
})}
</div>
</div>
)}
{urgent.length>0&&<div style={{margin:“14px 18px 0”,background:”#0E0808”,border:“1px solid #F03E3E22”,borderRadius:8,padding:“11px 14px”}}><div style={{fontSize:9,color:”#F03E3E”,letterSpacing:2,marginBottom:7}}>⚡ SORTIES IMMINENTES</div>{urgent.map(p=><div key={p.id} style={{display:“flex”,justifyContent:“space-between”,fontSize:11,color:”#666”,padding:“3px 0”}}><span>{p.titre} <span style={{color:”#888”}}>· {p.artiste}</span></span><span style={{color:”#F03E3E”}}>J-{daysUntil(p.sortie)}</span></div>)}</div>}
<div style={{padding:“14px 18px”,display:“flex”,flexDirection:“column”,gap:10}}>
{projects.map((p,i)=>{
const g=gp(p.progress);const d=daysUntil(p.sortie);const st=STAGES.find(s=>s.id===p.stage);
return(
<div key={p.id} className=“fu” style={{animationDelay:`${i*0.04}s`,background:”#0D0D0D”,borderRadius:10,padding:15,cursor:“pointer”,border:`1px solid ${p.color}15`,position:“relative”,overflow:“hidden”}} onClick={()=>onGoCoach(p.id)}>
<div style={{position:“absolute”,top:0,left:0,right:0,height:2,background:p.color,opacity:0.5}}/>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:10}}>
<div><div style={{fontSize:14,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:2}}>{p.titre}</div><div style={{fontSize:10,color:”#999”,marginTop:1}}>{p.artiste} · {p.genre}</div></div>
<div style={{fontSize:20,fontFamily:”‘Bebas Neue’,sans-serif”,color:g===100?”#00C9A7”:p.color}}>{g}%</div>
</div>
<div style={{height:2,background:”#111”,borderRadius:1,marginBottom:8,overflow:“hidden”}}><div style={{height:“100%”,width:`${g}%`,background:p.color,transition:“width 0.4s”}}/></div>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div style={{display:“flex”,gap:6,alignItems:“center”}}>
{st&&<span style={{fontSize:11}}>{st.icon}</span>}
<span style={{fontSize:10,color:”#666”}}>{st?.label}</span>
{p.urgent&&<span className=“pill” style={{background:`${p.color}15`,color:p.color}}>⚡ {p.urgent}</span>}
</div>
<div style={{display:“flex”,gap:8,alignItems:“center”}}>
{d!==null&&d>=0&&<span style={{fontSize:10,color:d<=7?”#F03E3E”:”#555”}}>J-{d}</span>}
<button onClick={e=>{e.stopPropagation();setEdit({…p});setIsNew(false);}} style={{background:“none”,border:“none”,color:”#333”,cursor:“pointer”,fontSize:14}}>✎</button>
</div>
</div>
</div>
);
})}
{plan!==“free”||projects.length<maxP?(
<button onClick={()=>{setEdit({id:null,titre:””,artiste:””,genre:””,stage:“creation”,sortie:””,urgent:””,color:”#FF6B35”,progress:{creation:0,protection:0,distribution:0,promotion:0,financement:0,live:0}});setIsNew(true);}} style={{background:”#0D0D0D”,border:“1px dashed #1A1A1A”,color:”#333”,fontFamily:”‘Inter’,sans-serif”,fontSize:11,letterSpacing:2,padding:16,borderRadius:10,cursor:“pointer”,transition:“all 0.2s”}} onMouseEnter={e=>{e.currentTarget.style.borderColor=”#FF6B3544”;e.currentTarget.style.color=”#555”;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=”#1A1A1A”;e.currentTarget.style.color=”#333”;}}>+ NOUVEAU TITRE</button>
):(
<div onClick={onGoPlan} style={{background:”#0D0D0D”,border:“1px dashed #FF6B3533”,color:”#FF6B35”,fontFamily:”‘Inter’,sans-serif”,fontSize:11,letterSpacing:2,padding:16,borderRadius:10,cursor:“pointer”,textAlign:“center”}}>+ Débloquer titres illimités →</div>
)}
</div>
{edit&&(
<div className="panel"><div className=“pin” style={{borderTopColor:edit.color||”#FF6B35”}}>
<div style={{padding:“16px 20px”,borderBottom:“1px solid #111”,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div style={{fontSize:9,color:edit.color||”#FF6B35”,letterSpacing:2}}>{isNew?“NOUVEAU TITRE”:“MODIFIER”}</div>
<button onClick={()=>setEdit(null)} style={{background:“none”,border:“none”,color:”#999”,fontSize:20,cursor:“pointer”}}>✕</button>
</div>
<div style={{padding:“18px 20px 40px”,display:“flex”,flexDirection:“column”,gap:12,fontFamily:”‘Inter’,sans-serif”}}>
<div><label style={{fontSize:11,color:”#888”,letterSpacing:1.5,display:“block”,marginBottom:7,fontWeight:600}}>TITRE *</label><input value={edit.titre} onChange={e=>setEdit(p=>({…p,titre:e.target.value}))} placeholder=“Nom de ton titre…”/></div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10}}>
<div><label style={{fontSize:11,color:”#888”,letterSpacing:1.5,display:“block”,marginBottom:7,fontWeight:600}}>ARTISTE</label><input value={edit.artiste} onChange={e=>setEdit(p=>({…p,artiste:e.target.value}))} placeholder=“Ton nom d’artiste…”/></div>
<div><label style={{fontSize:11,color:”#888”,letterSpacing:1.5,display:“block”,marginBottom:7,fontWeight:600}}>GENRE</label><input value={edit.genre} onChange={e=>setEdit(p=>({…p,genre:e.target.value}))} placeholder=“Afro Pop…”/></div>
</div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10}}>
<div><label style={{fontSize:11,color:”#888”,letterSpacing:1.5,display:“block”,marginBottom:7,fontWeight:600}}>DATE SORTIE</label><input type=“date” value={edit.sortie} onChange={e=>setEdit(p=>({…p,sortie:e.target.value}))}/></div>
<div><label style={{fontSize:11,color:”#888”,letterSpacing:1.5,display:“block”,marginBottom:7,fontWeight:600}}>PRIORITÉ</label><input value={edit.urgent} onChange={e=>setEdit(p=>({…p,urgent:e.target.value}))} placeholder=“Prochaine action…”/></div>
</div>
<div><label style={{fontSize:11,color:”#AAA”,letterSpacing:1,fontWeight:600,display:“block”,marginBottom:8}}>COULEUR</label><div style={{display:“flex”,gap:8}}>{COLORS.map(c=><div key={c} onClick={()=>setEdit(p=>({…p,color:c}))} style={{width:22,height:22,borderRadius:“50%”,background:c,cursor:“pointer”,border:edit.color===c?“2px solid #FFF”:“2px solid transparent”,transform:edit.color===c?“scale(1.25)”:“scale(1)”,transition:“transform 0.15s”}}/>)}</div></div>
<div><label style={{fontSize:11,color:”#AAA”,letterSpacing:1,fontWeight:600,display:“block”,marginBottom:8}}>ÉTAPE EN COURS</label><div style={{display:“flex”,gap:6,flexWrap:“wrap”}}>{STAGES.map(s=><button key={s.id} onClick={()=>setEdit(p=>({…p,stage:s.id}))} style={{background:edit.stage===s.id?`${s.color}18`:”#0F0F0F”,border:`1px solid ${edit.stage===s.id?s.color:"#1A1A1A"}`,color:edit.stage===s.id?s.color:”#555”,fontFamily:”‘Inter’,sans-serif”,fontSize:10,padding:“6px 11px”,borderRadius:20,cursor:“pointer”}}>{s.icon} {s.label}</button>)}</div></div>
<div style={{display:“flex”,flexDirection:“column”,gap:9,marginTop:6}}>
<button className=“btn” disabled={!edit.titre} onClick={()=>save(edit)} style={{background:edit.color}}>{isNew?“Créer le titre”:“Enregistrer”}</button>
{!isNew&&<button className=“btn-o” style={{width:“100%”,color:”#F03E3E44”,borderColor:”#F03E3E22”}} onClick={()=>{if(window.confirm(“Supprimer ce titre ?”))del(edit.id);}}>Supprimer</button>}
<button className=“btn-o” style={{width:“100%”}} onClick={()=>setEdit(null)}>Annuler</button>
</div>
</div>
</div></div>
)}
</div>
);
}

// ─── COACH ───────────────────────────────────────────────────────────────────
// ─── GUIDE COACH (théorie + bonnes pratiques par étape) ──────────────────────
const STAGE_GUIDE = {
creation: {
intro: “L’étape de création conditionne tout le reste. Un titre mal mixé ne sera jamais sauvé par la promo.”,
pillars: [
{t:“Composition”, d:“Mélodie, structure, accroche. Les 15 premières secondes décident.”},
{t:“Production”, d:“Arrangement, sons, énergie. Crée la signature.”},
{t:“Mix & Master”, d:“Niveaux, EQ, compression, -14 LUFS pour streaming.”},
],
warning:“Ne saute jamais le mix pro. Un titre mal mixé tue toute campagne marketing.”,
},
protection: {
intro: “Tes droits avant la sortie. SACEM, ISRC, contrats featuring : non négociables.”,
pillars: [
{t:“SACEM”, d:“Dépose AVANT la distribution. Sinon tu perds 6 mois de droits.”},
{t:“Splits”, d:“Répartition écrite des droits entre auteurs/compositeurs/featuring.”},
{t:“Samples”, d:“Tout sample non cleared peut faire retirer ton titre du jour au lendemain.”},
],
warning:“Un sample non cleared = retrait Spotify + procès possible. Toujours vérifier.”,
},
distribution: {
intro: “DistroKid (rapide), TuneCore (contrôle), CD Baby (royalties). Choisis selon ta stratégie.”,
pillars: [
{t:“Distributeur”, d:“DistroKid 22€/an illimité. Idéal si tu sors souvent.”},
{t:“Metadata”, d:“Genre, sous-genre, mood. Détermine la découvrabilité.”},
{t:“Pitch Spotify”, d:“7 semaines minimum avant la date. Une seule chance par sortie.”},
],
warning:“Ne sors jamais sans avoir pitché Spotify Editorial 7 semaines à l’avance.”,
},
promotion: {
intro: “Une bonne promo c’est avant tout un bon EPK et une présence régulière. Pas un blast.”,
pillars: [
{t:“EPK / Press Kit”, d:“Bio courte + longue, photo HD, vidéo live, lien Spotify.”},
{t:“Contenu vertical”, d:“3-5 vidéos TikTok/Reels prêtes le jour J.”},
{t:“Smart link”, d:“Un seul lien dans toutes tes bio (Linkfire, Bandcamp link).”},
],
warning:“La régularité bat le coup d’éclat. 1 post quotidien > 10 posts en rafale.”,
},
financement: {
intro: “Le financement public musical en France est sous-utilisé. Vise CNM + SACEM en priorité.”,
pillars: [
{t:“CNM”, d:“Production phonographique, clip, tournée. Jusqu’à 50K€.”},
{t:“SACEM”, d:“Bourse à la création 1.5K-10K€ pour membres.”},
{t:“DRAC + ADAMI”, d:“Aides régionales et droits d’artiste-interprète.”},
],
warning:“Les dossiers prennent 2-6 mois. Dépose AVANT que tu en aies besoin.”,
},
live: {
intro: “La scène est ton meilleur outil de carrière long terme. Vise les SMAC.”,
pillars: [
{t:“EPK live”, d:“Bio + vidéo live + rider technique. Sans, aucune programmation.”},
{t:“Cible”, d:“Jauge 100-300 personnes pour démarrer. SMAC en priorité.”},
{t:“Email parfait”, d:“Court, EPK en premier lien, propose une vraie soirée.”},
],
warning:“Ne signe jamais un cachet à l’oral. Toujours par email/contrat avant la date.”,
},
};

// ─── COACH ENRICHI ───────────────────────────────────────────────────────────
function Coach({projects,setProjects,activeId,setActiveId,plan,onGoPlan}){
const [si,setSi]=useState(null); // null = vue arborescence ; 0-5 = étape sélectionnée
const [tip,setTip]=useState(null);
const [showGuide,setShowGuide]=useState(false);
const [boostMsg,setBoostMsg]=useState(null);
const [boostLoad,setBoostLoad]=useState(false);
const [showBoostToast,setShowBoostToast]=useState(false);

const proj=projects.find(p=>p.id===activeId)||projects[0];

if(!proj)return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub="COACH PARCOURS"/>
<div style={{display:“flex”,alignItems:“center”,justifyContent:“center”,minHeight:“60vh”,color:”#999”,flexDirection:“column”,gap:16,padding:“20px”}}>
<div style={{fontSize:42}}>🎯</div>
<div style={{fontSize:14,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:3}}>AUCUN TITRE EN COURS</div>
<div style={{fontSize:12,color:”#666”,textAlign:“center”,lineHeight:1.6,maxWidth:260}}>Ajoute un titre depuis le Dashboard pour démarrer ton parcours coach.</div>
</div>
</div>
);

const stage=si!==null?STAGES[si]:null;
const tasks=stage?(TASKS[stage.id]||[]):[];
const checks=proj.checks||{};
const done=stage?tasks.filter(t=>checks[t.id]).length:0;
const pct=tasks.length?done/tasks.length:0;

// Calcul global pour rappels automatiques
const globalProgress=STAGES.map(s=>{const ts=TASKS[s.id]||[];const d=ts.filter(t=>checks[t.id]).length;return{…s,done:d,total:ts.length,pct:ts.length?d/ts.length:0};});
const totalDone=globalProgress.reduce((a,s)=>a+s.done,0);
const totalTasks=globalProgress.reduce((a,s)=>a+s.total,0);
const globalPct=totalTasks?Math.round(totalDone/totalTasks*100):0;
const nextStage=globalProgress.find(s=>s.pct<1)||globalProgress[0];
const blockedStage=globalProgress.find(s=>s.pct>0&&s.pct<0.4);

const toggle=(tid)=>{
const nc={…checks,[tid]:!checks[tid]};
const np={};
STAGES.forEach(s=>{const ts=TASKS[s.id]||[];np[s.id]=ts.length?Math.round(ts.filter(t=>nc[t.id]).length/ts.length*100):0;});
setProjects(ps=>ps.map(p=>p.id===proj.id?{…p,checks:nc,progress:np}:p));
};

// Bouton Coup de Boost — appel IA pour conseils personnalisés selon avancement
const handleBoost=async()=>{
if(plan===“free”){setShowBoostToast(true);setTimeout(()=>setShowBoostToast(false),3500);return;}
setBoostLoad(true);setBoostMsg(null);
const stageReport=globalProgress.map(s=>`${s.label}:${s.done}/${s.total}`).join(” · “);
const prompt=`Artiste : ${proj.artiste} (${proj.genre}). Titre : "${proj.titre}".\nAvancement : ${stageReport}.\nProchaine action : ${proj.urgent||"non définie"}.\nDonne 3 conseils CONCRETS et personnalisés (1 par paragraphe court) pour relancer ce projet maintenant. Évite les généralités, sois précis et actionable. Maximum 200 mots au total.`;
try{
const res=await fetch(”/api/claude”,{method:“POST”,headers:{“Content-Type”:“application/json”},body:JSON.stringify({system:COACH_SYS,messages:[{role:“user”,content:prompt}],maxTokens:600})});
const json=await res.json();
setBoostMsg(json.content?.map(b=>b.text||””).join(””)||“Erreur de génération.”);
}catch{setBoostMsg(“Erreur de connexion. Réessaie dans un instant.”);}
setBoostLoad(false);
};

return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub=“COACH PARCOURS” onBack={si!==null?()=>{setSi(null);setTip(null);setShowGuide(false);}:undefined} right={projects.length>1&&<select value={proj.id} onChange={e=>setActiveId(Number(e.target.value))} style={{background:”#111”,border:“1px solid #1A1A1A”,color:”#888”,fontSize:11,padding:“6px 10px”,borderRadius:6,width:“auto”}}>{projects.map(p=><option key={p.id} value={p.id}>{p.titre}</option>)}</select>}/>

```
  {/* Bandeau projet actif */}
  <div style={{padding:"10px 18px",borderBottom:"1px solid #111",display:"flex",alignItems:"center",gap:8}}>
    <div style={{width:8,height:8,borderRadius:"50%",background:proj.color}}/>
    <span style={{fontSize:11,color:"#CCC"}}>{proj.titre}</span>
    <span style={{fontSize:10,color:"#888"}}>· {proj.artiste}</span>
    <span style={{marginLeft:"auto",fontSize:11,color:proj.color,fontFamily:"'Bebas Neue',sans-serif"}}>{globalPct}%</span>
  </div>

  {/* ── VUE 1 : ARBORESCENCE (par défaut) ──────────────────────────── */}
  {si===null&&(
    <div style={{padding:"16px 18px"}}>
      {/* Bloc rappel automatique */}
      {globalPct===0&&(
        <div style={{background:"#0D0D0D",border:"1px solid #FF6B3522",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:9,color:"#FF6B35",letterSpacing:2,marginBottom:6}}>◆ COACH · BIENVENUE</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.7}}>Ton parcours commence ici. Tape sur une étape pour découvrir le guide et cocher tes avancées.</div>
        </div>
      )}
      {globalPct>0&&globalPct<100&&blockedStage&&(
        <div style={{background:"#0D0D0D",border:`1px solid ${blockedStage.color}33`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:9,color:blockedStage.color,letterSpacing:2,marginBottom:6}}>⚡ RAPPEL AUTO</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.7}}>L'étape <strong style={{color:blockedStage.color}}>{blockedStage.label}</strong> est en cours mais avance lentement ({blockedStage.done}/{blockedStage.total}). Termine-la avant de passer à la suivante.</div>
        </div>
      )}
      {globalPct>0&&globalPct<100&&!blockedStage&&nextStage&&(
        <div style={{background:"#0D0D0D",border:`1px solid ${nextStage.color}33`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:9,color:nextStage.color,letterSpacing:2,marginBottom:6}}>→ PROCHAINE ÉTAPE</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.7}}>Continue avec <strong style={{color:nextStage.color}}>{nextStage.label}</strong> ({nextStage.done}/{nextStage.total} validés).</div>
        </div>
      )}
      {globalPct===100&&(
        <div style={{background:"#0D0D0D",border:"1px solid #00C9A744",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:9,color:"#00C9A7",letterSpacing:2,marginBottom:6}}>🏆 PARCOURS TERMINÉ</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.7}}>Toutes les étapes sont validées. Ton titre est prêt pour la sortie. Bravo.</div>
        </div>
      )}

      {/* Bouton manuel : Coup de boost IA */}
      <button onClick={handleBoost} disabled={boostLoad} style={{width:"100%",background:plan==="free"?"#1A1A1A":"linear-gradient(135deg,#FF6B35,#FF8550)",border:plan==="free"?"1px solid #FF6B3533":"none",color:plan==="free"?"#FF6B35":"#000",fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",padding:"13px 20px",borderRadius:10,cursor:"pointer",fontWeight:600,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {boostLoad?<>⏳ Génération…</>:plan==="free"?<>🔒 ✦ Coup de boost Coach</>:<>✦ Coup de boost Coach</>}
      </button>
      {boostMsg&&(
        <div style={{background:"#0D0D0D",border:"1px solid #FF6B3533",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:9,color:"#FF6B35",letterSpacing:2,marginBottom:8}}>💡 CONSEIL PERSONNALISÉ</div>
          <div style={{fontSize:12,color:"#CCC",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{boostMsg}</div>
          <button onClick={()=>setBoostMsg(null)} style={{background:"none",border:"none",color:"#666",fontSize:10,letterSpacing:1,padding:"8px 0 0",cursor:"pointer"}}>Fermer</button>
        </div>
      )}

      {/* Arborescence des 6 étapes */}
      <div style={{fontSize:10,color:"#666",letterSpacing:2,marginBottom:10}}>◆ TON PARCOURS · 6 ÉTAPES</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {globalProgress.map((s,i)=>{
          const isComplete=s.pct===1;
          const isInProgress=s.pct>0&&s.pct<1;
          return(
            <div key={s.id} className="card fu" style={{padding:0,overflow:"hidden",cursor:"pointer",animationDelay:`${i*0.04}s`,borderColor:isComplete?`${s.color}44`:isInProgress?`${s.color}22`:"#1A1A1A"}} onClick={()=>{setSi(i);setShowGuide(false);}}>
              <div style={{height:2,background:s.color,opacity:isComplete?1:isInProgress?0.6:0.2}}/>
              <div style={{padding:"13px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:42,height:42,borderRadius:10,background:isComplete?`${s.color}22`:"#0D0D0D",border:`1.5px solid ${isComplete?s.color:isInProgress?s.color+"55":"#1A1A1A"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,position:"relative"}}>
                  {isComplete?"✓":s.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                    <span style={{fontSize:9,color:s.color,opacity:0.6,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>0{i+1}</span>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2,color:isComplete?s.color:"#F0EDE8"}}>{s.label.toUpperCase()}</span>
                  </div>
                  <div style={{height:2,background:"#111",borderRadius:1,overflow:"hidden",marginBottom:4}}>
                    <div style={{height:"100%",width:`${s.pct*100}%`,background:s.color,transition:"width 0.4s"}}/>
                  </div>
                  <div style={{fontSize:10,color:"#666"}}>{s.done}/{s.total} actions {isComplete?<span style={{color:"#00C9A7",marginLeft:6}}>· terminé</span>:isInProgress?<span style={{color:s.color,marginLeft:6}}>· en cours</span>:<span style={{marginLeft:6}}>· à démarrer</span>}</div>
                </div>
                <span style={{fontSize:18,color:"#333"}}>›</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* ── VUE 2 : ÉTAPE SÉLECTIONNÉE ──────────────────────────────────── */}
  {si!==null&&stage&&(
    <div>
      {/* Tabs étapes (navigation rapide) */}
      <div style={{display:"flex",overflowX:"auto",padding:"10px 14px",gap:6,borderBottom:"1px solid #0F0F0F",scrollbarWidth:"none"}}>
        {STAGES.map((s,i)=>{const ts=TASKS[s.id]||[];const act=i===si;return(
          <button key={s.id} onClick={()=>{setSi(i);setTip(null);}} style={{background:act?`${s.color}15`:"none",border:`1px solid ${act?s.color:"#1A1A1A"}`,color:act?s.color:"#999",fontFamily:"'Inter',sans-serif",fontSize:9,letterSpacing:1,padding:"7px 12px",borderRadius:20,cursor:"pointer",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:14}}>{s.icon}</span><span>{s.label.toUpperCase()}</span>
            <div style={{display:"flex",gap:2}}>{ts.map((t,ti)=><div key={ti} style={{width:4,height:4,borderRadius:"50%",background:checks[t.id]?s.color:"#222"}}/>)}</div>
          </button>
        );})}
      </div>

      <div style={{padding:"18px 18px 0"}}>
        {/* Header étape */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:38,color:stage.color,opacity:0.2}}>0{si+1}</span>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3}}>{stage.label.toUpperCase()}</span>
          </div>
          <div style={{height:2,background:"#111",borderRadius:1,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct*100}%`,background:stage.color,transition:"width 0.4s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
            <span style={{fontSize:10,color:"#888"}}>Progression</span>
            <span style={{fontSize:10,color:stage.color}}>{done}/{tasks.length}</span>
          </div>
        </div>

        {/* Toggle Guide / Checklist */}
        <div style={{display:"flex",gap:6,marginBottom:14,background:"#0D0D0D",borderRadius:8,padding:4}}>
          <button onClick={()=>setShowGuide(false)} style={{flex:1,background:!showGuide?stage.color+"18":"none",border:"none",color:!showGuide?stage.color:"#555",fontFamily:"'Inter',sans-serif",fontSize:10,letterSpacing:1.5,padding:"8px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>✓ Checklist ({tasks.length})</button>
          <button onClick={()=>setShowGuide(true)} style={{flex:1,background:showGuide?stage.color+"18":"none",border:"none",color:showGuide?stage.color:"#555",fontFamily:"'Inter',sans-serif",fontSize:10,letterSpacing:1.5,padding:"8px",borderRadius:6,cursor:"pointer",textTransform:"uppercase"}}>📖 Guide</button>
        </div>

        {/* GUIDE */}
        {showGuide&&STAGE_GUIDE[stage.id]&&(
          <div className="fu">
            <div style={{background:"#0D0D0D",borderLeft:`3px solid ${stage.color}`,borderRadius:"0 8px 8px 0",padding:"14px 16px",marginBottom:14}}>
              <div style={{fontSize:9,color:stage.color,letterSpacing:2,marginBottom:6}}>◆ EN BREF</div>
              <div style={{fontSize:12,color:"#AAA",lineHeight:1.7}}>{STAGE_GUIDE[stage.id].intro}</div>
            </div>
            <div style={{fontSize:9,color:"#666",letterSpacing:2,marginBottom:8}}>LES 3 PILIERS</div>
            {STAGE_GUIDE[stage.id].pillars.map((p,i)=>(
              <div key={i} style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:8,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:5}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:stage.color,opacity:0.4}}>0{i+1}</span>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:2}}>{p.t.toUpperCase()}</span>
                </div>
                <div style={{fontSize:11,color:"#888",lineHeight:1.6,paddingLeft:24}}>{p.d}</div>
              </div>
            ))}
            <div style={{background:"#0E0808",borderLeft:"3px solid #F03E3E",borderRadius:"0 8px 8px 0",padding:"12px 14px",marginTop:10,marginBottom:14}}>
              <div style={{fontSize:9,color:"#F03E3E",letterSpacing:2,marginBottom:5}}>⚠️ ATTENTION</div>
              <div style={{fontSize:11,color:"#999",lineHeight:1.6}}>{STAGE_GUIDE[stage.id].warning}</div>
            </div>
            <button className="btn-o" style={{width:"100%",marginBottom:18}} onClick={()=>setShowGuide(false)}>Voir la checklist →</button>
          </div>
        )}

        {/* CHECKLIST */}
        {!showGuide&&(
          <>
            <div style={{background:"#0C0C0C",border:`1px solid ${stage.color}15`,borderRadius:7,padding:"11px 14px",marginBottom:14}}>
              <div style={{fontSize:9,color:stage.color,letterSpacing:2,marginBottom:5}}>◆ COACH</div>
              <div style={{fontSize:12,color:"#888",lineHeight:1.7}}>
                {pct===0&&"Coche les éléments déjà validés pour évaluer où tu en es."}
                {pct>0&&pct<0.5&&"Bon début — chaque point coché réduit les risques."}
                {pct>=0.5&&pct<1&&"Presque prêt. Quelques points restants."}
                {pct===1&&<span style={{color:stage.color}}>✓ Étape complète. Passe à la suivante.</span>}
              </div>
            </div>
            <div style={{background:"#0D0D0D",borderRadius:8,padding:"0 14px"}}>
              {tasks.map((task,i)=>{const chk=!!checks[task.id];const showTip=tip===task.id;return(
                <div key={task.id}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 0",borderBottom:i<tasks.length-1?"1px solid #0F0F0F":"none"}}>
                    <div onClick={()=>toggle(task.id)} style={{width:19,height:19,borderRadius:4,border:`1.5px solid ${chk?stage.color:"#2A2A2A"}`,background:chk?`${stage.color}18`:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{chk&&<span style={{fontSize:10,color:stage.color}}>✓</span>}</div>
                    <div style={{flex:1,fontSize:12,color:chk?"#444":"#CCC",textDecoration:chk?"line-through":"none",lineHeight:1.5}}>{task.text}</div>
                    <button onClick={e=>{e.stopPropagation();setTip(showTip?null:task.id);}} style={{background:"none",border:"none",color:"#2A2A2A",cursor:"pointer",fontSize:12,flexShrink:0}}>💡</button>
                  </div>
                  {showTip&&<div style={{background:"#111",borderLeft:`2px solid ${stage.color}`,borderRadius:"0 7px 7px 0",padding:"10px 12px",marginBottom:6,fontSize:11,color:"#888",lineHeight:1.6}}>{task.tip}</div>}
                </div>
              );})}
            </div>
          </>
        )}

        {/* Navigation entre étapes */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:22,paddingBottom:20}}>
          {si>0&&<button className="btn-o" onClick={()=>{setSi(si-1);setTip(null);setShowGuide(false);}}>← Précédent</button>}
          {si<STAGES.length-1&&<button className="btn-o" style={{marginLeft:"auto"}} onClick={()=>{setSi(si+1);setTip(null);setShowGuide(false);}}>Suivant →</button>}
        </div>
      </div>
    </div>
  )}
  {showBoostToast&&<GateToast onUpgrade={onGoPlan}/>}
</div>
```

);
}

// ─── PRESSKIT ────────────────────────────────────────────────────────────────
function PressKit({projects,plan,onGoPlan,onBack}){
const FMTS=[{id:“court”,l:“Bio courte”,i:“⚡”,d:“~100 mots”},{id:“long”,l:“Bio longue”,i:“📰”,d:“~300 mots”},{id:“email”,l:“Email booking”,i:“📩”,d:“Prêt à envoyer”},{id:“spotify”,l:“Pitch Spotify”,i:“🎧”,d:“Éditorial”}];
const [data,setData]=useState({});const [fmt,setFmt]=useState(“court”);const [phase,setPhase]=useState(“form”);const [result,setResult]=useState(””);const [copied,setCopied]=useState(false);
const sf=FMTS.find(f=>f.id===fmt);
const [showToast,setShowToast]=useState(false);
const isLocked=plan===“free”;
const handleLocked=()=>{setShowToast(true);setTimeout(()=>setShowToast(false),3000);};
const gen=async()=>{
setPhase(“loading”);
const d=data;
const P={
court:`Bio courte ~100 mots, accrocheur, réseaux. FR.\nArtiste:${d.nom}\nGenre:${d.genre}\nVille:${d.ville||"France"}\nInfluences:${d.influences||""}\nProjet:${d.titre||""}\nPoints forts:${d.acc||""}`,
long:`Bio longue ~300 mots, journalistique, médias/booking. FR.\nArtiste:${d.nom}\nGenre:${d.genre}\nInfluences:${d.influences||""}\nProjet:${d.titre||""}\nPoints forts:${d.acc||""}`,
email:`Email booking 150-200 mots, direct, pro. FR.\nArtiste:${d.nom}\nGenre:${d.genre}\nPoints forts:${d.acc||""}\nContact:${d.contact||""}`,
spotify:`Pitch Spotify éditorial ~150 mots. FR.\nArtiste:${d.nom}\nGenre:${d.genre}\nProjet:${d.titre||""}\nPoints forts:${d.acc||""}`,
};
try{
const res=await fetch(”/api/claude”,{method:“POST”,headers:{“Content-Type”:“application/json”},body:JSON.stringify({system:AI_SYSTEM,messages:[{role:“user”,content:P[fmt]}],maxTokens:1000})});
const json=await res.json();
setResult(json.content?.map(b=>b.text||””).join(””)||“Erreur.”);
}catch{setResult(“Erreur de connexion.”);}
setPhase(“result”);
};
return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub="PRESS KIT GENERATOR" onBack={onBack}/>
{phase===“form”&&(
<div style={{padding:“18px 18px 0”}}>
{projects.length>0&&<div style={{marginBottom:16}}><div style={{fontSize:9,color:”#888”,letterSpacing:2,marginBottom:8}}>REMPLIR DEPUIS UN TITRE</div><div style={{display:“flex”,gap:6,overflowX:“auto”,scrollbarWidth:“none”}}>{projects.map(p=><button key={p.id} onClick={()=>setData({nom:p.artiste,genre:p.genre,titre:p.titre})} style={{background:”#0D0D0D”,border:`1px solid ${p.color}33`,color:”#777”,fontFamily:”‘Inter’,sans-serif”,fontSize:10,padding:“5px 11px”,borderRadius:20,cursor:“pointer”,flexShrink:0}}>{p.artiste}</button>)}</div></div>}
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:8,marginBottom:16}}>
{FMTS.map(f=><button key={f.id} onClick={()=>setFmt(f.id)} style={{background:fmt===f.id?”#150E08”:”#0D0D0D”,border:`1px solid ${fmt===f.id?"#FF6B35":"#1A1A1A"}`,color:fmt===f.id?”#FF6B35”:”#666”,fontFamily:”‘Inter’,sans-serif”,padding:“12px”,borderRadius:8,cursor:“pointer”,textAlign:“left”}}>
<div style={{fontSize:18,marginBottom:4}}>{f.i}</div><div style={{fontSize:11}}>{f.l}</div><div style={{fontSize:9,color:fmt===f.id?”#FF6B3566”:”#2A2A2A”,marginTop:2}}>{f.d}</div>
</button>)}
</div>
{[{k:“nom”,l:“NOM D’ARTISTE *”,p:“Ton nom d’artiste…”},{k:“genre”,l:“GENRE *”,p:“Afro Pop…”},{k:“ville”,l:“VILLE”,p:“Paris, France”},{k:“influences”,l:“3 INFLUENCES”,p:“Aya Nakamura, Burna Boy…”},{k:“titre”,l:“DERNIER PROJET”,p:“Mon EP (2026)”},{k:“acc”,l:“POINTS FORTS”,p:“50K streams, Skyrock…”},{k:“contact”,l:“EMAIL CONTACT”,p:“booking@label.com”}].map(f=>(
<div key={f.k} style={{marginBottom:10}}><label style={{fontSize:11,color:”#888”,letterSpacing:1.5,display:“block”,marginBottom:7,fontWeight:600}}>{f.l}</label><input value={data[f.k]||””} onChange={e=>setData(p=>({…p,[f.k]:e.target.value}))} placeholder={f.p}/></div>
))}
<div style={{marginTop:16,paddingBottom:20}}>
<button onClick={isLocked?handleLocked:gen} disabled={!isLocked&&(!data.nom?.trim()||!data.genre?.trim())} style={{background:isLocked?”#1A1A1A”:“linear-gradient(135deg,#FF6B35,#FF8550)”,border:isLocked?“1px solid #FF6B3533”:“none”,color:isLocked?”#FF6B35”:”#000”,fontFamily:”‘Inter’,sans-serif”,fontSize:11,letterSpacing:2,textTransform:“uppercase”,padding:“13px 20px”,borderRadius:8,cursor:“pointer”,fontWeight:500,width:“100%”}}>
{isLocked?“🔒 Réservé aux abonnés”:“✦ Générer — “+sf?.l}
</button>
</div>
{showToast&&<GateToast onUpgrade={onGoPlan}/>}
</div>
)}
{phase===“loading”&&<div style={{display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,minHeight:“60vh”,gap:16}}><div style={{fontSize:28}}>{sf?.i}</div><div style={{fontSize:13,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:3,color:”#FF6B35”}}>RÉDACTION EN COURS</div><div style={{display:“flex”,gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:“50%”,background:”#FF6B35”,animation:“pulse 1.2s infinite”,animationDelay:`${i*0.2}s`}}/>)}</div></div>}
{phase===“result”&&(
<div style={{padding:“18px 18px 20px”}}>
<div style={{background:”#0D0D0D”,border:“1px solid #FF6B3522”,borderRadius:8,padding:“11px 14px”,marginBottom:14,display:“flex”,alignItems:“center”,gap:10}}><span style={{fontSize:20}}>{sf?.i}</span><div><div style={{fontSize:11,color:”#FF6B35”}}>{sf?.l}</div><div style={{fontSize:10,color:”#888”}}>{data.nom}</div></div><span style={{marginLeft:“auto”,fontSize:10,color:”#888”}}>{result.split(/\s+/).filter(Boolean).length} mots</span></div>
<div style={{background:”#0D0D0D”,border:“1px solid #141414”,borderRadius:8,padding:18,fontSize:12,lineHeight:1.9,color:”#BBB”,whiteSpace:“pre-wrap”}}>{result}</div>
<div style={{display:“flex”,gap:10,marginTop:14}}>
<button style={{flex:1,background:“none”,border:`1px solid ${copied?"#00C9A7":"#FF6B3544"}`,color:copied?”#00C9A7”:”#FF6B35”,fontFamily:”‘Inter’,sans-serif”,fontSize:11,letterSpacing:2,padding:12,borderRadius:5,cursor:“pointer”}} onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>{copied?“✓ Copié !”:“Copier”}</button>
<button className=“btn-o” onClick={()=>setPhase(“form”)}>Modifier</button>
</div>
</div>
)}
</div>
);
}

// ─── BOOKING ─────────────────────────────────────────────────────────────────
function Booking({plan,onGoPlan,onBack}){
const [tab,setTab]=useState(“salles”);const [sel,setSel]=useState(null);const [emailSalle,setEmailSalle]=useState(null);const [search,setSearch]=useState(””);const [filters,setFilters]=useState({smac:false,sub:false,res:false,regions:[],genres:[]});
const tf=(k,v)=>typeof v===“boolean”?setFilters(f=>({…f,[k]:!f[k]})):setFilters(f=>({…f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[…f[k],v]}));
const filtered=SALLES.filter(s=>{const q=search.toLowerCase();if(q&&!s.nom.toLowerCase().includes(q)&&!s.ville.toLowerCase().includes(q)&&!s.genres.some(g=>g.includes(q)))return false;if(filters.smac&&!s.smac)return false;if(filters.sub&&!s.subv)return false;if(filters.res&&!s.res)return false;if(filters.regions.length&&!filters.regions.includes(s.region))return false;if(filters.genres.length&&!filters.genres.some(g=>s.genres.includes(g)))return false;return true;});
// plan free : accès partiel (salles visibles, fonctions lockées)

return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub="MODULE BOOKING" accent="#20C997" onBack={onBack}/>
<div style={{display:“flex”,borderBottom:“1px solid #111”}}>
<button className={`tab ${tab==="salles"?"on":""}`} onClick={()=>setTab(“salles”)}>🏛️ Salles ({SALLES.length})</button>
<button className={`tab ${tab==="guide"?"on":""}`} onClick={()=>setTab(“guide”)}>📋 Guide</button>
</div>
{tab===“salles”&&(
<div>
<div style={{padding:“12px 18px 0”}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder=“Rechercher salle, ville, genre…”/></div>
<div style={{padding:“8px 18px 0”,display:“flex”,gap:5,flexWrap:“wrap”}}>
{[{k:“smac”,l:“SMAC”},{k:“sub”,l:“Subventionné”},{k:“res”,l:“Résidence”}].map(f=><button key={f.k} onClick={()=>tf(f.k,true)} style={{background:filters[f.k]?”#20C99715”:“none”,border:`1px solid ${filters[f.k]?"#20C997":"#1A1A1A"}`,color:filters[f.k]?”#20C997”:”#444”,fontFamily:”‘Inter’,sans-serif”,fontSize:9,padding:“4px 10px”,borderRadius:20,cursor:“pointer”,flexShrink:0,textTransform:“uppercase”}}>{f.l}</button>)}
{[“idf”,“paca”,“aura”,“occitanie”,“bretagne”,“nord”,“bordeaux”,“alsace”].map(r=><button key={r} onClick={()=>tf(“regions”,r)} style={{background:filters.regions.includes(r)?”#20C99715”:“none”,border:`1px solid ${filters.regions.includes(r)?"#20C997":"#1A1A1A"}`,color:filters.regions.includes(r)?”#20C997”:”#444”,fontFamily:”‘Inter’,sans-serif”,fontSize:9,padding:“4px 10px”,borderRadius:20,cursor:“pointer”,flexShrink:0,textTransform:“uppercase”}}>{r.toUpperCase()}</button>)}
</div>
<div style={{padding:“10px 18px”,display:“flex”,flexDirection:“column”,gap:10}}>
<div style={{fontSize:10,color:”#888”,letterSpacing:1.5,fontWeight:600}}>{filtered.length} SALLE{filtered.length>1?“S”:””}</div>
{filtered.map((s,i)=>(
<div key={s.id} className=“card fu” style={{padding:0,overflow:“hidden”,cursor:“pointer”,animationDelay:`${i*0.03}s`}} onClick={()=>setSel(s)}>
<div style={{height:2,background:s.color}}/>
<div style={{padding:“13px 14px”}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:7}}>
<div><div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:15,letterSpacing:2}}>{s.nom}</div><div style={{fontSize:10,color:”#999”,marginTop:1}}>{s.ville} · <span style={{color:s.color}}>{s.cachet_min}–{s.cachet_max}€</span></div></div>
<div style={{display:“flex”,gap:4,flexWrap:“wrap”,justifyContent:“flex-end”}}>{s.smac&&<span className=“pill” style={{background:”#20C99715”,color:”#20C997”}}>SMAC</span>}{s.subv&&<span className=“pill” style={{background:”#FFD43B15”,color:”#FFD43B”}}>SUBV.</span>}{s.res&&<span className=“pill” style={{background:”#845EF715”,color:”#845EF7”}}>RÉSID.</span>}</div>
</div>
<div style={{fontSize:11,color:”#555”,lineHeight:1.5,marginBottom:7}}>{s.desc}</div>
<div style={{display:“flex”,gap:4,flexWrap:“wrap”}}>{s.genres.slice(0,4).map(t=><span key={t} className="chip">{t}</span>)}</div>
</div>
</div>
))}
</div>
</div>
)}
{tab===“guide”&&(
<div style={{padding:“16px 18px 40px”}}>
{[{n:“01”,t:“Prépare ton EPK”,c:”#FF6B35”,items:[“Bio courte + longue + photo HD”,“Vidéo live ou clip”,“Lien Spotify + stats”,“Rider technique (si tu en as un)”]},{n:“02”,t:“Cible les bonnes salles”,c:”#20C997”,items:[“Commence par les jauges 100–300 pers.”,“Priorise les SMAC (subventionnées = + accessibles)”,“Vérifie que ta musique correspond à leur prog.”]},{n:“03”,t:“L’email parfait”,c:”#845EF7”,items:[“Objet : [Artiste] – Demande de date – [Genre]”,“3 paragraphes max : qui · pourquoi cette salle · proposition”,“Lien EPK en premier — jamais de pièce jointe”]},{n:“04”,t:“Les contrats”,c:”#FFD43B”,items:[“Cession : cachet fixe contre droit de représentation”,“Coréalisation : tu partages les recettes”,“Résidence : création + concert de restitution”]}].map((s,i)=>(
<div key={i} style={{marginBottom:20}}>
<div style={{display:“flex”,alignItems:“baseline”,gap:8,marginBottom:10}}><span style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:30,color:s.c,opacity:0.3}}>{s.n}</span><span style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:17,letterSpacing:2}}>{s.t.toUpperCase()}</span></div>
<div style={{background:”#0D0D0D”,borderRadius:8,padding:“12px 14px”}}>{s.items.map((item,ii)=><div key={ii} style={{display:“flex”,gap:10,padding:“6px 0”,borderBottom:ii<s.items.length-1?“1px solid #111”:“none”}}><span style={{color:s.c,fontSize:10,flexShrink:0,marginTop:2}}>→</span><span style={{fontSize:11,color:”#777”,lineHeight:1.5}}>{item}</span></div>)}</div>
</div>
))}
</div>
)}
{sel&&(
<div className="panel"><div className="pin" style={{borderTopColor:sel.color}}>
<div style={{padding:“16px 20px”,borderBottom:“1px solid #111”,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div><div style={{fontSize:9,color:sel.color,letterSpacing:2}}>FICHE SALLE</div><div style={{fontSize:17,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:2}}>{sel.nom}</div></div>
<button onClick={()=>setSel(null)} style={{background:“none”,border:“none”,color:”#999”,fontSize:20,cursor:“pointer”}}>✕</button>
</div>
<div style={{padding:“18px 20px 40px”}}>
<div style={{display:“flex”,gap:6,flexWrap:“wrap”,marginBottom:14}}>{sel.smac&&<span className=“pill” style={{background:”#20C99718”,color:”#20C997”,border:“1px solid #20C99733”}}>SMAC</span>}{sel.subv&&<span className=“pill” style={{background:”#FFD43B18”,color:”#FFD43B”,border:“1px solid #FFD43B33”}}>SUBVENTIONNÉ</span>}{sel.res&&<span className=“pill” style={{background:”#845EF718”,color:”#845EF7”,border:“1px solid #845EF733”}}>RÉSIDENCES</span>}</div>
<p style={{fontSize:12,color:”#888”,lineHeight:1.8,marginBottom:14}}>{sel.desc}</p>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10,marginBottom:14}}>{[{l:“Cachet”,v:`${sel.cachet_min}–${sel.cachet_max}€`},{l:“Réponse”,v:sel.delai},{l:“Ville”,v:sel.ville},{l:“Jauge”,v:`${sel.jauge} pers.`}].map((x,i)=><div key={i} style={{background:”#0D0D0D”,border:“1px solid #141414”,borderRadius:7,padding:“10px 12px”}}><div style={{fontSize:9,color:”#888”,letterSpacing:2,marginBottom:3}}>{x.l.toUpperCase()}</div><div style={{fontSize:12,color:”#CCC”}}>{x.v}</div></div>)}</div>
<div style={{background:”#0D0D0D”,borderLeft:`2px solid ${sel.color}`,borderRadius:“0 7px 7px 0”,padding:“11px 14px”,marginBottom:14}}><div style={{fontSize:9,color:sel.color,letterSpacing:2,marginBottom:4}}>💡 CONSEIL</div><div style={{fontSize:11,color:”#888”,lineHeight:1.7}}>{sel.tips}</div></div>
<div style={{background:”#0D0D0D”,border:“1px solid #141414”,borderRadius:7,padding:“11px 14px”,marginBottom:16}}><div style={{fontSize:9,color:”#888”,letterSpacing:2,marginBottom:4}}>CONTACT</div><div style={{fontSize:12,color:”#888”}}>{sel.contact}</div><div style={{fontSize:10,color:”#999”,marginTop:3}}>{sel.adresse}</div></div>
<button className=“btn” style={{background:”#20C997”,color:”#000”}} onClick={()=>{setSel(null);setEmailSalle(sel);}}>✍️ Générer l’email de booking →</button>
</div>
</div></div>
)}
{emailSalle&&<EmailGen salle={emailSalle} onClose={()=>setEmailSalle(null)}/>}
</div>
);
}

function EmailGen({salle,onClose}){
const [d,setD]=useState({nom:””,genre:””,ville:””,streams:””,projet:””,dates:””});const [result,setResult]=useState(””);const [phase,setPhase]=useState(“form”);const [copied,setCopied]=useState(false);
const gen=async()=>{
setPhase(“loading”);
const prompt=`Email booking professionnel et percutant (150-200 mots) pour démarcher ${salle.nom} à ${salle.ville}.\nArtiste:${d.nom||"l'artiste"}\nGenre:${d.genre||salle.genres[0]}\nStats:${d.streams||"artiste émergent"}\nProjet:${d.projet||"EP récent"}\nDates passées:${d.dates||"premières dates"}\nContact:${salle.contact}\nJauge:${salle.jauge} · Cachet:${salle.cachet_min}–${salle.cachet_max}€\nAccroche forte, présentation courte, pourquoi cette salle, proposition concrète. Ton professionnel mais humain. En français.`;
try{
const res=await fetch(”/api/claude”,{method:“POST”,headers:{“Content-Type”:“application/json”},body:JSON.stringify({system:“Tu rédiges des emails de booking percutants pour artistes indépendants français.”,messages:[{role:“user”,content:prompt}],maxTokens:800})});
const json=await res.json();
setResult(json.content?.map(b=>b.text||””).join(””)||“Erreur.”);
}catch{setResult(“Erreur de connexion.”);}
setPhase(“result”);
};
return(
<div className="panel"><div className="pin" style={{borderTopColor:salle.color}}>
<div style={{padding:“16px 20px”,borderBottom:“1px solid #111”,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}><div><div style={{fontSize:9,color:salle.color,letterSpacing:2}}>EMAIL BOOKING</div><div style={{fontSize:16,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:2}}>{salle.nom}</div></div><button onClick={onClose} style={{background:“none”,border:“none”,color:”#999”,fontSize:20,cursor:“pointer”}}>✕</button></div>
{phase===“form”&&(
<div style={{padding:“18px 20px 40px”,display:“flex”,flexDirection:“column”,gap:12,fontFamily:”‘Inter’,sans-serif”}}>
{[{k:“nom”,l:“NOM D’ARTISTE *”,p:“Ton nom…”},{k:“genre”,l:“GENRE *”,p:salle.genres[0]},{k:“streams”,l:“STATS”,p:“50K Spotify…”},{k:“projet”,l:“DERNIER PROJET”,p:“Mon EP…”},{k:“dates”,l:“DATES PASSÉES”,p:“Trabendo, Fête de la Musique…”}].map(f=><div key={f.k}><label style={{fontSize:11,color:”#AAA”,letterSpacing:1,display:“block”,marginBottom:7,fontWeight:600}}>{f.l}</label><input value={d[f.k]} onChange={e=>setD(p=>({…p,[f.k]:e.target.value}))} placeholder={f.p}/></div>)}
<button className=“btn” style={{background:”#20C997”,color:”#000”,marginTop:8}} disabled={!d.nom||!d.genre} onClick={gen}>✦ Générer l’email</button>
</div>
)}
{phase===“loading”&&<div style={{display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,minHeight:“50vh”,gap:16}}><div style={{fontSize:28}}>📩</div><div style={{fontSize:13,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:3,color:”#20C997”}}>RÉDACTION EN COURS</div><div style={{display:“flex”,gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:“50%”,background:”#20C997”,animation:“pulse 1.2s infinite”,animationDelay:`${i*0.2}s`}}/>)}</div></div>}
{phase===“result”&&(
<div style={{padding:“18px 20px 40px”}}>
<div style={{background:”#0D0D0D”,border:“1px solid #141414”,borderRadius:8,padding:18,fontSize:12,lineHeight:1.9,color:”#BBB”,whiteSpace:“pre-wrap”,marginBottom:14}}>{result}</div>
<div style={{display:“flex”,gap:10}}>
<button style={{flex:1,background:“none”,border:`1px solid ${copied?"#00C9A7":"#20C99744"}`,color:copied?”#00C9A7”:”#20C997”,fontFamily:”‘Inter’,sans-serif”,fontSize:11,letterSpacing:2,padding:12,borderRadius:5,cursor:“pointer”}} onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>{copied?“✓ Copié !”:“Copier”}</button>
<button className=“btn-o” onClick={()=>setPhase(“form”)}>Modifier</button>
</div>
</div>
)}
</div></div>
);
}

// ─── BIBLIOTHÈQUE 24 DOCUMENTS ────────────────────────────────────────────────
const DOCS = [
{id:“d01”,cat:“Droits”,titre:“Cession de droits voisins”,desc:“Contrat artiste-interprète pour enregistrement studio.”,plan:“artiste”,icon:“📜”,color:”#FF6B35”},
{id:“d02”,cat:“Droits”,titre:“Contrat de featuring”,desc:“Accord de participation entre deux artistes.”,plan:“artiste”,icon:“🤝”,color:”#FF6B35”},
{id:“d03”,cat:“Droits”,titre:“Split sheet”,desc:“Répartition des droits d’auteur entre co-créateurs.”,plan:“artiste”,icon:“✂️”,color:”#FF6B35”},
{id:“d04”,cat:“Droits”,titre:“Déclaration SACEM”,desc:“Guide complet de dépôt d’œuvre à la SACEM.”,plan:“artiste”,icon:“🎵”,color:”#845EF7”},
{id:“d05”,cat:“Distribution”,titre:“Checklist sortie streaming”,desc:“Tous les points à valider avant une mise en ligne.”,plan:“artiste”,icon:“🚀”,color:”#845EF7”},
{id:“d06”,cat:“Distribution”,titre:“Formulaire ISRC”,desc:“Demande de codes ISRC pour tes enregistrements.”,plan:“artiste”,icon:“🔢”,color:”#845EF7”},
{id:“d07”,cat:“Promotion”,titre:“Dossier de presse type”,desc:“Template de dossier artistique complet.”,plan:“artiste”,icon:“📰”,color:”#FFD43B”},
{id:“d08”,cat:“Promotion”,titre:“Email de booking salles”,desc:“Template email pour démarcher les salles de concert.”,plan:“artiste”,icon:“📩”,color:”#FFD43B”},
{id:“d09”,cat:“Promotion”,titre:“Pitch Spotify editorial”,desc:“Structure pour convaincre les éditeurs Spotify.”,plan:“artiste”,icon:“🎧”,color:”#FFD43B”},
{id:“d10”,cat:“Financement”,titre:“Dossier CNM production”,desc:“Template de dossier pour l’aide à la production phonographique.”,plan:“artiste”,icon:“🏛️”,color:”#F03E3E”},
{id:“d11”,cat:“Financement”,titre:“Dossier SACEM bourse”,desc:“Dossier type pour la bourse à la création SACEM.”,plan:“artiste”,icon:“💰”,color:”#F03E3E”},
{id:“d12”,cat:“Financement”,titre:“Dossier ADAMI”,desc:“Template de demande d’aide ADAMI.”,plan:“artiste”,icon:“🎤”,color:”#F03E3E”},
{id:“d13”,cat:“Statuts”,titre:“Guide auto-entrepreneur”,desc:“Démarches complètes pour créer ton statut.”,plan:“artiste”,icon:“📋”,color:”#20C997”},
{id:“d14”,cat:“Statuts”,titre:“Guide intermittent”,desc:“Conditions, droits et démarches pour l’intermittence.”,plan:“artiste”,icon:“🎭”,color:”#20C997”},
{id:“d15”,cat:“Live”,titre:“Fiche technique standard”,desc:“Rider technique pour petites et moyennes salles.”,plan:“artiste”,icon:“🔊”,color:”#00C9A7”},
{id:“d16”,cat:“Live”,titre:“Checklist avant concert”,desc:“Tout ce qu’il faut vérifier le jour J.”,plan:“artiste”,icon:“✅”,color:”#00C9A7”},
{id:“d17”,cat:“Contrats avancés”,titre:“Contrat de cession (complet)”,desc:“Contrat pro de cession de droits entre label et artiste.”,plan:“label”,icon:“📜”,color:”#C8A96E”},
{id:“d18”,cat:“Contrats avancés”,titre:“Contrat de co-production”,desc:“Accord de co-production phonographique entre structures.”,plan:“label”,icon:“🏭”,color:”#C8A96E”},
{id:“d19”,cat:“Contrats avancés”,titre:“Contrat de licence”,desc:“Cession de droits d’exploitation pour un territoire.”,plan:“label”,icon:“🗺️”,color:”#C8A96E”},
{id:“d20”,cat:“Contrats avancés”,titre:“Contrat de management”,desc:“Accord de représentation artiste-manager.”,plan:“label”,icon:“👔”,color:”#C8A96E”},
{id:“d21”,cat:“Contrats avancés”,titre:“Contrat de booking”,desc:“Contrat entre artiste et agent de booking.”,plan:“label”,icon:“📅”,color:”#C8A96E”},
{id:“d22”,cat:“Label”,titre:“Rider technique scène nationale”,desc:“Fiche technique complète pour grandes salles.”,plan:“label”,icon:“🎚️”,color:”#C8A96E”},
{id:“d23”,cat:“Label”,titre:“Structure label indépendant”,desc:“Guide complet pour créer son label : SIRET, marque, SCPP.”,plan:“label”,icon:“🏷️”,color:”#C8A96E”},
{id:“d24”,cat:“Label”,titre:“Contrat de distribution label”,desc:“Accord entre label et distributeur numérique.”,plan:“label”,icon:“🌐”,color:”#C8A96E”},
];

// ─── BIBLIOTHÈQUE COMPONENT ───────────────────────────────────────────────────
function Bibliotheque({plan,onGoPlan,onBack}){
const [catFilter,setCatFilter]=useState(“Tous”);
const [showToast,setShowToast]=useState(false);
const isDocLocked=(d)=>plan===“free”||(plan===“artiste”&&d.plan===“label”);
const cats=[“Tous”,…new Set(DOCS.map(d=>d.cat))];
const filtered=catFilter===“Tous”?DOCS:DOCS.filter(d=>d.cat===catFilter);
const [downloading,setDownloading]=useState(null);
const [dlMsg,setDlMsg]=useState(null);
const handleDoc=async(d)=>{
if(isDocLocked(d)){setShowToast(true);setTimeout(()=>setShowToast(false),3000);return;}
const sb = await initSupabase();
if(!sb){setDlMsg(“📄 “+d.titre+” — Mode démo · upload tes PDFs sur Supabase pour activer”);setTimeout(()=>setDlMsg(null),3500);return;}
setDownloading(d.id);
try{
const path=`${d.id}.pdf`;
const {data,error}=await sb.storage.from(“documents”).createSignedUrl(path,60);
if(error||!data?.signedUrl){
setDlMsg(“⚠️ “+d.titre+” indisponible — upload le PDF dans le bucket ‘documents’”);
setTimeout(()=>setDlMsg(null),4500);
} else {
window.open(data.signedUrl,”_blank”);
setDlMsg(“✓ “+d.titre+” ouvert”);
setTimeout(()=>setDlMsg(null),2500);
}
}catch(e){setDlMsg(“Erreur : “+e.message);setTimeout(()=>setDlMsg(null),3500);}
setDownloading(null);
};
const accessible=filtered.filter(d=>!isDocLocked(d)).length;
return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub="BIBLIOTHÈQUE" accent="#C8A96E" onBack={onBack}/>
<div style={{padding:“12px 18px”,background:”#0D0D0D”,borderBottom:“1px solid #111”,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div><span style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:20,color:”#C8A96E”}}>{accessible}</span><span style={{fontSize:11,color:”#555”}}> / {filtered.length} doc{filtered.length>1?“s”:””} accessibles</span></div>
{plan===“artiste”&&<span className=“pill” style={{background:”#C8A96E15”,color:”#C8A96E”,border:“1px solid #C8A96E33”}}>Label → 24 docs</span>}
</div>
<div style={{padding:“10px 18px 0”,display:“flex”,gap:6,overflowX:“auto”,scrollbarWidth:“none”}}>
{cats.map(c=><button key={c} onClick={()=>setCatFilter(c)} style={{background:catFilter===c?”#C8A96E15”:“none”,border:`1px solid ${catFilter===c?"#C8A96E":"#1A1A1A"}`,color:catFilter===c?”#C8A96E”:”#444”,fontFamily:”‘Inter’,sans-serif”,fontSize:9,padding:“4px 12px”,borderRadius:20,cursor:“pointer”,flexShrink:0,textTransform:“uppercase”}}>{c}</button>)}
</div>
<div style={{padding:“10px 18px”,display:“flex”,flexDirection:“column”,gap:8}}>
{filtered.map((d,i)=>{
const locked=isDocLocked(d);
return(
<div key={d.id} className=“fu” style={{animationDelay:`${i*0.025}s`,background:”#0D0D0D”,borderRadius:10,border:`1px solid ${locked?"#111":d.color+"22"}`,padding:“14px 16px”,cursor:“pointer”,display:“flex”,gap:12,alignItems:“flex-start”}} onClick={()=>handleDoc(d)}>
<div style={{width:40,height:40,borderRadius:8,background:locked?”#111”:`${d.color}15`,border:`1px solid ${locked?"#1A1A1A":d.color+"33"}`,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:18,flexShrink:0}}>{locked?“🔒”:d.icon}</div>
<div style={{flex:1}}>
<div style={{fontSize:12,color:locked?”#444”:”#CCC”,marginBottom:3}}>{d.titre}</div>
<div style={{fontSize:9,color:locked?”#2A2A2A”:d.color,letterSpacing:1,marginBottom:4}}>{d.cat.toUpperCase()}{d.plan===“label”&&<span style={{marginLeft:6,color:”#C8A96E”}}>· LABEL</span>}</div>
<div style={{fontSize:10,color:”#555”,lineHeight:1.5}}>{d.desc}</div>
</div>
{!locked&&<span style={{fontSize:16,color:d.color,flexShrink:0,marginTop:4}}>↓</span>}
</div>
);
})}
</div>
{plan===“free”&&(
<div style={{margin:“8px 18px”,background:”#0D0D0D”,border:“1px solid #FF6B3533”,borderRadius:10,padding:“16px”,textAlign:“center”}}>
<div style={{fontSize:12,color:”#888”,marginBottom:10}}>Abonne-toi pour accéder aux 16 documents Artiste</div>
<button className="btn" onClick={onGoPlan}>Débloquer — 9,90€/mois →</button>
</div>
)}
{showToast&&<GateToast onUpgrade={onGoPlan}/>}
</div>
);
}

// ─── ANNUAIRE ────────────────────────────────────────────────────────────────
function Annuaire({plan,onGoPlan,onBack}){
const [cat,setCat]=useState(null);
const [section,setSection]=useState(null);
const [search,setSearch]=useState(””);
const [detail,setDetail]=useState(null);
const [showToast,setShowToast]=useState(false);
const isLocked=plan===“free”;
const handleLocked=()=>{setShowToast(true);setTimeout(()=>setShowToast(false),3000);};

const CATEGORIES=[
{id:“reseaux”,icon:“🌐”,label:“Réseaux & Fédérations”,color:”#845EF7”,desc:“FEDELIMA, SMA, FELIN, IRMA, SACEM…”,sections:[
{id:“federations”,icon:“🏛️”,label:“Fédérations & annuaires officiels”,color:”#845EF7”,data:FEDERATIONS,desc:`${FEDERATIONS.length} structures officielles`},
]},
{id:“studios”,icon:“🎙️”,label:“Studios”,color:”#00C9A7”,desc:“Enregistrement & répétition”,sections:[
{id:“enreg”,icon:“🎚️”,label:“Studios d’enregistrement”,color:”#845EF7”,data:STUDIOS_ENREG,desc:`${STUDIOS_ENREG.length} studios pro`},
{id:“repet”,icon:“🔊”,label:“Studios de répétition”,color:”#00C9A7”,data:STUDIOS_REPET,desc:`${STUDIOS_REPET.length} salles de répète`},
]},
{id:“live”,icon:“🎤”,label:“Scène & Live”,color:”#FF6B35”,desc:“Salles, résidences, tremplins”,sections:[
{id:“salles”,icon:“🏛️”,label:“Salles de concert”,color:”#FF6B35”,data:SALLES,desc:`${SALLES.length} salles avec contacts`},
{id:“residences”,icon:“🏠”,label:“Résidences artistiques”,color:”#C8A96E”,data:RESIDENCES,desc:`${RESIDENCES.length} lieux de création`},
{id:“tremplins”,icon:“🏆”,label:“Tremplins & Concours”,color:”#FFD43B”,data:TREMPLINS,desc:`${TREMPLINS.length} concours réels`},
]},
];

const curCat=CATEGORIES.find(c=>c.id===cat);
const SECS=curCat?.sections||[];
const sec=SECS.find(s=>s.id===section);
const items=sec?sec.data.filter(i=>{if(!search)return true;const q=search.toLowerCase();return(i.nom||””).toLowerCase().includes(q)||(i.ville||””).toLowerCase().includes(q)||((i.tags||i.genres||[]).some(t=>t.toLowerCase().includes(q)));}):[];

const goBack=()=>{
if(section){setSection(null);setSearch(””);}
else if(cat){setCat(null);}
else onBack&&onBack();
};

return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub={cat?curCat.label.toUpperCase():“ANNUAIRE”} accent={cat?curCat.color:”#C8A96E”} onBack={(cat||section)?goBack:onBack}/>

```
  {/* NIVEAU 1 : Catégories thématiques */}
  {!cat&&(
    <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontSize:11,color:"#555",letterSpacing:1,marginBottom:4}}>3 CATÉGORIES · {SALLES.length+STUDIOS_ENREG.length+STUDIOS_REPET.length+RESIDENCES.length+TREMPLINS.length+FEDERATIONS.length} ressources</div>
      {CATEGORIES.map((c,i)=>(
        <div key={c.id} className="card fu" style={{padding:0,overflow:"hidden",cursor:"pointer",animationDelay:`${i*0.06}s`}} onClick={()=>setCat(c.id)}>
          <div style={{height:3,background:c.color}}/>
          <div style={{padding:"16px 16px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:50,height:50,borderRadius:12,background:`${c.color}15`,border:`1px solid ${c.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:2}}>{c.label}</div>
              <div style={{fontSize:10,color:"#999",marginTop:3}}>{c.desc}</div>
              <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                {c.sections.map(s=>(
                  <span key={s.id} className="chip" style={{fontSize:9,color:s.color,background:`${s.color}10`,padding:"2px 7px"}}>{s.data.length} {s.label.split(" ")[0].toLowerCase()}</span>
                ))}
              </div>
            </div>
            <span style={{fontSize:22,color:"#333"}}>›</span>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* NIVEAU 2 : Sections de la catégorie */}
  {cat&&!section&&(
    <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:11,color:curCat.color,letterSpacing:2,marginBottom:4}}>◆ {curCat.label.toUpperCase()}</div>
      {SECS.map((s,i)=>(
        <div key={s.id} className="card fu" style={{padding:0,overflow:"hidden",cursor:"pointer",animationDelay:`${i*0.05}s`}} onClick={()=>setSection(s.id)}>
          <div style={{height:2,background:s.color}}/>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:10,background:`${s.color}15`,border:`1px solid ${s.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
            <div style={{flex:1}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:2}}>{s.label}</div><div style={{fontSize:10,color:"#999",marginTop:2}}>{s.data.length} ressources · {s.desc}</div></div>
            <span style={{fontSize:20,color:"#222"}}>›</span>
          </div>
        </div>
      ))}
    </div>
  )}
  {section&&(
    <div>
      <div style={{padding:"12px 18px"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Rechercher dans ${sec?.label}…`}/></div>
      {isLocked&&<div style={{margin:"0 18px 8px",background:"#0D0D0D",border:"1px solid #FF6B3522",borderRadius:8,padding:"10px 12px",fontSize:11,color:"#888",lineHeight:1.5,display:"flex",alignItems:"center",gap:8}}><span>🔒</span><span>Aperçu en mode Découverte · Clique pour voir les fiches détaillées</span></div>}
      <div style={{padding:"4px 18px",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{fontSize:10,color:"#888",letterSpacing:1.5,fontWeight:600}}>{items.length} RÉSULTAT{items.length>1?"S":""}</div>
        {items.map((item,i)=>{
          const color=sec?.color||"#888";
          return(
            <div key={i} className="card fu" style={{padding:0,overflow:"hidden",cursor:"pointer",animationDelay:`${i*0.04}s`,opacity:isLocked?0.7:1}} onClick={()=>isLocked?handleLocked():setDetail({...item,_color:color})}>
              <div style={{height:2,background:item.color||color}}/>
              <div style={{padding:"13px 14px",position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2,marginBottom:3}}>{item.nom}</div>
                    <div style={{fontSize:10,color:"#999",marginBottom:6}}>{item.ville}{(item.prix||item.cachet_min)&&<span style={{color:color}}> · {item.prix||`${item.cachet_min}–${item.cachet_max}€`}</span>}</div>
                  </div>
                  {isLocked&&<span style={{fontSize:14,opacity:0.5,flexShrink:0}}>🔒</span>}
                </div>
                <div style={{fontSize:11,color:"#555",lineHeight:1.5,marginBottom:6}}>{item.desc||item.description||""}</div>
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
      <div style={{padding:"18px 20px 40px"}}>
        {detail.tips&&<div style={{background:"#0D0D0D",borderLeft:`2px solid ${detail._color}`,borderRadius:"0 7px 7px 0",padding:"11px 14px",marginBottom:14}}><div style={{fontSize:9,color:detail._color,letterSpacing:2,marginBottom:4}}>💡 CONSEIL</div><div style={{fontSize:11,color:"#888",lineHeight:1.7}}>{detail.tips}</div></div>}
        <p style={{fontSize:12,color:"#888",lineHeight:1.8,marginBottom:14}}>{detail.desc||detail.description}</p>
        {detail.contact&&<div style={{background:"#0D0D0D",border:"1px solid #141414",borderRadius:7,padding:"11px 14px",marginBottom:14}}><div style={{fontSize:9,color:"#888",letterSpacing:2,marginBottom:4}}>CONTACT</div><div style={{fontSize:12,color:"#888"}}>{detail.contact}</div>{detail.adresse&&<div style={{fontSize:10,color:"#999",marginTop:3}}>{detail.adresse}</div>}</div>}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>{(detail.tags||detail.genres||[]).map(t=><span key={t} style={{fontSize:10,color:detail._color,background:`${detail._color}12`,padding:"3px 10px",borderRadius:20}}>{t}</span>)}</div>
        {detail.site&&detail.site!=="/#"&&detail.site!=="#"&&<a href={detail.site} target="_blank" rel="noopener noreferrer" className="lnk" style={{background:detail._color,color:"#000",fontWeight:500}}>Voir le site →</a>}
      </div>
    </div></div>
  )}
  {showToast&&<GateToast onUpgrade={onGoPlan}/>}
</div>
```

);
}

// ─── SUBVENTIONS ─────────────────────────────────────────────────────────────
function Subventions({plan,onGoPlan,onBack}){
const [ans,setAns]=useState({});const [qi,setQi]=useState(0);const [phase,setPhase]=useState(“q”);const [exp,setExp]=useState(null);
const [showToastSub,setShowToastSub]=useState(false);
if(plan===“free”)return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub="FINANCEMENT & AIDES" accent="#F03E3E" onBack={onBack}/>
<div style={{padding:“12px 18px”,background:”#0D0D0D”,borderBottom:“1px solid #111”,fontSize:11,color:”#555”,lineHeight:1.6}}><span style={{color:”#F03E3E”,fontSize:9,letterSpacing:2,display:“block”,marginBottom:3}}>◆ MATCHING SUBVENTIONS</span>4 questions → tes aides personnalisées. Réservé aux abonnés.</div>
{FINANCEMENT_QS.map((q,i)=>(
<div key={q.id} style={{padding:“14px 18px”,borderBottom:“1px solid #0F0F0F”,opacity:i===0?0.7:0.3}}>
<div style={{fontSize:9,color:”#555”,letterSpacing:1,fontWeight:600,marginBottom:5}}>QUESTION {i+1}/4</div>
<div style={{fontSize:14,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:2,marginBottom:10,color:”#333”}}>{q.q.toUpperCase()}</div>
<div style={{display:“flex”,flexDirection:“column”,gap:5}}>{q.opts.map(opt=><div key={opt.v} onClick={()=>{setShowToastSub(true);setTimeout(()=>setShowToastSub(false),3000);}} style={{background:”#0A0A0A”,border:“1px solid #0F0F0F”,color:”#2A2A2A”,fontFamily:”‘Inter’,sans-serif”,fontSize:12,padding:“10px 14px”,borderRadius:7,cursor:“pointer”,display:“flex”,gap:10}}><span style={{width:16,height:16,borderRadius:“50%”,border:“1.5px solid #1A1A1A”,flexShrink:0}}></span>{opt.l}</div>)}</div>
</div>
))}
<div style={{padding:“16px 18px”}}><button className="btn" onClick={onGoPlan}>Débloquer le matching — 9,90€/mois →</button></div>
{showToastSub&&<GateToast onUpgrade={onGoPlan}/>}
</div>
);
const answer=(qid,val)=>{const n={…ans,[qid]:val};setAns(n);if(qi<FINANCEMENT_QS.length-1)setTimeout(()=>setQi(qi+1),280);};
const allDone=Object.keys(ans).length===FINANCEMENT_QS.length;
const results=AIDES.map(a=>({…a,score:scoreAide(a,ans)})).filter(a=>a.score>=40).sort((a,b)=>b.score-a.score);
const top=results.filter(a=>a.score>=70);const possible=results.filter(a=>a.score<70);
return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub=“FINANCEMENT & DÉMARCHES” accent=”#F03E3E” onBack={onBack} right={phase===“results”&&<button className=“btn-o” style={{width:“auto”,padding:“6px 12px”,fontSize:10}} onClick={()=>{setPhase(“q”);setAns({});setQi(0);}}>↺ Refaire</button>}/>
{phase===“q”&&(
<div style={{padding:“20px 18px”}}>
<div style={{display:“flex”,gap:5,marginBottom:24}}>{FINANCEMENT_QS.map((q,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:ans[q.id]?”#F03E3E”:i===qi?”#2A2A2A”:”#111”,transition:“background 0.3s”}}/>)}</div>
{FINANCEMENT_QS.map((q,i)=>{if(i!==qi)return null;return(
<div key={q.id} className="fu">
<div style={{fontSize:11,color:”#AAA”,letterSpacing:1,fontWeight:600,marginBottom:6}}>QUESTION {i+1}/{FINANCEMENT_QS.length}</div>
<div style={{fontSize:18,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:2,marginBottom:18}}>{q.q.toUpperCase()}</div>
<div style={{display:“flex”,flexDirection:“column”,gap:8}}>{q.opts.map(opt=><button key={opt.v} onClick={()=>answer(q.id,opt.v)} style={{background:ans[q.id]===opt.v?”#150808”:”#0D0D0D”,border:`1px solid ${ans[q.id]===opt.v?"#F03E3E":"#1A1A1A"}`,color:ans[q.id]===opt.v?”#F03E3E”:”#777”,fontFamily:”‘Inter’,sans-serif”,fontSize:13,padding:“13px 15px”,borderRadius:7,cursor:“pointer”,textAlign:“left”,display:“flex”,alignItems:“center”,gap:10}}><span style={{width:16,height:16,borderRadius:“50%”,border:`1.5px solid ${ans[q.id]===opt.v?"#F03E3E":"#333"}`,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:9,color:”#F03E3E”,flexShrink:0}}>{ans[q.id]===opt.v?“✓”:””}</span>{opt.l}</button>)}</div>
<div style={{display:“flex”,justifyContent:“space-between”,marginTop:24}}>{i>0?<button className=“btn-o” onClick={()=>setQi(i-1)}>← Retour</button>:<div/>}{allDone&&<button className=“btn” style={{width:“auto”,padding:“10px 20px”,background:”#F03E3E”}} onClick={()=>setPhase(“results”)}>Voir mes aides →</button>}</div>
</div>
);})}
</div>
)}
{phase===“results”&&(
<div style={{padding:“18px 18px 20px”}}>
<div style={{background:”#0D0D0D”,border:“1px solid #F03E3E18”,borderRadius:8,padding:“14px”,marginBottom:18}}><div style={{fontSize:9,color:”#F03E3E”,letterSpacing:2,marginBottom:5}}>◆ RÉSULTAT MATCHING</div><div style={{fontSize:20,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:2}}>{results.length} AIDE{results.length>1?“S”:””} IDENTIFIÉE{results.length>1?“S”:””}</div><div style={{fontSize:11,color:”#999”,marginTop:3}}>{top.length} forte{top.length>1?“s”:””} · {possible.length} possible{possible.length>1?“s”:””}</div></div>
{top.length>0&&<><div style={{fontSize:9,letterSpacing:3,color:”#F03E3E”,marginBottom:10}}>✦ CORRESPONDANCES FORTES</div>{top.map(a=><AideCard key={a.id} aide={a} expanded={exp===a.id} onToggle={()=>setExp(exp===a.id?null:a.id)}/>)}</>}
{possible.length>0&&<><div style={{fontSize:9,letterSpacing:3,color:”#999”,marginTop:16,marginBottom:10}}>◦ AIDES POSSIBLES</div>{possible.map(a=><AideCard key={a.id} aide={a} expanded={exp===a.id} onToggle={()=>setExp(exp===a.id?null:a.id)}/>)}</>}
</div>
)}
</div>
);
}
function AideCard({aide,expanded,onToggle}){
return(
<div style={{background:”#0D0D0D”,border:`1px solid ${expanded?aide.color+"44":"#1A1A1A"}`,borderRadius:9,overflow:“hidden”,marginBottom:10}}>
<div style={{padding:“13px 14px”,cursor:“pointer”,display:“flex”,gap:10,alignItems:“flex-start”}} onClick={onToggle}>
<span style={{fontSize:18,flexShrink:0}}>{aide.icon}</span>
<div style={{flex:1}}><div style={{fontSize:12,color:expanded?aide.color:”#CCC”,lineHeight:1.3,marginBottom:4}}>{aide.nom}</div><div style={{fontSize:9,color:”#888”,letterSpacing:1,marginBottom:6}}>{aide.org.toUpperCase()}</div><div style={{display:“flex”,gap:6,flexWrap:“wrap”}}><span style={{fontSize:10,color:aide.color,background:`${aide.color}15`,padding:“2px 8px”,borderRadius:20}}>{aide.montant}</span><span style={{fontSize:9,color:”#888”}}>{aide.delai}</span></div></div>
<span style={{fontSize:10,color:aide.score>=70?aide.color:”#999”,background:`${aide.score>=70?aide.color:"#1A1A1A"}18`,border:`1px solid ${aide.score>=70?aide.color+"44":"#1E1E1E"}`,padding:“3px 7px”,borderRadius:20,flexShrink:0}}>{aide.score}%</span>
</div>
{expanded&&(
<div style={{padding:“0 14px 14px”,borderTop:“1px solid #111”}}>
<p style={{fontSize:11,color:”#777”,lineHeight:1.7,margin:“12px 0”}}>{aide.desc}</p>
<div style={{fontSize:11,color:”#AAA”,letterSpacing:1,fontWeight:600,marginBottom:8}}>ÉTAPES CLÉS</div>
{aide.etapes.map((e,i)=><div key={i} style={{display:“flex”,gap:9,padding:“7px 0”,borderBottom:i<aide.etapes.length-1?“1px solid #0F0F0F”:“none”}}><span style={{width:16,height:16,borderRadius:“50%”,background:”#111”,color:aide.color,fontSize:9,display:“flex”,alignItems:“center”,justifyContent:“center”,flexShrink:0}}>{i+1}</span><span style={{fontSize:11,color:”#666”}}>{e}</span></div>)}
<a href={aide.lien} target=”_blank” rel=“noopener noreferrer” className=“lnk” style={{marginTop:12,background:“none”,border:`1.5px solid ${aide.color}`,color:aide.color}}>Accéder au dossier →</a>
</div>
)}
</div>
);
}

// ─── ACTUALITÉS ──────────────────────────────────────────────────────────────
function Actualites({onBack}){
const [loading,setLoading]=useState(false);const [articles,setArticles]=useState(null);const [query,setQuery]=useState(””);const [searched,setSearched]=useState(false);
const CATS=[{l:“Concours de chant”,q:“concours chant France 2026”},{l:“Jams sessions”,q:“jam session Paris Lyon Marseille 2026”},{l:“Festivals”,q:“festival musique indépendant France 2026”},{l:“Appels à projets”,q:“appel à projets musique culture 2026”},{l:“Actualité indé”,q:“artiste indépendant musique France actualité 2026”},{l:“Subventions”,q:“subvention musique artiste 2026 CNM”}];
const search=async(q)=>{
setLoading(true);setSearched(true);setQuery(q);
try{
const res=await fetch(”/api/claude”,{method:“POST”,headers:{“Content-Type”:“application/json”},body:JSON.stringify({system:“Tu es un expert de la scène musicale indépendante française. Réponds UNIQUEMENT en JSON valide, sans texte autour, sans balises markdown.”,messages:[{role:“user”,content:`Cherche les dernières actualités sur : "${q}" pour artistes musicaux indépendants en France. Retourne exactement 5 résultats en JSON valide, sans markdown ni backticks, format: [{"titre":"...","source":"...","date":"...","url":"...","resume":"...","categorie":"..."}]`}],maxTokens:1500,tools:[{type:“web_search_20250305”,name:“web_search”}]})});
const json=await res.json();
const text=json.content?.filter(b=>b.type===“text”).map(b=>b.text).join(””)||”[]”;
const clean=text.replace(/`json|`/g,””).trim();
try{setArticles(JSON.parse(clean));}catch{setArticles([]);}
}catch{setArticles([]);}
setLoading(false);
};
const catColors={“Concours”:”#FF6B35”,“Festival”:”#845EF7”,“Appel”:”#00C9A7”,“Jam”:”#FFD43B”,“Subvention”:”#F03E3E”,“Actualité”:”#74C0FC”};
const getColor=(cat)=>Object.entries(catColors).find(([k])=>cat?.includes(k))?.[1]||”#444”;
return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub="ACTUALITÉS" accent="#74C0FC" onBack={onBack}/>
<div style={{padding:“12px 18px”}}>
<div style={{display:“flex”,gap:8,marginBottom:10}}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder=“Rechercher…” onKeyDown={e=>e.key===“Enter”&&search(query)} style={{flex:1}}/><button className=“btn” style={{width:“auto”,padding:“10px 16px”,background:”#74C0FC”,color:”#000”,fontSize:10}} onClick={()=>search(query)}>↵</button></div>
<div style={{display:“flex”,gap:5,overflowX:“auto”,scrollbarWidth:“none”,paddingBottom:4}}>
{CATS.map(c=><button key={c.l} onClick={()=>search(c.q)} style={{background:”#0D0D0D”,border:“1px solid #1A1A1A”,color:”#555”,fontFamily:”‘Inter’,sans-serif”,fontSize:9,letterSpacing:1,padding:“5px 11px”,borderRadius:20,cursor:“pointer”,flexShrink:0,textTransform:“uppercase”}}>{c.l}</button>)}
</div>
</div>
{!searched&&<div style={{padding:“40px 24px”,textAlign:“center”,display:“flex”,flexDirection:“column”,alignItems:“center”,gap:16}}><div style={{fontSize:40}}>📰</div><div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:22,letterSpacing:3,color:”#999”}}>ACTU MUSICALE</div><div style={{fontSize:12,color:”#888”,lineHeight:1.8,maxWidth:260}}>Concours, jams, festivals, appels à projets — l’actualité musicale en temps réel.</div><button className=“btn” style={{width:“auto”,padding:“12px 24px”,background:”#74C0FC”,color:”#000”}} onClick={()=>search(“actualité musique indépendante France 2026”)}>Charger l’actu →</button></div>}
{loading&&<div style={{display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,minHeight:“40vh”,gap:16}}><div style={{fontSize:28}}>📡</div><div style={{fontSize:12,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:3,color:”#74C0FC”}}>RECHERCHE EN COURS</div><div style={{display:“flex”,gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:“50%”,background:”#74C0FC”,animation:“pulse 1.2s infinite”,animationDelay:`${i*0.2}s`}}/>)}</div></div>}
{!loading&&articles&&(
<div style={{padding:“12px 18px”,display:“flex”,flexDirection:“column”,gap:10}}>
{articles.length===0&&<div style={{textAlign:“center”,padding:“30px 0”,color:”#888”,fontSize:12}}>Aucun résultat. Essaie une autre recherche.</div>}
{articles.map((a,i)=>(
<div key={i} className=“card fu” style={{padding:“15px”,animationDelay:`${i*0.05}s`}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:6}}><span className=“pill” style={{background:`${getColor(a.categorie)}15`,color:getColor(a.categorie),border:`1px solid ${getColor(a.categorie)}33`}}>{a.categorie||“Actu”}</span><span style={{fontSize:9,color:”#888”}}>{a.date||“Récent”}</span></div>
<div style={{fontSize:13,color:”#DDD”,fontWeight:500,lineHeight:1.4,marginBottom:6}}>{a.titre}</div>
<div style={{fontSize:11,color:”#777”,lineHeight:1.6,marginBottom:8}}>{a.resume}</div>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”}}><span style={{fontSize:9,color:”#999”}}>{a.source}</span>{a.url&&a.url!==“N/A”&&<a href={a.url} target=”_blank” rel=“noopener noreferrer” style={{fontSize:9,color:”#74C0FC”,textDecoration:“none”,letterSpacing:1}}>Lire →</a>}</div>
</div>
))}
</div>
)}
</div>
);
}

// ─── PROFIL ──────────────────────────────────────────────────────────────────
function Profil({plan,setPlan,user,onGoPlan,onBack}){
const PI={free:{l:“DÉCOUVERTE”,c:”#999”},artiste:{l:“ARTISTE”,c:”#FF6B35”},label:{l:“LABEL”,c:”#C8A96E”}};
const cur=PI[plan];
return(
<div style={{minHeight:“100vh”,background:”#080808”,color:”#F0EDE8”,fontFamily:”‘Inter’,sans-serif”,paddingBottom:80}}>
<Hdr sub="MON COMPTE" onBack={onBack}/>
<div style={{padding:“20px 18px”,display:“flex”,flexDirection:“column”,gap:14}}>
<div className="card" style={{padding:18}}><div style={{fontSize:11,color:”#AAA”,letterSpacing:1,fontWeight:600,marginBottom:10}}>PROFIL ARTISTE</div><div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:24,letterSpacing:3}}>{user?.name||“Artiste”}</div><div style={{fontSize:11,color:”#555”,marginTop:2}}>{user?.genre||“Genre non défini”}</div></div>
<div className="card" style={{padding:18}}><div style={{fontSize:9,color:cur.c,letterSpacing:2,marginBottom:6}}>ABONNEMENT ACTUEL</div><div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:20,letterSpacing:3,color:cur.c}}>{cur.l}</div>{plan===“free”&&<button className="btn" style={{marginTop:12}} onClick={onGoPlan}>Passer à ARTISTE — 9,90€/mois →</button>}</div>
{plan!==“free”&&<div className="card" style={{padding:18}}><div style={{fontSize:9,color:”#555”,letterSpacing:2,marginBottom:10}}>GÉRER MON ABONNEMENT</div><button className=“btn-o” style={{width:“100%”,marginBottom:8}} onClick={onGoPlan}>Changer de plan</button><button className=“btn-o” style={{width:“100%”,color:”#F03E3E44”,borderColor:”#F03E3E22”}} onClick={()=>setPlan(“free”)}>Résilier (simulation)</button></div>}
<div className="card" style={{padding:18}}>
<div style={{fontSize:9,color:”#555”,letterSpacing:2,marginBottom:10}}>COMPTE</div>
{user?.email&&<div style={{fontSize:11,color:”#888”,marginBottom:10,wordBreak:“break-all”}}>{user.email}</div>}
<button className=“btn-o” style={{width:“100%”,color:”#666”,borderColor:”#222”}} onClick={async()=>{if(!window.confirm(“Te déconnecter de INDY ?”))return;if(supabase&&supabase.auth)await supabase.auth.signOut();window.location.reload();}}>Se déconnecter</button>
</div>
<div className=“card” style={{padding:18,textAlign:“center”}}>
<div style={{fontSize:9,color:”#555”,letterSpacing:2,marginBottom:12}}>QR CODE — PARTAGE INDY</div>
<img src=“https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://www.indy-label.fr&bgcolor=0D0D0D&color=FF6B35&qzone=2&format=png” alt=“QR Code INDY” style={{width:150,height:150,borderRadius:8,border:“1px solid #FF6B3533”}} loading=“lazy”/>
<div style={{fontSize:10,color:”#888”,marginTop:10,lineHeight:1.5}}>Scanne pour accéder à INDY</div>
<div style={{fontSize:10,color:”#FF6B35”,marginTop:4}}>www.indy-label.fr</div>
<button className=“btn-o” style={{width:“100%”,marginTop:12,fontSize:10}} onClick={()=>{const a=document.createElement(“a”);a.href=“https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://www.indy-label.fr&bgcolor=0D0D0D&color=FF6B35&qzone=2&format=png”;a.download=“indy-qrcode.png”;a.click();}}>⬇ Télécharger le QR code</button>
</div>
</div>
</div>
);
}

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
function Chatbot({plan,onUpgrade,onClose}){
const [msgs,setMsgs]=useState([{role:“assistant”,content:“Salut ! Je suis INDY Coach 🎵\n\nJe suis là pour répondre à toutes tes questions sur la musique indépendante — SACEM, booking, subventions, distribution…\n\nC’est quoi ta question ?”}]);
const [input,setInput]=useState(””);
const [loading,setLoading]=useState(false);
const bottomRef=useRef(null);
useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:“smooth”});},[msgs]);

if(plan===“free”)return(
<div className="panel"><div className=“pin” style={{borderTopColor:”#FF6B35”}}>
<div style={{padding:“16px 20px”,borderBottom:“1px solid #111”,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div><div style={{fontSize:9,color:”#FF6B35”,letterSpacing:2}}>INDY COACH IA</div><div style={{fontSize:14,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:2,marginTop:2}}>ASSISTANT PERSONNEL</div></div>
<button onClick={onClose} style={{background:“none”,border:“none”,color:”#999”,fontSize:20,cursor:“pointer”}}>✕</button>
</div>
<div style={{padding:“32px 24px”,textAlign:“center”,display:“flex”,flexDirection:“column”,alignItems:“center”,gap:16}}>
<div style={{width:64,height:64,borderRadius:“50%”,background:”#FF6B3515”,border:“2px solid #FF6B3533”,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:28}}>🎵</div>
<div style={{fontFamily:”‘Bebas Neue’,sans-serif”,fontSize:20,letterSpacing:2}}>COACH IA RÉSERVÉ AUX ABONNÉS</div>
<div style={{fontSize:12,color:”#555”,lineHeight:1.7,maxWidth:260}}>Ton coach disponible 24h/24 sur la SACEM, le booking, les subventions, les contrats, la distribution.</div>
{[[“Réponses instantanées 24h/24”,”#FF6B35”],[“SACEM, ISRC, CNM, ADAMI”,”#845EF7”],[“Contrats & droits d’auteur”,”#20C997”],[“Booking & stratégie live”,”#FFD43B”]].map(([f,c])=>(
<div key={f} style={{display:“flex”,gap:8,fontSize:11,color:”#888”,alignSelf:“flex-start”,maxWidth:280}}><span style={{color:c,flexShrink:0}}>✓</span>{f}</div>
))}
<button className="btn" style={{maxWidth:300}} onClick={onUpgrade}>S’abonner dès 9,90€/mois →</button>
<div style={{fontSize:10,color:”#888”}}>3 jours d’essai · Sans engagement</div>
</div>
</div></div>
);

const send=async()=>{
if(!input.trim()||loading)return;
const userMsg={role:“user”,content:input.trim()};
setMsgs(prev=>[…prev,userMsg]);setInput(””);setLoading(true);
try{
const res=await fetch(”/api/claude”,{method:“POST”,headers:{“Content-Type”:“application/json”},body:JSON.stringify({system:COACH_SYS,messages:[…msgs,userMsg].map(m=>({role:m.role,content:m.content})),maxTokens:800})});
const json=await res.json();
setMsgs(prev=>[…prev,{role:“assistant”,content:json.content?.map(b=>b.text||””).join(””)||“Erreur.”}]);
}catch{setMsgs(prev=>[…prev,{role:“assistant”,content:“Erreur de connexion. Réessaie.”}]);}
setLoading(false);
};

return(
<div className="panel"><div className=“pin” style={{borderTopColor:”#FF6B35”,display:“flex”,flexDirection:“column”}}>
<div style={{padding:“14px 20px”,borderBottom:“1px solid #111”,display:“flex”,justifyContent:“space-between”,alignItems:“center”,flexShrink:0}}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
<div style={{width:32,height:32,borderRadius:“50%”,background:”#FF6B3518”,border:“1px solid #FF6B3533”,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:14}}>🎵</div>
<div><div style={{fontSize:13,fontFamily:”‘Bebas Neue’,sans-serif”,letterSpacing:2}}>INDY COACH</div><div style={{display:“flex”,alignItems:“center”,gap:5}}><div style={{width:6,height:6,borderRadius:“50%”,background:”#00C9A7”,animation:“pulse 2s infinite”}}/><div style={{fontSize:9,color:”#00C9A7”,letterSpacing:1}}>EN LIGNE</div></div></div>
</div>
<button onClick={onClose} style={{background:“none”,border:“none”,color:”#999”,fontSize:20,cursor:“pointer”}}>✕</button>
</div>
<div style={{flex:1,overflowY:“auto”,padding:“16px 18px”,display:“flex”,flexDirection:“column”,gap:12,fontFamily:”‘Inter’,sans-serif”}}>
{msgs.map((m,i)=>(
<div key={i} style={{display:“flex”,justifyContent:m.role===“user”?“flex-end”:“flex-start”}}>
<div style={{maxWidth:“90%”,padding:“11px 13px”,borderRadius:m.role===“user”?“14px 14px 4px 14px”:“14px 14px 14px 4px”,background:m.role===“user”?”#FF6B3520”:”#111”,border:`1px solid ${m.role==="user"?"#FF6B3533":"#1A1A1A"}`,fontSize:12,color:m.role===“user”?”#F0EDE8”:”#CCC”,lineHeight:1.7,whiteSpace:“pre-wrap”}}>{m.content}</div>
</div>
))}
{loading&&<div style={{display:“flex”,justifyContent:“flex-start”}}><div style={{padding:“11px 13px”,borderRadius:“14px 14px 14px 4px”,background:”#111”,border:“1px solid #1A1A1A”,display:“flex”,gap:5,alignItems:“center”}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:“50%”,background:”#555”,animation:“pulse 1.2s infinite”,animationDelay:`${i*0.2}s`}}/>)}</div></div>}
<div ref={bottomRef}/>
</div>
{msgs.length<=1&&(
<div style={{padding:“0 18px 10px”,display:“flex”,gap:6,overflowX:“auto”,scrollbarWidth:“none”,flexShrink:0}}>
{[“Déposer à la SACEM ?”,“C’est quoi un ISRC ?”,“Pitcher Spotify ?”,“Aides CNM ?”,“Trouver des dates ?”].map(s=>(
<button key={s} onClick={()=>setInput(s)} style={{background:”#0D0D0D”,border:“1px solid #1A1A1A”,color:”#666”,fontFamily:”‘Inter’,sans-serif”,fontSize:10,padding:“5px 11px”,borderRadius:20,cursor:“pointer”,flexShrink:0,whiteSpace:“nowrap”}}>{s}</button>
))}
</div>
)}
<div style={{padding:“11px 18px 14px”,borderTop:“1px solid #0F0F0F”,flexShrink:0,position:“relative”}}>
<input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key===“Enter”&&!e.shiftKey){e.preventDefault();send();}}} placeholder=“Pose ta question…” style={{paddingRight:44,borderRadius:24}}/>
<button onClick={send} disabled={!input.trim()||loading} style={{position:“absolute”,right:26,top:“50%”,transform:“translateY(-50%)”,background:input.trim()?”#FF6B35”:”#1A1A1A”,border:“none”,color:input.trim()?”#000”:”#333”,width:30,height:30,borderRadius:“50%”,cursor:input.trim()?“pointer”:“not-allowed”,fontSize:14,display:“flex”,alignItems:“center”,justifyContent:“center”}}>↑</button>
</div>
</div></div>
);
}

// ─── APP ROOT — état centralisé, navigation propre ───────────────────────────
export default function INDYComplete(){
// ── État global (1 seul endroit) ──────────────────────────────────────────
const [screen,  setScreen]  = useState(“landing”);   // landing | auth | onboarding | paywall | app
const [plan,    setPlan]    = useState(“free”);       // free | artiste | label
const [user,    setUser]    = useState(null);
const [view,    setView]    = useState(“dashboard”);
const [history, setHistory] = useState([]);
const [projects,setProjects]= useState(()=>{
try{const s=localStorage.getItem(“indy_projects”);return s?JSON.parse(s):[];}
catch{return [];}
});
const [activeId,setActiveId]= useState(null);
const [showMore,setShowMore]= useState(false);
const [showChat,setShowChat]= useState(false);
const [authReady,setAuthReady]= useState(false);  // true après tentative restore session

// ── Persistance des projets dans localStorage ────────────────────────────
useEffect(()=>{
try{localStorage.setItem(“indy_projects”,JSON.stringify(projects));}
catch(e){console.warn(“localStorage error”,e);}
},[projects]);

// ── Restauration session Supabase au chargement ───────────────────────────
useEffect(()=>{
(async()=>{
const sb = await initSupabase();
if(!sb){setAuthReady(true);return;}
try{
const {data:{session}} = await sb.auth.getSession();
if(session?.user){
const {data:profile} = await sb.from(“profiles”).select(”*”).eq(“id”,session.user.id).single();
if(profile){
setUser({id:session.user.id,email:session.user.email,name:profile.name,genre:profile.genre});
setPlan(profile.plan||“free”);
setScreen(“app”);
}
}
}catch(e){console.warn(“Session restore error”,e);}
setAuthReady(true);
const {data:listener} = sb.auth.onAuthStateChange((event)=>{
if(event===“SIGNED_OUT”){setUser(null);setPlan(“free”);setScreen(“landing”);}
});
return ()=>listener?.subscription?.unsubscribe();
})();
},[]);

// ── Navigation ────────────────────────────────────────────────────────────
const goTo=(v)=>{setHistory(h=>[…h,view]);setView(v);setShowMore(false);};
const goBack=()=>{
if(history.length>0){const h=[…history];const prev=h.pop();setHistory(h);setView(prev);}
else setView(“dashboard”);
};
const goPaywall=()=>setScreen(“paywall”);
const goCoach=(id)=>{setActiveId(id);goTo(“coach”);};

const MAIN=[“dashboard”,“coach”,“presskit”,“booking”];
const isSecondary=!MAIN.includes(view);

// ── Contenu principal ─────────────────────────────────────────────────────
const VIEWS = {
dashboard:   <Dashboard    projects={projects} setProjects={setProjects} onGoCoach={goCoach} onGoPlan={goPaywall} plan={plan} user={user}/>,
coach:       <Coach        projects={projects} setProjects={setProjects} activeId={activeId} setActiveId={setActiveId} plan={plan} onGoPlan={goPaywall}/>,
presskit:    <PressKit     projects={projects} plan={plan} onGoPlan={goPaywall} onBack={goBack}/>,
booking:     <Booking      plan={plan} onGoPlan={goPaywall} onBack={goBack}/>,
bibliotheque:<Bibliotheque plan={plan} onGoPlan={goPaywall} onBack={goBack}/>,
subventions: <Subventions  plan={plan} onGoPlan={goPaywall} onBack={goBack}/>,
annuaire:    <Annuaire    plan={plan} onGoPlan={goPaywall} onBack={goBack}/>,
actualites:  <Actualites   onBack={goBack}/>,
profil:      <Profil       plan={plan} setPlan={setPlan} user={user} onGoPlan={goPaywall} onBack={goBack}/>,
};

const NAV=[
{id:“dashboard”,l:“Board”,    i:“⬛”},
{id:“coach”,    l:“Coach”,    i:“🎯”},
{id:“presskit”, l:“Press Kit”,i:“✍️”},
{id:“booking”,  l:“Booking”,  i:“🎤”},
{id:“more”,     l:“Plus”,     i:”+”},
];
const MORE_MENU=[
{id:“bibliotheque”,l:“Documents”, i:“📚”,c:”#C8A96E”},
{id:“subventions”, l:“Financement”,i:“💰”,c:”#F03E3E”},
{id:“annuaire”,    l:“Annuaire”,  i:“🗂️”,c:”#845EF7”},
{id:“actualites”,  l:“Actualités”,i:“📰”,c:”#74C0FC”},
{id:“profil”,      l:“Compte”,    i:“👤”,c:”#FF6B35”},
];

// ── Écrans ────────────────────────────────────────────────────────────────
// Loader pendant la restauration de session
if(!authReady) return <div style={{background:”#080808”,minHeight:“100vh”,display:“flex”,alignItems:“center”,justifyContent:“center”,color:”#FF6B35”,fontFamily:”‘Inter’,sans-serif”}}><style>{CSS}</style><div style={{display:“flex”,flexDirection:“column”,alignItems:“center”,gap:16}}><Logo size={60} anim/><div style={{fontSize:11,letterSpacing:3}}>CHARGEMENT…</div></div></div>;

if(screen===“landing”)    return <div style={{background:”#060606”,minHeight:“100vh”}}><style>{CSS}</style><Landing onEnter={()=>setScreen(“auth”)}/></div>;
if(screen===“auth”)       return <div style={{background:”#080808”,minHeight:“100vh”}}><style>{CSS}</style><Auth onBack={()=>setScreen(“landing”)} onSuccess={u=>{setUser(u);setPlan(u.plan||“free”);setScreen(u.name?“paywall”:“onboarding”);}}/></div>;
if(screen===“onboarding”) return <div style={{background:”#080808”,minHeight:“100vh”}}><style>{CSS}</style><Onboarding onDone={async(u)=>{const merged={…user,…u};setUser(merged);if(supabase&&merged.id){try{await supabase.from(“profiles”).update({name:u.name,genre:u.genre}).eq(“id”,merged.id);}catch(e){console.warn(e);}}setScreen(“paywall”);}}/></div>;
if(screen===“paywall”)    return <div style={{background:”#080808”,minHeight:“100vh”}}><style>{CSS}</style><Paywall onSelect={async(p)=>{setPlan(p);if(supabase&&user?.id){try{await supabase.from(“profiles”).update({plan:p}).eq(“id”,user.id);}catch(e){console.warn(e);}}setScreen(“app”);}} current={plan}/></div>;

return(
<div style={{background:”#080808”,minHeight:“100vh”}}>
<style>{CSS}</style>
<div style={{paddingBottom:64}}>
{VIEWS[view]||VIEWS.dashboard}
</div>

```
  {/* ── Menu Plus ── */}
  {showMore&&(
    <div style={{position:"fixed",inset:0,zIndex:100}} onClick={()=>setShowMore(false)}>
      <div style={{position:"absolute",bottom:64,left:0,right:0,background:"#0A0A0A",borderTop:"1px solid #141414",padding:"12px 18px",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}} onClick={e=>e.stopPropagation()}>
        {MORE_MENU.map(m=>(
          <button key={m.id} onClick={()=>goTo(m.id)} style={{background:view===m.id?`${m.c}15`:"#0D0D0D",border:`1px solid ${view===m.id?m.c:"#1A1A1A"}`,borderRadius:10,padding:"12px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <span style={{fontSize:20}}>{m.i}</span>
            <span style={{fontSize:8,color:view===m.id?m.c:"#444",fontFamily:"'Inter',sans-serif",letterSpacing:0.5}}>{m.l}</span>
          </button>
        ))}
      </div>
    </div>
  )}

  {/* ── Chatbot flottant ── */}
  {!showChat&&(
    <button onClick={()=>setShowChat(true)} style={{position:"fixed",bottom:76,right:16,width:52,height:52,borderRadius:"50%",background:plan!=="free"?"#FF6B35":"#1A1A1A",border:plan!=="free"?"none":"2px solid #2A2A2A",color:plan!=="free"?"#000":"#555",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:49,boxShadow:plan!=="free"?"0 4px 20px #FF6B3544":"none",transition:"all 0.3s"}}>💬</button>
  )}
  {showChat&&<Chatbot plan={plan} onUpgrade={()=>{setShowChat(false);goPaywall();}} onClose={()=>setShowChat(false)}/>}

  {/* ── Bottom nav ── */}
  <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#080808",borderTop:"1px solid #0F0F0F",display:"flex",padding:"4px 0 8px",zIndex:50}}>
    {NAV.map(n=>{
      const isPlus=n.id==="more";
      const active=isPlus?showMore:view===n.id;
      return(
        <button key={n.id} className="nav" onClick={()=>{
          if(isPlus){setShowMore(s=>!s);}
          else{setHistory([]);setView(n.id);setShowMore(false);}
        }}>
          {isPlus?(
            <span style={{width:28,height:28,borderRadius:"50%",background:active?"#FF6B35":"#1A1A1A",border:active?"none":"1px solid #2A2A2A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:active?"#000":"#555",transition:"all 0.2s",fontWeight:"bold"}}>+</span>
          ):(
            <span style={{fontSize:18,opacity:active?1:0.35,transition:"all 0.2s"}}>{n.i}</span>
          )}
          <span style={{fontSize:10,letterSpacing:0.5,color:active?"#FF6B35":"#666",transition:"color 0.2s",fontWeight:active?700:500}}>{n.l}</span>
          {active&&!isPlus&&<div style={{width:14,height:2,borderRadius:1,background:"#FF6B35",marginTop:1}}/>}
        </button>
      );
    })}
  </div>
</div>
```

);
}