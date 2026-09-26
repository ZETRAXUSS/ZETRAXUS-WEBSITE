import type { Lang } from "@/lib/i18n/config";

/**
 * Legal copy for /terms and /privacy.
 *
 * IMPORTANT: this is a solid starting point written for a community forum
 * operating from Türkiye (KVKK), not legal advice. Have it reviewed before
 * you rely on it, and update LEGAL_CONTACT to a mailbox you actually read.
 */

export const LEGAL_CONTACT = "privacy@zetraxus.com";
export const LEGAL_UPDATED = "2026-09-26";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export const TERMS: Record<Lang, LegalSection[]> = {
  en: [
    {
      heading: "1. Acceptance",
      paragraphs: [
        "By creating an account or using ZETRAXUS (the “Platform”), you agree to these Terms of Use and to our Privacy Policy. If you do not agree, please do not use the Platform.",
      ],
    },
    {
      heading: "2. Your account",
      paragraphs: [
        "You must provide accurate information and keep your login credentials secure. You are responsible for all activity under your account. You must be at least 13 years old; if you are under 18, you confirm that a parent or legal guardian has agreed to these Terms.",
        "One person may not use multiple accounts to evade a restriction or ban.",
      ],
    },
    {
      heading: "3. Your content",
      paragraphs: [
        "You keep ownership of the posts, replies, images and other content you publish. By publishing, you grant ZETRAXUS a worldwide, non-exclusive, royalty-free license to host, store, display, reproduce and distribute that content for the purpose of operating and promoting the Platform. This license ends when you delete the content, except where it has been quoted by others or must be retained for legal reasons.",
        "You confirm that you have the rights needed to publish your content and that it does not infringe anyone else's rights.",
      ],
    },
    {
      heading: "4. Community rules",
      paragraphs: ["You agree not to post or do any of the following:"],
      list: [
        "Illegal content, or content that encourages illegal activity.",
        "Harassment, threats, hate speech or targeted abuse of any person or group.",
        "Sexual or pornographic content, graphic violence or gore, or any content sexualising minors.",
        "Personal data of others without consent (doxxing), including addresses, phone numbers or private messages.",
        "Spam, scams, phishing, malware, or repetitive/automated posting.",
        "Content that infringes copyrights, trademarks or other intellectual property.",
        "Impersonation of other people, creators or the ZETRAXUS team.",
        "Attempts to break, overload or bypass the Platform's security or rate limits.",
      ],
    },
    {
      heading: "5. Images and automated moderation",
      paragraphs: [
        "Images you upload are checked automatically by an AI moderation service before they are shown publicly, and may also be reviewed by our moderators. Images that are flagged are rejected and not stored; images that cannot be checked automatically are held for manual review. Automated systems can make mistakes — if you believe an image was rejected in error, contact us.",
      ],
    },
    {
      heading: "6. Moderation and enforcement",
      paragraphs: [
        "Members can report content. Moderators may edit, hide, lock, pin or remove content, and may warn, restrict or ban accounts that break these Terms, at their reasonable discretion and without prior notice where necessary to protect the community.",
      ],
    },
    {
      heading: "6a. Notice and takedown",
      paragraphs: [
        "ZETRAXUS acts as a hosting provider for content posted by members (Law No. 5651, Art. 5): we do not pre-screen every post and are not responsible for member content, but we remove unlawful content once we are notified of it. Anyone — member or not — can notify us with the Report button on any post, image or profile, or by email to " + LEGAL_CONTACT + ". Please include a link to the content and the reason. We review notices promptly and remove content that is unlawful or breaks these Terms.",
        "The author of a post is solely responsible for it. We keep the account and technical records that the law requires and share them with authorities only when legally obliged to.",
      ],
    },
    {
      heading: "7. Platform content",
      paragraphs: [
        "The ZETRAXUS name, logo, design and software are owned by ZETRAXUS and may not be copied or used without permission, except as allowed by law.",
      ],
    },
    {
      heading: "8. Disclaimer and liability",
      paragraphs: [
        "The Platform is provided “as is” and “as available”. Content published by members reflects their own views, not ours. To the maximum extent permitted by law, ZETRAXUS is not liable for indirect or consequential damages, loss of data, or damages arising from content posted by other members.",
      ],
    },
    {
      heading: "9. Termination",
      paragraphs: [
        "You can stop using the Platform at any time and request deletion of your account. We may suspend or terminate access if you seriously or repeatedly violate these Terms.",
      ],
    },
    {
      heading: "10. Governing law",
      paragraphs: [
        "These Terms are governed by the laws of the Republic of Türkiye. Istanbul courts and enforcement offices have jurisdiction, without prejudice to mandatory consumer protection rules.",
      ],
    },
    {
      heading: "11. Changes",
      paragraphs: [
        "We may update these Terms. Significant changes will be announced on the Platform. Continuing to use the Platform after changes take effect means you accept the updated Terms.",
      ],
    },
    {
      heading: "12. Contact",
      paragraphs: [`Questions about these Terms: ${LEGAL_CONTACT}`],
    },
  ],
  tr: [
    {
      heading: "1. Kabul",
      paragraphs: [
        "ZETRAXUS’ta (“Platform”) hesap oluşturarak veya Platformu kullanarak bu Kullanım Şartlarını ve Gizlilik Politikamızı kabul etmiş olursun. Kabul etmiyorsan lütfen Platformu kullanma.",
      ],
    },
    {
      heading: "2. Hesabın",
      paragraphs: [
        "Doğru bilgi vermekle ve giriş bilgilerini güvende tutmakla yükümlüsün. Hesabında gerçekleşen tüm işlemlerden sen sorumlusun. En az 13 yaşında olmalısın; 18 yaşından küçüksen, bu şartları bir ebeveynin veya yasal vasinin onayladığını beyan edersin.",
        "Bir kısıtlamayı veya yasağı aşmak için birden fazla hesap kullanılamaz.",
      ],
    },
    {
      heading: "3. İçeriğin",
      paragraphs: [
        "Paylaştığın konu, cevap, görsel ve diğer içeriklerin sahibi sensin. Paylaşarak ZETRAXUS’a, Platformu işletmek ve tanıtmak amacıyla bu içeriği barındırma, saklama, gösterme, çoğaltma ve dağıtma için dünya çapında, münhasır olmayan ve ücretsiz bir lisans vermiş olursun. Bu lisans içeriği sildiğinde sona erer; başkaları tarafından alıntılanmış veya yasal nedenlerle saklanması gereken içerikler bunun istisnasıdır.",
        "İçeriğini yayınlamak için gerekli haklara sahip olduğunu ve içeriğin başkalarının haklarını ihlal etmediğini beyan edersin.",
      ],
    },
    {
      heading: "4. Topluluk kuralları",
      paragraphs: ["Aşağıdakileri paylaşmamayı ve yapmamayı kabul edersin:"],
      list: [
        "Yasa dışı içerik veya yasa dışı faaliyeti teşvik eden içerik.",
        "Taciz, tehdit, nefret söylemi veya bir kişiyi/grubu hedef alan saldırgan davranış.",
        "Cinsel veya pornografik içerik, aşırı şiddet/kan içeren görseller ya da çocukları cinselleştiren her türlü içerik.",
        "Başkalarına ait kişisel verilerin rızası olmadan paylaşılması (adres, telefon, özel mesaj vb.).",
        "Spam, dolandırıcılık, oltalama (phishing), zararlı yazılım veya tekrarlayan/otomatik paylaşım.",
        "Telif hakkı, marka veya diğer fikri mülkiyet haklarını ihlal eden içerik.",
        "Başka kişileri, içerik üreticilerini veya ZETRAXUS ekibini taklit etmek.",
        "Platformun güvenliğini veya gönderim sınırlarını aşmaya, bozmaya ya da aşırı yüklemeye çalışmak.",
      ],
    },
    {
      heading: "5. Görseller ve otomatik denetim",
      paragraphs: [
        "Yüklediğin görseller herkese gösterilmeden önce bir yapay zekâ denetim hizmeti tarafından otomatik olarak kontrol edilir ve moderatörlerimiz tarafından da incelenebilir. Uygunsuz bulunan görseller reddedilir ve saklanmaz; otomatik kontrol edilemeyen görseller moderatör onayına kadar bekletilir. Otomatik sistemler hata yapabilir — bir görselin yanlışlıkla reddedildiğini düşünüyorsan bize ulaş.",
      ],
    },
    {
      heading: "6. Moderasyon ve yaptırımlar",
      paragraphs: [
        "Üyeler içerikleri şikâyet edebilir. Moderatörler, topluluğu korumak için gerektiğinde önceden bildirim yapmaksızın içerikleri düzenleyebilir, gizleyebilir, kilitleyebilir, sabitleyebilir veya kaldırabilir; bu şartları ihlal eden hesapları uyarabilir, kısıtlayabilir veya yasaklayabilir.",
      ],
    },
    {
      heading: "6a. İçerik bildirimi ve kaldırma",
      paragraphs: [
        "ZETRAXUS, üyelerin paylaştığı içerikler bakımından 5651 sayılı Kanun’un 5. maddesi kapsamında yer sağlayıcıdır: her paylaşımı önceden kontrol etmekle yükümlü değildir ve üye içeriklerinden sorumlu tutulamaz; ancak hukuka aykırı içerikten haberdar edildiğinde bu içeriği yayından kaldırır. Üye olsun olmasın herkes; her konu, görsel ve profildeki Şikâyet et butonuyla veya " + LEGAL_CONTACT + " adresine e-posta göndererek bildirimde bulunabilir. Bildirimde içeriğin bağlantısını ve gerekçeni belirt. Bildirimler hızla incelenir; hukuka aykırı veya bu şartları ihlal eden içerikler kaldırılır.",
        "Bir paylaşımın hukuki sorumluluğu tamamen paylaşan üyeye aittir. Kanunen tutulması gereken hesap ve teknik kayıtları saklarız ve bunları yalnızca yasal zorunluluk halinde yetkili makamlarla paylaşırız.",
      ],
    },
    {
      heading: "7. Platform içeriği",
      paragraphs: [
        "ZETRAXUS adı, logosu, tasarımı ve yazılımı ZETRAXUS’a aittir; kanunun izin verdiği haller dışında izinsiz kopyalanamaz veya kullanılamaz.",
      ],
    },
    {
      heading: "8. Sorumluluk reddi",
      paragraphs: [
        "Platform “olduğu gibi” ve “mevcut olduğu şekilde” sunulur. Üyelerin paylaştığı içerikler kendi görüşlerini yansıtır, bizim görüşlerimizi değil. Kanunun izin verdiği azami ölçüde ZETRAXUS; dolaylı zararlardan, veri kaybından veya diğer üyelerin paylaştığı içeriklerden doğan zararlardan sorumlu değildir.",
      ],
    },
    {
      heading: "9. Fesih",
      paragraphs: [
        "Platformu dilediğin zaman kullanmayı bırakabilir ve hesabının silinmesini talep edebilirsin. Bu şartları ciddi veya tekrarlı şekilde ihlal etmen halinde erişimini askıya alabilir veya sonlandırabiliriz.",
      ],
    },
    {
      heading: "10. Uygulanacak hukuk",
      paragraphs: [
        "Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir. Tüketici mevzuatının emredici hükümleri saklı kalmak kaydıyla İstanbul mahkemeleri ve icra daireleri yetkilidir.",
      ],
    },
    {
      heading: "11. Değişiklikler",
      paragraphs: [
        "Bu şartları güncelleyebiliriz. Önemli değişiklikler Platform üzerinden duyurulur. Değişiklikler yürürlüğe girdikten sonra Platformu kullanmaya devam etmen, güncel şartları kabul ettiğin anlamına gelir.",
      ],
    },
    {
      heading: "12. İletişim",
      paragraphs: [`Bu şartlarla ilgili soruların için: ${LEGAL_CONTACT}`],
    },
  ],
};

