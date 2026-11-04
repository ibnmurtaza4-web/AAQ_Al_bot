# AAQ - Ahl Al Qalam (AAQ Əhl-ül Qələm) Telegram Bot & Web Engine

Müxtəlif süni intellekt modelləri (Google Gemini Flash) ilə təchiz olunmuş, Telegram qruplarını idarə edən, PDF sənədlərini analiz edən, 24/7 Webhook ilə oyaq qalan və canlı Veb İdarəetmə Panelinə malik çoxfunksiyalı sistem.

Rəsmi Təşkilat Kanalı: [t.me/AAQ_Offical](https://t.me/AAQ_Offical)

---

## 🌟 Əsas Xüsusiyyətlər

### 1. ⚡ Sürətli Süni İntellekt (Gemini Flash Engine)
- **Modellər:** `gemini-3.8-flash` (Defolt), `gemini-3.7-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`, `gemini-2.5-flash`.
- **Fast Path:** Gərəksiz axtarış və mesaj statusu yeniləmə intervalları ləğv edilib. Ümumi suallara cavab sürəti **300–600ms** təşkil edir.
- **Canlı Tarix & Hadisə Anlayışı:** Günün tarixi, cari hadisələr və yeniliklər soruşulduqda avtomatik olaraq canlı axtarış tətbiq olunur.
- **Müxtəlif Xarakterlər (Personas):** Dahi Alim, Səmimi Bələdçi, Müdrik Filosof, Yaradıcı Şair, Maarifçi Müəllim və s.

### 2. 📄 Ağıllı PDF Sənəd Analizi
- **Şəxsi İstifadə Rejimi:** Qruplara atılan PDF-lərin avtomatik işə düşməsi və qrupu narahat etməsi ləğv edilib. PDF analizi **yalnız şəxsi söhbətlərdə** işləyir.
- **Dərin Analiz:** `pdf-parse` vasitəsilə mətni çıxarır, strukturu xülasələşdirir və sualları cavablandırır.

### 3. ⚡ 24/7 Oyaq Qalma (Telegram Webhook & Keep-Alive)
- **Telegram Webhook:** Bulud mühiti (məsələn, Cloud Run) yuxuya (scale-to-zero) getdikdə belə, Telegram istifadəçisi mesaj yazan kimi Telegram serveri tərəfindən dərhal HTTPS POST sorğusu ilə oyadılır.
- **Daxili Nabız (Keep-Alive):** Hər 5 dəqiqədən bir server daxili `/api/health` ünvanını yoxlayaraq prosesin aktivliyini təmin edir.

### 4. 🛡️ Qrup Qoruma & Moderasiya
- **Anti-Söyüş (Profanity Filter):** Azərbaycan, rus və ingilis dillərində qeyri-etik sözləri aşkar edir və avtomatik silir.
- **Anti-Link:** İcazəsiz reklam və xarici keçidləri ləğv edir.
- **Anti-Spam:** Təkrarlanan və flood mesajları bloklayır.

### 5. 📊 Müasir Veb İdarə Paneli
- Bot statistikası (İstifadəçilər, Qruplar, Biletlər, Oyanma loqları).
- Canlı qrup idarəsi, istifadəçi bloklama və elan yayımı (`/elan`).
- Dəstək biletləri və rəhbərlik müraciət sistemi.

---

## 🔐 Gizli Dəyişənlər (Environment Secrets)

Bu layihədə bütün gizli açarlar koddan tam təcrid edilib. Reponun və ya serverinizin mühit dəyişənlərinə (**GitHub Settings → Secrets and variables → Actions**) aşağıdakı açarları əlavə edin:

| Dəyişən Adı | İzah | Nümunə Dəyər |
| :--- | :--- | :--- |
| `BOT_TOKEN` | Telegram BotFather tokeni | `8005698770:AAHz4...` |
| `GEMINI_API_KEY` | Google Gemini AI Model Açarı | `AIzaSy...` |
| `ADMIN_SECRET_KEY`| AAQ İdarə Paneli və Admin Parolu | `aaq2026admin` |
| `APP_URL` | Serverin canlı HTTPS ünvanı (Webhook üçün) | `https://your-domain.run.app` |
| `OWNER_USERNAME` | Baş Rəhbərin Telegram istifadəçi adı | `muntazir_admin` |
| `PORT` | Daxili server portu | `3000` |

---

## 🚀 Quraşdırma & İşə Salma

### 1. Layihəni klonlayın
```bash
git clone https://github.com/ibnmurtaza4-web/AAQ_Al_bot.git
cd AAQ_Al_bot
```

### 2. Asılılıqları quraşdırın
```bash
npm install
```

### 3. Mühit dəyişənlərini təyin edin
`.env.example` faylını `.env` kimi kopyalayın və açarlarınızı daxil edin:
```bash
cp .env.example .env
```

### 4. İnkişaf Rejimində Başladın
```bash
npm run dev
```
Brauzerdə açın: `http://localhost:3000`

### 5. Production Qurulumu & Başlama
```bash
npm run build
npm start
```

---

## 📋 Bot Əmrləri

- `/start` - Əsas interaktiv menyu və bələdçi
- `/sorus <sual>` - Gemini Flash süni intellekti ilə sürətli cavab
- `/pdf` - PDF faylı göndərmək üçün təlimat (yalnız şəxsi çatda)
- `/sozluk <söz>` - Azərbaycan dilinin izahlı lüğəti
- `/tarix` - Tarixdə bu gün və əlamətdar hadisələr
- `/sitat` - Dahi mütəfəkkirlərdən hikmətli kəlamlar
- `/hava <şəhər>` - Real vaxt hava proqnozu
- `/dim` - DİM imtahan bələdçisi
- `/elaqe <mesaj>` - AAQ Rəhbərliyinə birbaşa müraciət
- `/panel` - Rəhbərlik idarəetmə mərkəzi (Yalnız adminlər)
- `/elan <mətn>` - Bütün qruplara rəsmi bildiriş yayımı (Yalnız adminlər)

---

## ⚖️ Lisenziya & Müəlliflik Hüququ

Layihə **AAQ - Ahl Al Qalam** təşkilatının rəhbərliyi altında hazırlanmışdır.  
Rəsmi Kanal: [https://t.me/AAQ_Offical](https://t.me/AAQ_Offical)
