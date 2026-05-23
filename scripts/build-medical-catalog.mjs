/**
 * Génère le catalogue médical MedSearch (index + catégories).
 * Sources de référence : OMS, UNICEF IMCI, fiches pédiatriques tropicales.
 */
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

const catalog = {
  infectieuses: [
    entry('grip-001', 'Grippe (Influenza)', 'infectieuses', 'Infection respiratoire aiguë due aux virus influenza (OMS).', [
      ['fièvre', 3], ['toux', 3], ['courbatures', 2], ['fatigue', 2], ['mal de gorge', 1],
    ], ['détresse respiratoire', 'cyanose', 'confusion'], 'Repos, hydratation, antipyrétiques. Oseltamivir si protocole national et risque élevé.', 'Moyenne'),
    entry('vih-001', 'Infection à VIH', 'infectieuses', 'Virus d\'immunodéficience humaine ; évolution vers SIDA sans traitement (OMS).', [
      ['fièvre prolongée', 2], ['perte de poids', 3], ['diarrhée chronique', 2], ['toux persistante', 2], ['éruptions cutanées', 1],
    ], ['infections opportunistes', 'tuberculose', 'amaigrissement sévère'], 'Dépistage rapide + confirmation. ARV selon protocole national. Prévention transmission.', 'Haute'),
    entry('poli-001', 'Poliomyélite', 'infectieuses', 'Maladie virale par poliovirus, éradiquée dans de nombreuses régions ; résurgences possibles (OMS).', [
      ['fièvre', 2], ['maux de tête', 2], ['paralysie', 3], ['raideur de la nuque', 2], ['faiblesse musculaire', 3],
    ], ['paralysie respiratoire', 'paralysie permanente'], 'Pas de traitement curatif. Soutien respiratoire si besoin. Vaccination préventive.', 'Critique'),
    entry('rage-001', 'Rage', 'infectieuses', 'Encéphalite virale mortelle après morsure d\'animal infecté (OMS).', [
      ['fièvre', 2], ['maux de tête', 3], ['hydrophobie', 3], ['agitation', 3], ['paralysie', 2],
    ], ['coma', 'arrêt respiratoire'], 'Lavage plaie + immunoglobulines + vaccin post-exposition IMMÉDIAT. Référence urgente.', 'Critique'),
    entry('lept-001', 'Leptospirose', 'infectieuses', 'Zoonose bactérienne transmise par l\'eau contaminée (OMS).', [
      ['fièvre', 3], ['maux de tête', 2], ['courbatures', 3], ['conjonctivite', 2], ['nausées', 1],
    ], ['ictère', 'insuffisance rénale', 'hémorragie'], 'Antibiotiques (doxycycline) précoce. Réhydratation. Référence si forme sévère.', 'Haute'),
    entry('try-001', 'Trypanosomiase (Maladie du sommeil)', 'infectieuses', 'Parasitose transmise par la mouche tsé-tsé (OMS).', [
      ['fièvre intermittente', 3], ['maux de tête', 2], ['somnolence diurne', 3], ['ganglions', 2], ['prurit', 1],
    ], ['troubles neurologiques', 'coma'], 'Dépistage terrain si disponible. Traitement selon stade (suramine/éflornithine/mélarsoprol).', 'Haute'),
    entry('lfas-001', 'Fièvre de Lassa', 'infectieuses', 'Fièvre hémorragique virale endémique en Afrique de l\'Ouest (OMS).', [
      ['fièvre', 3], ['maux de tête', 3], ['vomissements', 2], ['douleurs abdominales', 2], ['saignement', 2],
    ], ['choc', 'saignement massif', 'défaillance organes'], 'Isolement. Ribavirine si disponible. Soins de support. Référence hôpital.', 'Critique'),
    entry('ebol-001', 'Maladie à virus Ebola', 'infectieuses', 'Fièvre hémorragique virale à haute létalité (OMS).', [
      ['fièvre', 3], ['vomissements', 3], ['diarrhée', 3], ['douleurs musculaires', 2], ['saignement', 3],
    ], ['choc', 'hémorragie', 'défaillance multi-organes'], 'Isolement strict. Soins de support intensifs. Référence centre spécialisé.', 'Critique'),
    entry('covi-001', 'COVID-19', 'infectieuses', 'Maladie respiratoire due au SARS-CoV-2 (OMS).', [
      ['fièvre', 2], ['toux', 3], ['fatigue', 2], ['essoufflement', 3], ['perte de goût', 1],
    ], ['détresse respiratoire', 'hypoxie', 'confusion'], 'Isolement si possible. Oxygène si SpO2 basse. Suivi signes de gravité.', 'Haute'),
    entry('stre-001', 'Angine streptococcique', 'infectieuses', 'Infection pharyngée à Streptococcus pyogenes (OMS/IMCI).', [
      ['mal de gorge', 3], ['fièvre', 2], ['adénopathies cervicales', 2], ['absence de toux', 2], ['éruption', 1],
    ], ['abcès péri-amygdalien', 'rhume des foins'], 'Antibiotiques (pénicilline/azithromycine) si confirmé ou score clinique élevé.', 'Moyenne'),
    entry('orei-001', 'Oreillons', 'infectieuses', 'Infection virale à paramyxovirus, contagieuse (OMS).', [
      ['gonflement des parotides', 3], ['fièvre', 2], ['mal de gorge', 2], ['fatigue', 1],
    ], ['méningite', 'orchite', 'surdité'], 'Traitement symptomatique. Vaccination préventive (ROR).', 'Moyenne'),
    entry('rubi-001', 'Rubéole', 'infectieuses', 'Infection virale ; risque majeur en grossesse (syndrome rubéoleux congénital) (OMS).', [
      ['éruption cutanée', 3], ['fièvre légère', 1], ['adénopathies', 2], ['arthralgies', 1],
    ], ['complications grossesse', 'fausse couche'], 'Traitement symptomatique. Vaccination ROR. Éviter grossesse 28 j après vaccin.', 'Moyenne'),
    entry('diph-001', 'Diphtérie', 'infectieuses', 'Infection à Corynebacterium diphtheriae (OMS).', [
      ['fièvre', 2], ['mal de gorge', 3], ['fausse membrane pharyngée', 3], ['fatigue', 2],
    ], ['obstruction des voies aériennes', 'myocardite', 'paralysie'], 'Antitoxine diphtérique + antibiotiques. Référence urgente.', 'Critique'),
    entry('trac-001', 'Trachome', 'infectieuses', 'Infection oculaire à Chlamydia trachomatis, cause de cécité évitable (OMS).', [
      ['yeux rouges', 2], ['démangeaisons oculaires', 2], ['écoulement oculaire', 2], ['sensibilité à la lumière', 1],
    ], ['cécité'], 'Azithromycine en MDA selon programme. Hygiène faciale, eau.', 'Moyenne'),
    entry('fila-001', 'Filariose lymphatique', 'infectieuses', 'Parasitose à Wuchereria bancrofti (OMS).', [
      ['fièvre', 2], ['gonflement des membres', 3], ['lymphangite', 2], ['douleurs', 2],
    ], ['éléphantiasis', 'infection secondaire'], 'Albendazole + ivermectine (traitement de masse). Soins des membres.', 'Moyenne'),
    entry('shig-001', 'Shigellose (dysenterie bacillaire)', 'infectieuses', 'Infection à Shigella, transmission féco-orale (OMS).', [
      ['diarrhée sanglante', 3], ['fièvre', 2], ['douleurs abdominales', 3], ['tenesme', 2], ['vomissements', 1],
    ], ['déshydratation sévère', 'choc'], 'Réhydratation + antibiotique selon sensibilité locale (ciprofloxacine si indiqué). Zinc enfant.', 'Haute'),
    entry('rota-001', 'Gastro-entérite à rotavirus', 'infectieuses', 'Cause majeure de diarrhée grave chez l\'enfant (OMS).', [
      ['diarrhée aqueuse', 3], ['vomissements', 3], ['fièvre', 1], ['déshydratation', 3],
    ], ['choc', 'déshydratation sévère'], 'SRO plan A/B/C (IMCI). Zinc 10-14 jours. Vaccin rotavirus prévention.', 'Haute'),
    entry('giar-001', 'Giardiase', 'infectieuses', 'Parasitose intestinale à Giardia lamblia (OMS).', [
      ['diarrhée chronique', 3], ['douleurs abdominales', 2], ['ballonnements', 2], ['nausées', 1], ['perte de poids', 1],
    ], ['malabsorption', 'dénutrition'], 'Métronidazole ou tinidazole. Hygiène eau/aliments.', 'Moyenne'),
    entry('hepb-001', 'Hépatite B', 'infectieuses', 'Infection virale du foie, transmission sang et voie sexuelle (OMS).', [
      ['fatigue', 2], ['jaunisse', 3], ['douleurs abdominales', 2], ['urines foncées', 2], ['nausées', 1],
    ], ['insuffisance hépatique aiguë', 'cirrhose'], 'Traitement symptomatique aigu. Vaccination prévention. Référence si ictère sévère.', 'Haute'),
    entry('hepc-001', 'Hépatite C', 'infectieuses', 'Infection virale du foie, souvent chronique (OMS).', [
      ['fatigue', 2], ['jaunisse', 1], ['douleurs abdominales', 1],
    ], ['cirrhose', 'carcinome hépatocellulaire'], 'Dépistage sérologique. Antiviraux directs si accès. Référence spécialisée.', 'Moyenne'),
    entry('typh-002', 'Typhus', 'infectieuses', 'Maladie à Rickettsia transmise par poux ou puces (OMS).', [
      ['fièvre élevée', 3], ['maux de tête', 3], ['éruption', 2], ['courbatures', 2], ['toux', 1],
    ], ['encéphalite', 'choc'], 'Antibiotiques (doxycycline). Éradication poux si typhus épidémique.', 'Haute'),
    entry('leis-001', 'Leishmaniose', 'infectieuses', 'Maladie parasitaire transmise par phlébotomes (OMS).', [
      ['lésion cutanée', 3], ['fièvre', 2], ['perte de poids', 2], ['anémie', 2], ['splénomégalie', 2],
    ], ['hémorragie', 'infection secondaire'], 'Forme cutanée : antimoniaux ou miltefosine. Viscérale : référence hospitalière.', 'Haute'),
    entry('meni-002', 'Méningite à méningocoque', 'infectieuses', 'Infection bactérienne aiguë des méninges (OMS).', [
      ['fièvre élevée', 3], ['raideur de la nuque', 3], ['vomissements', 2], ['purpura', 3], ['somnolence', 2],
    ], ['choc septique', 'coma'], 'Antibiotiques IV/IM immédiats (ceftriaxone). Référence urgente. Chimioprophylaxie contacts.', 'Critique'),
    entry('seps-001', 'Sepsis', 'infectieuses', 'Réponse dysfonctionnelle du corps à une infection, menace vitale (OMS).', [
      ['fièvre ou hypothermie', 3], ['fréquence cardiaque élevée', 2], ['respiration rapide', 3], ['confusion', 3], ['extrémités froides', 2],
    ], ['choc septique', 'défaillance organes'], 'Antibiotiques précoces larges spectre. Réhydratation IV. Référence immédiate.', 'Critique'),
    entry('scar-001', 'Scarlatine', 'infectieuses', 'Infection à streptocoque avec éruption (OMS).', [
      ['éruption scarlatine', 3], ['fièvre', 2], ['mal de gorge', 3], ['langue framboisée', 2],
    ], ['complications rhumatiques', 'glomérulonéphrite'], 'Antibiotiques (pénicilline). Traitement symptomatique.', 'Moyenne'),
    entry('imp-002', 'Infection urinaire', 'infectieuses', 'Infection du tractus urinaire, fréquente chez la femme (OMS).', [
      ['brûlures mictionnelles', 3], ['envie fréquente d\'uriner', 3], ['douleurs sus-pubiennes', 2], ['fièvre', 1], ['urines troubles', 2],
    ], ['pyélonéphrite', 'sepsis'], 'Antibiotiques selon protocole. Hydratation. Référence si fièvre haute ou douleur lombaire.', 'Moyenne'),
  ],

  respiratoires: [
    entry('sinu-001', 'Sinusite aiguë', 'respiratoires', 'Inflammation des sinus paranasaux, souvent post-virale (OMS).', [
      ['douleur faciale', 3], ['congestion nasale', 3], ['fièvre', 1], ['maux de tête', 2], ['écoulement nasal purulent', 2],
    ], ['infection orbitaire', 'méningite'], 'Antibiotiques si persistance >10 j ou signes sévères. Lavage nasal, antalgiques.', 'Faible'),
    entry('lary-001', 'Laryngite aiguë', 'respiratoires', 'Inflammation du larynx, fréquente chez l\'enfant (croup) (OMS).', [
      ['toux rauque', 3], ['enrouement', 3], ['stridor', 2], ['fièvre légère', 1],
    ], ['détresse respiratoire', 'cyanose'], 'Corticoïdes si croup modéré/sévère. Aérosols humides. Référence si détresse.', 'Moyenne'),
    entry('epig-001', 'Épiglotte aiguë', 'respiratoires', 'Infection urgente du larynx, souvent H. influenzae (OMS).', [
      ['fièvre élevée', 3], ['douleur à la déglutition', 3], ['salivation', 3], ['stridor', 3], ['position assise penchée', 2],
    ], ['obstruction totale des voies aériennes'], 'NE PAS examiner la gorge. Référence IMMÉDIATE. Voie aérienne sécurisée en hôpital.', 'Critique'),
    entry('bpco-001', 'BPCO', 'respiratoires', 'Bronchopneumopathie chronique obstructive, liée au tabac (OMS).', [
      ['essoufflement chronique', 3], ['toux chronique', 3], ['expectorations', 2], ['sifflements', 2],
    ], ['exacerbation sévère', 'insuffisance respiratoire'], 'Arrêt tabac. Bronchodilatateurs. Référence si exacerbation.', 'Moyenne'),
    entry('phar-001', 'Pharyngite virale', 'respiratoires', 'Inflammation du pharynx, majoritairement virale (OMS/IMCI).', [
      ['mal de gorge', 3], ['fièvre légère', 1], ['rhinorrhée', 2], ['toux', 1],
    ], ['déshydratation'], 'Traitement symptomatique. Pas d\'antibiotiques sauf suspicion streptocoque.', 'Faible'),
    entry('crup-001', 'Croup (laryngotrachéite)', 'respiratoires', 'Infection virale des voies aériennes supérieures chez l\'enfant (OMS).', [
      ['toux aboyante', 3], ['stridor inspiratoire', 3], ['fièvre', 2], ['respiration bruyante', 2],
    ], ['détresse respiratoire sévère'], 'Dexaméthasone dose unique si modéré+. Oxygène si besoin.', 'Haute'),
    entry('srag-001', 'Syndrome respiratoire aigu sévère', 'respiratoires', 'Infection respiratoire grave avec détresse (contexte OMS).', [
      ['fièvre', 2], ['toux', 2], ['essoufflement rapide', 3], ['confusion', 2], ['lèvres bleues', 3],
    ], ['insuffisance respiratoire', 'choc'], 'Oxygénothérapie. Antibiotiques/antiviraux selon cause. Référence hospitalière.', 'Critique'),
  ],

  digestives: [
    entry('appe-001', 'Appendicite aiguë', 'digestives', 'Inflammation aiguë de l\'appendice (référence chirurgicale OMS).', [
      ['douleur ombilicale puis FID', 3], ['fièvre', 2], ['nausées', 2], ['vomissements', 1], ['douleur à la palpation', 3],
    ], ['perforation', 'péritonite'], 'Référence chirurgicale urgente. Jeûne. Antibiotiques péri-opératoires.', 'Critique'),
    entry('gast-001', 'Gastro-entérite aiguë', 'digestives', 'Syndrome diarrhéique et vomissements, cause infectieuse fréquente (OMS/IMCI).', [
      ['diarrhée', 3], ['vomissements', 2], ['crampes abdominales', 2], ['fièvre légère', 1],
    ], ['déshydratation sévère'], 'Plan A/B/C SRO (IMCI). Zinc enfant. Continuer alimentation si possible.', 'Moyenne'),
    entry('ulce-001', 'Ulcère gastroduodénal', 'digestives', 'Lésion de la muqueuse gastrique ou duodénale, souvent H. pylori (OMS).', [
      ['douleur épigastrique', 3], ['brûlures d\'estomac', 2], ['nausées', 2], ['vomissements', 1], ['perte d\'appétit', 1],
    ], ['hémorragie digestive', 'perforation'], 'Test H. pylori si disponible. IPP + éradication H. pylori. Référence si hémorragie.', 'Moyenne'),
    entry('hepe-001', 'Hépatite E', 'digestives', 'Hépatite virale aiguë, risque grave en grossesse (OMS).', [
      ['jaunisse', 3], ['fatigue', 2], ['nausées', 2], ['douleurs abdominales', 1],
    ], ['insuffissante hépatique fulminante en grossesse'], 'Traitement symptomatique. Surveillance grossesse. Référence si enceinte.', 'Haute'),
    entry('occl-001', 'Occlusion intestinale', 'digestives', 'Arrêt du transit intestinal, urgence chirurgicale (OMS).', [
      ['douleurs abdominales violentes', 3], ['vomissements', 3], ['arrêt des gaz', 3], ['distension abdominale', 3],
    ], ['nécrose intestinale', 'choc'], 'Référence chirurgicale IMMÉDIATE. SNG, réhydratation IV.', 'Critique'),
    entry('asc-001', 'Ascite parasitaire', 'digestives', 'Complication de filariose ou autres causes ; ascite dans contexte tropical.', [
      ['ventre gonflé', 3], ['douleurs abdominales', 2], ['essoufflement', 1],
    ], ['infection du liquide'], 'Traiter cause sous-jacente. Référence pour ponction si respiratoire.', 'Moyenne'),
  ],

  nutritionnelles: [
    entry('kwas-001', 'Kwashiorkor', 'nutritionnelles', 'Malnutrition protéino-énergétique avec œdème (OMS).', [
      ['œdème des pieds', 3], ['cheveux décolorés', 2], ['peau desquamée', 2], ['apathie', 2], ['perte d\'appétit', 1],
    ], ['infection sévère', 'choc'], 'F-75 puis F-100 (protocole OMS). Antibiotiques systématiques. Référence nutritionnelle.', 'Critique'),
    entry('mara-001', 'Marasme', 'nutritionnelles', 'Malnutrition sévère par déficit énergétique (OMS).', [
      ['émaciation', 3], ['peau plissée', 3], ['perte de poids', 3], ['faiblesse extrême', 2],
    ], ['hypothermie', 'infection'], 'Réhabilitation nutritionnelle progressive (F-75/F-100). Traiter infections.', 'Critique'),
    entry('pem-001', 'Malnutrition aiguë sévère', 'nutritionnelles', 'Définition OMS incluant marasme, kwashiorkor et formes mixtes.', [
      ['poids très bas', 3], ['muqueuse pâle', 2], ['faiblesse', 3], ['œdème', 2], ['diarrhée', 1],
    ], ['défaillance organes', 'sepsis'], 'Protocole national UNI/OMS. Hospitalisation si complications.', 'Critique'),
    entry('fer-001', 'Anémie ferriprive', 'nutritionnelles', 'Carence en fer, cause majeure d\'anémie mondiale (OMS).', [
      ['fatigue', 3], ['pâleur', 3], ['essoufflement à l\'effort', 2], ['ongles cassants', 1], ['langue lisse', 1],
    ], ['insuffisance cardiaque', 'choc hémorragique'], 'Fer oral ou IV selon gravité. Traiter cause (parasites, saignement).', 'Moyenne'),
    entry('zinc-001', 'Déficit en zinc', 'nutritionnelles', 'Carence en zinc, aggrave diarrhée et infections (OMS).', [
      ['retard de croissance', 2], ['diarrhée', 2], ['lésions cutanées', 2], ['perte d\'appétit', 1],
    ], ['infection sévère'], 'Zinc 10-14 jours (IMCI diarrhée). Aliments riches en zinc.', 'Moyenne'),
    entry('scor-001', 'Scorbut (carence vitamine C)', 'nutritionnelles', 'Carence en acide ascorbique (OMS).', [
      ['gencives qui saignent', 3], ['fatigue', 2], ['douleurs articulaires', 2], ['cicatrisation lente', 2],
    ], ['hémorragie'], 'Vitamine C. Aliments frais (agrumes, légumes verts).', 'Moyenne'),
    entry('rick-001', 'Rachitisme', 'nutritionnelles', 'Carence en vitamine D chez l\'enfant (OMS).', [
      ['retard de croissance', 2], ['déformations osseuses', 3], ['faiblesse musculaire', 1], ['crampes', 1],
    ], ['fractures', 'convulsions'], 'Vitamine D + calcium. Exposition solaire modérée.', 'Moyenne'),
  ],

  dermatologiques: [
    entry('cell-001', 'Cellulite infectieuse', 'dermatologiques', 'Infection bactérienne des tissus mous (OMS).', [
      ['rougeur', 3], ['chaleur locale', 2], ['gonflement', 3], ['fièvre', 2], ['douleur', 3],
    ], ['abcès', 'sepsis'], 'Antibiotiques oraux/IV. Surélever membre. Incision si abcès.', 'Moyenne'),
    entry('absc-001', 'Abcès cutané', 'dermatologiques', 'Collection de pus sous la peau (OMS).', [
      ['masse rouge et douloureuse', 3], ['fièvre', 2], ['fluctuation', 3],
    ], ['sepsis', 'fasciite nécrosante'], 'Incision-drainage. Antibiotiques si cellulite associée.', 'Moyenne'),
    entry('derm-001', 'Dermatophytose (teigne corps)', 'dermatologiques', 'Infection fongique de la peau (OMS).', [
      ['lésion annulaire', 3], ['démangeaisons', 2], ['desquamation', 2], ['bordure active', 2],
    ], ['surinfection'], 'Antifongiques topiques ou oraux (griséofulvine, terbinafine).', 'Faible'),
    entry('pied-001', 'Pied diabétique infecté', 'dermatologiques', 'Plaie du pied compliquée chez diabétique (OMS).', [
      ['plaie au pied', 3], ['écoulement purulent', 2], ['odeur', 2], ['douleur', 1], ['engourdissement', 1],
    ], ['gangrène', 'amputation'], 'Débridement. Antibiotiques. Contrôle glycémie. Référence spécialisée.', 'Haute'),
    entry('brul-001', 'Brûlure', 'dermatologiques', 'Lésion tissulaire par chaleur, produits chimiques ou électricité (OMS).', [
      ['douleur', 3], ['rougeur', 2], ['cloques', 3], ['peau blanche ou carbonisée', 3],
    ], ['choc', 'infection', 'déshydratation'], 'Refroidir eau 20 min. Couvrir propre. Référence si étendue ou visage/mains.', 'Haute'),
    entry('moll-001', 'Molluscum contagiosum', 'dermatologiques', 'Infection virale cutanée bénigne (OMS).', [
      ['boutons perlés', 3], ['démangeaisons légères', 1],
    ], ['surinfection'], 'Souvent spontané. Traitement topique ou cryothérapie si gênant.', 'Faible'),
    entry('zona-001', 'Zona (herpès zoster)', 'dermatologiques', 'Réactivation du virus varicelle-zona (OMS).', [
      ['éruption en bande', 3], ['douleur brûlante', 3], ['fièvre', 1], ['démangeaisons', 1],
    ], ['neuralgie post-zostérienne', 'atteinte oculaire'], 'Antiviraux précoces (acyclovir). Analgiques. Référence si oeil atteint.', 'Moyenne'),
    entry('mpox-001', 'Mpox (variole du singe)', 'dermatologiques', 'Maladie virale avec éruption, endémies possibles (OMS).', [
      ['fièvre', 2], ['éruption pustuleuse', 3], ['adénopathies', 2], ['céphalées', 1],
    ], ['surinfection', 'pneumonie'], 'Isolement. Soins symptomatiques. Référence si forme sévère.', 'Moyenne'),
  ],

  gyneco: [
    entry('pree-001', 'Prééclampsie', 'gyneco', 'Hypertension et protéinurie après 20 SA (OMS).', [
      ['céphalées', 3], ['œdème', 2], ['douleurs épigastriques', 2], ['troubles visuels', 2], ['hypertension', 3],
    ], ['éclampsie', 'HELLP'], 'Référence obstétricale. Sulfate de magnésium si éclampsie. Surveillance fœtale.', 'Critique'),
    entry('anem-002', 'Anémie de la grossesse', 'gyneco', 'Anémie fréquente, souvent ferriprive (OMS).', [
      ['fatigue', 3], ['pâleur', 2], ['essoufflement', 2], ['vertiges', 1],
    ], ['insuffisance cardiaque'], 'Fer + acide folique. Alimentation. Référence si Hb très basse.', 'Moyenne'),
    entry('gon-001', 'Gonorrhée', 'gyneco', 'IST bactérienne à Neisseria gonorrhoeae (OMS).', [
      ['écoulement vaginal', 3], ['douleur à la miction', 2], ['douleurs pelviennes', 2],
    ], ['salpingite', 'stérilité'], 'Antibiotiques selon protocole (ceftriaxone). Traiter partenaire. Dépistage IST.', 'Moyenne'),
    entry('chla-001', 'Chlamydia', 'gyneco', 'IST bactérienne fréquente, souvent asymptomatique (OMS).', [
      ['écoulement', 2], ['douleur pelvienne', 2], ['saignement intermenstruel', 1],
    ], ['salpingite', 'grossesse extra-utérine'], 'Azithromycine ou doxycycline. Dépistage et traitement partenaire.', 'Moyenne'),
    entry('syp-001', 'Syphilis', 'gyneco', 'IST à Treponema pallidum (OMS).', [
      ['chancre indolore', 3], ['éruption cutanée', 2], ['adénopathies', 1],
    ], ['syphilis congénitale'], 'Benzathine pénicilline G. Dépistage grossesse. Traitement partenaire.', 'Haute'),
    entry('vag-001', 'Infection vaginale (candidose)', 'gyneco', 'Candidose à Candida albicans (OMS).', [
      ['prurit vulvaire', 3], ['écoulement blanc grumeleux', 3], ['brûlures', 2], ['dyspareunie', 1],
    ], [], 'Antifongique local ou oral (fluconazole). Éviter savons irritants.', 'Faible'),
    entry('bact-001', 'Vaginose bactérienne', 'gyneco', 'Déséquilibre de la flore vaginale (OMS).', [
      ['écoulement grisâtre', 3], ['odeur de poisson', 3], ['démangeaisons légères', 1],
    ], ['infection post-partum'], 'Métronidazole ou clinadamycine.', 'Faible'),
    entry('avort-001', 'Complications d\'avortement non médicalisé', 'gyneco', 'Cause majeure de mortalité maternelle (OMS).', [
      ['saignement vaginal', 3], ['douleurs pelviennes', 3], ['fièvre', 2], ['écoulement malodorant', 2],
    ], ['choc hémorragique', 'sepsis'], 'Référence urgente. Antibiotiques + évacuation utérine en hôpital.', 'Critique'),
  ],

  chroniques: [
    entry('icc-001', 'Insuffisance cardiaque', 'chroniques', 'Incapacité du cœur à pomper efficacement (OMS).', [
      ['essoufflement', 3], ['fatigue', 2], ['œdème des jambes', 3], ['prise de poids rapide', 2], ['toux nocturne', 2],
    ], ['œdème pulmonaire', 'choc cardiogénique'], 'Diurétiques, IEC si disponibles. Sel limité. Référence si décompensation.', 'Haute'),
    entry('irc-001', 'Insuffisance rénale chronique', 'chroniques', 'Perte progressive de la fonction rénale (OMS).', [
      ['fatigue', 2], ['œdème', 2], ['urines diminuées', 2], ['nausées', 2], ['démangeaisons', 1],
    ], ['hyperkaliémie', 'urémie'], 'Contrôle PA et diabète. Référence néphrologie. Dialyse si terminale.', 'Haute'),
    entry('dep-001', 'Dépression', 'chroniques', 'Trouble mental fréquent, sous-diagnostiqué (OMS).', [
      ['tristesse', 3], ['perte d\'intérêt', 3], ['fatigue', 2], ['troubles du sommeil', 2], ['perte d\'appétit', 1],
    ], ['idées suicidaires'], 'Écoute empathique. Référence santé mentale. Antidépresseurs si disponibles.', 'Moyenne'),
    entry('epi-002', 'État de mal épileptique', 'chroniques', 'Crises convulsives prolongées ou répétées (OMS).', [
      ['convulsions', 3], ['perte de conscience', 3], ['morsure de langue', 2],
    ], ['arrêt respiratoire', 'lésions cérébrales'], 'Diazépam rectal/IV. Référence IMMÉDIATE. Position latérale de sécurité.', 'Critique'),
    entry('hypo-001', 'Hypothyroïdie', 'chroniques', 'Déficit en hormones thyroïdiennes (OMS).', [
      ['fatigue', 2], ['prise de poids', 2], ['intolérance au froid', 2], ['constipation', 1], ['peau sèche', 1],
    ], ['coma myxœdémateux'], 'Lévothyroxine si disponible. Dépistage TSH.', 'Moyenne'),
    entry('arth-001', 'Arthrite rhumatoïde', 'chroniques', 'Maladie inflammatoire chronique des articulations (OMS).', [
      ['douleurs articulaires', 3], ['raideur matinale', 3], ['gonflement articulaire', 2], ['fatigue', 1],
    ], ['déformations', 'invalidité'], 'AINS si pas contre-indication. Référence rhumatologie. Physiothérapie.', 'Moyenne'),
  ],

  neurologiques: [
    entry('avc-001', 'Accident vasculaire cérébral', 'neurologiques', 'Syndrome neurologique focal d\'origine vasculaire (OMS).', [
      ['paralysie d\'un côté', 3], ['troubles de la parole', 3], ['visage asymétrique', 3], ['maux de tête brutal', 2], ['confusion', 2],
    ], ['coma', 'dépendance'], 'Référence IMMÉDIATE (<4h si thrombolyse). Position demi-assise. Glycémie.', 'Critique'),
    entry('enc-001', 'Encéphalite', 'neurologiques', 'Inflammation du cerveau, souvent virale (OMS).', [
      ['fièvre', 3], ['maux de tête', 3], ['confusion', 3], ['convulsions', 2], ['raideur de la nuque', 2],
    ], ['coma'], 'Référence hospitalière. Soins de support. Antiviraux si herpès suspecté.', 'Critique'),
    entry('migr-001', 'Migraine', 'neurologiques', 'Céphalée primaire récurrente (OMS).', [
      ['maux de tête pulsatile', 3], ['nausées', 2], ['photophobie', 2], ['vomissements', 1],
    ], ['état de mal migraineux'], 'Antalgiques. Repos obscurité. Triptans si disponibles.', 'Faible'),
    entry('meni-003', 'Méningite tuberculeuse', 'neurologiques', 'Forme grave de tuberculose (OMS).', [
      ['fièvre', 2], ['maux de tête', 3], ['raideur de la nuque', 3], ['confusion', 2], ['perte de poids', 1],
    ], ['hydrocéphalie', 'coma'], 'Anti-TB prolongé + corticoïdes. Référence spécialisée.', 'Critique'),
    entry('tet-002', 'Tétanos néonatal', 'neurologiques', 'Infection du cordon ombilical non stérile (OMS).', [
      ['incapacité à téter', 3], ['raideur', 3], ['spasmes', 3], ['opisthotonos', 2],
    ], ['décès'], 'Soins intensifs. Immunoglobuline antitétanique. Prévention : hygiène du cordon.', 'Critique'),
    entry('park-001', 'Maladie de Parkinson', 'neurologiques', 'Trouble neurodégénératif progressif (OMS).', [
      ['tremblements au repos', 3], ['raideur', 2], ['lenteur des mouvements', 3], ['instabilité', 2],
    ], ['chutes', 'dépendance'], 'Référence neurologie. Lévodopa si disponible. Kinésithérapie.', 'Moyenne'),
    entry('dem-001', 'Démence', 'neurologiques', 'Déclin cognitif progressif, Alzheimer fréquent (OMS).', [
      ['troubles de la mémoire', 3], ['désorientation', 2], ['troubles du comportement', 2], ['difficultés quotidiennes', 2],
    ], ['errance', 'dénutrition'], 'Évaluation cognitive. Soutien familial. Référence si début brutal (exclure AVC).', 'Moyenne'),
    entry('bell-001', 'Paralysie faciale (Bell)', 'neurologiques', 'Paralysie aiguë du nerf facial (OMS).', [
      ['asymétrie du visage', 3], ['impossibilité de fermer l\'œil', 2], ['sécheresse buccale', 1],
    ], [], 'Corticoïdes précoces si protocole. Protection de l\'œil. Référence si atteinte bilatérale.', 'Moyenne'),
    entry('ceph-001', 'Céphalée de tension', 'neurologiques', 'Céphalée primaire bénigne fréquente (OMS).', [
      ['maux de tête bilatéraux', 3], ['pression', 2], ['raideur cervicale', 1], ['fatigue', 1],
    ], [], 'Antalgiques simples. Repos. Référence si céphalée brutale ou signes neurologiques.', 'Faible'),
    entry('sync-001', 'Syncope', 'neurologiques', 'Perte de conscience brève, récupération rapide (OMS).', [
      ['perte de conscience', 3], ['pâleur', 2], ['sueurs', 2], ['vertiges', 2], ['palpitations', 1],
    ], ['arythmie', 'AVC'], 'Position allongée, jambes surélevées. Rechercher cause (déshydratation, anémie). Référence si récidive.', 'Moyenne'),
    entry('neur-001', 'Neuropathie périphérique', 'neurologiques', 'Atteinte des nerfs périphériques, souvent diabétique (OMS).', [
      ['fourmillements', 3], ['brûlures des pieds', 2], ['faiblesse', 2], ['douleurs', 2],
    ], ['plaies du pied', 'amputation'], 'Contrôle glycémie. Soins des pieds. Référence si progression rapide.', 'Moyenne'),
  ],

  pediatriques: [
    entry('desh-001', 'Déshydratation (enfant)', 'pediatriques', 'Perte excessive de liquides, urgence IMCI (OMS).', [
      ['soif', 2], ['yeux enfoncés', 3], ['peau plissée lente', 3], ['pleurs sans larmes', 2], ['léthargie', 3],
    ], ['choc', 'inconscient'], 'Plan A/B/C SRO. Voie IV si plan C. Référence urgente si choc.', 'Critique'),
    entry('mala-001', 'Paludisme grave (enfant)', 'pediatriques', 'Complication du paludisme chez l\'enfant (OMS).', [
      ['fièvre', 2], ['convulsions', 3], ['léthargie', 3], ['anémie', 2], ['vomissements', 2],
    ], ['coma', 'décès'], 'ACT injectable ou suppositoire. Référence urgente. TDR si possible.', 'Critique'),
    entry('pneu-003', 'Pneumonie (enfant <5 ans)', 'pediatriques', 'Cause majeure de mortalité infantile (OMS/IMCI).', [
      ['toux', 2], ['tirage', 3], ['fièvre', 2], ['refus de boire', 2], ['convulsions', 1],
    ], ['hypoxie', 'inconscient'], 'Antibiotiques oraux amoxicilline. Oxygène si tirage. Référence si grave.', 'Haute'),
    entry('diar-002', 'Diarrhée persistante (enfant)', 'pediatriques', 'Diarrhée >14 jours (OMS).', [
      ['diarrhée', 3], ['perte de poids', 2], ['vomissements', 1], ['fièvre', 1],
    ], ['malnutrition'], 'Zinc. Alimentation continue. Rechercher parasites. Référence si émaciation.', 'Moyenne'),
    entry('neon-001', 'Infection néonatale', 'pediatriques', 'Sepsis du nouveau-né dans les 28 premiers jours (OMS).', [
      ['fièvre ou hypothermie', 3], ['refus de boire', 3], ['léthargie', 3], ['respiration rapide', 2],
    ], ['sepsis', 'décès'], 'Antibiotiques IV. Référence maternité/hôpital. Allaitement précoce prévention.', 'Critique'),
    entry('fiev-002', 'Fièvre sans foyer (nourrisson)', 'pediatriques', 'Fièvre chez enfant <3 mois, évaluation urgente (IMCI).', [
      ['fièvre', 3], ['irritabilité', 2], ['refus de boire', 2], ['léthargie', 2],
    ], ['sepsis', 'méningite'], 'Référence hospitalière pour bilan. Ne pas retarder antibiotiques si signes graves.', 'Haute'),
    entry('conv-001', 'Convulsions fébriles', 'pediatriques', 'Crises liées à la fièvre chez l\'enfant 6 mois-5 ans (OMS).', [
      ['convulsions', 3], ['fièvre', 3], ['perte de conscience brève', 2],
    ], ['méningite', 'état de mal'], 'Position latérale. Antipyrétiques. Référence si première crise <6 mois, signes méningés ou crise >15 min.', 'Haute'),
    entry('crou-001', 'Laryngite aiguë (croup)', 'pediatriques', 'Infection des voies aériennes supérieures chez l\'enfant (OMS).', [
      ['toux aboyante', 3], ['stridor', 3], ['fièvre', 1], ['difficulté à respirer', 2],
    ], ['détresse respiratoire'], 'Humidification. Corticoïdes oraux si modéré/sévère. Référence si tirage ou cyanose.', 'Haute'),
    entry('cell-001', 'Cellulite (enfant)', 'pediatriques', 'Infection cutanée profonde (OMS).', [
      ['rougeur', 3], ['gonflement', 3], ['fièvre', 2], ['douleur', 2], ['chaleur locale', 2],
    ], ['abcès', 'sepsis'], 'Antibiotiques oraux. Référence si extension rapide ou signes systémiques.', 'Moyenne'),
    entry('orl-001', 'Angine virale (enfant)', 'pediatriques', 'Infection pharyngée virale fréquente (IMCI).', [
      ['mal de gorge', 3], ['fièvre', 2], ['toux', 1], ['adénopathies', 1],
    ], ['abcès'], 'Symptomatique. Antibiotiques seulement si strepto confirmé ou score élevé.', 'Faible'),
    entry('pneu-004', 'Bronchopneumonie (nourrisson)', 'pediatriques', 'Pneumonie chez nourrisson <2 mois (OMS).', [
      ['toux', 2], ['tirage', 3], ['refus de boire', 3], ['cyanose', 2], ['apnées', 2],
    ], ['hypoxie', 'choc'], 'Référence IMMÉDIATE. Antibiotiques IV. Oxygène.', 'Critique'),
    entry('jaun-001', 'Ictère néonatal', 'pediatriques', 'Coloration jaune du nouveau-né (OMS).', [
      ['jaunisse', 3], ['urines foncées', 1], ['léthargie', 2], ['refus de boire', 2],
    ], ['encéphalopathie bilirubinique'], 'Allaitement fréquent. Photothérapie si seuils dépassés. Référence si <24h ou signes neurologiques.', 'Haute'),
  ],

  traumatiques: [
    entry('snak-001', 'Morsure de serpent', 'traumatiques', 'Urgence médicale en zones tropicales (OMS).', [
      ['douleur locale', 3], ['gonflement', 3], ['ecchymoses', 2], ['nausées', 2], ['saignement', 1],
    ], ['choc', 'paralysie', 'nécrose'], 'Immobiliser membre. Référence IMMÉDIATE. Antivenin si disponible. Pas d\'incision.', 'Critique'),
    entry('frac-001', 'Fracture', 'traumatiques', 'Rupture osseuse suite traumatisme (OMS).', [
      ['douleur', 3], ['déformation', 3], ['impotence fonctionnelle', 3], ['gonflement', 2], ['ecchymose', 1],
    ], ['choc', 'syndrome des loges'], 'Immobilisation. Référence radiographie et réduction. Antalgiques.', 'Haute'),
    entry('pla-001', 'Plaie profonde', 'traumatiques', 'Lésion cutanée nécessitant suture (OMS).', [
      ['saignement', 3], ['douleur', 3], ['plaie visible', 3],
    ], ['hémorragie', 'infection', 'tétanos'], 'Compression hémorragie. Suture si <6-8h. Vaccin/immunoglobuline antitétanique.', 'Moyenne'),
    entry('ent-001', 'Traumatisme crânien', 'traumatiques', 'Choc à la tête (OMS).', [
      ['maux de tête', 3], ['vomissements', 2], ['somnolence', 2], ['amnésie', 2], ['vertiges', 1],
    ], ['hématome sous-dural', 'coma'], 'Surveillance 24-48h. Référence si vomissements répétés, convulsions, inconscience.', 'Haute'),
    entry('burn-001', 'Brûlure', 'traumatiques', 'Lésion tissulaire par chaleur, produits chimiques ou électricité (OMS).', [
      ['douleur', 3], ['rougeur', 2], ['cloques', 3], ['peau blanchâtre', 2],
    ], ['choc', 'infection', 'déshydratation'], 'Refroidir à l\'eau 20 min. Couvrir propre. Référence si >10% surface, visage, mains, pieds, enfant.', 'Haute'),
    entry('dog-001', 'Morsure de chien', 'traumatiques', 'Plaie par morsure, risque rage et infection (OMS).', [
      ['plaie', 3], ['saignement', 2], ['douleur', 2], ['gonflement', 1],
    ], ['rage', 'tétanos', 'infection'], 'Lavage abondant 15 min. Antibiotiques si plaie profonde. Vaccin antirabique si zone endémique.', 'Haute'),
    entry('disl-001', 'Luxation', 'traumatiques', 'Déplacement articulaire (OMS).', [
      ['douleur', 3], ['déformation', 3], ['impotence', 2], ['gonflement', 2],
    ], ['lésion vasculaire'], 'Immobiliser. Réduction par personnel formé. Radiographie après.', 'Haute'),
    entry('entr-001', 'Entorse', 'traumatiques', 'Lésion ligamentaire (OMS).', [
      ['douleur', 3], ['gonflement', 3], ['ecchymose', 2], ['instabilité', 1],
    ], ['fracture associée'], 'Repos, glace, compression, surélévation. Référence si incapacité à appuyer.', 'Moyenne'),
    entry('amp-001', 'Amputation traumatique', 'traumatiques', 'Perte partielle ou totale d\'un membre (OMS).', [
      ['saignement', 3], ['douleur', 3], ['membre sectionné', 3],
    ], ['choc hémorragique'], 'Compression hémorragie. Référence chirurgicale IMMÉDIATE. Conserver segment au frais humide.', 'Critique'),
    entry('noy-001', 'Noyade / quasi-noyade', 'traumatiques', 'Hypoxie par immersion (OMS).', [
      ['difficulté à respirer', 3], ['toux', 2], ['cyanose', 2], ['léthargie', 2], ['vomissements', 1],
    ], ['arrêt cardiaque', 'œdème pulmonaire'], 'Réanimation si arrêt. Oxygène. Référence même si récupération apparente.', 'Critique'),
  ],
};