export const PRIVACY: Record<Lang, LegalSection[]> = {
  en: [
    {
      heading: "1. Who we are",
      paragraphs: [
        "ZETRAXUS is the data controller for the personal data processed on this Platform. This policy explains what we collect, why, and the rights you have — including under Türkiye's Personal Data Protection Law No. 6698 (KVKK) and, where applicable, the EU GDPR.",
      ],
    },
    {
      heading: "2. Data we collect",
      paragraphs: ["Depending on how you use the Platform, we process:"],
      list: [
        "Account data: email address, display name, username, password (stored only as a secure hash by our authentication provider), and — if you sign in with Google — your Google name, email and profile picture.",
        "Profile data: biography and avatar image.",
        "Content: forum topics, replies, uploaded images, likes, saved topics and reports you submit.",
        "Technical data: IP address, browser/device information, and request logs kept by our hosting providers for security and reliability.",
        "Local preferences: language, sound on/off and similar settings stored in cookies or your browser's local storage.",
      ],
    },
    {
      heading: "3. Why we use it (purpose and legal basis)",
      paragraphs: [
        "We process your data to create and run your account, publish your content, show notifications, keep the community safe (moderation, spam prevention, abuse reports), secure the Platform, and comply with legal obligations. The legal bases are the performance of our contract with you, our legitimate interest in operating a safe community, compliance with legal obligations, and — where required — your explicit consent (KVKK Art. 5).",
      ],
    },
    {
      heading: "4. Automated image moderation",
      paragraphs: [
        "Images you upload are sent to an AI moderation service (OpenAI) solely to check them for prohibited content before publication. The result (approved/rejected and category scores) is stored with the upload. Rejected images are not stored by us.",
      ],
    },
    {
      heading: "5. Who we share it with",
      paragraphs: [
        "We do not sell your personal data. We share it only with service providers that process it on our behalf:",
      ],
      list: [
        "Supabase — database, authentication and file storage.",
        "Vercel — website hosting and delivery.",
        "Google — only if you choose “Continue with Google”.",
        "OpenAI — image moderation, as described above.",
        "Public authorities, when legally required.",
      ],
    },
    {
      heading: "6. International transfers",
      paragraphs: [
        "Our providers may store and process data on servers outside Türkiye (for example in Asia, the EU or the United States). Where KVKK Art. 9 applies, such transfers are carried out on the basis of appropriate safeguards or your explicit consent, which you give when you create an account.",
      ],
    },
    {
      heading: "7. What is public",
      paragraphs: [
        "Your display name, username, avatar, bio and the content you post in the forum are visible to everyone. Your email address is never shown publicly.",
      ],
    },
    {
      heading: "8. Retention",
      paragraphs: [
        "We keep your data while your account is active. When you delete content or your account, we delete or anonymise the related data within a reasonable period, except where we must keep it longer to comply with the law or to resolve disputes and abuse reports.",
      ],
    },
    {
      heading: "9. Your rights",
      paragraphs: ["Under KVKK Art. 11 (and GDPR where applicable) you may:"],
      list: [
        "Learn whether your personal data is processed and request information about it.",
        "Learn the purpose of processing and whether it is used accordingly.",
        "Know the third parties to whom it is transferred, in Türkiye or abroad.",
        "Request correction of incomplete or inaccurate data.",
        "Request deletion or destruction of your data.",
        "Object to results arising exclusively from automated processing that are to your detriment.",
        "Claim compensation for damages caused by unlawful processing.",
      ],
    },
    {
      heading: "10. Cookies and local storage",
      paragraphs: [
        "We use strictly necessary cookies to keep you signed in and to remember your language. Your browser's local/session storage remembers preferences such as sound and whether you've seen the intro animation. We do not use advertising cookies.",
      ],
    },
    {
      heading: "11. Security",
      paragraphs: [
        "We use encrypted connections (HTTPS), row-level access rules in our database, server-side rate limits and restricted administrative access. No system is perfectly secure, so please use a strong, unique password.",
      ],
    },
    {
      heading: "12. Children",
      paragraphs: [
        "The Platform is not intended for children under 13. If you believe a child has provided us with personal data, contact us and we will delete it.",
      ],
    },
    {
      heading: "13. Contact and changes",
      paragraphs: [
        `To exercise your rights or ask a question, write to ${LEGAL_CONTACT}. We will respond within 30 days as required by KVKK. We may update this policy; the date at the top shows the latest version.`,
      ],
    },
  ],
  tr: [
    {
      heading: "1. Biz kimiz",
      paragraphs: [
        "Bu Platformda işlenen kişisel veriler bakımından veri sorumlusu ZETRAXUS’tur. Bu politika; 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve uygulanabildiği ölçüde AB GDPR kapsamında hangi verileri, neden işlediğimizi ve haklarını açıklar.",
      ],
    },
    {
      heading: "2. Topladığımız veriler",
      paragraphs: ["Platformu nasıl kullandığına bağlı olarak şu verileri işleriz:"],
      list: [
        "Hesap verileri: e-posta adresi, görünen ad, kullanıcı adı, şifre (kimlik doğrulama sağlayıcımızda yalnızca güvenli özet/hash olarak saklanır) ve Google ile giriş yaparsan Google adın, e-postan ve profil fotoğrafın.",
        "Profil verileri: biyografi ve profil fotoğrafı.",
        "İçerik: forum konuları, cevaplar, yüklenen görseller, beğeniler, kaydedilen konular ve gönderdiğin şikâyetler.",
        "Teknik veriler: IP adresi, tarayıcı/cihaz bilgisi ve barındırma sağlayıcılarımızın güvenlik ve süreklilik için tuttuğu erişim kayıtları.",
        "Yerel tercihler: dil, ses açık/kapalı gibi ayarlar (çerezlerde veya tarayıcının yerel depolamasında).",
      ],
    },
    {
      heading: "3. Neden kullanıyoruz (amaç ve hukuki sebep)",
      paragraphs: [
        "Verilerini hesabını oluşturmak ve yönetmek, içeriklerini yayınlamak, bildirim göstermek, topluluğu güvende tutmak (moderasyon, spam önleme, şikâyetler), Platformun güvenliğini sağlamak ve yasal yükümlülüklerimizi yerine getirmek için işleriz. Hukuki sebepler; seninle kurduğumuz sözleşmenin ifası, güvenli bir topluluk işletme konusundaki meşru menfaatimiz, hukuki yükümlülüklerin yerine getirilmesi ve gerekli hallerde açık rızandır (KVKK m. 5).",
      ],
    },
    {
      heading: "4. Otomatik görsel denetimi",
      paragraphs: [
        "Yüklediğin görseller, yayınlanmadan önce yalnızca yasaklı içerik kontrolü amacıyla bir yapay zekâ denetim hizmetine (OpenAI) gönderilir. Sonuç (onay/ret ve kategori puanları) yükleme kaydıyla birlikte saklanır. Reddedilen görseller tarafımızca saklanmaz.",
      ],
    },
    {
      heading: "5. Kimlerle paylaşıyoruz",
      paragraphs: ["Kişisel verilerini satmayız. Yalnızca bizim adımıza veri işleyen hizmet sağlayıcılarla paylaşırız:"],
      list: [
        "Supabase — veritabanı, kimlik doğrulama ve dosya depolama.",
        "Vercel — web sitesi barındırma ve dağıtım.",
        "Google — yalnızca “Google ile devam et” seçeneğini kullanırsan.",
        "OpenAI — yukarıda açıklanan görsel denetimi.",
        "Kanunen zorunlu hallerde yetkili kamu kurumları.",
      ],
    },
    {
      heading: "6. Yurt dışına aktarım",
      paragraphs: [
        "Hizmet sağlayıcılarımız verileri Türkiye dışındaki sunucularda (örneğin Asya, AB veya ABD) saklayabilir ve işleyebilir. KVKK m. 9 kapsamındaki aktarımlar uygun güvenceler çerçevesinde veya hesap oluştururken verdiğin açık rızaya dayanarak gerçekleştirilir.",
      ],
    },
    {
      heading: "7. Herkese açık olanlar",
      paragraphs: [
        "Görünen adın, kullanıcı adın, profil fotoğrafın, biyografin ve forumda paylaştığın içerikler herkes tarafından görülebilir. E-posta adresin hiçbir zaman herkese açık gösterilmez.",
      ],
    },
    {
      heading: "8. Saklama süresi",
      paragraphs: [
        "Hesabın aktif olduğu sürece verilerini saklarız. İçeriğini veya hesabını sildiğinde ilgili verileri makul bir süre içinde siler veya anonim hale getiririz; kanuni yükümlülükler veya uyuşmazlık ve şikâyetlerin çözümü için daha uzun saklamamız gereken durumlar saklıdır.",
      ],
    },
    {
      heading: "9. Hakların",
      paragraphs: ["KVKK m. 11 (ve uygulanabildiği ölçüde GDPR) kapsamında şu haklara sahipsin:"],
      list: [
        "Kişisel verilerinin işlenip işlenmediğini öğrenme ve buna ilişkin bilgi talep etme.",
        "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme.",
        "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme.",
        "Eksik veya yanlış işlenmişse düzeltilmesini isteme.",
        "Silinmesini veya yok edilmesini isteme.",
        "Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhine bir sonuç çıkmasına itiraz etme.",
        "Kanuna aykırı işleme nedeniyle zarara uğraman halinde zararın giderilmesini talep etme.",
      ],
    },
    {
      heading: "10. Çerezler ve yerel depolama",
      paragraphs: [
        "Oturumunu açık tutmak ve dil tercihini hatırlamak için yalnızca zorunlu çerezler kullanırız. Tarayıcının yerel/oturum depolaması; ses tercihi ve açılış animasyonunu görüp görmediğin gibi ayarları hatırlar. Reklam çerezi kullanmayız.",
      ],
    },
    {
      heading: "11. Güvenlik",
      paragraphs: [
        "Şifreli bağlantı (HTTPS), veritabanında satır bazlı erişim kuralları, sunucu tarafı gönderim sınırları ve kısıtlı yönetici erişimi kullanırız. Hiçbir sistem kusursuz değildir; lütfen güçlü ve benzersiz bir şifre kullan.",
      ],
    },
    {
      heading: "12. Çocuklar",
      paragraphs: [
        "Platform 13 yaşından küçük çocuklara yönelik değildir. Bir çocuğun bize kişisel veri verdiğini düşünüyorsan bize ulaş; ilgili verileri sileriz.",
      ],
    },
    {
      heading: "13. İletişim ve değişiklikler",
      paragraphs: [
        `Haklarını kullanmak veya soru sormak için ${LEGAL_CONTACT} adresine yazabilirsin. Başvurularını KVKK gereği en geç 30 gün içinde yanıtlarız. Bu politikayı güncelleyebiliriz; en üstteki tarih en güncel sürümü gösterir.`,
      ],
    },
  ],
};
