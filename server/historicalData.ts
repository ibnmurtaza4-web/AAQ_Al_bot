/**
 * Verified Historical Milestones Data for Azerbaijani and World History
 */

export interface HistoricalEvent {
  year: string;
  title: string;
  description: string;
  category: 'azerbaijan' | 'world' | 'science';
}

export const MONTH_EVENTS: Record<number, HistoricalEvent[]> = {
  0: [ // Yanvar
    { year: '1990', title: '20 Yanvar Hadisələri', description: 'Azərbaycan xalqının azadlıq və suverenlik uğrunda apardığı mübarizənin qəhrəmanlıq tarixi.', category: 'azerbaijan' },
    { year: '1908', title: '"Leyli və Məcnun" Operası', description: 'Üzeyir Hacıbəylinin Şərqdə və müsəlman dünyasında ilk operası Bakıda tamaşaya qoyuldu.', category: 'azerbaijan' }
  ],
  1: [ // Fevral
    { year: '1992', title: 'Xocalı Soyqırımı', description: 'Azərbaycan xalqının XX əsrdə üzləşdiyi ən böyük faciələrdən biri, soyqırım aktı.', category: 'azerbaijan' },
    { year: '1543', title: 'Nikolay Kopernikin Günəş Mərkəzli Sistemi', description: 'Kopernik Yerin Günəş ətrafında fırlanması barədə elmi nəzəriyyəsini tamamladı.', category: 'science' }
  ],
  2: [ // Mart
    { year: '1918', title: '31 Mart Azərbaycanlıların Soyqırımı', description: 'Bakı və digər bölgələrdə dinc azərbaycanlılara qarşı törədilmiş kütləvi qırğınların anım günü.', category: 'azerbaijan' },
    { year: '1879', title: 'Albert Eynşteynin Doğumu', description: 'Nisbilik nəzəriyyəsinin müəllifi, Nobel mükafatı laureatı Albert Eynşteyn anadan olub.', category: 'science' }
  ],
  3: [ // Aprel
    { year: '2016', title: 'Aprel Döyüşləri', description: 'Azərbaycan Ordusunun Lələtəpə və Talış yüksəkliklərini azad etdiyi uğurlu hərbi əməliyyat.', category: 'azerbaijan' },
    { year: '1961', title: 'İnsanın Kosmosa İlk Uçuşu', description: 'Yuri Qaqarin "Vostok-1" gəmisi ilə bəşəriyyət tarixində ilk dəfə kosmosa uçdu.', category: 'world' }
  ],
  4: [ // May
    { year: '1918', title: 'Azərbaycan Xalq Cümhuriyyətinin Yaradılması', description: '28 May 1918-ci ildə Şərqdə və İslam dünyasında ilk dünyəvi demokratik respublika quruldu.', category: 'azerbaijan' },
    { year: '1453', title: 'İstanbulun Fəthi', description: 'Sultan II Mehmet tərəfindən Konstantinopol fəth edildi və Bizans imperiyası sona çatdı.', category: 'world' }
  ],
  5: [ // İyun
    { year: '1993', title: 'Milli Qurtuluş Günü', description: '15 İyun 1993-cü ildə Heydər Əliyevin hakimiyyətə qayıdışı ilə Azərbaycanın dövlətçilik böhranı aradan qaldırıldı.', category: 'azerbaijan' },
    { year: '1918', title: 'Qafqaz İslam Ordusunun Azərbaycana Köməyi', description: 'Nuru Paşanın rəhbərliyi ilə Qafqaz İslam Ordusu Azərbaycanı qorumaq üçün yürüşə başladı.', category: 'azerbaijan' }
  ],
  6: [ // İyul
    { year: '1875', title: '"Əkinçi" Qəzetinin İlk Nömrəsi', description: 'Həsən bəy Zərdabi tərəfindən ana dilimizdə ilk milli mətbuatın əsası qoyuldu (22 İyul Milli Mətbuat Günü).', category: 'azerbaijan' },
    { year: '1969', title: 'İnsanın Aya İlk Enişi', description: 'Apollon-11 missiyası çərçivəsində Nil Armstronq və Bazz Oldrin Ay səthinə ayaq basdı.', category: 'science' }
  ],
  7: [ // Avqust
    { year: '1991', title: 'Dövlət Müstəqilliyi Bəyannaməsi', description: '30 Avqust 1991-ci ildə Azərbaycan Respublikasının Dövlət Müstəqilliyi haqqında Bəyannamə qəbul edildi.', category: 'azerbaijan' },
    { year: '1071', title: 'Malazgird Döyüşü', description: 'Sultan Alp Arslanın rəhbərliyi ilə Səlcuqlu ordusu Bizansı məğlub edərək Anadolunun qapılarını açdı.', category: 'world' }
  ],
  8: [ // Sentyabr
    { year: '2020', title: 'Vətən Müharibəsinin Başlanması (Anım Günü)', description: '27 Sentyabr 2020-ci ildə Azərbaycan torpaqlarının işğaldan azad edilməsi uğrunda 44 günlük Vətən Müharibəsi başladı.', category: 'azerbaijan' },
    { year: '1994', title: '"Əsrin Müqaviləsi"nin İmzalanması', description: '20 Sentyabr 1994-cü ildə Xəzər dənizinin Azərbaycan sektorundakı neft yataqlarının işlənməsi üzrə tarixi neft sazişi imzalandı.', category: 'azerbaijan' },
    { year: '1918', title: 'Bakının Azad Olunması', description: '15 Sentyabr 1918-ci ildə Qafqaz İslam Ordusu və Azərbaycan hərbi qüvvələri Bakını işğaldan azad etdi.', category: 'azerbaijan' }
  ],
  9: [ // Oktyabr
    { year: '1991', title: 'Dövlət Müstəqilliyi Günü', description: '18 Oktyabr 1991-ci ildə "Azərbaycan Respublikasının Dövlət Müstəqilliyi haqqında" Konstitusiya Aktı qəbul edildi.', category: 'azerbaijan' },
    { year: '2020', title: 'Cəbrayıl, Füzuli, Zəngilan və Qubadlının Azad Edilməsi', description: 'Vətən Müharibəsində tarixi şəhər və kəndlərimizin müzəffər ordumuz tərəfindən azad olunması.', category: 'azerbaijan' }
  ],
  10: [ // Noyabr
    { year: '2020', title: 'Zəfər Günü və Şuşanın Azad Edilməsi', description: '8 Noyabr 2020-ci ildə Qarabağın tacı olan qədim Şuşa şəhəri işğaldan tamamilə azad edildi.', category: 'azerbaijan' },
    { year: '1918', title: 'Dövlət Bayrağı Günü', description: '9 Noyabr 1918-ci ildə Azərbaycan Xalq Cümhuriyyəti üçrəngli dövlət bayrağını qəbul etdi.', category: 'azerbaijan' },
    { year: '1995', title: 'Milli Konstitusiyanın Qəbulu', description: '12 Noyabr 1995-ci ildə müstəqil Azərbaycan Respublikasının ilk milli Konstitusiyası ümumxalq səsverməsi ilə qəbul edildi.', category: 'azerbaijan' }
  ],
  11: [ // Dekabr
    { year: '1989', title: 'Dünya Azərbaycanlılarının Həmrəyliyi Günü', description: '31 Dekabr Naxçıvanda sərhəd hasarlarının sökülməsi ilə dünya azərbaycanlılarının birlik günü elan olundu.', category: 'azerbaijan' },
    { year: '1901', title: 'İlk Nobel Mükafatlarının Təqdimatı', description: 'Fizika, kimya, tibb və sülh sahəsində ilk beynəlxalq Nobel mükafatları təqdim edildi.', category: 'science' }
  ]
};

export function getTodayHistoricalEvents(): HistoricalEvent[] {
  const month = new Date().getMonth();
  return MONTH_EVENTS[month] || MONTH_EVENTS[8];
}