function entry(id, nom, categorie, description, symptomesArr, danger, prise_en_charge, urgence) {
  return {
    id,
    nom,
    categorie,
    description,
    symptomes: symptomesArr.map(([nom, poids]) => ({ nom, poids })),
    danger,
    prise_en_charge,
    urgence,
  };
}

// Charger maladies existantes et fusionner (éviter doublons par id)
const categories = [
  'infectieuses', 'respiratoires', 'digestives', 'nutritionnelles',
  'dermatologiques', 'gyneco', 'chroniques', 'neurologiques', 'pediatriques', 'traumatiques',
];

const existingIds = new Set();
const merged = {};

for (const cat of categories) {
  const path = join(dataDir, `${cat}.json`);
  let existing = [];
  try {
    existing = JSON.parse(readFileSync(path, 'utf8'));
    existing.forEach((d) => existingIds.add(d.id));
  } catch {
    existing = [];
  }
  const additions = catalog[cat] || [];
  const newOnes = additions.filter((d) => !existingIds.has(d.id));
  newOnes.forEach((d) => existingIds.add(d.id));
  merged[cat] = [...existing, ...newOnes];
}

// Index complet
const index = [];
for (const cat of categories) {
  for (const d of merged[cat]) {
    index.push({ id: d.id, nom: d.nom, categorie: d.categorie });
  }
}
index.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

for (const cat of categories) {
  writeFileSync(join(dataDir, `${cat}.json`), JSON.stringify(merged[cat], null, 2) + '\n', 'utf8');
}
writeFileSync(join(dataDir, 'index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');

console.log(`Catalogue: ${index.length} maladies dans ${categories.length} catégories.`);
