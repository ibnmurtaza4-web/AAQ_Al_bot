/**
 * Azerbaijani Lexicographical Dictionary Data & Search Engine
 * Provides rich definitions, etymology, synonyms, antonyms, and literary examples.
 */

export interface WordDefinition {
  word: string;
  meaning: string;
  etymology: string;
  partOfSpeech: string;
  synonyms: string[];
  antonyms: string[];
  example: string;
}

export const AZERBAIJANI_DICTIONARY: Record<string, WordDefinition> = {
  'maarif': {
    word: 'Maarif',
    meaning: 'Elm, bilik, təhsil və mədəniyyəti yayma işi; cəmiyyəti savadlandırma və intellektual inkişaf prosesi.',
    etymology: 'Ərəbcə "ərf" (bilmək, tanımaq, mərifət) kökündən yaranmışdır.',
    partOfSpeech: 'İsim',
    synonyms: ['Təhsil', 'Tədris', 'Aydınlanma', 'Bilik'],
    antonyms: ['Cəhalət', 'Nadanlıq', 'Qaranlıq'],
    example: 'Xalqın tərəqqisi və yüksəlişi maarif və elmin inkişafından asılıdır.'
  },
  'intellekt': {
    word: 'İntellekt',
    meaning: 'İnsanın əqli qabiliyyəti, düşünmə, anlama, mühakimə yürütmə və mürəkkəb problemləri dərk edib həll etmə bacarığı.',
    etymology: 'Latınca "intellectus" (anlama, dərketmə) sözündən götürülmüşdür.',
    partOfSpeech: 'İsim',
    synonyms: ['Zəka', 'Ağıl', 'Dərrakə', 'Fəhm'],
    antonyms: ['Axmaqlıq', 'Kütbeyinlik'],
    example: 'Süni intellekt müasir texnologiyanın və elmi təfəkkürün ən böyük nailiyyətidir.'
  },
  'hikmət': {
    word: 'Hikmət',
    meaning: 'Dərin fəlsəfi məna, həyat təcrübəsinə əsaslanan ali bilik və əxlaqi həqiqət.',
    etymology: 'Ərəbcə "hukm" (dərrakə ilə hökm vermək, sirr, bilik) sözündəndir.',
    partOfSpeech: 'İsim',
    synonyms: ['Müdriklik', 'Bilik', 'Fəlsəfə', 'Nəsihət'],
    antonyms: ['Cəhalət', 'Bayağılıq'],
    example: 'Nizami Gəncəvinin hər bir beytində sonsuz bir həyat hikməti gizlənmişdir.'
  },
  'elm': {
    word: 'Elm',
    meaning: 'Təbiət, cəmiyyət və təfəkkürün inkişaf qanunauyğunluqlarını öyrənən obyektiv biliklər sistemi.',
    etymology: 'Ərəbcə "əlimə" (bilmək, agah olmaq) kökündəndir.',
    partOfSpeech: 'İsim',
    synonyms: ['Bilik', 'Dərrakə', 'Tədqiqat', 'Akademiya'],
    antonyms: ['Xurafat', 'Cəhalət'],
    example: 'Elm öyrənmək hər bir insanın mənəvi borcudur.'
  },
  'ədəbiyyat': {
    word: 'Ədəbiyyat',
    meaning: 'Söz sənəti; bədii, elmi və fəlsəfi yazılı əsərlərin məcmusu.',
    etymology: 'Ərəbcə "ədəb" (tərbiyə, nəzakət, gözəl davranış) kökündəndir.',
    partOfSpeech: 'İsim',
    synonyms: ['Bədii söz', 'Nəsr və nəzm', 'Yazı mədəniyyəti'],
    antonyms: [],
    example: 'Azərbaycan ədəbiyyatı dünya mədəniyyət xəzinəsinin ən parlaq incilərindəndir.'
  },
  'fəlsəfə': {
    word: 'Fəlsəfə',
    meaning: 'Varlığın, idrakın, insanın və kainatın ən ümumi qanunauyğunluqlarını araşdıran dünyagörüşü və fundamental elm sahəsi.',
    etymology: 'Yunan mənşəli "philosophia" (müdrikliyi sevmək: phileo - sevirəm, sophia - müdriklik) sözündən ərəb dilinə və oradan dilimizə keçmişdir.',
    partOfSpeech: 'İsim',
    synonyms: ['Hikmət', 'Dünyagörüşü', 'Təfəkkür elmi'],
    antonyms: ['Dogmatizm'],
    example: 'Qədim Şərq fəlsəfəsi insanın daxili harmoniyasına və mənəvi saflığına əsaslanır.'
  },
  'qələm': {
    word: 'Qələm',
    meaning: 'Yazı yazmaq aləti; məcazi mənada yazı sənəti, fikir və söz qüdrəti.',
    etymology: 'Ərəbcə və yunanca "kalamos" (qamış) sözündən törəmişdir.',
    partOfSpeech: 'İsim',
    synonyms: ['Yazı aləti', 'Söz sənəti'],
    antonyms: [],
    example: 'Əhl-ül Qələm birliyi maarif və elmin işığını yaymağı hədəfləyir.'
  },
  'vətən': {
    word: 'Vətən',
    meaning: 'Bir insanın doğulub boya-başa çatdığı, tarixi və mənəvi bağlılığı olan torpaq, ölkə.',
    etymology: 'Ərəbcə məskən, yurd mənasını verən "vətən" sözündəndir.',
    partOfSpeech: 'İsim',
    synonyms: ['Yurd', 'Diyar', 'Məkan', 'Torpaq'],
    antonyms: ['Qürbət'],
    example: 'Vətəni sevmək imandandır.'
  },
  'şərəf': {
    word: 'Şərəf',
    meaning: 'İnsanın ləyaqəti, mənəvi ucalığı, cəmiyyət içindəki ali hörməti və dürüstlüyü.',
    etymology: 'Ərəbcə "şərəf" (ucalıq, zadəganlıq) sözündəndir.',
    partOfSpeech: 'İsim',
    synonyms: ['Ləyaqət', 'İzzət', 'Ucalıq', 'Hörmət'],
    antonyms: ['Biabırçılıq', 'Rəzillik', 'Alçaqlıq'],
    example: 'Hər bir şəxsiyyətin ən böyük sərvəti onun ləkəsiz şərəf və ləyaqətidir.'
  },
  'müdrik': {
    word: 'Müdrik',
    meaning: 'Dərin ağla, zəngin həyat təcrübəsinə və uzaqgörənliyə malik şəxs.',
    etymology: 'Ərəbcə "idrak edən, dərk edən" mənasındadır.',
    partOfSpeech: 'Sifət',
    synonyms: ['Ağıllı', 'Ziyalı', 'Hikmətli', 'Dahi'],
    antonyms: ['Nadan', 'Axmaq', 'Cahil'],
    example: 'Müdrik insan az danışar, lakin hər kəlməsi dəyərli bir nəsihətdir.'
  }
};

export function lookupWord(rawWord: string): WordDefinition | null {
  const clean = rawWord.trim().toLowerCase().replace(/[^a-zəöğıüşç]/gi, '');
  if (!clean) return null;

  if (AZERBAIJANI_DICTIONARY[clean]) {
    return AZERBAIJANI_DICTIONARY[clean];
  }

  // Partial search
  for (const [key, val] of Object.entries(AZERBAIJANI_DICTIONARY)) {
    if (key.startsWith(clean) || clean.startsWith(key)) {
      return val;
    }
  }

  return null;
}
