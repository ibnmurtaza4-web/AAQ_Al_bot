# AAQ - Ahl Al Qalam (AAQ Əhl-ül Qələm) Telegram Bot & Web Engine

Müxtəlif süni intellekt modelləri (Google Gemini Flash) ilə təchiz olunmuş, Telegram qruplarını idarə edən, PDF sənədlərini analiz edən, 24/7 Webhook ilə oyaq qalan və canlı Veb İdarəetmə Panelinə malik çoxfunksiyalı sistem.

Rəsmi Təşkilat Kanalı: [t.me/AAQ_Offical](https://t.me/AAQ_Offical)

---

## 🌟 Əsas Xüsusiyyətlər

### 1. ⚡ Sürətli Süni İntellekt (Gemini Flash Engine)
- **Modellər:** `gemini-3.8-flash` (Defolt), `gemini-2.5-flash`, `gemini-3.7-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`.
- **İtiksiz Kaskad (Auto-Failover):** Hər hansı modeldə 503 yüklənməsi yarandıqda sistem dərhal digər aktiv Gemini Flash modelinə keçir.
- **Dərin Xarakter İmmersiyası:** Müdrik Filosof, Baş Proqramçı, DİM Eksperti, Kiberpunk 2077, Səmimi Dost və Xarici Dil Müəllimi.

### 2. 📄 Ağıllı PDF Sənəd Analizi
- **Şəxsi İstifadə Rejimi:** Qruplara atılan PDF-lərin avtomatik işə düşməsi və qrupu narahat etməsi ləğv edilib. PDF analizi **yalnız şəxsi söhbətlərdə** işləyir.
- **Dərin Analiz:** Multimodal mühərrik vasitəsilə mətni çıxarır, strukturu xülasələşdirir və sualları cavablandırır.

### 3. ⚡ 24/7 Oyaq Qalma (Keep-Alive 2.0 & Polling Watchdog)
- **Telegram Webhook & Watchdog:** Bulud mühiti yuxuya getdikdə `/api/wake` və ya Webhook vasitəsilə oyanır, Watchdog isə hər 45 saniyədən bir polling döngüsünü nəzarətdə saxlayır.
- **Daxili Nabız (Keep-Alive):** Hər 2 dəqiqədən bir server daxili `/api/health` ünvanını yoxlayaraq prosesin aktivliyini təmin edir.

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

Bu layihədə bütün gizli açarlar koddan tam təcrid edilib. Reponun və ya serverinizin mühit dəyişənlərinə (**GitHub Settings → Secrets and variables → Actions** və ya `.env`) aşağıdakı açarları əlavə edin:

| Dəyişən Adı | İzah | Nümunə Dəyər |
| :--- | :--- | :--- |
| `BOT_TOKEN` | Telegram BotFather tokeni | `1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` |
| `GEMINI_API_KEY` | Google Gemini AI Model Açarı | `AIzaSy...` |
| `ADMIN_SECRET_KEY`| AAQ İdarə Paneli və Admin Parolu | `your_secret_admin_key` |
| `APP_URL` | Serverin canlı HTTPS ünvanı (Webhook üçün) | `https://your-domain.run.app` |
| `OWNER_USERNAME` | Baş Rəhbərin Telegram istifadəçi adı | `your_telegram_username` |
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
